import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSectionResult, type ContentAnalysis, type HistoryItem, type QAPair, type ContentType, type ProcessingStatus } from '@/types/content'
import { generateId } from '@/lib/utils'

export type RealStage =
  | 'preparing'
  | 'loading_model'
  | 'transcribing'
  | 'understanding'
  | 'generating_report'
  | 'done'
  | 'error'

interface ContentStore {
  // Current active content being processed or displayed
  currentContent: ContentAnalysis | null
  setCurrentContent: (content: ContentAnalysis | null) => void

  // Backward compatibility alias
  currentMeeting: ContentAnalysis | null
  setCurrentMeeting: (content: ContentAnalysis | null) => void

  // Processing state & Real-Time Pipeline Progress
  processingFile: string | null
  processingUrl: string | null
  processingSourceType: ContentType | null
  processingStatus: ProcessingStatus
  processingError: string | null

  activeStage: RealStage
  stageMessage: string
  stageDetail: string | null
  failedStage: string | null
  isBackgrounded: boolean

  setProcessingFile: (name: string | null, sourceType?: ContentType) => void
  setProcessingUrl: (url: string | null, sourceType?: ContentType) => void
  setProcessingError: (error: string | null, failedStage?: string) => void
  setActiveStage: (stage: RealStage, message: string, detail?: string) => void
  setIsBackgrounded: (isBg: boolean) => void
  resetProcessing: () => void

  // Persistent History system
  history: HistoryItem[]
  addHistoryItem: (content: ContentAnalysis) => void
  removeHistoryItem: (id: string) => void
  renameHistoryItem: (id: string, newTitle: string) => void
  togglePinHistoryItem: (id: string) => void
  toggleFavoriteHistoryItem: (id: string) => void
  clearHistory: () => void

  // Backward compatibility aliases
  recentMeetings: HistoryItem[]
  addRecentMeeting: (content: ContentAnalysis) => void
  clearRecentMeetings: () => void

  // History filtering & search
  historySearchQuery: string
  setHistorySearchQuery: (query: string) => void
  historyFilterType: ContentType | 'all'
  setHistoryFilterType: (type: ContentType | 'all') => void

  // Action item completion state
  completedItems: Record<string, boolean>
  toggleItem: (id: string) => void

  // Q&A history per content item
  chatHistory: Record<string, QAPair[]>
  addQAPair: (contentId: string, pair: Omit<QAPair, 'id' | 'timestamp'>) => void
  getChatHistory: (contentId: string) => QAPair[]
}

const EMPTY_CHAT_ARRAY: QAPair[] = []

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      currentContent: null,
      setCurrentContent: (content) =>
        set({
          currentContent: content,
          currentMeeting: content,
          processingStatus: content ? 'done' : 'idle',
          processingError: null,
          activeStage: content ? 'done' : 'preparing',
          isBackgrounded: false,
        }),

      currentMeeting: null,
      setCurrentMeeting: (content) =>
        set({
          currentContent: content,
          currentMeeting: content,
          processingStatus: content ? 'done' : 'idle',
          processingError: null,
          activeStage: content ? 'done' : 'preparing',
          isBackgrounded: false,
        }),

      processingFile: null,
      processingUrl: null,
      processingSourceType: null,
      processingStatus: 'idle',
      processingError: null,

      activeStage: 'preparing',
      stageMessage: 'Initializing analysis...',
      stageDetail: null,
      failedStage: null,
      isBackgrounded: false,

      setProcessingFile: (name, sourceType = 'recording') =>
        set({
          processingFile: name,
          processingSourceType: sourceType,
          processingStatus: name ? 'processing' : 'idle',
          processingError: null,
          activeStage: 'preparing',
          stageMessage: 'Receiving file...',
          stageDetail: 'Preparing audio for processing',
          failedStage: null,
          isBackgrounded: false,
        }),

      setProcessingUrl: (url, sourceType = 'youtube') =>
        set({
          processingUrl: url,
          processingSourceType: sourceType,
          processingStatus: url ? 'processing' : 'idle',
          processingError: null,
          activeStage: 'preparing',
          stageMessage: 'Fetching URL media...',
          stageDetail: 'Downloading media stream',
          failedStage: null,
          isBackgrounded: false,
        }),

      setProcessingError: (error, failedStage = undefined) =>
        set({
          processingError: error,
          processingStatus: error ? 'error' : 'idle',
          activeStage: 'error',
          failedStage: failedStage ?? get().activeStage,
        }),

      setActiveStage: (stage, message, detail) =>
        set({
          activeStage: stage,
          stageMessage: message,
          stageDetail: detail ?? null,
          processingStatus: stage === 'done' ? 'done' : stage === 'error' ? 'error' : 'processing',
        }),

      setIsBackgrounded: (isBg) => set({ isBackgrounded: isBg }),

      resetProcessing: () =>
        set({
          processingFile: null,
          processingUrl: null,
          processingSourceType: null,
          processingStatus: 'idle',
          processingError: null,
          activeStage: 'preparing',
          stageMessage: '',
          stageDetail: null,
          failedStage: null,
          isBackgrounded: false,
        }),

      history: [],
      recentMeetings: [],
      addHistoryItem: (content) => {
        const item: HistoryItem = {
          id: content.id,
          title: content.title,
          sourceType: content.sourceType,
          date: new Date().toISOString(),
          duration_seconds: content.metadata?.duration_seconds,
          action_items_count: (() => {
            const res = getSectionResult(content.action_items)
            return res.status === 'SUCCESS' && res.content
              ? res.content.split('\n\n').filter(Boolean).length
              : 0
          })(),
          channelName: content.metadata?.channelName,
          thumbnailUrl: content.metadata?.thumbnailUrl,
          originalUrl: content.metadata?.originalUrl,
          isPinned: false,
          isFavorite: false,
        }

        set((state) => {
          const updated = [
            item,
            ...state.history.filter((h) => h.id !== content.id),
          ]
          return {
            history: updated,
            recentMeetings: updated,
          }
        })
      },
      addRecentMeeting: (content) => get().addHistoryItem(content),

      removeHistoryItem: (id) =>
        set((state) => {
          const updated = state.history.filter((h) => h.id !== id)
          return { history: updated, recentMeetings: updated }
        }),

      renameHistoryItem: (id, newTitle) =>
        set((state) => {
          const updated = state.history.map((h) =>
            h.id === id ? { ...h, title: newTitle } : h
          )
          return { history: updated, recentMeetings: updated }
        }),

      togglePinHistoryItem: (id) =>
        set((state) => {
          const updated = state.history.map((h) =>
            h.id === id ? { ...h, isPinned: !h.isPinned } : h
          )
          return { history: updated, recentMeetings: updated }
        }),

      toggleFavoriteHistoryItem: (id) =>
        set((state) => {
          const updated = state.history.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          )
          return { history: updated, recentMeetings: updated }
        }),

      clearHistory: () => set({ history: [], recentMeetings: [] }),
      clearRecentMeetings: () => get().clearHistory(),

      historySearchQuery: '',
      setHistorySearchQuery: (query) => set({ historySearchQuery: query }),

      historyFilterType: 'all',
      setHistoryFilterType: (type) => set({ historyFilterType: type }),

      completedItems: {},
      toggleItem: (id) =>
        set((state) => ({
          completedItems: {
            ...state.completedItems,
            [id]: !state.completedItems[id],
          },
        })),

      chatHistory: {},
      addQAPair: (contentId, pair) => {
        const newPair: QAPair = {
          ...pair,
          id: generateId(),
          timestamp: new Date(),
        }
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [contentId]: [...(state.chatHistory[contentId] ?? []), newPair],
          },
        }))
      },
      getChatHistory: (contentId) => get().chatHistory[contentId] ?? EMPTY_CHAT_ARRAY,
    }),
    {
      name: 'voxa-content-store-v2',
      partialize: (state) => ({
        history: state.history,
        completedItems: state.completedItems,
        chatHistory: state.chatHistory,
      }),
    }
  )
)

export const useMeetingStore = useContentStore
