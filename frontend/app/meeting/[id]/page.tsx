'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMeetingStore } from '@/stores/meeting-store'
import { MOCK_MEETING } from '@/lib/api'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { TitleReveal } from '@/components/results/title-reveal'
import { StickyHeader } from '@/components/results/sticky-header'
import { DocumentNav, SECTION_IDS } from '@/components/results/document-nav'
import { OverviewSection } from '@/components/results/overview-section'
import { DecisionsSection } from '@/components/results/decisions-section'
import { ActionsSection } from '@/components/results/actions-section'
import { QuestionsSection } from '@/components/results/questions-section'
import { AskSection } from '@/components/chat/ask-section'
import { TranscriptSection } from '@/components/transcript/transcript-section'
import { Colophon } from '@/components/results/colophon'
import { SavePopover } from '@/components/download/save-popover'
import { Logo } from '@/components/layout/logo'
import { staggerContainer, documentCascade } from '@/lib/motion'

const SECTION_SPACING = 'mt-[72px]'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params?.id as string

  const currentMeeting = useMeetingStore((s) => s.currentMeeting)
  const setCurrentMeeting = useMeetingStore((s) => s.setCurrentMeeting)

  // If no meeting in store (e.g. page refresh), load demo data
  useEffect(() => {
    if (!currentMeeting) {
      setCurrentMeeting({ ...MOCK_MEETING, id: meetingId ?? MOCK_MEETING.id })
    }
  }, [currentMeeting, meetingId, setCurrentMeeting])

  const meeting = currentMeeting ?? { ...MOCK_MEETING, id: meetingId }

  // Title reveal state — controls when sections cascade in
  const [titleRevealComplete, setTitleRevealComplete] = useState(false)

  const handleRevealComplete = useCallback(() => {
    setTitleRevealComplete(true)
  }, [])

  // Scroll spy for document navigation
  const { activeId, scrollTo } = useScrollSpy(SECTION_IDS)

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Sticky header — appears after scroll */}
      <StickyHeader meeting={meeting} titleRevealComplete={titleRevealComplete} />

      {/* Top bar — logo + save */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-12 transition-colors backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-header-bg)',
          borderBottom: '1px solid var(--color-separator)',
        }}
      >
        <Logo size="sm" />
        <SavePopover meeting={meeting} />
      </header>

      {/* Document navigation */}
      <div
        className="sticky top-12 z-30 px-4 py-2 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-header-bg)',
          borderBottom: '1px solid var(--color-separator)',
        }}
      >
        <DocumentNav activeId={activeId} onNavigate={scrollTo} />
      </div>

      {/* Main document */}
      <main
        className="mx-auto px-5 md:px-8 pb-8"
        style={{ maxWidth: '760px' }}
        id="main-content"
      >
        {/* Title + metadata — reveal animation */}
        <TitleReveal meeting={meeting} onRevealComplete={handleRevealComplete} />

        {/* Sections cascade in after title reveal */}
        <motion.div
          initial="hidden"
          animate={titleRevealComplete ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="flex flex-col"
        >
          {/* Overview */}
          <motion.div variants={documentCascade}>
            <OverviewSection
              summary={meeting.summary}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Key Decisions */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <DecisionsSection
              text={meeting.key_decisions}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Action Items */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <ActionsSection
              text={meeting.action_items}
              meetingId={meeting.id}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Open Questions */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <QuestionsSection
              text={meeting.questions ?? ''}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Ask */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <AskSection meetingId={meeting.id} />
          </motion.div>

          {/* Transcript */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <TranscriptSection
              text={meeting.transcript}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Colophon */}
          <motion.div variants={documentCascade}>
            <Colophon generatedAt={meeting.metadata?.generation_timestamp} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
