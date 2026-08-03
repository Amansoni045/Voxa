'use client'

import { useState, useCallback } from 'react'
import { SectionLabel } from '@/components/shared/section-label'
import { QuestionInput } from '@/components/chat/question-input'
import { QAPairItem } from '@/components/chat/qa-pair'
import { useMeetingStore } from '@/stores/meeting-store'
import { chatWithMeeting, MOCK_MEETING } from '@/lib/api'
import { generateId } from '@/lib/utils'

// Inline mock answers for demo when backend is unavailable
const DEMO_ANSWERS: Record<string, string> = {
  default:
    'Based on the meeting transcript, the team discussed accelerating the mobile app launch date and making key decisions about API migration ownership and the design system budget approval process.',
}

interface AskSectionProps {
  meetingId: string
}

export function AskSection({ meetingId }: AskSectionProps) {
  const addQAPair = useMeetingStore((s) => s.addQAPair)
  const chatHistoryMap = useMeetingStore((s) => s.chatHistory)
  const chatHistory = chatHistoryMap[meetingId] ?? []
  const [isLoading, setIsLoading] = useState(false)

  const handleQuestion = useCallback(
    async (question: string) => {
      setIsLoading(true)

      // Optimistically show question
      const tempId = generateId()

      try {
        let answer: string
        try {
          answer = await chatWithMeeting(meetingId, question)
        } catch {
          // Fall back to demo answer if backend unavailable
          answer =
            DEMO_ANSWERS[question.toLowerCase()] ??
            DEMO_ANSWERS['default']
        }

        addQAPair(meetingId, { question, answer })
      } catch {
        addQAPair(meetingId, {
          question,
          answer:
            "Something didn't work with that question. Try asking something more specific.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [meetingId, addQAPair]
  )

  return (
    <section
      id="section-ask"
      aria-labelledby="heading-ask"
      className="scroll-mt-14"
    >
      <SectionLabel withAccentBar className="mb-6">
        <span id="heading-ask">Ask about this meeting</span>
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
        isLoading={isLoading}
      />
    </section>
  )
}
