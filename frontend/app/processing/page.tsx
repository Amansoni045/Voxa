'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, ArrowLeft, Clock, Command } from 'lucide-react'
import { StagePoem } from '@/components/processing/stage-poem'
import { LiveSessionCard } from '@/components/processing/live-session-card'
import { useContentStore, type RealStage } from '@/stores/content-store'
import { getContentTypeBadge } from '@/lib/content-helpers'
import { Logo } from '@/components/layout/logo'
import { HistoryDrawer } from '@/components/history/history-drawer'
import { CommandPalette } from '@/components/shared/command-palette'

const STAGE_ORDER: RealStage[] = [
  'preparing',
  'loading_model',
  'transcribing',
  'understanding',
  'generating_report',
  'done',
]

const STAGE_ITEMS = [
  { label: 'Getting everything ready...' },
  { label: 'Setting up Voxa for its first analysis...' },
  { label: 'Listening carefully to every word...' },
  { label: 'Finding the important moments...' },
  { label: 'Putting your report together...' },
  { label: 'Your report is ready.' },
]

export default function ProcessingPage() {
  const router = useRouter()
  const currentContent = useContentStore((s) => s.currentContent)
  const processingFile = useContentStore((s) => s.processingFile)
  const processingUrl = useContentStore((s) => s.processingUrl)
  const processingSourceType = useContentStore((s) => s.processingSourceType)
  const processingStatus = useContentStore((s) => s.processingStatus)
  const processingError = useContentStore((s) => s.processingError)
  const activeStage = useContentStore((s) => s.activeStage)
  const history = useContentStore((s) => s.history)

  const resetProcessing = useContentStore((s) => s.resetProcessing)

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [stageElapsedSeconds, setStageElapsedSeconds] = useState(0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Overall & Stage Timers
  useEffect(() => {
    if (processingStatus === 'done') return
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
      setStageElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [processingStatus])

  // Reset stage timer when activeStage changes
  useEffect(() => {
    setStageElapsedSeconds(0)
  }, [activeStage])

  // Navigate to /analysis/[id] when processing is done
  useEffect(() => {
    if (currentContent && processingStatus === 'done' && !processingError) {
      const timer = setTimeout(() => {
        router.push(`/analysis/${currentContent.id}`)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentContent, processingStatus, processingError, router])

  const currentStageIndex = Math.max(0, STAGE_ORDER.indexOf(activeStage))

  const completedStages = useMemo(() => {
    if (currentStageIndex <= 0) return []
    return STAGE_ITEMS.slice(0, currentStageIndex).map((s) => s.label)
  }, [currentStageIndex])

  const handleCancel = () => {
    resetProcessing()
    router.push('/')
  }

  const badge = processingSourceType ? getContentTypeBadge(processingSourceType) : 'Content'
  const sourceName =
    processingFile ??
    (processingUrl
      ? `${badge}: ${new URL(processingUrl).hostname}`
      : `Analyzing content...`)

  // ─── Honest Failure View ──────────────────────────────────────────
  if (processingError) {
    return (
      <main
        className="min-h-dvh flex flex-col items-center justify-center relative p-6 text-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-[480px] flex flex-col items-center gap-6 p-8 rounded-[24px] border border-[var(--color-border)] shadow-xl"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} strokeWidth={2} />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[22px] font-semibold tracking-[-0.015em]" style={{ color: 'var(--color-text-primary)' }}>
              We couldn't finish analyzing this content
            </h2>
            <p className="text-[15px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
              {processingError}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <button
              onClick={handleCancel}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] text-[14px] font-medium border border-[var(--color-border)] transition-all hover:bg-[var(--color-zone)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <ArrowLeft size={15} />
              <span>Return Home & Try Again</span>
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // ─── Approved Processing View (StagePoem + Live Session Card) ──────
  return (
    <main
      className="min-h-dvh flex flex-col justify-between relative overflow-hidden px-6 py-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, var(--color-accent-muted) 0%, transparent 70%)',
          opacity: 0.4,
          animation: 'ambient-warm 12s ease-in-out infinite',
        }}
      />

      {/* Header — Logo + Cancel + History + Search (Background Experience) */}
      <header className="w-full flex items-center justify-between z-20">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open command palette (Cmd+K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-[12px] transition-all hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Command size={13} />
            <span>Search & Commands</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Open history workspace"
            className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-[12px] font-medium transition-all hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Clock size={14} className="text-[var(--color-accent)]" />
            <span>History</span>
          </button>

          <button
            onClick={handleCancel}
            aria-label="Cancel processing and return home"
            className="flex items-center gap-1 text-[13px] px-3 py-1.5 rounded-[8px] transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <X size={14} strokeWidth={1.5} />
            <span>Cancel</span>
          </button>
        </div>
      </header>

      {/* Center Section — UNTOUCHED Approved StagePoem + Live Session Card */}
      <div className="my-auto relative z-10 flex flex-col items-center w-full py-8">
        <StagePoem
          currentStageIndex={currentStageIndex}
          completedStages={completedStages}
          stages={STAGE_ITEMS}
        />

        {/* Live Session Card & Real Backend Activity (Appears Underneath StagePoem) */}
        <LiveSessionCard
          activeStage={activeStage}
          sourceName={sourceName}
          sourceType={processingSourceType ?? 'recording'}
          durationSeconds={currentContent?.metadata?.duration_seconds}
          detectedLanguage={currentContent?.metadata?.detected_language}
          elapsedSeconds={elapsedSeconds}
          stageElapsedSeconds={stageElapsedSeconds}
        />
      </div>

      {/* History Drawer Modal */}
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAnalyzeAnother={() => {}}
      />
    </main>
  )
}
