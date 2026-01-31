'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const HEARTBEAT_INTERVAL_MS = 60_000

export default function AdminSessionHeartbeat() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function beat() {
      try {
        const res = await fetch('/api/admin/heartbeat', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!res.ok) {
          if (res.status === 401 && !cancelled) {
            router.push('/login')
            router.refresh()
          }
        }
      } catch {
        // ignore (offline, etc)
      }
    }

    beat()
    const id = window.setInterval(beat, HEARTBEAT_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [router])

  return null
}
