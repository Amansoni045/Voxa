'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { SectionErrorCard } from '@/components/results/section-error-card'
import { parseSummaryBullets } from '@/lib/parsers'
import { getOverviewSectionLabel } from '@/lib/content-helpers'
import { staggerContainer, documentCascade } from '@/lib/motion'
import { getSectionResult, type ContentType, type SectionResult } from '@/types/content'

interface OverviewSectionProps {
  summary: SectionResult | string
  sourceType?: ContentType
  isVisible: boolean
  onRetry?: () => void
}

export function OverviewSection({
  summary,
  sourceType = 'recording',
  isVisible,
  onRetry,
}: OverviewSectionProps) {
  const result = getSectionResult(summary)
  const label = getOverviewSectionLabel(sourceType)
  const bullets = result.status === 'SUCCESS' && result.content ? parseSummaryBullets(result.content) : []

  return (
    <section id="section-overview" aria-labelledby="heading-overview" className="scroll-mt-14">
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-overview">{label}</span>
      </SectionLabel>

      {result.status === 'FAILED' ? (
        <SectionErrorCard sectionTitle="Summary Overview" sectionResult={result} onRetry={onRetry} />
      ) : result.status === 'EMPTY' ? (
        <p className="text-[15px] italic" style={{ color: 'var(--color-text-secondary)' }}>
          No summary points were identified in this recording.
        </p>
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="flex flex-col gap-3"
        >
          {bullets.map((bullet, i) => (
            <motion.div key={i} variants={documentCascade} className="flex gap-3 items-start">
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
            <p className="text-[16px] leading-[1.75]" style={{ color: 'var(--color-text-primary)' }}>
              {result.content}
            </p>
          )}
        </motion.div>
      )}
    </section>
  )
}
