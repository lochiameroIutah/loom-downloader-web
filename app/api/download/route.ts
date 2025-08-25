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

    console.log(`Processing video ID: ${videoId}`)

    try {
      // Fetch download URL first (most important)
      const transcodeResponse = await axios.post(
        `https://www.loom.com/api/campaigns/sessions/${videoId}/transcoded-url`,
        {},
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LoomDownloader/1.0)',
            'Accept': 'application/json'
          }
        }
      )

      if (!transcodeResponse.data?.url) {
        return NextResponse.json({ error: 'Could not get download URL from Loom' }, { status: 404 })
      }

      // Try to get video title, but don't fail if this doesn't work
      let videoTitle = 'Loom Video'
      try {
        const videoInfoResponse = await axios.get(
          `https://www.loom.com/api/campaigns/sessions/${videoId}`,
          {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; LoomDownloader/1.0)',
              'Accept': 'application/json'
            }
          }
        )
        videoTitle = videoInfoResponse.data?.name || 'Loom Video'
      } catch (titleError) {
        console.log('Could not fetch video title, using default')
      }

      // Clean title for filename
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

    } catch (apiError) {
      console.error('Loom API error:', apiError)
      return NextResponse.json({ 
        error: `Loom API error: ${apiError.message || 'Unknown error'}` 
      }, { status: 502 })
    }

  } catch (error) {
    console.error('General API error:', error)
    return NextResponse.json({ 
      error: `Server error: ${error.message || 'Unknown error'}` 
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