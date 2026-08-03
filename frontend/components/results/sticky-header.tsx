'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { SavePopover } from '@/components/download/save-popover'
import { stickyHeaderVariants } from '@/lib/motion'
import type { ContentAnalysis } from '@/types/content'

interface StickyHeaderProps {
  content: ContentAnalysis
  titleRevealComplete: boolean
  onAnalyzeAnother?: () => void
}

export function StickyHeader({ content, titleRevealComplete, onAnalyzeAnother }: StickyHeaderProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!titleRevealComplete) return

    const handleScroll = () => {
      setIsVisible(window.scrollY > 160)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [titleRevealComplete])

  const handleLogoClick = () => {
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          key="sticky-header"
          variants={stickyHeaderVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-12"
          style={{
            backgroundColor: 'var(--color-header-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-separator)',
          }}
          role="banner"
        >
          <div className="cursor-pointer" onClick={handleLogoClick}>
            <Logo size="sm" />
          </div>

          <p
            className="absolute left-1/2 -translate-x-1/2 text-[14px] font-medium tracking-[-0.01em] max-w-[320px] truncate text-center hidden md:block"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {content.title}
          </p>

          <div className="flex items-center gap-2">
            {onAnalyzeAnother && (
              <button
                onClick={onAnalyzeAnother}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:opacity-80"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span>Analyze Another</span>
              </button>
            )}
            <SavePopover meeting={content} size="sm" />
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
