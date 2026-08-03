'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Trash2, Clock, Filter } from 'lucide-react'
import { useContentStore } from '@/stores/content-store'
import { HistoryItemRow } from '@/components/history/history-item'
import { overlayVariants, popoverVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { ContentType } from '@/types/content'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const FILTER_TABS: { id: ContentType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'youtube', label: 'Videos' },
  { id: 'meeting', label: 'Meetings' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'lecture', label: 'Lectures' },
]

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const history = useContentStore((s) => s.history)
  const clearHistory = useContentStore((s) => s.clearHistory)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all')

  const filteredItems = useMemo(() => {
    return history.filter((item) => {
      // Category filter
      if (activeTab !== 'all') {
        if (activeTab === 'youtube' && item.sourceType !== 'youtube' && item.sourceType !== 'video') {
          return false
        }
        if (activeTab !== 'youtube' && item.sourceType !== activeTab) {
          return false
        }
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchChannel = item.channelName?.toLowerCase().includes(q) ?? false
        return matchTitle || matchChannel
      }

      return true
    })
  }, [history, activeTab, searchQuery])

  const pinnedItems = useMemo(
    () => filteredItems.filter((i) => i.isPinned),
    [filteredItems]
  )

  const unpinnedItems = useMemo(
    () => filteredItems.filter((i) => !i.isPinned),
    [filteredItems]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[90] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-[440px] flex flex-col shadow-2xl border-l"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
            role="dialog"
            aria-label="History and saved analyses"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--color-separator)]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--color-accent)]" />
                <h2 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-text-primary)' }}>
                  History & Workspace
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close history drawer"
                className="p-1.5 rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-zone)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-zone)]">
                <Search size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past analyses..."
                  className="w-full text-[13px] bg-transparent outline-none placeholder:opacity-40"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-600">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto no-scrollbar border-b border-[var(--color-separator)]">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] rounded-[6px] transition-all whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-zone)]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <p className="text-[14px] font-medium text-[var(--color-text-secondary)] mb-1">
                    No analyses found
                  </p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">
                    {searchQuery ? 'Try a different search query.' : 'Analyzed videos and files will appear here.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Pinned Items */}
                  {pinnedItems.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-1">
                        Pinned
                      </p>
                      {pinnedItems.map((item) => (
                        <HistoryItemRow key={item.id} item={item} onCloseDrawer={onClose} />
                      ))}
                    </div>
                  )}

                  {/* All / Unpinned Items */}
                  {unpinnedItems.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {pinnedItems.length > 0 && (
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mt-2 mb-1">
                          Recent
                        </p>
                      )}
                      {unpinnedItems.map((item) => (
                        <HistoryItemRow key={item.id} item={item} onCloseDrawer={onClose} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 border-t border-[var(--color-separator)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--color-text-tertiary)]">
                  {history.length} saved item{history.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-[12px] text-[var(--color-error)] hover:opacity-80 transition-opacity"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
