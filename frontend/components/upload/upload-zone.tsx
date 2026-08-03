'use client'

import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpload } from '@/hooks/use-upload'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFile: (file: File) => void
  className?: string
}

export function UploadZone({ onFile, className }: UploadZoneProps) {
  const {
    isDragging,
    error,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    openFilePicker,
    fileInputRef,
    clearError,
  } = useUpload(onFile)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openFilePicker()
      }
    },
    [openFilePicker]
  )

  return (
    <div className={cn('w-full', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.mp4,.wav,.m4a,.ogg,.webm,.mkv"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload meeting recording"
        tabIndex={-1}
      />

      {/* Drop zone */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={
          isDragging
            ? 'Drop your recording here'
            : 'Drop a recording to begin, or click to browse'
        }
        aria-describedby={error ? 'upload-error' : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => { clearError(); openFilePicker() }}
        onKeyDown={handleKeyDown}
        animate={isDragging ? 'drag' : 'rest'}
        whileHover="hover"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.004, transition: { duration: 0.2, ease: 'easeOut' } },
          drag: { scale: 1.018, transition: { duration: 0.14, ease: 'easeOut' } },
        }}
        className={cn(
          'relative w-full rounded-[24px] cursor-pointer',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          isDragging
            ? 'ring-2 ring-[var(--color-accent)]'
            : ''
        )}
        style={{
          height: '196px',
          backgroundColor: isDragging
            ? 'var(--color-accent-muted)'
            : 'var(--color-zone)',
        }}
      >
        {/* Breathing layer — barely visible gradient pulse */}
        <div
          className="zone-breathe absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, var(--color-accent-light) 0%, transparent 70%)',
            opacity: 0,
          }}
          aria-hidden="true"
        />

        {/* Drag-over border */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute inset-0 rounded-[24px] pointer-events-none border-[1.5px]"
              style={{ borderColor: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-4 px-6">
          {/* Icon */}
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-shrink-0"
            aria-hidden="true"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </motion.div>

          {/* Text */}
          <div className="flex flex-col items-center gap-[6px] text-center">
            <AnimatePresence mode="wait">
              {isDragging ? (
                <motion.p
                  key="drop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-[16px] font-medium tracking-[-0.01em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Drop it here
                </motion.p>
              ) : (
                <motion.p
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-[15px] font-medium tracking-[-0.01em]"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Drop a recording to begin
                </motion.p>
              )}
            </AnimatePresence>

            {!isDragging && (
              <p className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
                or{' '}
                <span
                  className="underline underline-offset-2 cursor-pointer"
                  style={{ color: 'var(--color-accent)' }}
                >
                  browse your files
                </span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="upload-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 text-[13px] text-center"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
