'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProcessingStage } from '@/types/meeting'

export const PROCESSING_STAGES: ProcessingStage[] = [
  { label: 'Getting started...', durationMs: 900 },
  { label: 'Listening carefully...', durationMs: 3000 },
  { label: 'Making sense of it...', durationMs: 2000 },
  { label: 'Finding what matters.', durationMs: 1800 },
  { label: 'Putting it together...', durationMs: 1500 },
  { label: 'Ready.', durationMs: 500 },
]

interface UseProcessingReturn {
  currentStageIndex: number
  completedStages: string[]
  isComplete: boolean
  isDone: boolean
}

/**
 * Advances through stages with the specified timing.
 * `isApiDone` signals when the actual API call has finished.
 * The final 'Ready.' stage will not complete until isApiDone is true.
 */
export function useProcessing(isApiDone: boolean): UseProcessingReturn {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [completedStages, setCompletedStages] = useState<string[]>([])
  const [isDone, setIsDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indexRef = useRef(0)

  const advance = useCallback(() => {
    const nextIndex = indexRef.current + 1

    if (nextIndex >= PROCESSING_STAGES.length) {
      setIsDone(true)
      return
    }

    // Don't advance to the final stage until the API is done
    if (nextIndex === PROCESSING_STAGES.length - 1 && !isApiDone) {
      // Retry after 500ms
      timerRef.current = setTimeout(advance, 500)
      return
    }

    setCompletedStages((prev) => [...prev, PROCESSING_STAGES[indexRef.current].label])
    indexRef.current = nextIndex
    setCurrentStageIndex(nextIndex)

    const nextDuration = PROCESSING_STAGES[nextIndex]?.durationMs ?? 1000
    timerRef.current = setTimeout(advance, nextDuration)
  }, [isApiDone])

  useEffect(() => {
    const firstDuration = PROCESSING_STAGES[0]?.durationMs ?? 1000
    timerRef.current = setTimeout(advance, firstDuration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [advance])

  return {
    currentStageIndex,
    completedStages,
    isComplete: isDone,
    isDone,
  }
}
