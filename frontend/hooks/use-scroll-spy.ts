'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function useScrollSpy(sectionIds: string[], offset = 80) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observe = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()

    const entries = new Map<string, IntersectionObserverEntry>()

    observerRef.current = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          entries.set(entry.target.id, entry)
        }

        // Find the topmost visible section
        let topMost: string | null = null
        let topMostY = Infinity

        for (const [id, entry] of entries) {
          if (entry.isIntersecting) {
            const y = entry.boundingClientRect.top
            if (y < topMostY) {
              topMostY = y
              topMost = id
            }
          }
        }

        if (topMost) setActiveId(topMost)
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.25],
      }
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observerRef.current.observe(el)
    }
  }, [sectionIds, offset])

  useEffect(() => {
    observe()
    return () => observerRef.current?.disconnect()
  }, [observe])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }, [offset])

  return { activeId, scrollTo }
}
