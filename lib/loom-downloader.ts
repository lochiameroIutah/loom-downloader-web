export interface DownloadResult {
  filename: string
  videoId: string
  title?: string
}

export async function downloadLoomVideo(url: string, debugLog?: (msg: string) => void): Promise<DownloadResult> {
  const log = debugLog || console.log
  
  try {
    log('Starting download for URL: ' + url)
    
    // Call our API endpoint
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    log('API response status: ' + response.status)

    if (!response.ok) {
      const errorText = await response.text()
      log('API error response: ' + errorText)
      
      let errorMessage = 'Failed to get download URL'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        errorMessage = `HTTP ${response.status}: ${errorText}`
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    log('API response data: ' + JSON.stringify(data))
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile && navigator.share) {
      try {
        log('Mobile detected, attempting file download and share')
        
        // Download the video file as blob
        log('Fetching video blob from: ' + data.downloadUrl)
        const videoResponse = await fetch(data.downloadUrl)
        
        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video: ${videoResponse.status}`)
        }
        
        const videoBlob = await videoResponse.blob()
        log('Video blob size: ' + videoBlob.size)
        
        // Create a file from the blob
        const videoFile = new File([videoBlob], data.filename, { type: 'video/mp4' })
        
        // Check if sharing files is supported
        if (navigator.canShare && navigator.canShare({ files: [videoFile] })) {
          log('File sharing supported, attempting share')
          // Share the actual video file
          await navigator.share({
            title: data.title || 'Loom Video',
            text: `Downloaded: ${data.title || data.filename}`,
            files: [videoFile]
          })
          return {
            filename: data.filename,
            videoId: data.videoId,
            title: data.title
          }
        } else {
          log('File sharing not supported, falling back')
        }
      } catch (shareError) {
        log('Share with file failed: ' + (shareError as Error).message)
        log('Falling back to direct download')
      }
    }
    
    // Desktop or fallback: direct download
    const link = document.createElement('a')
    link.href = data.downloadUrl
    link.download = data.filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return {
      filename: data.filename,
      videoId: data.videoId,
      title: data.title
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred')
  }
}