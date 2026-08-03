'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Maximize2, X } from 'lucide-react'
import { useContentStore } from '@/stores/content-store'
import { getContentTypeBadge } from '@/lib/content-helpers'

export function BackgroundProgressToast() {
  const router = useRouter()
  const processingStatus = useContentStore((s) => s.processingStatus)
  const isBackgrounded = useContentStore((s) => s.isBackgrounded)
  const processingFile = useContentStore((s) => s.processingFile)
  const processingUrl = useContentStore((s) => s.processingUrl)
  const processingSourceType = useContentStore((s) => s.processingSourceType)
  const stageMessage = useContentStore((s) => s.stageMessage)
  const setIsBackgrounded = useContentStore((s) => s.setIsBackgrounded)
  const resetProcessing = useContentStore((s) => s.resetProcessing)

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (processingStatus !== 'processing') {
      setSeconds(0)
      return
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [processingStatus])

  if (processingStatus !== 'processing' || !isBackgrounded) {
    return null
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const badge = processingSourceType ? getContentTypeBadge(processingSourceType) : 'Content'
  const title = processingFile ?? (processingUrl ? new URL(processingUrl).hostname : badge)

  const handleMaximize = () => {
    setIsBackgrounded(false)
    router.push('/processing')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-[16px] border border-[var(--color-border)] shadow-2xl backdrop-blur-md"
        style={{ backgroundColor: 'var(--color-surface)', minWidth: '280px', maxWidth: '360px' }}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <Loader2 size={16} className="animate-spin" />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {formatTimer(seconds)}
            </span>
          </div>
          <p className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {stageMessage || 'Distilling content...'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleMaximize}
            aria-label="Expand processing view"
            className="p-1.5 rounded-[6px] hover:bg-[var(--color-zone)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={resetProcessing}
            aria-label="Cancel processing"
            className="p-1.5 rounded-[6px] hover:bg-[var(--color-zone)] text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
