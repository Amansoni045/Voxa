'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionErrorCard } from '@/components/results/section-error-card'
import { parseDecisions } from '@/lib/parsers'
import { getDecisionsEmptyMessage } from '@/lib/content-helpers'
import { staggerContainer, documentCascade } from '@/lib/motion'
import { getSectionResult, type Decision, type ContentType, type SectionResult } from '@/types/content'

function DecisionItem({ decision }: { decision: Decision }) {
  return (
    <motion.div
      variants={documentCascade}
      className="flex gap-4 items-start py-4 border-b"
      style={{ borderColor: 'var(--color-separator)' }}
    >
      <span
        className="text-[15px] font-semibold flex-shrink-0 w-5 text-right leading-[1.6] tabular-nums"
        style={{ color: 'var(--color-accent)' }}
        aria-hidden="true"
      >
        {decision.number}
      </span>
      <p
        className="text-[15px] leading-[1.6] tracking-[-0.005em]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {decision.text}
      </p>
    </motion.div>
  )
}

interface DecisionsSectionProps {
  text: SectionResult | string
  sourceType?: ContentType
  isVisible: boolean
  onRetry?: () => void
}

export function DecisionsSection({ text, sourceType = 'recording', isVisible, onRetry }: DecisionsSectionProps) {
  const result = getSectionResult(text)
  const decisions = result.status === 'SUCCESS' && result.content ? parseDecisions(result.content) : []
  const emptyMessage = getDecisionsEmptyMessage(sourceType)

  return (
    <section id="section-decisions" aria-labelledby="heading-decisions" className="scroll-mt-14">
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-decisions">Key Decisions</span>
      </SectionLabel>

      {result.status === 'FAILED' ? (
        <SectionErrorCard sectionTitle="Key Decisions" sectionResult={result} onRetry={onRetry} />
      ) : decisions.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="border-t"
          style={{ borderColor: 'var(--color-separator)' }}
          role="list"
        >
          {decisions.map((decision) => (
            <div key={decision.id} role="listitem">
              <DecisionItem decision={decision} />
            </div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
