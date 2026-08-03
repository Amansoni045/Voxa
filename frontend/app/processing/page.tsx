'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { StagePoem } from '@/components/processing/stage-poem'
import { useMeetingStore } from '@/stores/meeting-store'
import { useProcessing } from '@/hooks/use-processing'
import { cn } from '@/lib/utils'

export default function ProcessingPage() {
  const router = useRouter()
  const currentMeeting = useMeetingStore((s) => s.currentMeeting)
  const processingFile = useMeetingStore((s) => s.processingFile)
  const processingUrl = useMeetingStore((s) => s.processingUrl)
  const setProcessingFile = useMeetingStore((s) => s.setProcessingFile)
  const setProcessingUrl = useMeetingStore((s) => s.setProcessingUrl)

  // isApiDone is true when the meeting analysis has landed in the store
  const isApiDone = currentMeeting !== null

  const { currentStageIndex, completedStages, isDone } = useProcessing(isApiDone)

  // Navigate to results when processing is fully done
  useEffect(() => {
    if (isDone && currentMeeting) {
      const timer = setTimeout(() => {
        router.push(`/meeting/${currentMeeting.id}`)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isDone, currentMeeting, router])

  const handleCancel = () => {
    setProcessingFile(null)
    setProcessingUrl(null)
    router.push('/')
  }

  const sourceName =
    processingFile ?? (processingUrl ? new URL(processingUrl).hostname : null)

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Subtle ambient background — very slow warm gradient shift */}
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

      {/* Cancel — top-left, unobtrusive */}
      <div className="absolute top-4 left-5">
        <button
          onClick={handleCancel}
          aria-label="Cancel processing and return home"
          className={cn(
            'flex items-center gap-1.5 text-[13px] transition-opacity duration-150',
            'hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-sm'
          )}
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <X size={14} strokeWidth={1.5} />
          <span>Cancel</span>
        </button>
      </div>

      {/* Source name — trust anchor */}
      {sourceName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 text-[12px] max-w-[240px] truncate text-center"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label={`Processing: ${sourceName}`}
        >
          {sourceName}
        </motion.p>
      )}

      {/* Stage poem — center of screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center px-8 w-full max-w-[400px]"
      >
        <StagePoem
          currentStageIndex={currentStageIndex}
          completedStages={completedStages}
        />
      </motion.div>
    </main>
  )
}
