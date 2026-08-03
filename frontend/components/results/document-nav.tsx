'use client'

import { cn } from '@/lib/utils'

export const SECTION_IDS = [
  'section-overview',
  'section-decisions',
  'section-actions',
  'section-questions',
  'section-ask',
  'section-transcript',
]

export const SECTION_LABELS: Record<string, string> = {
  'section-overview': 'Overview',
  'section-decisions': 'Decisions',
  'section-actions': 'Actions',
  'section-questions': 'Questions',
  'section-ask': 'Ask',
  'section-transcript': 'Transcript',
}

interface DocumentNavProps {
  activeId: string
  onNavigate: (id: string) => void
  className?: string
}

export function DocumentNav({ activeId, onNavigate, className }: DocumentNavProps) {
  return (
    <nav
      aria-label="Meeting sections"
      className={cn('flex items-center justify-center gap-1 flex-wrap', className)}
    >
      {SECTION_IDS.map((id) => {
        const isActive = activeId === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={isActive ? 'location' : undefined}
            className={cn(
              'relative px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] rounded-[6px]',
              'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--color-accent)]',
            )}
            style={{
              color: isActive
                ? 'var(--color-accent)'
                : 'var(--color-text-tertiary)',
              backgroundColor: isActive
                ? 'var(--color-accent-muted)'
                : 'transparent',
            }}
          >
            {SECTION_LABELS[id]}
          </button>
        )
      })}
    </nav>
  )
}
