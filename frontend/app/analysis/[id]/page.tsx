'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { useContentStore } from '@/stores/content-store'
import { MOCK_CONTENT } from '@/lib/api'
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
import { HistoryDrawer } from '@/components/history/history-drawer'
import { CommandPalette } from '@/components/shared/command-palette'
import { staggerContainer, documentCascade } from '@/lib/motion'

const SECTION_SPACING = 'mt-[72px]'
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const contentId = params?.id as string

  const currentContent = useContentStore((s) => s.currentContent)
  const setCurrentContent = useContentStore((s) => s.setCurrentContent)
  const history = useContentStore((s) => s.history)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Restore content from history if available, or load demo mode ONLY if explicitly enabled
  useEffect(() => {
    if (!currentContent && contentId) {
      const historicalMatch = history.find((item) => item.id === contentId)
      if (historicalMatch) {
        setCurrentContent({
          id: historicalMatch.id,
          title: historicalMatch.title,
          sourceType: historicalMatch.sourceType,
          summary: 'No summary text available.',
          action_items: '',
          key_decisions: '',
          questions: '',
          metadata: {
            duration_seconds: historicalMatch.duration_seconds,
            channelName: historicalMatch.channelName,
            thumbnailUrl: historicalMatch.thumbnailUrl,
            originalUrl: historicalMatch.originalUrl,
          },
        })
      } else if (IS_DEMO_MODE) {
        setCurrentContent({ ...MOCK_CONTENT, id: contentId })
      }
    }
  }, [currentContent, contentId, history, setCurrentContent])

  const content = currentContent

  const [titleRevealComplete, setTitleRevealComplete] = useState(false)

  const handleRevealComplete = useCallback(() => {
    setTitleRevealComplete(true)
  }, [])

  const { activeId, scrollTo } = useScrollSpy(SECTION_IDS)

  const handleAnalyzeAnother = useCallback(() => {
    setCurrentContent(null)
    router.push('/')
  }, [setCurrentContent, router])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleAnalyzeAnother()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        setIsHistoryOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAnalyzeAnother])

  // Honest Not Found / Empty View if content does not exist
  if (!content) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-full max-w-[420px] flex flex-col items-center gap-5 p-8 rounded-[24px] border border-[var(--color-border)] shadow-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertCircle size={24} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]" style={{ color: 'var(--color-text-primary)' }}>
              Analysis Not Found
            </h2>
            <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
              This content has not been analyzed yet or is no longer active in your workspace session.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all w-full mt-2"
          >
            <ArrowLeft size={14} />
            <span>Return to Home & Analyze</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky header */}
      <StickyHeader
        content={content}
        titleRevealComplete={titleRevealComplete}
        onAnalyzeAnother={handleAnalyzeAnother}
      />

      {/* Top bar — Logo, Analyze Another, Save, History */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 transition-colors backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-header-bg)',
          borderBottom: '1px solid var(--color-separator)',
        }}
      >
        <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push('/')}>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-3">
          {/* Analyze Another Primary Action */}
          <button
            onClick={handleAnalyzeAnother}
            aria-label="Analyze another file or link (Cmd+N)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Analyze Another</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] opacity-75 ml-1">⌘N</kbd>
          </button>

          {/* Save Popover */}
          <SavePopover meeting={content} size="sm" />

          {/* History Drawer Trigger */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Open history workspace"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-[12px] font-medium transition-all hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Clock size={14} className="text-[var(--color-accent)]" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </header>

      {/* Document navigation */}
      <div
        className="sticky top-14 z-30 px-4 py-2 backdrop-blur-md"
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
        <TitleReveal content={content} onRevealComplete={handleRevealComplete} />

        <motion.div
          initial="hidden"
          animate={titleRevealComplete ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="flex flex-col"
        >
          {/* Overview */}
          <motion.div variants={documentCascade}>
            <OverviewSection
              summary={content.summary}
              sourceType={content.sourceType}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Key Decisions */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <DecisionsSection
              text={content.key_decisions}
              sourceType={content.sourceType}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Action Items */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <ActionsSection
              text={content.action_items}
              contentId={content.id}
              sourceType={content.sourceType}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Open Questions */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <QuestionsSection
              text={content.questions ?? ''}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Ask */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <AskSection contentId={content.id} sourceType={content.sourceType} />
          </motion.div>

          {/* Transcript */}
          <motion.div variants={documentCascade} className={SECTION_SPACING}>
            <TranscriptSection
              text={content.transcript}
              sourceType={content.sourceType}
              isVisible={titleRevealComplete}
            />
          </motion.div>

          {/* Colophon */}
          <motion.div variants={documentCascade}>
            <Colophon generatedAt={content.metadata?.generation_timestamp} />
          </motion.div>
        </motion.div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAnalyzeAnother={handleAnalyzeAnother}
      />
    </div>
  )
}
