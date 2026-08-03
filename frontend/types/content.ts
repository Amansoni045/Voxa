export type ContentType =
  | 'youtube'
  | 'meeting'
  | 'podcast'
  | 'lecture'
  | 'interview'
  | 'recording'
  | 'video'

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
  summary: string
  action_items: string
  key_decisions: string
  questions: string
  risks?: string
  next_steps?: string
  transcript?: string
  metadata?: ContentMetadata
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
