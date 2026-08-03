'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { EmptyState } from '@/components/shared/empty-state'
import { parseActionItems } from '@/lib/parsers'
import { getActionsEmptyMessage } from '@/lib/content-helpers'
import { useContentStore } from '@/stores/content-store'
import { staggerContainer, documentCascade, toggleFill } from '@/lib/motion'
import type { ActionItem, ContentType } from '@/types/content'

function ActionRow({ item }: { item: ActionItem }) {
  const completedItems = useContentStore((s) => s.completedItems)
  const toggleItem = useContentStore((s) => s.toggleItem)
  const isCompleted = completedItems[item.id] ?? false

  return (
    <motion.div
      variants={documentCascade}
      className="group flex items-center gap-4 py-4 border-b transition-colors duration-150"
      style={{ borderColor: 'var(--color-separator)' }}
    >
      <button
        onClick={() => toggleItem(item.id)}
        aria-label={isCompleted ? `Mark "${item.task}" as incomplete` : `Mark "${item.task}" as done`}
        aria-pressed={isCompleted}
        className="flex-shrink-0 relative w-[18px] h-[18px] rounded-full border-[1.5px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
        style={{
          borderColor: isCompleted
            ? 'var(--color-success)'
            : 'var(--color-border-hover)',
        }}
      >
        <motion.div
          className="absolute inset-[2px] rounded-full"
          style={{ backgroundColor: 'var(--color-success)' }}
          variants={toggleFill}
          animate={isCompleted ? 'checked' : 'unchecked'}
          initial="unchecked"
        />
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-[15px] leading-[1.5] tracking-[-0.005em] transition-all duration-300"
          style={{
            color: isCompleted
              ? 'var(--color-text-tertiary)'
              : 'var(--color-text-primary)',
          }}
        >
          {item.task}
        </p>
        {(item.owner || item.deadline) && (
          <div
            className="flex items-center gap-3 mt-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {item.owner && (
              <span className="text-[12px] font-medium">{item.owner}</span>
            )}
            {item.owner && item.deadline && (
              <span className="text-[10px]" aria-hidden="true">·</span>
            )}
            {item.deadline && (
              <span className="text-[12px]">{item.deadline}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface ActionsSectionProps {
  text: string
  contentId: string
  sourceType?: ContentType
  isVisible: boolean
}

export function ActionsSection({ text, contentId, sourceType = 'recording', isVisible }: ActionsSectionProps) {
  const items = parseActionItems(text)
  const emptyMessage = getActionsEmptyMessage(sourceType)

  return (
    <section
      id="section-actions"
      aria-labelledby="heading-actions"
      className="scroll-mt-14"
    >
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-actions">Action Items</span>
      </SectionLabel>

      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="border-t"
          style={{ borderColor: 'var(--color-separator)' }}
          role="list"
          aria-label="Action items"
        >
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <ActionRow item={item} />
            </div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
