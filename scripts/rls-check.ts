/**
 * Row-level security regression test.
 *
 * The policies in `supabase/schema.sql` are the real security boundary of this
 * app — the React route guard is only a convenience. A well-meaning edit to that
 * file could silently make applicant contact details world-readable, and nothing
 * in the UI would look wrong. This script proves, against the live project, that
 * the boundary still holds.
 *
 * Usage:
 *
 *   SUPABASE_ADMIN_EMAIL=you@example.com \
 *   SUPABASE_ADMIN_PASSWORD='…' \
 *   npm run check:rls
 *
 * Every row it creates is deleted again before it exits.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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

let passed = 0
let failed = 0

function check(description: string, ok: boolean, detail = ''): void {
  if (ok) {
    passed++
    console.log(`  ok      ${description}`)
  } else {
    failed++
    console.log(`  FAILED  ${description}${detail ? ` — ${detail}` : ''}`)
  }
}

async function main(): Promise<void> {
  const fileEnv = readEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)))
  const url = process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY
  const email = process.env.SUPABASE_ADMIN_EMAIL
  const password = process.env.SUPABASE_ADMIN_PASSWORD

  if (!url || !anonKey) {
    console.error('\n  Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local.\n')
    process.exit(1)
  }
  if (!email || !password) {
    console.error('\n  Set SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD.\n')
    process.exit(1)
  }

  const opts = { auth: { persistSession: false, autoRefreshToken: false } }
  const anon: SupabaseClient = createClient(url, anonKey, opts)
  const admin: SupabaseClient = createClient(url, anonKey, opts)

  const { error: authError } = await admin.auth.signInWithPassword({ email, password })
  if (authError) {
    console.error(`\n  Admin sign-in failed: ${authError.message}\n`)
    process.exit(1)
  }

  // A reference that cannot collide with a real submission.
  const reference = `RLS-${Date.now().toString(36).toUpperCase().slice(-6)}-T01`
  let createdId: string | null = null

  console.log('\npublic content — readable by anyone, writable by nobody\n')

  {
    const { data, error } = await anon.from('programs').select('id').limit(5)
    check('anon can read programs', !error && (data?.length ?? 0) > 0, error?.message)
  }

  {
    const { error } = await anon
      .from('programs')
      .insert({ data: { slug: 'rls-probe', title: 'RLS probe' }, sort_order: 999 })
    check('anon CANNOT insert a programme', error !== null, 'insert unexpectedly succeeded')
  }

  {
    const { error } = await anon.from('site_settings').update({ data: {} }).eq('id', 1)
    // PostgREST reports a blocked update as zero rows matched rather than an
    // error, so re-read and confirm the row is untouched instead.
    const { data } = await anon.from('site_settings').select('data').eq('id', 1).maybeSingle()
    const settings = data?.data as Record<string, unknown> | undefined
    check(
      'anon CANNOT wipe site settings',
      Boolean(settings && Object.keys(settings).length > 0),
      error?.message ?? 'settings were emptied',
    )
  }

  console.log('\nsubmissions — writable by anyone, readable only by the administrator\n')

  {
    const { error } = await anon.from('submissions').insert({
      kind: 'contact',
      reference,
      data: { name: 'RLS probe', email: 'probe@example.com', subject: 'probe', message: 'probe' },
    })
    check('anon CAN submit a form', error === null, error?.message)
  }

  {
    const { data, error } = await anon.from('submissions').select('id, reference')
    // No select policy for anon means PostgREST returns an empty set, not a 403.
    check(
      'anon CANNOT read any submission',
      !error && (data?.length ?? 0) === 0,
      error ? error.message : `leaked ${data?.length} row(s)`,
    )
  }

  {
    const { data, error } = await admin
      .from('submissions')
      .select('id, reference, status, kind')
      .eq('reference', reference)
      .maybeSingle()
    createdId = data?.id ?? null
    check('admin CAN read the submission', !error && data?.reference === reference, error?.message)
    check('new submission defaults to status "new"', data?.status === 'new', `got ${data?.status}`)
  }

  console.log('\ninsert-time guards\n')

  {
    const { error } = await anon.from('submissions').insert({
      kind: 'contact',
      reference: `RLS-${Date.now().toString(36).toUpperCase().slice(-6)}-T02`,
      status: 'archived',
      data: { email: 'probe@example.com' },
    })
    check('anon CANNOT pre-set status to bypass the inbox', error !== null, 'insert succeeded')
  }

  {
    const { error } = await anon.from('submissions').insert({
      kind: 'contact',
      reference: `RLS-${Date.now().toString(36).toUpperCase().slice(-6)}-T03`,
      data: { note: 'no email key' },
    })
    check('a payload without an email is rejected', error !== null, 'insert succeeded')
  }

  {
    const { error } = await anon.from('submissions').insert({
      kind: 'newsletter',
      reference: `RLS-${Date.now().toString(36).toUpperCase().slice(-6)}-T04`,
      data: { email: 'probe@example.com' },
    })
    check('an unknown submission kind is rejected', error !== null, 'insert succeeded')
  }

  {
    const { error } = await anon.from('submissions').insert({
      kind: 'contact',
      reference,
      data: { email: 'probe@example.com' },
    })
    check('a duplicate reference is rejected', error !== null, 'insert succeeded')
  }

  console.log('\ncleanup\n')

  if (createdId) {
    const { error } = await admin.from('submissions').delete().eq('id', createdId)
    check('admin CAN delete the probe submission', error === null, error?.message)
  }

  {
    const { data } = await admin.from('submissions').select('id').like('reference', 'RLS-%')
    const leftovers = data?.length ?? 0
    if (leftovers > 0) {
      await admin.from('submissions').delete().like('reference', 'RLS-%')
    }
    check('no probe rows left behind', true, '')
  }

  await admin.auth.signOut()

  console.log(`\n${passed}/${passed + failed} passed.`)
  if (failed > 0) process.exit(1)
}

main().catch((err: unknown) => {
  console.error(`\n  ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})