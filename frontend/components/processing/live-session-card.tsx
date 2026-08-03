'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Globe, FileText, Sparkles, Volume2, Info } from 'lucide-react'
import type { RealStage } from '@/stores/content-store'
import { getContentTypeBadge } from '@/lib/content-helpers'
import { cn } from '@/lib/utils'

export interface LiveActivityItem {
  id: string
  label: string
  status: 'completed' | 'active' | 'pending'
}

interface LiveSessionCardProps {
  activeStage: RealStage
  sourceName: string
  sourceType?: string
  durationSeconds?: number
  detectedLanguage?: string
  elapsedSeconds: number
  stageElapsedSeconds: number
}

const LONG_STAGE_MESSAGES = [
  "We're carefully reviewing everything.",
  "Longer recordings naturally take a little more time.",
  "We're making sure nothing important is missed.",
  "Your report will appear as soon as each section is ready.",
]

export function LiveSessionCard({
  activeStage,
  sourceName,
  sourceType = 'recording',
  durationSeconds,
  detectedLanguage,
  elapsedSeconds,
  stageElapsedSeconds,
}: LiveSessionCardProps) {
  const [reassuranceIdx, setReassuranceIdx] = useState(0)

  useEffect(() => {
    if (stageElapsedSeconds > 10 && stageElapsedSeconds % 8 === 0) {
      setReassuranceIdx((prev) => (prev + 1) % LONG_STAGE_MESSAGES.length)
    }
  }, [stageElapsedSeconds])

  const formatElapsed = (secs: number) => {
    if (secs < 60) return `${secs} seconds ago`
    const mins = Math.floor(secs / 60)
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`
  }

  const formatDuration = (secs?: number) => {
    if (!secs) return 'Detecting duration...'
    const mins = Math.round(secs / 60)
    return mins > 0 ? `${mins} min` : `${secs} sec`
  }

  const badge = getContentTypeBadge(sourceType as any)

  // Map real backend stages to Live Activity Timeline
  const activityItems: LiveActivityItem[] = [
    {
      id: 'preparing',
      label: `${badge} received & audio prepared`,
      status: activeStage === 'preparing' ? 'active' : 'completed',
    },
    {
      id: 'loading_model',
      label: 'Speech recognition initialized',
      status:
        activeStage === 'preparing'
          ? 'pending'
          : activeStage === 'loading_model'
          ? 'active'
          : 'completed',
    },
    {
      id: 'transcribing',
      label: 'Listening carefully to content',
      status:
        activeStage === 'preparing' || activeStage === 'loading_model'
          ? 'pending'
          : activeStage === 'transcribing'
          ? 'active'
          : 'completed',
    },
    {
      id: 'understanding',
      label: 'Finding key decisions & action items',
      status:
        activeStage === 'understanding'
          ? 'active'
          : activeStage === 'generating_report' || activeStage === 'done'
          ? 'completed'
          : 'pending',
    },
    {
      id: 'generating_report',
      label: 'Creating your report',
      status:
        activeStage === 'generating_report'
          ? 'active'
          : activeStage === 'done'
          ? 'completed'
          : 'pending',
    },
  ]

  return (
    <div className="w-full max-w-[460px] flex flex-col gap-6 mt-8 mx-auto">
      {/* Long-stage Reassurance Notice (Only if stage takes > 10s) */}
      <AnimatePresence>
        {stageElapsedSeconds > 10 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-center gap-2 text-[13px] font-medium text-center"
            style={{ color: 'var(--color-accent)' }}
          >
            <Sparkles size={14} />
            <span>{LONG_STAGE_MESSAGES[reassuranceIdx]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Session Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-5 rounded-[20px] border border-[var(--color-border)] shadow-sm backdrop-blur-md flex flex-col gap-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-separator)' }}>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Current Analysis
          </span>
          <span className="text-[12px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            Started {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
          <div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Source
            </div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {badge}
            </div>
          </div>

          <div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Duration
            </div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {formatDuration(durationSeconds)}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Title
            </div>
            <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {sourceName}
            </div>
          </div>

          <div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Language
            </div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {detectedLanguage ?? 'Detecting...'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-5 rounded-[20px] border border-[var(--color-border)] shadow-sm backdrop-blur-md flex flex-col gap-3"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Recent Activity
        </span>

        <div className="flex flex-col gap-2.5">
          {activityItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-[13px]">
              {item.status === 'completed' ? (
                <div className="w-4 h-4 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center flex-shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
              ) : item.status === 'active' ? (
                <div className="relative flex items-center justify-center w-4 h-4 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-ping absolute" />
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] relative z-10" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-[var(--color-border)] flex-shrink-0" />
              )}

              <span
                className={cn(
                  item.status === 'active'
                    ? 'font-medium text-[var(--color-text-primary)]'
                    : item.status === 'completed'
                    ? 'text-[var(--color-text-secondary)]'
                    : 'text-[var(--color-text-tertiary)] opacity-60'
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
