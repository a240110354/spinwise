import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spinwise - AI Content Rewriting Tool',
  description: 'AI-powered text paraphrasing tool with multiple style options',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
