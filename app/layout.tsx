import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SwiftConnect - Recover Failed Payments',
  description: 'Creator dashboard to recover revenue from failed payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

