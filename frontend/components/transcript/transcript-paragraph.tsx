'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TranscriptParagraph } from '@/types/meeting'

interface TranscriptParagraphProps {
  paragraph: TranscriptParagraph
  searchQuery: string
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          backgroundColor: 'rgba(253, 224, 71, 0.6)',
          color: 'inherit',
          borderRadius: '2px',
          padding: '0 1px',
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function TranscriptParagraphItem({
  paragraph,
  searchQuery,
}: TranscriptParagraphProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(paragraph.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [paragraph.text])

  return (
    <div className="group relative py-4">
      {/* Speaker label */}
      {paragraph.speaker && (
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {paragraph.speaker}
        </p>
      )}

      <div className="flex items-start gap-3">
        {/* Timestamp */}
        {paragraph.timestamp && (
          <span
            className="text-[11px] flex-shrink-0 mt-[2px] tabular-nums"
            style={{ color: 'var(--color-text-quarternary)' }}
          >
            {paragraph.timestamp}
          </span>
        )}

        {/* Text */}
        <p
          className="text-[15px] leading-[1.8] tracking-[-0.003em] flex-1"
          style={{ color: 'var(--color-text-secondary)', maxWidth: '660px' }}
        >
          {highlightText(paragraph.text, searchQuery)}
        </p>

        {/* Copy button — appears on hover */}
        <div
          className={cn(
            'flex-shrink-0 transition-opacity duration-100 mt-[2px]',
            'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
          )}
        >
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy paragraph'}
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded-[4px] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
            )}
            style={{
              color: copied ? 'var(--color-success)' : 'var(--color-accent)',
              backgroundColor: copied
                ? 'var(--color-success-light)'
                : 'var(--color-accent-light)',
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
