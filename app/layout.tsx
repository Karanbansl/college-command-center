import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'College Resource Command Center',
  description: 'A premium command center for accessing college resources, PDFs, official links, and more.',
  keywords: ['college resources', 'student portal', 'academic resources', 'study materials'],
  manifest: '/college-command-center/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RC Center',
  },
  openGraph: {
    title: 'College Resource Command Center',
    description: 'Your premium academic hub',
    type: 'website',
  },
  icons: {
    icon: '/college-command-center/favicon.ico',
    apple: '/college-command-center/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030308',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
