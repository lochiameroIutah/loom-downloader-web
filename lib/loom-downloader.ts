export interface DownloadResult {
  filename: string
  videoId: string
}

export async function downloadLoomVideo(url: string): Promise<DownloadResult> {
  try {
    // Call our API endpoint
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get download URL')
    }

    const data = await response.json()
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile && navigator.share) {
      // Use native share menu on mobile
      try {
        await navigator.share({
          title: 'Download Loom Video',
          text: `Download: ${data.filename}`,
          url: data.downloadUrl
        })
        return {
          filename: data.filename,
          videoId: data.videoId,
        }
      } catch (shareError) {
        // Fall back to direct download if share is cancelled
        console.log('Share cancelled, falling back to download')
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
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred')
  }
}