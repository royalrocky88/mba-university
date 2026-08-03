import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

/**
 * Email + password authentication for the admin panel.
 *
 * Accounts are created in the Supabase dashboard (Authentication → Users), not
 * from the site — there is deliberately no public sign-up, because anyone who
 * can sign up would be able to edit the university's content.
 */

/**
 * What a signed-in administrator is allowed to do.
 *
 * `superadmin` reaches every section including site settings, the theme and
 * applicant enquiries; `admin` reaches the content behind the navbar and
 * nothing else.
 *
 * This drives what the UI *shows*. It is not what makes the split safe — the
 * row-level security policies in `supabase/schema.sql` are, and `npm run
 * check:rls` proves it by calling PostgREST directly as each role. Treat this
 * value as a convenience, never as a guarantee.
 */
export type AdminRole = 'superadmin' | 'admin'

type AuthState = {
  user: User | null
  session: Session | null
  role: AdminRole | null
  /** True for a superadmin. Sections beyond navbar content check this. */
  isSuperadmin: boolean
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Role travels in its own table rather than in the JWT, so it is fetched when
  // the session changes. A failed read leaves the role null, which shows the
  // smaller menu — failing closed is the right direction for a permission.
  const [role, setRole] = useState<AdminRole | null>(null)
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!supabase || !userId) {
      setRole(null)
      return
    }

    let active = true
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setRole((data?.role as AdminRole | undefined) ?? null)
      })

    return () => {
      active = false
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. See README.md for setup.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // BASE_URL, not a bare '/admin' — on GitHub Pages the app is served from
      // /mba-university/, so origin alone would send the reset link to a path
      // that does not exist. BASE_URL already carries its trailing slash.
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin`,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      role,
      isSuperadmin: role === 'superadmin',
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signOut,
      sendPasswordReset,
    }),
    [session, role, loading, signIn, signOut, sendPasswordReset],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
