'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getAskPlaceholder } from '@/lib/content-helpers'
import { cn } from '@/lib/utils'
import type { ContentType } from '@/types/content'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  sourceType?: ContentType
  isLoading?: boolean
  className?: string
}

export function QuestionInput({
  onSubmit,
  sourceType = 'recording',
  isLoading,
  className,
}: QuestionInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const placeholder = getAskPlaceholder(sourceType)

  const handleSubmit = useCallback(() => {
    const q = value.trim()
    if (!q || isLoading) return
    onSubmit(q)
    setValue('')
  }, [value, onSubmit, isLoading])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const isEmpty = !value.trim()

  return (
    <div className={cn('relative w-full max-w-[660px] mx-auto', className)}>
      <div
        className="relative flex items-center gap-3 pb-2 border-b-[1.5px] transition-colors duration-150"
        style={{
          borderColor: isLoading
            ? 'var(--color-accent)'
            : 'var(--color-border)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={isLoading}
          className={cn(
            'flex-1 text-[15px] bg-transparent outline-none',
            'placeholder:opacity-35 disabled:opacity-50'
          )}
          style={{ color: 'var(--color-text-primary)' }}
        />

        <AnimatePresence mode="wait">
          {isEmpty || isLoading ? (
            <motion.div
              key="dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoading ? 0.5 : 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[15px] flex-shrink-0 select-none leading-none"
              aria-hidden="true"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {isLoading ? '···' : '?'}
            </motion.div>
          ) : (
            <motion.button
              key="arrow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onClick={handleSubmit}
              aria-label="Submit question"
              className="flex-shrink-0 p-1 rounded-[4px] transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-accent)' }}
            >
              <ArrowRight size={16} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
