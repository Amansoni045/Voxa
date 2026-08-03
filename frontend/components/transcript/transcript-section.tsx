'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { SectionLabel } from '@/components/shared/section-label'
import { EmptyState } from '@/components/shared/empty-state'
import { TranscriptParagraphItem } from '@/components/transcript/transcript-paragraph'
import { parseTranscript } from '@/lib/parsers'
import { getTranscriptEmptyMessage } from '@/lib/content-helpers'
import { staggerContainer } from '@/lib/motion'
import type { ContentType } from '@/types/content'

interface TranscriptSectionProps {
  text?: string
  sourceType?: ContentType
  isVisible: boolean
}

export function TranscriptSection({ text, sourceType = 'recording', isVisible }: TranscriptSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const paragraphs = useMemo(
    () => parseTranscript(text ?? ''),
    [text]
  )

  const filteredParagraphs = useMemo(() => {
    if (!searchQuery.trim()) return paragraphs
    const q = searchQuery.toLowerCase()
    return paragraphs.filter((p) => p.text.toLowerCase().includes(q))
  }, [paragraphs, searchQuery])

  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const q = searchQuery.toLowerCase()
    return paragraphs.filter((p) => p.text.toLowerCase().includes(q)).length
  }, [paragraphs, searchQuery])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const emptyMessage = getTranscriptEmptyMessage(sourceType)

  if (!text?.trim()) {
    return (
      <section
        id="section-transcript"
        aria-labelledby="heading-transcript"
        className="scroll-mt-14"
      >
        <SectionLabel withAccentBar className="mb-5">
          <span id="heading-transcript">Transcript</span>
        </SectionLabel>
        <EmptyState message={emptyMessage} />
      </section>
    )
  }

  return (
    <section
      id="section-transcript"
      aria-labelledby="heading-transcript"
      className="scroll-mt-14"
    >
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <SectionLabel withAccentBar>
          <span id="heading-transcript">Transcript</span>
        </SectionLabel>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-2 pb-1 border-b transition-colors duration-150"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Search
              size={13}
              strokeWidth={1.8}
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search transcript..."
              aria-label="Search within transcript"
              className="text-[13px] bg-transparent outline-none w-36 placeholder:opacity-35"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {searchQuery && matchCount > 0 && (
              <span
                className="text-[11px] font-medium whitespace-nowrap"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {matchCount} match{matchCount !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {filteredParagraphs.length === 0 ? (
        <EmptyState message="No matches found." />
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="divide-y"
          style={{ '--tw-divide-color': 'var(--color-separator)' } as React.CSSProperties}
          role="region"
          aria-label="Transcript content"
        >
          {filteredParagraphs.map((paragraph) => (
            <TranscriptParagraphItem
              key={paragraph.id}
              paragraph={paragraph}
              searchQuery={searchQuery}
            />
          ))}
        </motion.div>
      )}
    </section>
  )
}
