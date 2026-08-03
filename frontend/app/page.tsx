'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, Command } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { UploadContainer } from '@/components/upload/upload-container'
import { HistoryDrawer } from '@/components/history/history-drawer'
import { CommandPalette } from '@/components/shared/command-palette'
import { useContentStore } from '@/stores/content-store'
import { analyzeContent, analyzeContentUrl } from '@/lib/api'
import { detectSourceFromFile, detectSourceFromUrl } from '@/lib/source-detector'
import { getHeroHeadline, getHeroSubheading } from '@/lib/content-helpers'
import { staggerContainer, fadeInUp } from '@/lib/motion'

export default function HomePage() {
  const router = useRouter()
  const setCurrentContent = useContentStore((s) => s.setCurrentContent)
  const setProcessingFile = useContentStore((s) => s.setProcessingFile)
  const setProcessingUrl = useContentStore((s) => s.setProcessingUrl)
  const setProcessingError = useContentStore((s) => s.setProcessingError)
  const addHistoryItem = useContentStore((s) => s.addHistoryItem)
  const history = useContentStore((s) => s.history)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      const sourceInfo = detectSourceFromFile(file)
      setProcessingFile(file.name, sourceInfo.sourceType)
      setCurrentContent(null)
      router.push('/processing')

      try {
        const result = await analyzeContent(file)
        setCurrentContent(result)
        addHistoryItem(result)
      } catch (err: any) {
        setProcessingError(
          err.message || "We couldn't analyze this file. Please make sure the backend is running."
        )
      }
    },
    [router, setCurrentContent, setProcessingFile, setProcessingError, addHistoryItem]
  )

  const handleUrl = useCallback(
    async (url: string) => {
      const sourceInfo = detectSourceFromUrl(url)
      setProcessingUrl(url, sourceInfo.sourceType)
      setCurrentContent(null)
      router.push('/processing')

      try {
        const result = await analyzeContentUrl(url)
        setCurrentContent(result)
        addHistoryItem(result)
      } catch (err: any) {
        setProcessingError(
          err.message || "We couldn't analyze this link. Please check the URL or backend connection."
        )
      }
    },
    [router, setCurrentContent, setProcessingUrl, setProcessingError, addHistoryItem]
  )

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        setIsHistoryOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header — Logo + History + Command Palette */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 flex-shrink-0 border-b border-[var(--color-separator)]">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          {/* Cmd+K trigger button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open command palette (Cmd+K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] text-[12px] transition-all hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Command size={13} />
            <span>Search & Commands</span>
            <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--color-zone)] border border-[var(--color-border)]">
              ⌘K
            </kbd>
          </button>

          {/* History trigger button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Open history workspace"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] border border-[var(--color-border)] text-[13px] font-medium transition-all hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Clock size={15} className="text-[var(--color-accent)]" />
            <span>History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16 pt-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-[540px] flex flex-col items-center gap-10"
        >
          {/* Hero Header */}
          <motion.div variants={fadeInUp} className="text-center flex flex-col items-center gap-3">
            <h1
              className="text-[48px] md:text-[56px] font-bold leading-[1.08] tracking-[-0.035em]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {getHeroHeadline()}
            </h1>
            <p
              className="text-[16px] md:text-[17px] leading-[1.6] tracking-[-0.01em] max-w-[460px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {getHeroSubheading()}
            </p>
          </motion.div>

          {/* Integrated Upload Container */}
          <motion.div variants={fadeInUp} className="w-full">
            <UploadContainer onFile={handleFile} onUrl={handleUrl} />
          </motion.div>
        </motion.div>
      </div>

      {/* History Drawer Modal */}
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAnalyzeAnother={() => {}}
      />
    </main>
  )
}
