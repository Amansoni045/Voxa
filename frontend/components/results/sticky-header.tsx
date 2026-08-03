'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/layout/logo'
import { SavePopover } from '@/components/download/save-popover'
import { stickyHeaderVariants } from '@/lib/motion'
import type { MeetingAnalysis } from '@/types/meeting'

interface StickyHeaderProps {
  meeting: MeetingAnalysis
  titleRevealComplete: boolean
}

export function StickyHeader({ meeting, titleRevealComplete }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!titleRevealComplete) return

    const handleScroll = () => {
      // Show sticky header after scrolling past the title (roughly 180px)
      setIsVisible(window.scrollY > 160)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [titleRevealComplete])

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
          <Logo size="sm" />

          <p
            className="absolute left-1/2 -translate-x-1/2 text-[14px] font-medium tracking-[-0.01em] max-w-[360px] truncate text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {meeting.title}
          </p>

          <SavePopover meeting={meeting} size="sm" />
        </motion.header>
      )}
    </AnimatePresence>
  )
}
