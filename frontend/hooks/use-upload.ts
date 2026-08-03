'use client'

import { useState, useCallback, useRef } from 'react'
import { validateAudioFile, validateYoutubeUrl } from '@/lib/api'

interface UseUploadReturn {
  isDragging: boolean
  error: string | null
  handleFileSelect: (file: File) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  openFilePicker: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  clearError: () => void
}

export function useUpload(onFile: (file: File) => void): UseUploadReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragCounterRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileSelect = useCallback((file: File) => {
    const err = validateAudioFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onFile(file)
  }, [onFile])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }, [])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    isDragging,
    error,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    openFilePicker,
    fileInputRef,
    clearError,
  }
}

interface UseYoutubeReturn {
  url: string
  setUrl: (url: string) => void
  error: string | null
  handleSubmit: () => void
  isVisible: boolean
  toggle: () => void
  clearError: () => void
}

export function useYoutube(onUrl: (url: string) => void): UseYoutubeReturn {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const handleSubmit = useCallback(() => {
    const err = validateYoutubeUrl(url)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onUrl(url)
  }, [url, onUrl])

  const toggle = useCallback(() => {
    setIsVisible((v) => !v)
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { url, setUrl, error, handleSubmit, isVisible, toggle, clearError }
}
