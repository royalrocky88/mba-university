/**
 * Seeds a fresh Supabase project with the bundled starting content.
 *
 * The admin dashboard has a "Seed database" button that does the same thing from
 * the browser. This script exists for the first run, before anybody has signed
 * in — and for CI or a rebuild, where clicking is not an option.
 *
 * Usage:
 *
 *   SUPABASE_ADMIN_EMAIL=you@example.com \
 *   SUPABASE_ADMIN_PASSWORD='…' \
 *   npm run seed
 *
 * Reads the project URL and anon key from `.env.local`. Credentials come from the
 * environment and are never written to disk or echoed — writes are gated by
 * row-level security, so a real session is required.
 *
 * Idempotent: a table that already holds rows is skipped, never overwritten.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { seedRows, seedSettings } from '@/lib/repository/seed'
import { collectionKeys, tableFor } from '@/lib/repository/types'

/** Minimal `.env` parser — avoids a dependency for four lines of work. */
function readEnvFile(path: string): Record<string, string> {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return {}
  }

  const out: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return out
}

function fail(message: string): never {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

async function main(): Promise<void> {
  // fileURLToPath, not `.pathname` — the latter yields "/C:/…" on Windows.
  const fileEnv = readEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)))
  const url = process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY
  const email = process.env.SUPABASE_ADMIN_EMAIL
  const password = process.env.SUPABASE_ADMIN_PASSWORD

  if (!url || !anonKey) {
    fail('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in .env.local.')
  }
  if (!email || !password) {
    fail('Set SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD in the environment.')
  }

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error: authError } = await client.auth.signInWithPassword({ email, password })
  if (authError) fail(`Sign-in failed: ${authError.message}`)
  console.log(`signed in as ${email}`)

  let inserted = 0
  let skipped = 0

  for (const key of collectionKeys) {
    const table = tableFor[key]

    const { count, error: countError } = await client
      .from(table)
      .select('id', { count: 'exact', head: true })
    if (countError) fail(`Could not count ${table}: ${countError.message}`)

    if ((count ?? 0) > 0) {
      console.log(`  skip   ${table.padEnd(16)} already has ${count} row(s)`)
      skipped++
      continue
    }

    const rows = seedRows[key].map((item, index) => ({ data: item, sort_order: index }))
    const { error } = await client.from(table).insert(rows)
    if (error) fail(`Seeding ${table} failed: ${error.message}`)

    console.log(`  insert ${table.padEnd(16)} ${rows.length} row(s)`)
    inserted += rows.length
  }

  const { error: settingsError } = await client
    .from('site_settings')
    .upsert({ id: 1, data: seedSettings, updated_at: new Date().toISOString() })
  if (settingsError) fail(`Saving settings failed: ${settingsError.message}`)
  console.log('  upsert site_settings    1 row')

  await client.auth.signOut()
  console.log(`\n${inserted} rows inserted, ${skipped} table(s) already populated.`)
}

main().catch((err: unknown) => {
  fail(err instanceof Error ? err.message : String(err))
})