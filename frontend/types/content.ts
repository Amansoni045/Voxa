export type ContentType =
  | 'youtube'
  | 'meeting'
  | 'podcast'
  | 'lecture'
  | 'interview'
  | 'recording'
  | 'video'

export type SectionStatus = 'SUCCESS' | 'EMPTY' | 'FAILED'

export interface DeveloperDetails {
  provider?: string
  exception?: string
  code?: number
  message?: string
}

export interface SectionResult {
  status: SectionStatus
  content?: string | null
  reason?: string
  developer_details?: DeveloperDetails
}

export interface ContentMetadata {
  duration_seconds?: number
  detected_language?: string
  transcription_engine?: string
  generation_timestamp?: string
  transcript_chunks_count?: number
  processing_time_seconds?: number
  channelName?: string
  author?: string
  thumbnailUrl?: string
  originalUrl?: string
  publishDate?: string
}

export interface ContentAnalysis {
  id: string
  title: string
  sourceType: ContentType
  summary: SectionResult | string
  action_items: SectionResult | string
  key_decisions: SectionResult | string
  questions: SectionResult | string
  risks?: SectionResult | string
  next_steps?: SectionResult | string
  transcript?: string
  metadata?: ContentMetadata
}

// Helper to extract SectionResult safely from string or SectionResult object
export function getSectionResult(val: SectionResult | string | undefined): SectionResult {
  if (!val) return { status: 'EMPTY' }
  if (typeof val === 'object' && 'status' in val) return val

  const str = String(val).trim()
  if (!str || str === 'No summary generated.' || (str.startsWith('No ') && str.endsWith(' found.'))) {
    return { status: 'EMPTY' }
  }
  return { status: 'SUCCESS', content: str }
}

// Parsed / structured types for UI rendering
export interface ActionItem {
  id: string
  task: string
  owner?: string
  deadline?: string
  completed: boolean
}

export interface Decision {
  id: string
  text: string
  number: number
}

export interface Question {
  id: string
  text: string
  number: number
}

export interface TranscriptParagraph {
  id: string
  timestamp?: string
  speaker?: string
  text: string
}

export interface QAPair {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export interface HistoryItem {
  id: string
  title: string
  sourceType: ContentType
  date: Date | string
  duration_seconds?: number
  action_items_count: number
  channelName?: string
  thumbnailUrl?: string
  originalUrl?: string
  isPinned?: boolean
  isFavorite?: boolean
}

export interface ProcessingStage {
  label: string
  durationMs: number
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'
