'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Check } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { popoverVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { MeetingAnalysis } from '@/types/meeting'

const FORMATS = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Best for sharing and printing',
    badge: 'PDF',
  },
  {
    id: 'docx',
    label: 'Word document',
    description: 'Editable in Microsoft Word',
    badge: 'W',
  },
  {
    id: 'md',
    label: 'Markdown',
    description: 'Plain text with formatting',
    badge: 'Md',
  },
] as const

type Format = (typeof FORMATS)[number]['id']

interface SavePopoverProps {
  meeting: MeetingAnalysis
  size?: 'sm' | 'md'
}

export function SavePopover({ meeting, size = 'md' }: SavePopoverProps) {
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState<Format | null>(null)
  const [downloaded, setDownloaded] = useState<Format | null>(null)

  const handleFormat = useCallback(
    async (format: Format) => {
      setDownloading(format)
      setOpen(false)

      // Simulate download — in production, hit the backend export endpoint
      await new Promise((r) => setTimeout(r, 800))

      setDownloading(null)
      setDownloaded(format)
      setTimeout(() => setDownloaded(null), 2000)
    },
    []
  )

  const buttonLabel =
    downloaded ? 'Downloaded' : downloading ? 'Downloading...' : 'Save a copy'

  const isSmall = size === 'sm'

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Save a copy of this analysis report"
          className={cn(
            'flex items-center gap-2 rounded-[8px] font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
            isSmall
              ? 'px-3 py-1.5 text-[12px]'
              : 'px-4 py-2 text-[13px]'
          )}
          style={{
            backgroundColor: downloading || downloaded
              ? 'var(--color-surface)'
              : 'var(--color-accent)',
            color: downloading || downloaded
              ? 'var(--color-accent)'
              : 'white',
            border: downloading || downloaded
              ? '1px solid var(--color-accent-border)'
              : 'none',
          }}
        >
          <motion.div
            animate={{ rotate: downloading ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {downloaded ? (
              <Check size={isSmall ? 11 : 13} strokeWidth={2.5} />
            ) : (
              <Download size={isSmall ? 11 : 13} strokeWidth={2.5} />
            )}
          </motion.div>
          <span>{buttonLabel}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[100] outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                variants={popoverVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-[220px] rounded-[12px] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-popover)',
                  border: '1px solid var(--color-border)',
                }}
                role="menu"
                aria-label="Save as format"
              >
                <div className="p-1">
                  <p
                    className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Save as...
                  </p>
                  {FORMATS.map((format, i) => (
                    <button
                      key={format.id}
                      role="menuitem"
                      onClick={() => handleFormat(format.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left',
                        'transition-colors duration-100',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                        'hover:bg-[var(--color-zone)]'
                      )}
                    >
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: 'var(--color-accent-light)',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {format.badge}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {format.label}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {format.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
