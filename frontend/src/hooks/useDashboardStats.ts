import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: DashboardStats }
  | { status: 'empty' }
  | { status: 'error'; message: string }

async function fetchStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/api/dashboard/stats')
  return data
}

function hasRealData(data: DashboardStats): boolean {
  return (
    data.overview.totalCommits30d > 0 ||
    data.heatmap.some((d) => d.count > 0) ||
    data.languages.length > 0
  )
}

export function useDashboardStats() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollStop = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchStats()
      setState(hasRealData(data) ? { status: 'ok', data } : { status: 'empty' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load stats'
      setState({ status: 'error', message: msg })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Start polling every 4s until lastSyncedAt advances past `sinceIso`, max 90s
  const startPolling = useCallback(
    (sinceIso: string) => {
      if (pollTimer.current) clearInterval(pollTimer.current)
      if (pollStop.current) clearTimeout(pollStop.current)

      const stopAll = () => {
        if (pollTimer.current) clearInterval(pollTimer.current)
        if (pollStop.current) clearTimeout(pollStop.current)
      }

      pollTimer.current = setInterval(async () => {
        try {
          const data = await fetchStats()
          const updated =
            data.lastSyncedAt !== null && data.lastSyncedAt > sinceIso
          if (updated) {
            stopAll()
            setState(hasRealData(data) ? { status: 'ok', data } : { status: 'empty' })
          }
        } catch {
          // silent — keep polling
        }
      }, 4000)

      // Hard stop after 90s regardless
      pollStop.current = setTimeout(() => {
        stopAll()
        load()
      }, 90_000)
    },
    [load]
  )

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
      if (pollStop.current) clearTimeout(pollStop.current)
    }
  }, [])

  return { state, refresh: load, startPolling }
}
