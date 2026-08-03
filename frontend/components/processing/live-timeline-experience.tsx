'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Clock,
  Globe,
  FileText,
  Sparkles,
  Volume2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { type RealStage } from '@/stores/content-store'
import { getContentTypeBadge } from '@/lib/content-helpers'
import { cn } from '@/lib/utils'

export interface TimelineStage {
  id: RealStage
  title: string
  activeSubtitle: string
}

export const TimelineStages: TimelineStage[] = [
  {
    id: 'preparing',
    title: 'Getting everything ready',
    activeSubtitle: 'Receiving your audio stream and setting up your workspace.',
  },
  {
    id: 'loading_model',
    title: 'Setting up Voxa for its first analysis',
    activeSubtitle: 'This one-time setup may take a minute. Future analyses will be much faster.',
  },
  {
    id: 'transcribing',
    title: 'Listening carefully to every word',
    activeSubtitle: 'Understanding the flow of speech and capturing every detail.',
  },
  {
    id: 'understanding',
    title: 'Finding the important moments',
    activeSubtitle: 'Distilling key decisions, action items, and key takeaways for you.',
  },
  {
    id: 'generating_report',
    title: 'Putting your report together',
    activeSubtitle: 'Organizing everything into a publication-ready summary.',
  },
  {
    id: 'done',
    title: 'Your report is ready',
    activeSubtitle: 'Opening your distilled report...',
  },
]

const STAGE_ORDER: RealStage[] = [
  'preparing',
  'loading_model',
  'transcribing',
  'understanding',
  'generating_report',
  'done',
]

// Reassurance microcopy when a stage lasts longer than 10 seconds
const LONG_STAGE_REASSURANCES = [
  "We're carefully listening to every minute of speech.",
  "Longer recordings naturally take a little more time.",
  "We're making sure nothing important is missed.",
  "Distilling complex conversation into clean, clear insights.",
]

interface LiveTimelineExperienceProps {
  activeStage: RealStage
  stageMessage?: string
  stageDetail?: string | null
  sourceName: string
  sourceType?: string
  durationSeconds?: number
  detectedLanguage?: string
  onCancel: () => void
  onBackground: () => void
}

export function LiveTimelineExperience({
  activeStage,
  stageMessage,
  stageDetail,
  sourceName,
  sourceType = 'recording',
  durationSeconds,
  detectedLanguage = 'English',
  onCancel,
  onBackground,
}: LiveTimelineExperienceProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [stageElapsed, setStageElapsed] = useState(0)
  const [reassuranceIndex, setReassuranceIndex] = useState(0)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const activeIndex = STAGE_ORDER.indexOf(activeStage)

  // Overall Timer
  useEffect(() => {
    if (activeStage === 'done') return
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
      setStageElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [activeStage])

  // Reset stage timer on active stage change
  useEffect(() => {
    setStageElapsed(0)
    setReassuranceIndex(0)
  }, [activeStage])

  // Cycle reassurance every 8 seconds after initial 10 seconds on same stage
  useEffect(() => {
    if (stageElapsed > 10 && stageElapsed % 8 === 0) {
      setReassuranceIndex((prev) => (prev + 1) % LONG_STAGE_REASSURANCES.length)
    }
  }, [stageElapsed])

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (secs?: number) => {
    if (!secs) return null
    const mins = Math.round(secs / 60)
    return mins > 0 ? `~${mins} min duration` : `${secs}s duration`
  }

  const badgeLabel = getContentTypeBadge(sourceType as any)

  return (
    <div className="relative flex flex-col items-center w-full max-w-[680px] mx-auto">
      {/* Real-time Insights Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-between p-4 mb-8 rounded-[20px] border border-[var(--color-border)] shadow-sm backdrop-blur-md"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Volume2 size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              {badgeLabel}
            </span>
            <span className="text-[14px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {sourceName}
            </span>
          </div>
        </div>

        {/* Live Detected Info Pills */}
        <div className="flex items-center gap-2">
          {detectedLanguage && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-zone)] text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <Globe size={12} />
              <span>{detectedLanguage}</span>
            </div>
          )}
          {formatDuration(durationSeconds) && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-zone)] text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <FileText size={12} />
              <span>{formatDuration(durationSeconds)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] font-mono text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
            <Clock size={13} className="text-[var(--color-accent)]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Full Live Timeline */}
      <div className="w-full flex flex-col gap-4 py-2">
        {TimelineStages.slice(0, 5).map((stage, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex
          const isPending = idx > activeIndex

          return (
            <motion.div
              key={stage.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative flex items-start gap-4 p-5 rounded-[22px] border transition-all duration-300',
                isActive
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-lg scale-[1.01]'
                  : isCompleted
                  ? 'border-transparent bg-[var(--color-zone)] opacity-75'
                  : 'border-transparent bg-[var(--color-surface)] opacity-35'
              )}
            >
              {/* Left Stage Indicator Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-sm"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <motion.span
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-[var(--color-accent)]"
                    />
                    <span className="w-3 h-3 rounded-full bg-[var(--color-accent)] z-10" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] opacity-50" />
                  </div>
                )}
              </div>

              {/* Stage Copy */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      'text-[17px] sm:text-[18px] tracking-[-0.015em]',
                      isActive ? 'font-semibold text-[var(--color-text-primary)]' : isCompleted ? 'font-medium text-[var(--color-text-secondary)]' : 'font-normal text-[var(--color-text-tertiary)]'
                    )}
                  >
                    {isActive && stageMessage ? stageMessage : stage.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-[12px] font-medium text-[var(--color-accent)]">Done</span>
                  )}
                </div>

                <p
                  className={cn(
                    'text-[14px] leading-[1.6]',
                    isActive ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'
                  )}
                >
                  {isActive && stageDetail ? stageDetail : stage.activeSubtitle}
                </p>

                {/* Long-stage reassurance text after 10 seconds */}
                {isActive && stageElapsed > 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-2 text-[13px] font-medium flex items-center gap-1.5 text-[var(--color-accent)]"
                  >
                    <Sparkles size={13} />
                    <span>{LONG_STAGE_REASSURANCES[reassuranceIndex]}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Optional Technical Details Accordion */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={() => setShowDiagnostics((prev) => !prev)}
          className="flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <span>Technical details</span>
          {showDiagnostics ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <AnimatePresence>
          {showDiagnostics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full text-center"
            >
              <div
                className="p-3 rounded-[12px] border border-[var(--color-border)] text-[11px] font-mono leading-[1.5] flex flex-col gap-1 mt-1"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-tertiary)' }}
              >
                <div>Active Stage ID: {activeStage}</div>
                <div>Source: {sourceName}</div>
                <div>Elapsed Seconds: {elapsedSeconds}s</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
