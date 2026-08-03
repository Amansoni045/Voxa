'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { StagePoem } from '@/components/processing/stage-poem'
import { useContentStore } from '@/stores/content-store'
import { useProcessing } from '@/hooks/use-processing'
import { getContentTypeBadge } from '@/lib/content-helpers'
import { cn } from '@/lib/utils'

export default function ProcessingPage() {
  const router = useRouter()
  const currentContent = useContentStore((s) => s.currentContent)
  const processingFile = useContentStore((s) => s.processingFile)
  const processingUrl = useContentStore((s) => s.processingUrl)
  const processingSourceType = useContentStore((s) => s.processingSourceType)
  const processingError = useContentStore((s) => s.processingError)
  const resetProcessing = useContentStore((s) => s.resetProcessing)
  const setProcessingFile = useContentStore((s) => s.setProcessingFile)
  const setProcessingUrl = useContentStore((s) => s.setProcessingUrl)

  const isApiDone = currentContent !== null

  const { currentStageIndex, completedStages, isDone } = useProcessing(isApiDone)

  // Navigate to /analysis/[id] when processing is fully done and content exists
  useEffect(() => {
    if (isDone && currentContent && !processingError) {
      const timer = setTimeout(() => {
        router.push(`/analysis/${currentContent.id}`)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isDone, currentContent, processingError, router])

  const handleCancel = () => {
    resetProcessing()
    router.push('/')
  }

  const badge = processingSourceType ? getContentTypeBadge(processingSourceType) : 'Content'
  const sourceName =
    processingFile ??
    (processingUrl
      ? `${badge}: ${new URL(processingUrl).hostname}`
      : `Distilling ${badge.toLowerCase()}...`)

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
          className="w-full max-w-[440px] flex flex-col items-center gap-5 p-8 rounded-[24px] border border-[var(--color-border)] shadow-xl"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} strokeWidth={2} />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]" style={{ color: 'var(--color-text-primary)' }}>
              We couldn't finish analyzing this content
            </h2>
            <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
              {processingError}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <button
              onClick={handleCancel}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-medium border border-[var(--color-border)] transition-all hover:bg-[var(--color-zone)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <ArrowLeft size={14} />
              <span>Return Home</span>
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // ─── Normal Poetic Processing View ───────────────────────────────
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
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

      {/* Cancel button */}
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

      {/* Source badge + title */}
      {sourceName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 text-[12px] max-w-[280px] truncate text-center font-medium"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label={`Processing: ${sourceName}`}
        >
          {sourceName}
        </motion.p>
      )}

      {/* Stage poem */}
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
