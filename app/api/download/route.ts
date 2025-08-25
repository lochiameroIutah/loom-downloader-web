import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract video ID from URL
    const videoId = extractId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid Loom URL' }, { status: 400 })
    }

    // Fetch video info and download URL from Loom API
    const [transcodeResponse, videoInfoResponse] = await Promise.all([
      axios.post(`https://www.loom.com/api/campaigns/sessions/${videoId}/transcoded-url`),
      axios.get(`https://www.loom.com/api/campaigns/sessions/${videoId}`)
    ])

    if (!transcodeResponse.data.url) {
      return NextResponse.json({ error: 'Could not get download URL' }, { status: 404 })
    }

    // Get video title and clean it for filename
    const videoTitle = videoInfoResponse.data?.name || 'Loom Video'
    const cleanTitle = videoTitle
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 100) // Limit length
    
    const filename = cleanTitle ? `${cleanTitle}.mp4` : `${videoId}.mp4`

    return NextResponse.json({ 
      downloadUrl: transcodeResponse.data.url,
      videoId,
      filename,
      title: videoTitle
    })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process download request' 
    }, { status: 500 })
  }
}

function extractId(url: string): string | null {
  try {
    const cleanUrl = url.split('?')[0]
    const parts = cleanUrl.split('/')
    const id = parts.pop()
    return id || null
  } catch {
    return null
  }
}