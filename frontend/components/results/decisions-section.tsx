'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { EmptyState } from '@/components/shared/empty-state'
import { parseDecisions } from '@/lib/parsers'
import { staggerContainer, documentCascade } from '@/lib/motion'
import type { Decision } from '@/types/meeting'

function DecisionItem({ decision, index }: { decision: Decision; index: number }) {
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
  text: string
  isVisible: boolean
}

export function DecisionsSection({ text, isVisible }: DecisionsSectionProps) {
  const decisions = parseDecisions(text)

  return (
    <section
      id="section-decisions"
      aria-labelledby="heading-decisions"
      className="scroll-mt-14"
    >
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-decisions">Key Decisions</span>
      </SectionLabel>

      {decisions.length === 0 ? (
        <EmptyState message="Nothing was decided — at least not out loud." />
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="border-t"
          style={{ borderColor: 'var(--color-separator)' }}
          role="list"
        >
          {decisions.map((decision, i) => (
            <div key={decision.id} role="listitem">
              <DecisionItem decision={decision} index={i} />
            </div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
