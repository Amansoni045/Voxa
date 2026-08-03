export interface MeetingMetadata {
  duration_seconds?: number
  detected_language?: string
  transcription_engine?: string
  generation_timestamp?: string
  transcript_chunks_count?: number
  processing_time_seconds?: number
}

export interface MeetingAnalysis {
  id: string
  title: string
  summary: string
  action_items: string
  key_decisions: string
  questions: string
  risks?: string
  next_steps?: string
  transcript?: string
  metadata?: MeetingMetadata
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

export interface RecentMeeting {
  id: string
  title: string
  date: Date
  duration_seconds?: number
  action_items_count: number
}

export interface ProcessingStage {
  label: string
  durationMs: number
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'
