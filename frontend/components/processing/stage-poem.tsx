'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { stageActiveAppear } from '@/lib/motion'

export interface StageItem {
  label: string
}

interface StagePoemProps {
  currentStageIndex: number
  completedStages: string[]
  stages: StageItem[]
}

export function StagePoem({ currentStageIndex, completedStages, stages }: StagePoemProps) {
  const currentStage = stages[currentStageIndex]

  return (
    <div className="relative flex flex-col items-center w-full" aria-live="polite" aria-atomic="true">
      {/* Completed stages — recede upward */}
      <div className="mb-8 flex flex-col items-center gap-1 text-center min-h-[48px] justify-end">
        <AnimatePresence>
          {completedStages.slice(-3).map((label, i, arr) => {
            const opacity = 0.25 + (i / arr.length) * 0.25
            return (
              <motion.p
                key={`${label}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="text-[12px] leading-none font-normal"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {label}
              </motion.p>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Active stage — centered */}
      <AnimatePresence mode="wait">
        {currentStage && (
          <motion.div
            key={currentStage.label}
            variants={stageActiveAppear}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex items-center gap-3"
            aria-label={`Current stage: ${currentStage.label}`}
          >
            {/* Accent indicator bar */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
              className="absolute -left-5 top-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: '2px',
                height: '20px',
                backgroundColor: 'var(--color-accent)',
              }}
              aria-hidden="true"
            />

            <p
              className="text-[26px] font-normal leading-[1.35] tracking-[-0.01em] text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {currentStage.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
