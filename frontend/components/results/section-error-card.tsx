'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, Terminal } from 'lucide-react'
import type { SectionResult } from '@/types/content'

interface SectionErrorCardProps {
  sectionTitle: string
  sectionResult: SectionResult
  onRetry?: () => void
  isRetrying?: boolean
}

export function SectionErrorCard({
  sectionTitle,
  sectionResult,
  onRetry,
  isRetrying = false,
}: SectionErrorCardProps) {
  const [showDevDetails, setShowDevDetails] = useState(false)
  const dev = sectionResult.developer_details

  return (
    <div
      className="p-6 rounded-[20px] border border-amber-500/20 bg-amber-500/5 flex flex-col gap-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle size={18} strokeWidth={2} />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-text-primary)' }}>
            We couldn't finish the {sectionTitle.toLowerCase()} section
          </h4>
          <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
            We analyzed your recording successfully, but one of our analysis services was temporarily unavailable during this section.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-500/15">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Retrying section...' : 'Retry Section Analysis'}</span>
          </button>
        )}

        {dev && (
          <button
            onClick={() => setShowDevDetails((prev) => !prev)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors ml-auto"
          >
            <Terminal size={12} />
            <span>Developer Details</span>
            {showDevDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Developer Details Panel */}
      <AnimatePresence>
        {showDevDetails && dev && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3.5 rounded-[12px] border border-[var(--color-border)] text-[11px] font-mono leading-[1.6] flex flex-col gap-1 mt-1"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-tertiary)' }}
            >
              <div><strong>Provider:</strong> {dev.provider ?? 'Mistral AI'}</div>
              <div><strong>Exception:</strong> {dev.exception}</div>
              {dev.code && <div><strong>HTTP Status Code:</strong> {dev.code}</div>}
              <div><strong>Raw Message:</strong> {dev.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
