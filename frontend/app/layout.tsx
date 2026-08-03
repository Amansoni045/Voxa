import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { BackgroundProgressToast } from '@/components/processing/background-progress-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Voxa — Any content, distilled.',
  description:
    'Drop in a recording, paste a YouTube link, or upload any file. Get decisions, action items, questions, and full transcripts.',
  keywords: ['youtube', 'podcast', 'lecture', 'meeting', 'summary', 'transcription', 'productivity'],
  openGraph: {
    title: 'Voxa — Any content, distilled.',
    description: 'Drop in a recording or link. We handle the rest.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>
          {children}
          <BackgroundProgressToast />
        </ThemeProvider>
      </body>
    </html>
  )
}
