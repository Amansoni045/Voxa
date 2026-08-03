'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDate, formatDuration } from '@/lib/utils'
import type { MeetingAnalysis } from '@/types/meeting'
import { staggerContainer, documentCascade, titleReveal } from '@/lib/motion'

interface TitleRevealProps {
  meeting: MeetingAnalysis
  onRevealComplete: () => void
}

export function TitleReveal({ meeting, onRevealComplete }: TitleRevealProps) {
  const [showDocument, setShowDocument] = useState(false)

  useEffect(() => {
    // Title appears alone for 600ms, then the rest cascades in
    const timer = setTimeout(() => {
      setShowDocument(true)
      onRevealComplete()
    }, 600)
    return () => clearTimeout(timer)
  }, [onRevealComplete])

  const metadata = meeting.metadata
  const duration = metadata?.duration_seconds
    ? formatDuration(metadata.duration_seconds)
    : null
  const lang = metadata?.detected_language ?? null
  const date = metadata?.generation_timestamp
    ? formatDate(metadata.generation_timestamp)
    : formatDate(new Date())

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col items-center text-center pt-12 pb-6"
    >
      {/* Meeting title — appears first and alone */}
      <motion.h1
        variants={titleReveal}
        className="text-[30px] font-semibold tracking-[-0.022em] leading-[1.25] max-w-[580px]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {meeting.title}
      </motion.h1>

      {/* Metadata — fades in after title */}
      <motion.div
        variants={documentCascade}
        style={{
          opacity: showDocument ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
        className="flex items-center gap-2 mt-2 flex-wrap justify-center"
        aria-label="Meeting details"
      >
        {duration && (
          <span className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {duration}
          </span>
        )}
        {duration && lang && (
          <span style={{ color: 'var(--color-text-quarternary)' }} aria-hidden="true">·</span>
        )}
        {lang && (
          <span className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {lang}
          </span>
        )}
        {(duration || lang) && (
          <span style={{ color: 'var(--color-text-quarternary)' }} aria-hidden="true">·</span>
        )}
        <span className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {date}
        </span>
      </motion.div>
    </motion.div>
  )
}
