'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/layout/logo'
import { UploadZone } from '@/components/upload/upload-zone'
import { YouTubeInput } from '@/components/upload/youtube-input'
import { RecentMeetings } from '@/components/upload/recent-meetings'
import { useMeetingStore } from '@/stores/meeting-store'
import { MOCK_MEETING, analyzeMeeting, analyzeMeetingUrl } from '@/lib/api'
import { staggerContainer, fadeInUp } from '@/lib/motion'

export default function HomePage() {
  const router = useRouter()
  const setCurrentMeeting = useMeetingStore((s) => s.setCurrentMeeting)
  const setProcessingFile = useMeetingStore((s) => s.setProcessingFile)
  const setProcessingUrl = useMeetingStore((s) => s.setProcessingUrl)
  const addRecentMeeting = useMeetingStore((s) => s.addRecentMeeting)

  const handleFile = useCallback(
    async (file: File) => {
      setProcessingFile(file.name)
      setCurrentMeeting(null)
      router.push('/processing')

      // In dev/demo mode — use mock data after a delay
      // In production — call: const meeting = await analyzeMeeting(file)
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true) {
        setTimeout(() => {
          setCurrentMeeting(MOCK_MEETING)
          addRecentMeeting(MOCK_MEETING)
        }, 8000) // Simulate processing time
      }
    },
    [router, setCurrentMeeting, setProcessingFile, addRecentMeeting]
  )

  const handleUrl = useCallback(
    async (url: string) => {
      setProcessingUrl(url)
      setCurrentMeeting(null)
      router.push('/processing')

      setTimeout(() => {
        setCurrentMeeting(MOCK_MEETING)
        addRecentMeeting(MOCK_MEETING)
      }, 8000)
    },
    [router, setCurrentMeeting, setProcessingUrl, addRecentMeeting]
  )

  return (
    <main className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header — logo only */}
      <header className="flex items-center px-6 md:px-10 h-14 flex-shrink-0">
        <Logo size="md" />
      </header>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-[480px] flex flex-col items-center gap-10"
        >
          {/* Hero */}
          <motion.div
            variants={fadeInUp}
            className="text-center flex flex-col items-center gap-3"
          >
            <h1
              className="text-[52px] font-bold leading-[1.1] tracking-[-0.034em]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Every meeting,
              <br />
              distilled.
            </h1>
            <p
              className="text-[17px] leading-[1.6] tracking-[-0.01em]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Drop in a recording. We&#8217;ll handle the rest.
            </p>
          </motion.div>

          {/* Upload zone */}
          <motion.div variants={fadeInUp} className="w-full">
            <UploadZone onFile={handleFile} />
          </motion.div>

          {/* YouTube secondary input */}
          <motion.div variants={fadeInUp} className="w-full -mt-4">
            <YouTubeInput onUrl={handleUrl} />
          </motion.div>

          {/* Recent meetings — only appears if there are any */}
          <motion.div variants={fadeInUp} className="w-full">
            <RecentMeetings />
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
