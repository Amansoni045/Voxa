import type { ContentType } from '@/types/content'

export interface ExtractedSourceInfo {
  sourceType: ContentType
  title?: string
  channelName?: string
  thumbnailUrl?: string
  originalUrl?: string
}

/**
 * Extract YouTube Video ID from URL.
 */
export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1)
    }
    if (u.hostname === 'youtube.com' || u.hostname === 'www.youtube.com') {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v')
      }
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/')[2]
      }
      if (u.pathname.startsWith('/v/')) {
        return u.pathname.split('/')[2]
      }
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/')[2]
      }
    }
  } catch {
    return null
  }
  return null
}

/**
 * Automatically detect content source type and metadata from a URL or filename.
 */
export function detectSourceFromUrl(url: string): ExtractedSourceInfo {
  const youtubeId = extractYoutubeId(url)
  if (youtubeId) {
    return {
      sourceType: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      originalUrl: url,
    }
  }

  const lower = url.toLowerCase()
  if (lower.includes('podcast') || lower.includes('spotify.com') || lower.includes('apple.com/podcast')) {
    return { sourceType: 'podcast', originalUrl: url }
  }
  if (lower.includes('zoom.us') || lower.includes('teams.microsoft.com') || lower.includes('meet.google.com')) {
    return { sourceType: 'meeting', originalUrl: url }
  }
  if (lower.includes('lecture') || lower.includes('course') || lower.includes('class')) {
    return { sourceType: 'lecture', originalUrl: url }
  }

  return { sourceType: 'recording', originalUrl: url }
}

export function detectSourceFromFile(file: File): ExtractedSourceInfo {
  const name = file.name.toLowerCase()
  const ext = '.' + name.split('.').pop()

  const isVideoExt = ['.mp4', '.webm', '.mkv', '.mov', '.avi'].includes(ext)

  if (name.includes('zoom') || name.includes('meet') || name.includes('teams') || name.includes('standup') || name.includes('sync')) {
    return { sourceType: 'meeting', title: formatFilenameTitle(file.name) }
  }
  if (name.includes('podcast') || name.includes('ep') || name.includes('episode')) {
    return { sourceType: 'podcast', title: formatFilenameTitle(file.name) }
  }
  if (name.includes('lecture') || name.includes('chapter') || name.includes('class')) {
    return { sourceType: 'lecture', title: formatFilenameTitle(file.name) }
  }
  if (name.includes('interview') || name.includes('qna') || name.includes('qa')) {
    return { sourceType: 'interview', title: formatFilenameTitle(file.name) }
  }

  return {
    sourceType: isVideoExt ? 'video' : 'recording',
    title: formatFilenameTitle(file.name),
  }
}

function formatFilenameTitle(filename: string): string {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
