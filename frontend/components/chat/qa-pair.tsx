'use client'

import { motion } from 'framer-motion'
import { answerAppear } from '@/lib/motion'
import type { QAPair } from '@/types/meeting'

interface QAPairProps {
  pair: QAPair
}

export function QAPairItem({ pair }: QAPairProps) {
  return (
    <article className="py-6 border-b" style={{ borderColor: 'var(--color-separator)' }}>
      {/* Question — large and prominent */}
      <p
        className="text-[18px] font-medium tracking-[-0.01em] leading-[1.4] mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {pair.question}
      </p>

      {/* Answer */}
      <motion.p
        variants={answerAppear}
        initial="hidden"
        animate="visible"
        className="text-[15px] leading-[1.7] tracking-[-0.005em]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {pair.answer}
      </motion.p>
    </article>
  )
}
