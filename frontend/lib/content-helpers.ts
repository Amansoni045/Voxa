import type { ContentType } from '@/types/content'

export function getContentTypeBadge(type: ContentType): string {
  switch (type) {
    case 'youtube':
      return 'YouTube'
    case 'meeting':
      return 'Meeting'
    case 'podcast':
      return 'Podcast'
    case 'lecture':
      return 'Lecture'
    case 'interview':
      return 'Interview'
    case 'video':
      return 'Video'
    case 'recording':
    default:
      return 'Recording'
  }
}

export function getOverviewSectionLabel(type: ContentType): string {
  switch (type) {
    case 'youtube':
      return 'Video Overview'
    case 'meeting':
      return 'Meeting Overview'
    case 'podcast':
      return 'Podcast Overview'
    case 'lecture':
      return 'Lecture Overview'
    case 'interview':
      return 'Interview Overview'
    case 'video':
      return 'Video Overview'
    case 'recording':
    default:
      return 'Recording Overview'
  }
}

export function getAskHeaderLabel(type: ContentType): string {
  switch (type) {
    case 'youtube':
      return 'Ask about this video'
    case 'meeting':
      return 'Ask about this meeting'
    case 'podcast':
      return 'Ask about this podcast'
    case 'lecture':
      return 'Ask about this lecture'
    case 'interview':
      return 'Ask about this interview'
    case 'video':
      return 'Ask about this video'
    case 'recording':
    default:
      return 'Ask about this recording'
  }
}

export function getAskPlaceholder(type: ContentType): string {
  switch (type) {
    case 'youtube':
      return 'What happened in this video?'
    case 'meeting':
      return 'What was decided in this meeting?'
    case 'podcast':
      return 'What were the main podcast takeaways?'
    case 'lecture':
      return 'What are the core concepts in this lecture?'
    case 'interview':
      return 'What did the interviewee conclude?'
    case 'video':
      return 'Summarize key points in this video...'
    case 'recording':
    default:
      return 'Ask a question about this recording...'
  }
}

export function getTranscriptEmptyMessage(type: ContentType): string {
  switch (type) {
    case 'youtube':
      return 'No transcript available for this video.'
    case 'meeting':
      return 'No transcript available for this meeting.'
    case 'podcast':
      return 'No transcript available for this podcast.'
    case 'lecture':
      return 'No transcript available for this lecture.'
    case 'interview':
      return 'No transcript available for this interview.'
    case 'recording':
    default:
      return 'No transcript available for this recording.'
  }
}

export function getDecisionsEmptyMessage(type: ContentType): string {
  switch (type) {
    case 'meeting':
      return 'Nothing was decided — at least not out loud.'
    case 'youtube':
    case 'video':
      return 'No key conclusions or decisions were highlighted in this video.'
    case 'podcast':
      return 'No specific decisions outlined in this episode.'
    case 'lecture':
      return 'No formal decisions recorded for this session.'
    case 'interview':
    case 'recording':
    default:
      return 'No explicit decisions identified.'
  }
}

export function getActionsEmptyMessage(type: ContentType): string {
  switch (type) {
    case 'meeting':
      return 'No tasks came out of this meeting.'
    case 'youtube':
    case 'video':
      return 'No action items or next steps in this video.'
    case 'podcast':
    case 'lecture':
    case 'interview':
    case 'recording':
    default:
      return 'No action items extracted from this content.'
  }
}

export function getQuestionsEmptyMessage(type: ContentType): string {
  return 'Everything seems resolved.'
}

export function getHeroHeadline(type?: ContentType): string {
  return 'Any content, distilled.'
}

export function getHeroSubheading(type?: ContentType): string {
  return 'Drop in a recording, paste a YouTube link, or upload any file. We handle the rest.'
}

export function getProcessingTitle(sourceName?: string | null, type?: ContentType | null): string {
  if (!sourceName) return 'Distilling content...'
  const badge = type ? getContentTypeBadge(type) : 'Content'
  return `Distilling ${badge.toLowerCase()}...`
}
