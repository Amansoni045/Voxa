import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Voxa — Every meeting, distilled.',
  description:
    'Drop in a recording. Get everything that mattered — decisions, action items, questions, and more.',
  keywords: ['meeting', 'summary', 'transcription', 'productivity'],
  openGraph: {
    title: 'Voxa — Every meeting, distilled.',
    description: "Drop in a recording. We'll handle the rest.",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
