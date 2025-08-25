import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Loom Downloader - Download Loom Videos Easily',
  description: 'Simple and fast way to download videos from Loom.com',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {children}
      </body>
    </html>
  )
}