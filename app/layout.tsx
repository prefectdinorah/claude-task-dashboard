import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Task Dashboard',
  description: 'Real-time task monitoring for Claude Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
}
