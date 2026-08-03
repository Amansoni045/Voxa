'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useMeetingStore } from '@/stores/meeting-store'
import { MOCK_MEETING } from '@/lib/api'
import { formatDate, formatDuration } from '@/lib/utils'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import type { RecentMeeting } from '@/types/meeting'

function MeetingRow({ meeting }: { meeting: RecentMeeting }) {
  const router = useRouter()
  const setCurrentMeeting = useMeetingStore((s) => s.setCurrentMeeting)

  const handleClick = () => {
    // In production, load from cache/API. For demo, use mock.
    setCurrentMeeting({ ...MOCK_MEETING, id: meeting.id, title: meeting.title })
    router.push(`/meeting/${meeting.id}`)
  }

  return (
    <motion.button
      variants={fadeInUp}
      onClick={handleClick}
      className="w-full flex items-center justify-between gap-4 py-3 px-0 text-left group transition-all duration-150 focus-visible:outline-none"
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-medium tracking-[-0.01em] truncate transition-colors duration-150 group-hover:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {meeting.title}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          {formatDate(meeting.date)}
          {meeting.duration_seconds
            ? ` · ${formatDuration(meeting.duration_seconds)}`
            : ''}
        </p>
      </div>
      {meeting.action_items_count > 0 && (
        <span
          className="flex-shrink-0 text-[11px] font-medium tabular-nums"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {meeting.action_items_count} task{meeting.action_items_count !== 1 ? 's' : ''}
        </span>
      )}
    </motion.button>
  )
}

export function RecentMeetings() {
  const recentMeetings = useMeetingStore((s) => s.recentMeetings)

  if (!recentMeetings.length) return null

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
        <div
          className="divide-y"
          style={{ '--tw-divide-color': 'var(--color-separator)' } as React.CSSProperties}
        >
          {recentMeetings.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
