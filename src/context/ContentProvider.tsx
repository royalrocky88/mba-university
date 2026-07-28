import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { buildSeedSnapshot, loadSnapshot, type ContentSnapshot } from '@/lib/repository'
import { isSupabaseConfigured } from '@/lib/supabase'

/**
 * Loads all site content once and shares it with every page, the navbar and the
 * chatbot. Admin mutations call `refresh()`, so an edit is visible across the
 * whole site without a reload.
 */

type ContentState = {
  content: ContentSnapshot
  loading: boolean
  error: string | null
  /** True when reads are coming from Supabase rather than the bundled seed data. */
  live: boolean
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  // Start from the bundled content so the first paint is never empty, then
  // swap in database rows when they arrive.
  const [content, setContent] = useState<ContentSnapshot>(() => buildSeedSnapshot())
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setContent(buildSeedSnapshot())
      setLive(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { snapshot, live: isLive } = await loadSnapshot()
      setContent(snapshot)
      setLive(isLive)
      setError(null)
    } catch (err) {
      // A database that is unreachable or not yet migrated should degrade to the
      // bundled content rather than taking the public site down.
      setError(err instanceof Error ? err.message : 'Could not load content')
      setContent(buildSeedSnapshot())
      setLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<ContentState>(
    () => ({ content, loading, error, live, refresh }),
    [content, loading, error, live, refresh],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentState {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

// ---------------------------------------------------------------------------
// Convenience selectors — these replace the direct `src/data` imports that pages
// would otherwise use, so every page automatically reflects admin edits.
// ---------------------------------------------------------------------------

export function usePrograms() {
  return useContent().content.programs
}

export function useProgram(slug: string | undefined) {
  return usePrograms().find((p) => p.slug === slug)
}

export function useFaculty() {
  return useContent().content.faculty
}

export function useNews() {
  // Newest first, so every consumer gets the same ordering.
  return [...useContent().content.news].sort((a, b) => b.date.localeCompare(a.date))
}

export function useSettings() {
  return useContent().content.settings
}

/** Derived filter options — never maintained by hand, so a new department just appears. */
export function useProgramDepartments() {
  const programs = usePrograms()
  return useMemo(() => ['All', ...new Set(programs.map((p) => p.department))].sort(), [programs])
}

export function useFacultyDepartments() {
  const faculty = useFaculty()
  return useMemo(() => ['All', ...new Set(faculty.map((f) => f.department))].sort(), [faculty])
}
