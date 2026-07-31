import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  countNewSubmissions,
  listSubmissions,
  type Submission,
} from '@/lib/repository/submissions'

/**
 * Submission loading for the admin panel.
 *
 * Deliberately not part of `ContentProvider`: that snapshot is loaded by every
 * visitor on first paint, and applicant contact details have no business being
 * in it. These hooks only ever run inside `/admin`, behind the session gate.
 */

type UseSubmissions = {
  items: Submission[]
  loading: boolean
  error: string | null
  /** Refetch from Postgres — call after a status change or delete. */
  reload: () => Promise<void>
  /** True when there is no database to read from, so an empty list is expected. */
  configured: boolean
}

export function useSubmissions(): UseSubmissions {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      setItems(await listSubmissions())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load submissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, loading, error, reload, configured: isSupabaseConfigured }
}

/**
 * Count of untriaged submissions for the sidebar badge.
 *
 * A count-only query, so it stays cheap enough to run on every admin screen. It
 * swallows its error: a badge that fails to load should not put an error banner
 * over an unrelated page, and the inbox itself reports the real problem.
 */
export function useNewSubmissionCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    countNewSubmissions()
      .then((value) => {
        if (active) setCount(value)
      })
      .catch(() => {
        /* badge is decorative — the inbox surfaces the real error */
      })

    return () => {
      active = false
    }
  }, [])

  return count
}