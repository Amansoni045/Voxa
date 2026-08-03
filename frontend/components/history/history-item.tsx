'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Video,
  Mic,
  Users,
  Radio,
  GraduationCap,
  Pin,
  Star,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react'
import { useContentStore } from '@/stores/content-store'
import { formatDate, formatDuration, cn } from '@/lib/utils'
import { getContentTypeBadge } from '@/lib/content-helpers'
import type { HistoryItem as HistoryItemType, ContentType } from '@/types/content'

interface HistoryItemProps {
  item: HistoryItemType
  onCloseDrawer?: () => void
}

function SourceIcon({ type }: { type: ContentType }) {
  switch (type) {
    case 'youtube':
      return (
        <svg
          width="15"
          height="15"
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
          <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="currentColor" />
        </svg>
      )
    case 'podcast':
      return <Radio size={14} strokeWidth={1.8} className="flex-shrink-0 text-purple-500" />
    case 'lecture':
      return <GraduationCap size={14} strokeWidth={1.8} className="flex-shrink-0 text-amber-500" />
    case 'meeting':
      return <Users size={14} strokeWidth={1.8} className="flex-shrink-0 text-blue-500" />
    case 'video':
      return <Video size={14} strokeWidth={1.8} className="flex-shrink-0 text-emerald-500" />
    case 'interview':
    case 'recording':
    default:
      return <Mic size={14} strokeWidth={1.8} className="flex-shrink-0 text-neutral-400" />
  }
}

export function HistoryItemRow({ item, onCloseDrawer }: HistoryItemProps) {
  const router = useRouter()
  const setCurrentContent = useContentStore((s) => s.setCurrentContent)
  const removeHistoryItem = useContentStore((s) => s.removeHistoryItem)
  const renameHistoryItem = useContentStore((s) => s.renameHistoryItem)
  const togglePinHistoryItem = useContentStore((s) => s.togglePinHistoryItem)
  const toggleFavoriteHistoryItem = useContentStore((s) => s.toggleFavoriteHistoryItem)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)

  const handleClick = () => {
    if (isEditing) return
    // Load content in store and navigate to analysis page
    setCurrentContent({
      id: item.id,
      title: item.title,
      sourceType: item.sourceType,
      summary: 'Loading summary...',
      action_items: '',
      key_decisions: '',
      questions: '',
      metadata: {
        duration_seconds: item.duration_seconds,
        channelName: item.channelName,
        thumbnailUrl: item.thumbnailUrl,
        originalUrl: item.originalUrl,
      },
    })
    if (onCloseDrawer) onCloseDrawer()
    router.push(`/analysis/${item.id}`)
  }

  const handleSaveRename = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (editTitle.trim()) {
        renameHistoryItem(item.id, editTitle.trim())
      }
      setIsEditing(false)
    },
    [editTitle, item.id, renameHistoryItem]
  )

  return (
    <motion.div
      layout
      className={cn(
        'group relative flex items-center justify-between gap-3 py-3 px-3.5 rounded-[12px] transition-all duration-150',
        'hover:bg-[var(--color-surface-hover)] focus-within:bg-[var(--color-surface-hover)] cursor-pointer',
        item.isPinned ? 'bg-[var(--color-accent-muted)]' : ''
      )}
      onClick={handleClick}
    >
      {/* Thumbnail or Source Icon */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-10 h-10 rounded-[6px] object-cover border border-[var(--color-border)]"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-[8px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-zone)' }}
          >
            <SourceIcon type={item.sourceType} />
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        {isEditing ? (
          <form onSubmit={handleSaveRename} className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              className="text-[13px] font-medium bg-transparent border-b border-[var(--color-accent)] outline-none w-full"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <button
              type="submit"
              className="p-0.5 text-emerald-600 hover:opacity-80"
              aria-label="Save title"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-0.5 text-neutral-400 hover:opacity-80"
              aria-label="Cancel rename"
            >
              <X size={13} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5">
            {item.isPinned && (
              <Pin size={10} strokeWidth={2} className="flex-shrink-0 text-[var(--color-accent)]" />
            )}
            {item.isFavorite && (
              <Star size={10} strokeWidth={2.5} className="flex-shrink-0 text-amber-500 fill-amber-500" />
            )}
            <p
              className="text-[14px] font-medium tracking-[-0.01em] truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {item.title}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          <span className="font-semibold uppercase tracking-[0.04em] text-[10px]">
            {getContentTypeBadge(item.sourceType)}
          </span>
          {item.channelName && (
            <>
              <span>·</span>
              <span className="truncate max-w-[100px]">{item.channelName}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(item.date)}</span>
          {item.duration_seconds && (
            <>
              <span>·</span>
              <span>{formatDuration(item.duration_seconds)}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Action Buttons (Appear on Hover) */}
      <div
        className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => togglePinHistoryItem(item.id)}
          title={item.isPinned ? 'Unpin' : 'Pin to top'}
          aria-label={item.isPinned ? 'Unpin item' : 'Pin item'}
          className={cn(
            'p-1.5 rounded-[6px] transition-colors',
            item.isPinned
              ? 'text-[var(--color-accent)] bg-[var(--color-accent-light)]'
              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-zone)]'
          )}
        >
          <Pin size={13} strokeWidth={1.8} />
        </button>

        <button
          onClick={() => toggleFavoriteHistoryItem(item.id)}
          title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
          aria-label={item.isFavorite ? 'Unfavorite item' : 'Favorite item'}
          className={cn(
            'p-1.5 rounded-[6px] transition-colors',
            item.isFavorite
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-zone)]'
          )}
        >
          <Star size={13} strokeWidth={1.8} />
        </button>

        <button
          onClick={() => { setIsEditing(true); setEditTitle(item.title) }}
          title="Rename"
          aria-label="Rename item"
          className="p-1.5 rounded-[6px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-zone)] transition-colors"
        >
          <Edit2 size={13} strokeWidth={1.8} />
        </button>

        <button
          onClick={() => removeHistoryItem(item.id)}
          title="Delete"
          aria-label="Delete item"
          className="p-1.5 rounded-[6px] text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>
    </motion.div>
  )
}
