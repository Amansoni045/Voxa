'use client'

import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useYoutube } from '@/hooks/use-upload'
import { ArrowRight, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface YouTubeInputProps {
  onUrl: (url: string) => void
  standalone?: boolean
}

export function YouTubeInput({ onUrl, standalone = true }: YouTubeInputProps) {
  const { url, setUrl, error, handleSubmit, clearError } = useYoutube(onUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-3">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-[16px] border transition-all duration-200 shadow-sm',
          'focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:border-transparent'
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
        }}
      >
        {/* YouTube / Link icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="flex-shrink-0 text-red-500"
        >
          <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="currentColor" stroke="none" />
        </svg>

        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => {
            clearError()
            setUrl(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste a YouTube or audio link..."
          aria-label="YouTube or media recording URL"
          className="flex-1 text-[15px] bg-transparent outline-none placeholder:opacity-40"
          style={{ color: 'var(--color-text-primary)' }}
        />

        <button
          onClick={handleSubmit}
          disabled={!url.trim()}
          aria-label="Process link"
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-[8px] transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
            url.trim() ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-30'
          )}
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="alert"
            className="text-[13px] text-center"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
