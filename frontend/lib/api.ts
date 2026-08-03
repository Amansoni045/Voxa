import type { ContentAnalysis, SectionResult } from '@/types/content'
import { detectSourceFromFile, detectSourceFromUrl, extractYoutubeId } from '@/lib/source-detector'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export interface PipelineProgressEvent {
  stage: 'preparing' | 'loading_model' | 'transcribing' | 'understanding' | 'generating_report' | 'done' | 'error'
  message: string
  detail?: string
  result?: ContentAnalysis
  error?: string
}

// ─── Default Mock Content (Isolated for Demo Mode ONLY) ───────────
export const MOCK_CONTENT: ContentAnalysis = {
  id: 'demo-001',
  title: 'Q3 Product Roadmap Review',
  sourceType: 'meeting',
  summary: {
    status: 'SUCCESS',
    content: `• Agreed to accelerate the mobile app launch by two weeks — now targeting September 14th to beat a competitor announcement.
• Marketing and engineering alignment on the new onboarding flow is blocking three downstream workstreams.
• The API migration from v1 to v2 is on track but needs an owner assigned before end of week.
• Budget approval for the design system tooling was discussed but not resolved — requires CFO sign-off.`,
  },
  key_decisions: {
    status: 'SUCCESS',
    content: `1. Move the mobile launch date from September 28th to September 14th.
2. Halt v1 API new features immediately; redirect capacity to v2 migration.
3. Sarah Chen to lead the onboarding redesign starting Monday.
4. Conduct a follow-up review on the design system budget in two weeks.`,
  },
  action_items: {
    status: 'SUCCESS',
    content: `Task: Draft the revised mobile launch plan with timeline breakdown
Owner: Marcus Thompson
Deadline: This Friday

Task: Assign an owner to the v1-to-v2 API migration
Owner: Engineering leads
Deadline: End of week

Task: Schedule CFO meeting for design system budget approval
Owner: Sarah Chen
Deadline: Next Monday

Task: Share onboarding flow mockups with the full team
Owner: Design team
Deadline: Wednesday

Task: Update the product roadmap document to reflect the new dates
Owner: Marcus Thompson
Deadline: Today`,
  },
  questions: {
    status: 'SUCCESS',
    content: `1. Who owns the v1-to-v2 API migration — is it a dedicated team or distributed?
2. Has the competitor launch date been confirmed, or is September 14th based on speculation?
3. What is the CFO's availability for the design system budget discussion?
4. Are there any dependencies between the mobile launch and the onboarding redesign?`,
  },
  transcript: `Marcus Thompson: Alright, let's get started. I want to make sure we cover the mobile launch timing first because that's the most urgent thing on the table.

Sarah Chen: Agreed. I've been looking at the competitor landscape and I think we need to move faster. Their announcement is likely coming in the last week of September, which means if we launch on the 28th we're going to be playing catch-up.

Marcus Thompson: So what are you proposing? Moving it to the 14th?

Sarah Chen: Exactly. It's aggressive but I think it's the right call. Engineering, is that feasible?

Dev Lead: It's tight. We'd have to deprioritize a few features from the launch scope — specifically the social sharing module and the advanced notifications.

Marcus Thompson: Those are table stakes for v2 anyway, not v1. Let's make that trade. Sarah, I want you to lead the revised launch plan. Can you have something by Friday?

Sarah Chen: Yes, I can do that.

Marcus Thompson: Good. Now the other critical item — the API migration. Where are we on v2?

Dev Lead: The foundation is solid. We're about sixty percent done with the migration. The blocker is that v1 still has three teams shipping new features against it, which is slowing everything down.

Marcus Thompson: We need to stop that. No new v1 features starting today. All capacity goes to v2. Who owns this migration?

Dev Lead: That's actually the question — it's currently distributed across three engineers but there's no single owner.

Marcus Thompson: That needs to change by end of week. Whoever runs this needs full authority to make decisions.

Sarah Chen: I can help identify the right person. I know the team well.

Marcus Thompson: Thank you. Last thing — the design system budget. Did anyone get a response from the CFO?

Sarah Chen: Not yet. I'll schedule something for next week. But I want to flag that two of our design tooling contracts expire at the end of the month, so this needs to happen quickly.

Marcus Thompson: Understood. Let's make that happen Monday at the latest. Anything else before we wrap?

Dev Lead: The onboarding redesign — Sarah, when does that actually kick off?

Sarah Chen: Monday. I'll share the initial mockups with the full team on Wednesday so we can get early feedback.

Marcus Thompson: Perfect. Okay, let's wrap this up. Good discussion everyone.`,
  metadata: {
    duration_seconds: 2847,
    detected_language: 'English',
    transcription_engine: 'whisper',
    generation_timestamp: new Date().toISOString(),
    transcript_chunks_count: 3,
    processing_time_seconds: 41,
  },
}

export const MOCK_MEETING = MOCK_CONTENT

// ─── Real-Time Stream SSE Helper ─────────────────────────────────

async function consumeSseStream(
  response: Response,
  onProgress: (event: PipelineProgressEvent) => void
): Promise<ContentAnalysis> {
  if (!response.body) {
    throw new Error('Response body stream is empty.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let finalResult: ContentAnalysis | null = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let currentEventName = 'message'

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('event:')) {
        currentEventName = trimmed.slice(6).trim()
      } else if (trimmed.startsWith('data:')) {
        const rawJson = trimmed.slice(5).trim()
        try {
          const parsed = JSON.parse(rawJson)

          if (currentEventName === 'progress') {
            onProgress({
              stage: parsed.stage,
              message: parsed.message,
              detail: parsed.detail,
            })
          } else if (currentEventName === 'result') {
            finalResult = parsed as ContentAnalysis
            onProgress({
              stage: 'done',
              message: 'Analysis complete',
              result: finalResult,
            })
          } else if (currentEventName === 'error') {
            onProgress({
              stage: 'error',
              message: parsed.message || 'Processing failed',
              error: parsed.detail || parsed.message,
            })
            throw new Error(parsed.detail || parsed.message || 'Backend processing failed')
          }
        } catch (err: any) {
          if (err.message.includes('Backend processing failed')) throw err
        }
      }
    }
  }

  if (!finalResult) {
    throw new Error("Backend stream finished without emitting a final analysis result.")
  }

  return finalResult
}

// ─── API Functions ────────────────────────────────────────────────

export async function analyzeContentStream(
  file: File,
  onProgress: (event: PipelineProgressEvent) => void,
  signal?: AbortSignal
): Promise<ContentAnalysis> {
  const info = detectSourceFromFile(file)

  if (IS_DEMO_MODE) {
    onProgress({ stage: 'preparing', message: 'Receiving audio file...' })
    await new Promise((r) => setTimeout(r, 600))
    onProgress({ stage: 'loading_model', message: 'Preparing speech recognition...' })
    await new Promise((r) => setTimeout(r, 800))
    onProgress({ stage: 'transcribing', message: 'Transcribing audio content...' })
    await new Promise((r) => setTimeout(r, 1200))
    onProgress({ stage: 'understanding', message: 'Extracting key decisions and summary...' })
    await new Promise((r) => setTimeout(r, 800))

    const mockRes: ContentAnalysis = {
      ...MOCK_CONTENT,
      id: `file-${Math.random().toString(36).substring(2, 10)}`,
      title: info.title ?? file.name,
      sourceType: info.sourceType,
    }
    onProgress({ stage: 'done', message: 'Analysis complete', result: mockRes })
    return mockRes
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/analyze/stream`, {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(errText || `Backend returned status ${response.status}`)
  }

  return consumeSseStream(response, onProgress)
}

export async function analyzeContentUrlStream(
  url: string,
  onProgress: (event: PipelineProgressEvent) => void,
  signal?: AbortSignal
): Promise<ContentAnalysis> {
  const info = detectSourceFromUrl(url)
  const ytId = extractYoutubeId(url)

  if (IS_DEMO_MODE) {
    onProgress({ stage: 'preparing', message: 'Downloading media content...' })
    await new Promise((r) => setTimeout(r, 800))
    onProgress({ stage: 'loading_model', message: 'Loading speech model...' })
    await new Promise((r) => setTimeout(r, 800))
    onProgress({ stage: 'transcribing', message: 'Transcribing speech to text...' })
    await new Promise((r) => setTimeout(r, 1200))
    onProgress({ stage: 'understanding', message: 'Analyzing insights and action items...' })
    await new Promise((r) => setTimeout(r, 800))

    const mockRes: ContentAnalysis = {
      ...MOCK_CONTENT,
      id: `url-${ytId ?? Math.random().toString(36).substring(2, 10)}`,
      sourceType: info.sourceType,
      title: info.sourceType === 'youtube' ? 'YouTube Video Analysis' : 'Media Link Analysis',
      metadata: {
        ...MOCK_CONTENT.metadata,
        thumbnailUrl: info.thumbnailUrl,
        originalUrl: url,
      },
    }
    onProgress({ stage: 'done', message: 'Analysis complete', result: mockRes })
    return mockRes
  }

  const response = await fetch(`${API_BASE}/analyze-url/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(errText || `Backend returned status ${response.status}`)
  }

  return consumeSseStream(response, onProgress)
}

export async function retryTranscriptSections(transcript: string): Promise<{
  summary: SectionResult
  key_decisions: SectionResult
  action_items: SectionResult
  questions: SectionResult
}> {
  if (IS_DEMO_MODE) {
    return {
      summary: MOCK_CONTENT.summary as SectionResult,
      key_decisions: MOCK_CONTENT.key_decisions as SectionResult,
      action_items: MOCK_CONTENT.action_items as SectionResult,
      questions: MOCK_CONTENT.questions as SectionResult,
    }
  }

  const response = await fetch(`${API_BASE}/analyze-transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })

  if (!response.ok) {
    throw new Error('Failed to retry transcript sections.')
  }

  return response.json()
}

export async function analyzeContent(file: File): Promise<ContentAnalysis> {
  return analyzeContentStream(file, () => {})
}

export async function analyzeContentUrl(url: string): Promise<ContentAnalysis> {
  return analyzeContentUrlStream(url, () => {})
}

// Backward compatibility exports
export const analyzeMeeting = analyzeContent
export const analyzeMeetingUrl = analyzeContentUrl

export async function chatWithMeeting(
  contentId: string,
  question: string
): Promise<string> {
  if (IS_DEMO_MODE) {
    return 'Based on the content transcript, the team agreed to accelerate delivery timelines and assign ownership to the core workstreams.'
  }

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meeting_id: contentId, question }),
  })

  if (!response.ok) {
    throw new Error('Backend failed to process Q&A query')
  }

  const data = await response.json()
  return data.answer ?? data.response ?? ''
}

export function validateAudioFile(file: File): string | null {
  const ALLOWED_EXTENSIONS = ['.mp3', '.mp4', '.wav', '.m4a', '.ogg', '.webm', '.mkv', '.mov', '.avi']
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `That format isn't supported. Try MP3, MP4, WAV, M4A, WEBM or MKV.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `That recording is too large. Try a file under 500 MB.`
  }
  return null
}

export function validateYoutubeUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const isYoutube =
      u.hostname === 'youtube.com' ||
      u.hostname === 'www.youtube.com' ||
      u.hostname === 'youtu.be'
    if (!isYoutube) return "Please paste a valid YouTube video link."
    return null
  } catch {
    return "Please enter a valid link."
  }
}
