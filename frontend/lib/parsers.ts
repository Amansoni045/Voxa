import type { ActionItem, Decision, Question, TranscriptParagraph } from '@/types/meeting'
import { generateId } from '@/lib/utils'

/**
 * Parse action items from LLM text output.
 * Expects format like:
 *   Task: Write quarterly report
 *   Owner: Sarah
 *   Deadline: Friday
 *
 *   Task: Review contracts
 *   Owner: Marcus
 */
export function parseActionItems(text: string): ActionItem[] {
  if (!text?.trim()) return []

  const items: ActionItem[] = []
  // Split by double newline or numbered list or bullet
  const blocks = text.split(/\n\s*\n/).filter(Boolean)

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue

    let task = ''
    let owner: string | undefined
    let deadline: string | undefined

    for (const line of lines) {
      const lower = line.toLowerCase()
      if (lower.startsWith('task:') || lower.startsWith('- ') || /^\d+\./.test(line)) {
        task = line.replace(/^(task:|\d+\.|-)/i, '').trim()
      } else if (lower.startsWith('owner:') || lower.startsWith('assigned to:') || lower.startsWith('responsible:')) {
        owner = line.split(':').slice(1).join(':').trim()
      } else if (lower.startsWith('deadline:') || lower.startsWith('due:') || lower.startsWith('due date:')) {
        deadline = line.split(':').slice(1).join(':').trim()
      } else if (!task) {
        // Treat any line as the task if no prefix found
        task = line.replace(/^[-*•·]\s*/, '').trim()
      }
    }

    if (task) {
      items.push({ id: generateId(), task, owner, deadline, completed: false })
    }
  }

  // Fallback: line-by-line for simple bullet lists
  if (!items.length) {
    const lines = text.split('\n').filter(l => l.trim())
    for (const line of lines) {
      const task = line.replace(/^[-*•·\d\.]+\s*/, '').trim()
      if (task) {
        items.push({ id: generateId(), task, completed: false })
      }
    }
  }

  return items
}

/**
 * Parse numbered decisions list.
 */
export function parseDecisions(text: string): Decision[] {
  if (!text?.trim()) return []

  const lines = text.split('\n').filter(l => l.trim())
  const decisions: Decision[] = []
  let number = 1

  for (const line of lines) {
    const clean = line.replace(/^\d+[.):\-]\s*/, '').replace(/^[-*•]\s*/, '').trim()
    if (clean) {
      decisions.push({ id: generateId(), text: clean, number: number++ })
    }
  }

  return decisions
}

/**
 * Parse open questions list.
 */
export function parseQuestions(text: string): Question[] {
  if (!text?.trim()) return []

  const lines = text.split('\n').filter(l => l.trim())
  const questions: Question[] = []
  let number = 1

  for (const line of lines) {
    const clean = line.replace(/^\d+[.):\-]\s*/, '').replace(/^[-*•]\s*/, '').trim()
    if (clean) {
      questions.push({ id: generateId(), text: clean, number: number++ })
    }
  }

  return questions
}

/**
 * Parse raw transcript text into paragraphs.
 * Groups sentences into readable paragraphs with ~5 sentences each.
 */
export function parseTranscript(text: string): TranscriptParagraph[] {
  if (!text?.trim()) return []

  const paragraphs: TranscriptParagraph[] = []

  // Check if transcript has speaker labels (e.g., "SPEAKER 1:" or "Alice:")
  const speakerPattern = /^([A-Z][A-Z\s0-9]+|[A-Za-z]+):\s*/
  const lines = text.split('\n').filter(l => l.trim())

  let currentSpeaker: string | undefined
  let currentLines: string[] = []

  const flush = () => {
    if (currentLines.length) {
      paragraphs.push({
        id: generateId(),
        speaker: currentSpeaker,
        text: currentLines.join(' '),
      })
      currentLines = []
    }
  }

  for (const line of lines) {
    const match = line.match(speakerPattern)
    if (match) {
      flush()
      currentSpeaker = match[1].trim()
      const rest = line.slice(match[0].length).trim()
      if (rest) currentLines.push(rest)
    } else {
      currentLines.push(line.trim())
      // Break into paragraphs every ~5 lines
      if (currentLines.length >= 5) flush()
    }
  }
  flush()

  // Fallback: no speaker labels, just split into ~100-word paragraphs
  if (!paragraphs.length) {
    const words = text.split(' ')
    const chunkSize = 80
    for (let i = 0; i < words.length; i += chunkSize) {
      paragraphs.push({
        id: generateId(),
        text: words.slice(i, i + chunkSize).join(' '),
      })
    }
  }

  return paragraphs
}

/**
 * Parse summary bullets into renderable items.
 * Returns array of strings (each bullet as a paragraph).
 */
export function parseSummaryBullets(text: string): string[] {
  if (!text?.trim()) return []
  return text
    .split('\n')
    .map(l => l.replace(/^[-*•·]\s*/, '').trim())
    .filter(Boolean)
}
