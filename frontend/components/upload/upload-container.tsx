'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadZone } from '@/components/upload/upload-zone'
import { YouTubeInput } from '@/components/upload/youtube-input'
import { Upload, Link2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadContainerProps {
  onFile: (file: File) => void
  onUrl: (url: string) => void
}

type InputMode = 'file' | 'url'

export function UploadContainer({ onFile, onUrl }: UploadContainerProps) {
  const [mode, setMode] = useState<InputMode>('file')

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Segmented Mode Switcher */}
      <div
        className="flex items-center p-1 rounded-[12px] border transition-colors"
        style={{
          backgroundColor: 'var(--color-zone)',
          borderColor: 'var(--color-border)',
        }}
        role="tablist"
        aria-label="Input method selection"
      >
        <button
          role="tab"
          aria-selected={mode === 'file'}
          onClick={() => setMode('file')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all duration-200',
            mode === 'file'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          <Upload size={14} strokeWidth={2} />
          <span>Upload Recording</span>
        </button>

        <button
          role="tab"
          aria-selected={mode === 'url'}
          onClick={() => setMode('url')}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all duration-200',
            mode === 'url'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          <Link2 size={14} strokeWidth={2} />
          <span>Paste YouTube or Media Link</span>
        </button>
      </div>

      {/* Mode panels with smooth Framer Motion transition */}
      <div className="w-full relative min-h-[200px] flex flex-col items-center">
        <AnimatePresence mode="wait">
          {mode === 'file' ? (
            <motion.div
              key="file-mode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <UploadZone onFile={onFile} />
            </motion.div>
          ) : (
            <motion.div
              key="url-mode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center pt-2"
            >
              <YouTubeInput onUrl={onUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
