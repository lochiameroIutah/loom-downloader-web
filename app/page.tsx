'use client'

import { useState } from 'react'
import { Download, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { downloadLoomVideo } from '../lib/loom-downloader'

export default function Home() {
  const [url, setUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setMessage('Please enter a Loom URL')
      setMessageType('error')
      return
    }

    if (!url.includes('loom.com/share/')) {
      setMessage('Please enter a valid Loom URL (must contain loom.com/share/)')
      setMessageType('error')
      return
    }

    setIsDownloading(true)
    setMessage('Preparing download...')
    setMessageType('info')

    try {
      // Check if mobile for different messaging
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        setMessage('Downloading video file...')
        setMessageType('info')
      }
      
      const result = await downloadLoomVideo(url)
      
      if (isMobile) {
        setMessage(`Video ready to share: ${result.title || result.filename}`)
      } else {
        setMessage(`Video downloaded successfully: ${result.title || result.filename}`)
      }
      setMessageType('success')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to download video')
      setMessageType('error')
    } finally {
      setIsDownloading(false)
    }
  }

  const MessageIcon = messageType === 'success' ? CheckCircle : 
                     messageType === 'error' ? AlertCircle : Video

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full px-4 md:px-0">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-loom-purple rounded-xl md:rounded-2xl shadow-lg">
              <Video className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-loom-purple to-loom-light bg-clip-text text-transparent">
              Loom Downloader
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed px-2 md:px-0">
            Download your Loom videos quickly and easily. Simply paste your Loom share link below.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-8">
          <form onSubmit={handleDownload} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                Loom Video URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.loom.com/share/your-video-id"
                className="w-full px-3 py-3 md:px-4 md:py-4 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-loom-purple focus:border-transparent transition-all duration-200 text-base md:text-lg"
                disabled={isDownloading}
              />
            </div>

            <button
              type="submit"
              disabled={isDownloading || !url.trim()}
              className="w-full bg-gradient-to-r from-loom-purple to-loom-light text-white py-3 px-4 md:py-4 md:px-6 rounded-lg md:rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 md:gap-3"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="hidden sm:inline">Download Video</span>
                  <span className="sm:hidden">Download</span>
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
              messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <MessageIcon className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/50 backdrop-blur rounded-2xl border border-white/20 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">How it works:</h3>
          <ol className="space-y-2 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="bg-loom-purple text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">1</span>
              <span>Copy your Loom video share link</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-loom-purple text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">2</span>
              <span>Paste it in the input field above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-loom-purple text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">3</span>
              <span>Click "Download Video" and your file will be saved</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>&copy; 2024 Loom Downloader. Built with ❤️ for video creators.</p>
        </div>
      </div>
    </main>
  )
}