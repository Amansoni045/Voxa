'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Play } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { getContentTypeBadge } from '@/lib/content-helpers'
import type { ContentAnalysis } from '@/types/content'
import { staggerContainer, documentCascade, titleReveal } from '@/lib/motion'

interface TitleRevealProps {
  content: ContentAnalysis
  onRevealComplete: () => void
}

export function TitleReveal({ content, onRevealComplete }: TitleRevealProps) {
  const [showDocument, setShowDocument] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDocument(true)
      onRevealComplete()
    }, 600)
    return () => clearTimeout(timer)
  }, [onRevealComplete])

  const metadata = content.metadata
  const duration = metadata?.duration_seconds
    ? formatDuration(metadata.duration_seconds)
    : null
  const lang = metadata?.detected_language ?? null
  const date = metadata?.generation_timestamp
    ? formatDate(metadata.generation_timestamp)
    : formatDate(new Date())

  const badgeLabel = getContentTypeBadge(content.sourceType)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col items-center text-center pt-10 pb-6"
    >
      {/* Source Type Badge */}
      <motion.div variants={titleReveal} className="mb-3">
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
          {badgeLabel}
        </span>
      </motion.div>

      {/* YouTube Thumbnail Header Integration */}
      {content.sourceType === 'youtube' && metadata?.thumbnailUrl && (
        <motion.div
          variants={documentCascade}
          className="relative group mb-6 rounded-[16px] overflow-hidden shadow-lg border border-[var(--color-border)] max-w-[540px] w-full"
        >
          <img
            src={metadata.thumbnailUrl}
            alt={content.title}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {metadata.originalUrl && (
            <a
              href={metadata.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-[14px]"
            >
              <Play size={18} fill="white" />
              <span>Watch on YouTube</span>
              <ExternalLink size={14} />
            </a>
          )}
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        variants={titleReveal}
        className="text-[28px] md:text-[34px] font-semibold tracking-[-0.022em] leading-[1.25] max-w-[620px]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {content.title}
      </motion.h1>

      {/* Subtitle & Metadata */}
      <motion.div
        variants={documentCascade}
        style={{
          opacity: showDocument ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
        className="flex items-center gap-2 mt-3 flex-wrap justify-center text-[13px]"
        aria-label="Content metadata"
      >
        {metadata?.channelName && (
          <>
            <span className="font-medium text-[var(--color-text-primary)]">
              {metadata.channelName}
            </span>
            <span style={{ color: 'var(--color-text-quarternary)' }} aria-hidden="true">·</span>
          </>
        )}

        {duration && (
          <span style={{ color: 'var(--color-text-tertiary)' }}>
            {duration}
          </span>
        )}

        {duration && lang && (
          <span style={{ color: 'var(--color-text-quarternary)' }} aria-hidden="true">·</span>
        )}

        {lang && (
          <span style={{ color: 'var(--color-text-tertiary)' }}>
            {lang}
          </span>
        )}

        {(duration || lang) && (
          <span style={{ color: 'var(--color-text-quarternary)' }} aria-hidden="true">·</span>
        )}

        <span style={{ color: 'var(--color-text-tertiary)' }}>
          {date}
        </span>
      </motion.div>
    </motion.div>
  )
}
