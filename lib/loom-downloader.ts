export interface DownloadResult {
  filename: string
  videoId: string
  title?: string
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
      const errorText = await response.text()
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
    
    // Simple direct download for all devices
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