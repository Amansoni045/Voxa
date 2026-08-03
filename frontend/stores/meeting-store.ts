import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MeetingAnalysis, RecentMeeting, ActionItem, QAPair } from '@/types/meeting'
import { generateId } from '@/lib/utils'

interface MeetingStore {
  // Current meeting being processed / displayed
  currentMeeting: MeetingAnalysis | null
  setCurrentMeeting: (meeting: MeetingAnalysis | null) => void

  // Processing state
  processingFile: string | null
  processingUrl: string | null
  setProcessingFile: (name: string | null) => void
  setProcessingUrl: (url: string | null) => void

  // Recent meetings history
  recentMeetings: RecentMeeting[]
  addRecentMeeting: (meeting: MeetingAnalysis) => void
  clearRecentMeetings: () => void

  // Action item completion state (persisted)
  completedItems: Record<string, boolean>
  toggleItem: (id: string) => void

  // Chat history per meeting
  chatHistory: Record<string, QAPair[]>
  addQAPair: (meetingId: string, pair: Omit<QAPair, 'id' | 'timestamp'>) => void
  getChatHistory: (meetingId: string) => QAPair[]
}

const EMPTY_CHAT_ARRAY: QAPair[] = []

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      currentMeeting: null,
      setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),

      processingFile: null,
      processingUrl: null,
      setProcessingFile: (name) => set({ processingFile: name }),
      setProcessingUrl: (url) => set({ processingUrl: url }),

      recentMeetings: [],
      addRecentMeeting: (meeting) => {
        const recent: RecentMeeting = {
          id: meeting.id,
          title: meeting.title,
          date: new Date(),
          duration_seconds: meeting.metadata?.duration_seconds,
          action_items_count: meeting.action_items
            ? meeting.action_items.split('\n\n').filter(Boolean).length
            : 0,
        }
        set((state) => ({
          recentMeetings: [
            recent,
            ...state.recentMeetings.filter((m) => m.id !== meeting.id),
          ].slice(0, 10), // keep last 10
        }))
      },
      clearRecentMeetings: () => set({ recentMeetings: [] }),

      completedItems: {},
      toggleItem: (id) =>
        set((state) => ({
          completedItems: {
            ...state.completedItems,
            [id]: !state.completedItems[id],
          },
        })),

      chatHistory: {},
      addQAPair: (meetingId, pair) => {
        const newPair: QAPair = {
          ...pair,
          id: generateId(),
          timestamp: new Date(),
        }
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [meetingId]: [...(state.chatHistory[meetingId] ?? []), newPair],
          },
        }))
      },
      getChatHistory: (meetingId) => get().chatHistory[meetingId] ?? EMPTY_CHAT_ARRAY,
    }),
    {
      name: 'voxa-meeting-store',
      partialize: (state) => ({
        recentMeetings: state.recentMeetings,
        completedItems: state.completedItems,
        chatHistory: state.chatHistory,
      }),
    }
  )
)
