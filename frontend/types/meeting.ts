import type { ContentAnalysis, HistoryItem } from './content'

export * from './content'

// Backward compatibility aliases
export type MeetingAnalysis = ContentAnalysis
export type RecentMeeting = HistoryItem
