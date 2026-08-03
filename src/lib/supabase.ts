import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client, created only when credentials are present.
 *
 * The site is designed to run in two modes:
 *   • **seed mode** — no credentials configured. Every page renders from the
 *     bundled content in `src/data/`, and the admin panel is read-only.
 *   • **live mode** — credentials in `.env.local`. Content is read from and
 *     written to Postgres, and the admin panel has full create/update/delete.
 *
 * The repository layer (`src/lib/repository`) picks the adapter, so no page or
 * component ever needs to know which mode it is in.
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'aku-admin-auth',
      },
    })
  : null

/** Narrowing helper — throws with a clear message instead of a null-deref. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}

/** Storage bucket that holds admin-uploaded images. Created by `supabase/schema.sql`. */
export const MEDIA_BUCKET = 'media'
