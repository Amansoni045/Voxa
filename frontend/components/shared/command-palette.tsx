'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, Plus, Clock, Home, ArrowRight, X } from 'lucide-react'
import { useContentStore } from '@/stores/content-store'
import { overlayVariants, popoverVariants } from '@/lib/motion'
import { getContentTypeBadge } from '@/lib/content-helpers'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenHistory: () => void
  onOpenAnalyzeAnother: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenHistory,
  onOpenAnalyzeAnother,
}: CommandPaletteProps) {
  const router = useRouter()
  const history = useContentStore((s) => s.history)
  const setCurrentContent = useContentStore((s) => s.setCurrentContent)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!query.trim()) return history.slice(0, 5)
    const q = query.toLowerCase()
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.channelName?.toLowerCase().includes(q) ?? false)
    )
  }, [history, query])

  // Build combined items list: Quick Actions + History items
  const quickActions = useMemo(
    () => [
      {
        id: 'action-analyze',
        label: 'Analyze new content...',
        shortcut: '⌘N',
        icon: Plus,
        perform: () => {
          onClose()
          onOpenAnalyzeAnother()
        },
      },
      {
        id: 'action-history',
        label: 'Open History Workspace',
        shortcut: '⌘H',
        icon: Clock,
        perform: () => {
          onClose()
          onOpenHistory()
        },
      },
      {
        id: 'action-home',
        label: 'Go to Home',
        shortcut: '⌘Shift+H',
        icon: Home,
        perform: () => {
          onClose()
          router.push('/')
        },
      },
    ],
    [onClose, onOpenAnalyzeAnother, onOpenHistory, router]
  )

  const totalItems = quickActions.length + filteredHistory.length

  const handleSelect = useCallback(
    (index: number) => {
      if (index < quickActions.length) {
        quickActions[index].perform()
      } else {
        const historyItem = filteredHistory[index - quickActions.length]
        if (historyItem) {
          setCurrentContent({
            id: historyItem.id,
            title: historyItem.title,
            sourceType: historyItem.sourceType,
            summary: 'Loading summary...',
            action_items: '',
            key_decisions: '',
            questions: '',
            metadata: {
              duration_seconds: historyItem.duration_seconds,
              channelName: historyItem.channelName,
              thumbnailUrl: historyItem.thumbnailUrl,
              originalUrl: historyItem.originalUrl,
            },
          })
          onClose()
          router.push(`/analysis/${historyItem.id}`)
        }
      }
    },
    [quickActions, filteredHistory, setCurrentContent, onClose, router]
  )

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, totalItems, selectedIndex, handleSelect, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[110] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              variants={popoverVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-[560px] rounded-[16px] overflow-hidden shadow-2xl border pointer-events-auto flex flex-col"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
              role="dialog"
              aria-label="Command palette"
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-separator)]">
                <Search size={18} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Type a command or search past analyses..."
                  autoFocus
                  className="flex-1 text-[15px] bg-transparent outline-none placeholder:opacity-35"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={onClose}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded-[4px] border border-[var(--color-border)] text-[var(--color-text-tertiary)]"
                >
                  ESC
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-[340px] overflow-y-auto p-2 flex flex-col gap-1">
                {/* Quick Actions Group */}
                {!query.trim() && (
                  <div className="flex flex-col gap-0.5 mb-2">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                      Quick Actions
                    </p>
                    {quickActions.map((action, i) => {
                      const isSelected = selectedIndex === i
                      const Icon = action.icon
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleSelect(i)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-left transition-colors',
                            isSelected
                              ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-zone)]'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} strokeWidth={1.8} />
                            <span className="text-[14px]">{action.label}</span>
                          </div>
                          {action.shortcut && (
                            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
                              {action.shortcut}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* History Items Group */}
                {filteredHistory.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                      {query.trim() ? 'Matching Analyses' : 'Recent Analyses'}
                    </p>
                    {filteredHistory.map((item, i) => {
                      const actualIndex = query.trim() ? i : i + quickActions.length
                      const isSelected = selectedIndex === actualIndex
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(actualIndex)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-left transition-colors',
                            isSelected
                              ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-zone)]'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-6 h-6 rounded-[4px] object-cover flex-shrink-0"
                              />
                            ) : (
                              <Clock size={15} className="flex-shrink-0 opacity-60" />
                            )}
                            <span className="text-[14px] truncate">{item.title}</span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.04em] px-2 py-0.5 rounded-[4px] bg-[var(--color-zone)] text-[var(--color-text-tertiary)] flex-shrink-0">
                            {getContentTypeBadge(item.sourceType)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {filteredHistory.length === 0 && query.trim() && (
                  <div className="py-8 text-center text-[13px] text-[var(--color-text-tertiary)]">
                    No matching analyses found for "{query}".
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--color-separator)] flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
                <span>Navigate with ↑↓, select with Enter</span>
                <span>Voxa V2</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
