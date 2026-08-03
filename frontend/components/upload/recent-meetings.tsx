'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useContentStore } from '@/stores/content-store'
import { HistoryItemRow } from '@/components/history/history-item'
import { staggerContainer } from '@/lib/motion'

export function RecentMeetings() {
  const history = useContentStore((s) => s.history)

  if (!history.length) return null

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full max-w-[480px] mx-auto"
      aria-labelledby="recent-heading"
    >
      <div
        className="mb-1 border-t pt-6"
        style={{ borderColor: 'var(--color-separator)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Recent Workspace Analyses
        </p>
        <div className="flex flex-col gap-1">
          {history.slice(0, 5).map((item) => (
            <HistoryItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
