'use client'

import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useYoutube } from '@/hooks/use-upload'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface YouTubeInputProps {
  onUrl: (url: string) => void
}

export function YouTubeInput({ onUrl }: YouTubeInputProps) {
  const { url, setUrl, error, handleSubmit, isVisible, toggle, clearError } =
    useYoutube(onUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  const handleToggle = useCallback(() => {
    toggle()
    if (!isVisible) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [toggle, isVisible])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Trigger link */}
      <button
        onClick={handleToggle}
        className="text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-sm"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-expanded={isVisible}
      >
        {isVisible ? 'Cancel' : 'Have a recording link instead?'}
      </button>

      {/* Expandable input */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="youtube-input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-[10px] border transition-colors duration-150',
                )}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: error
                    ? 'var(--color-error)'
                    : 'var(--color-border)',
                }}
              >
                {/* YouTube icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path
                    d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>

                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => { clearError(); setUrl(e.target.value) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste a YouTube link..."
                  aria-label="YouTube recording URL"
                  className="flex-1 text-[14px] bg-transparent outline-none placeholder:opacity-40"
                  style={{ color: 'var(--color-text-primary)' }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!url.trim()}
                  aria-label="Process YouTube link"
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-[6px] transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                    url.trim()
                      ? 'cursor-pointer opacity-100'
                      : 'cursor-not-allowed opacity-30'
                  )}
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  <ArrowRight size={12} strokeWidth={2.5} />
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
                    className="text-[12px] text-center"
                    style={{ color: 'var(--color-error)' }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
