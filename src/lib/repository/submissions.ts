import { requireSupabase } from '@/lib/supabase'

/**
 * Form submissions — MBA applications and contact enquiries.
 *
 * Kept apart from the content collections in `./index.ts` on purpose. Those are
 * world-readable and admin-writable; a submission is the exact inverse, and the
 * asymmetry runs all the way down:
 *
 *   • **write** — happens from the public site with the anon key, so it cannot
 *     read the row back afterwards (no select policy for `anon`). That is why
 *     `insertSubmission` never chains `.select()` and returns a plain result
 *     object instead of throwing — the caller needs to distinguish a duplicate
 *     reference from a real failure in order to retry.
 *   • **read** — happens only inside `/admin` behind a session, and never from
 *     the content provider, so applicant details are not shipped to every
 *     visitor's browser as part of the initial page load.
 */

export type SubmissionKind = 'application' | 'contact'
export type SubmissionStatus = 'new' | 'read' | 'archived'

export type Submission = {
  id: string
  kind: SubmissionKind
  reference: string
  status: SubmissionStatus
  created_at: string
  data: Record<string, unknown>
}

export const submissionKinds: SubmissionKind[] = ['application', 'contact']
export const submissionStatuses: SubmissionStatus[] = ['new', 'read', 'archived']

export const submissionKindLabel: Record<SubmissionKind, string> = {
  application: 'Application',
  contact: 'Enquiry',
}

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  new: 'New',
  read: 'Read',
  archived: 'Archived',
}

const TABLE = 'submissions'

/** Postgres unique-violation. Signals a reference collision worth retrying. */
const UNIQUE_VIOLATION = '23505'

export type InsertResult =
  | { ok: true }
  | { ok: false; duplicateReference: boolean; message: string }

// ---------------------------------------------------------------------------
// Write — public site, anon key
// ---------------------------------------------------------------------------

/**
 * Records one submission. Never throws: a form must always be able to tell the
 * visitor something useful, and a collision on `reference` is recoverable by the
 * caller generating a new one.
 */
export async function insertSubmission(
  kind: SubmissionKind,
  reference: string,
  data: Record<string, unknown>,
): Promise<InsertResult> {
  const client = requireSupabase()

  // No `.select()` — the anon role is allowed to insert but not to read.
  const { error } = await client.from(TABLE).insert({ kind, reference, data })

  if (!error) return { ok: true }
  return {
    ok: false,
    duplicateReference: error.code === UNIQUE_VIOLATION,
    message: error.message,
  }
}

// ---------------------------------------------------------------------------
// Read and triage — admin only
// ---------------------------------------------------------------------------

/** Newest first. `limit` keeps a long-lived inbox from loading in full. */
export async function listSubmissions(limit = 500): Promise<Submission[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from(TABLE)
    .select('id, kind, reference, status, created_at, data')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to load submissions: ${error.message}`)
  return (data ?? []) as Submission[]
}

/** Count of untriaged submissions, for the sidebar badge. Row bodies not fetched. */
export async function countNewSubmissions(): Promise<number> {
  const client = requireSupabase()
  const { count, error } = await client
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')

  if (error) throw new Error(`Failed to count submissions: ${error.message}`)
  return count ?? 0
}

export async function setSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from(TABLE).update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteSubmission(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Field order for the CSV, so the admissions office gets stable columns. */
const csvColumnOrder = [
  'fullName',
  'name',
  'email',
  'phone',
  'programSlug',
  'entranceExam',
  'entranceScore',
  'graduationYear',
  'workExperience',
  'subject',
  'message',
]

function csvCell(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)

  // A leading =, +, - or @ makes Excel treat the cell as a formula. Prefix with
  // an apostrophe so a pasted payload cannot execute in the admissions office.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

/**
 * Flattens submissions to CSV. Applications and enquiries have different fields,
 * so the header is the union of what is actually present, ordered by
 * `csvColumnOrder` with anything unrecognised appended alphabetically.
 */
export function submissionsToCsv(items: Submission[]): string {
  const present = new Set<string>()
  for (const item of items) {
    for (const key of Object.keys(item.data)) present.add(key)
  }

  const known = csvColumnOrder.filter((key) => present.has(key))
  const extra = [...present].filter((key) => !csvColumnOrder.includes(key)).sort()
  const dataColumns = [...known, ...extra]

  const header = ['reference', 'kind', 'status', 'received', ...dataColumns]
  const rows = items.map((item) => [
    item.reference,
    item.kind,
    item.status,
    item.created_at,
    ...dataColumns.map((key) => item.data[key]),
  ])

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}