'use client'

import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/shared/section-label'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionErrorCard } from '@/components/results/section-error-card'
import { parseQuestions } from '@/lib/parsers'
import { staggerContainer, documentCascade } from '@/lib/motion'
import { getSectionResult, type SectionResult } from '@/types/content'

interface QuestionsSectionProps {
  text: SectionResult | string
  isVisible: boolean
  onRetry?: () => void
}

export function QuestionsSection({ text, isVisible, onRetry }: QuestionsSectionProps) {
  const result = getSectionResult(text)
  const questions = result.status === 'SUCCESS' && result.content ? parseQuestions(result.content) : []

  return (
    <section id="section-questions" aria-labelledby="heading-questions" className="scroll-mt-14">
      <SectionLabel withAccentBar className="mb-5">
        <span id="heading-questions">Open Questions</span>
      </SectionLabel>

      {result.status === 'FAILED' ? (
        <SectionErrorCard sectionTitle="Open Questions" sectionResult={result} onRetry={onRetry} />
      ) : questions.length === 0 ? (
        <EmptyState message="No open questions were identified in this recording." />
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="border-t"
          style={{ borderColor: 'var(--color-separator)' }}
          role="list"
        >
          {questions.map((q) => (
            <motion.div
              key={q.id}
              variants={documentCascade}
              role="listitem"
              className="flex gap-4 items-start py-4 border-b"
              style={{ borderColor: 'var(--color-separator)' }}
            >
              <span
                className="text-[15px] font-semibold flex-shrink-0 w-5 text-right leading-[1.6] tabular-nums"
                style={{ color: 'var(--color-accent)' }}
                aria-hidden="true"
              >
                {q.number}
              </span>
              <p
                className="text-[15px] leading-[1.6] tracking-[-0.005em]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {q.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
