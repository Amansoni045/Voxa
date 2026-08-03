import type { ContentAnalysis } from '@/types/content'
import { detectSourceFromFile, detectSourceFromUrl, extractYoutubeId } from '@/lib/source-detector'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// ─── Default Mock Content (Isolated for Demo Mode ONLY) ───────────
export const MOCK_CONTENT: ContentAnalysis = {
  id: 'demo-001',
  title: 'Q3 Product Roadmap Review',
  sourceType: 'meeting',
  summary: `• Agreed to accelerate the mobile app launch by two weeks — now targeting September 14th to beat a competitor announcement.
• Marketing and engineering alignment on the new onboarding flow is blocking three downstream workstreams.
• The API migration from v1 to v2 is on track but needs an owner assigned before end of week.
• Budget approval for the design system tooling was discussed but not resolved — requires CFO sign-off.`,
  key_decisions: `1. Move the mobile launch date from September 28th to September 14th.
2. Halt v1 API new features immediately; redirect capacity to v2 migration.
3. Sarah Chen to lead the onboarding redesign starting Monday.
4. Conduct a follow-up review on the design system budget in two weeks.`,
  action_items: `Task: Draft the revised mobile launch plan with timeline breakdown
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
  questions: `1. Who owns the v1-to-v2 API migration — is it a dedicated team or distributed?
2. Has the competitor launch date been confirmed, or is September 14th based on speculation?
3. What is the CFO's availability for the design system budget discussion?
4. Are there any dependencies between the mobile launch and the onboarding redesign?`,
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

// ─── API Functions (Strict Real Backend Contract) ──────────────────

export async function analyzeContent(file: File): Promise<ContentAnalysis> {
  const info = detectSourceFromFile(file)

  // Explicit Demo Mode flag only
  if (IS_DEMO_MODE) {
    return {
      ...MOCK_CONTENT,
      id: `file-${Math.random().toString(36).substring(2, 10)}`,
      title: info.title ?? file.name,
      sourceType: info.sourceType,
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Backend returned error status ${response.status}`)
    }

    const data = await response.json()
    return {
      ...data,
      id: data.id ?? generateClientId(),
      sourceType: data.sourceType ?? info.sourceType,
      title: data.title ?? info.title ?? file.name,
    }
  } catch (err: any) {
    // NEVER silently return mock data. Surface honest failure state.
    throw new Error(
      err.message ||
        'We couldn’t reach the Voxa backend server. Please make sure the backend is running and try again.'
    )
  }
}

export async function analyzeContentUrl(url: string): Promise<ContentAnalysis> {
  const info = detectSourceFromUrl(url)
  const ytId = extractYoutubeId(url)

  // Explicit Demo Mode flag only
  if (IS_DEMO_MODE) {
    return {
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
  }

  try {
    const response = await fetch(`${API_BASE}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Backend returned error status ${response.status}`)
    }

    const data = await response.json()
    return {
      ...data,
      id: data.id ?? generateClientId(),
      sourceType: data.sourceType ?? info.sourceType,
      metadata: {
        ...data.metadata,
        thumbnailUrl: data.metadata?.thumbnailUrl ?? info.thumbnailUrl,
        originalUrl: url,
      },
    }
  } catch (err: any) {
    // NEVER silently return mock data. Surface honest failure state.
    throw new Error(
      err.message ||
        'We couldn’t finish analyzing this link. Please check if the Voxa backend server is online or try another URL.'
    )
  }
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

function generateClientId(): string {
  return 'local-' + Math.random().toString(36).substring(2, 10)
}

// ─── Validation ───────────────────────────────────────────
const ALLOWED_EXTENSIONS = ['.mp3', '.mp4', '.wav', '.m4a', '.ogg', '.webm', '.mkv', '.mov', '.avi']
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

export function validateAudioFile(file: File): string | null {
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
