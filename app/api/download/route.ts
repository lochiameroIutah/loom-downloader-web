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

    // Fetch download URL from Loom API
    const { data } = await axios.post(
      `https://www.loom.com/api/campaigns/sessions/${videoId}/transcoded-url`
    )

    if (!data.url) {
      return NextResponse.json({ error: 'Could not get download URL' }, { status: 404 })
    }

    return NextResponse.json({ 
      downloadUrl: data.url,
      videoId,
      filename: `${videoId}.mp4`
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