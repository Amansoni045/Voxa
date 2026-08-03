'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { parseSummaryBullets } from '@/lib/parsers'
import { staggerContainer, documentCascade } from '@/lib/motion'

interface OverviewSectionProps {
  summary: string
  isVisible: boolean
}

export function OverviewSection({ summary, isVisible }: OverviewSectionProps) {
  const bullets = parseSummaryBullets(summary)

  return (
    <section
      id="section-overview"
      aria-labelledby="heading-overview"
      className="scroll-mt-14"
    >
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-overview">Overview</span>
      </SectionLabel>

      <motion.div
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="flex flex-col gap-3"
      >
        {bullets.map((bullet, i) => (
          <motion.div
            key={i}
            variants={documentCascade}
            className="flex gap-3 items-start"
          >
            {/* Left accent bar — editorial bullet */}
            <div
              className="mt-[5px] w-[2px] flex-shrink-0 rounded-full self-stretch"
              style={{
                backgroundColor: 'var(--color-accent)',
                opacity: 0.4,
                minHeight: '16px',
              }}
              aria-hidden="true"
            />
            <p
              className="text-[16px] leading-[1.75] tracking-[-0.005em]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {bullet}
            </p>
          </motion.div>
        ))}

        {!bullets.length && (
          <p
            className="text-[16px] leading-[1.75] italic"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {summary}
          </p>
        )}
      </motion.div>
    </section>
  )
}
