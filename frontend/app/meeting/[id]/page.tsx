'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function MeetingLegacyRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params?.id as string

  useEffect(() => {
    if (meetingId) {
      router.replace(`/analysis/${meetingId}`)
    } else {
      router.replace('/')
    }
  }, [meetingId, router])

  return (
    <div
      className="min-h-dvh flex items-center justify-center text-[13px]"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-tertiary)' }}
    >
      Redirecting to V2 Analysis...
    </div>
  )
}
