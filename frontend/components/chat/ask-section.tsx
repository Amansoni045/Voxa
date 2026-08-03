'use client'

import { useState, useCallback } from 'react'
import { SectionLabel } from '@/components/shared/section-label'
import { QuestionInput } from '@/components/chat/question-input'
import { QAPairItem } from '@/components/chat/qa-pair'
import { useContentStore } from '@/stores/content-store'
import { chatWithMeeting } from '@/lib/api'
import { getAskHeaderLabel } from '@/lib/content-helpers'
import type { ContentType } from '@/types/content'

interface AskSectionProps {
  contentId: string
  sourceType?: ContentType
}

export function AskSection({ contentId, sourceType = 'recording' }: AskSectionProps) {
  const addQAPair = useContentStore((s) => s.addQAPair)
  const chatHistoryMap = useContentStore((s) => s.chatHistory)
  const chatHistory = chatHistoryMap[contentId] ?? []
  const [isLoading, setIsLoading] = useState(false)

  const label = getAskHeaderLabel(sourceType)

  const handleQuestion = useCallback(
    async (question: string) => {
      setIsLoading(true)

      try {
        const answer = await chatWithMeeting(contentId, question)
        addQAPair(contentId, { question, answer })
      } catch (err: any) {
        addQAPair(contentId, {
          question,
          answer:
            err.message ||
            "We couldn't get an answer right now. Please make sure the Voxa backend server is running and try again.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [contentId, addQAPair]
  )

  return (
    <section
      id="section-ask"
      aria-labelledby="heading-ask"
      className="scroll-mt-14"
    >
      <SectionLabel withAccentBar className="mb-6">
        <span id="heading-ask">{label}</span>
      </SectionLabel>

      {/* Q&A history */}
      {chatHistory.length > 0 && (
        <div
          className="mb-6 border-t"
          style={{ borderColor: 'var(--color-separator)' }}
          role="log"
          aria-label="Questions and answers"
          aria-live="polite"
        >
          {chatHistory.map((pair) => (
            <QAPairItem key={pair.id} pair={pair} />
          ))}

          {/* Loading state */}
          {isLoading && (
            <div className="py-6 border-b" style={{ borderColor: 'var(--color-separator)' }}>
              <p
                className="text-[15px]"
                style={{ color: 'var(--color-text-tertiary)' }}
                aria-live="polite"
                aria-label="Loading answer"
              >
                ···
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <QuestionInput
        onSubmit={handleQuestion}
        sourceType={sourceType}
        isLoading={isLoading}
      />
    </section>
  )
}
