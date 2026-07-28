/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Leave unset to run the site on bundled seed content. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anonymous key — safe to ship, row-level security does the gating. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
