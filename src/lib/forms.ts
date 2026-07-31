import { isSupabaseConfigured } from '@/lib/supabase'
import { insertSubmission, type SubmissionKind } from '@/lib/repository/submissions'

/**
 * Form submission boundary.
 *
 * Both handlers write a row to the `submissions` table, which the admin panel
 * reads at /admin/submissions. The components only await these promises, so
 * nothing in the UI knows or cares where a submission ends up.
 *
 * Without credentials (`isSupabaseConfigured === false`) the handlers fall back
 * to simulating the round-trip, exactly as they did before there was a table.
 * That is what keeps the public demo deploy usable: the form validates, succeeds
 * and shows a reference, it just has nowhere to file the result. The admin inbox
 * says as much rather than showing an empty list and implying nobody applied.
 */

export type ApplicationPayload = {
  fullName: string
  email: string
  phone: string
  programSlug: string
  entranceExam: string
  entranceScore: string
  graduationYear: string
  workExperience: string
  message?: string
}

export type ContactPayload = {
  name: string
  email: string
  subject: string
  message: string
}

export type SubmitResult = { ok: true; reference: string } | { ok: false; error: string }

/**
 * Human-readable reference the applicant can quote back to us, e.g. `MSB-K3P9QX-7YT`.
 *
 * The timestamp keeps references roughly sortable; the random tail keeps two
 * people submitting in the same millisecond from colliding. `reference` is unique
 * in Postgres, so a collision is caught rather than silently overwriting — see
 * the retry in `submit`. The shape must satisfy the `submissions_reference_format`
 * constraint in `supabase/schema.sql`.
 */
function makeReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const noise = Math.random().toString(36).toUpperCase().slice(2, 5).padEnd(3, 'X')
  return `${prefix}-${stamp}-${noise}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** How many fresh references to try before giving up on a unique violation. */
const MAX_REFERENCE_ATTEMPTS = 3

async function submit(
  kind: SubmissionKind,
  prefix: string,
  payload: Record<string, unknown>,
): Promise<SubmitResult> {
  if (!isSupabaseConfigured) {
    await delay(900)
    console.info(`[${kind} submitted — no database configured, nothing was stored]`, payload)
    return { ok: true, reference: makeReference(prefix) }
  }

  let lastMessage = 'Something went wrong on our side.'

  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = makeReference(prefix)
    const result = await insertSubmission(kind, reference, payload)

    if (result.ok) return { ok: true, reference }

    lastMessage = result.message
    // Only a reference collision is worth another go; anything else (offline,
    // policy rejection, malformed payload) will fail again identically.
    if (!result.duplicateReference) break
  }

  console.error(`[${kind} submission failed]`, lastMessage)
  return {
    ok: false,
    error: `We could not record your ${
      kind === 'application' ? 'application' : 'message'
    }. Please try again, or email us directly if this keeps happening.`,
  }
}

export function submitApplication(payload: ApplicationPayload): Promise<SubmitResult> {
  return submit('application', 'MSB', { ...payload })
}

export function submitContact(payload: ContactPayload): Promise<SubmitResult> {
  return submit('contact', 'MSG', { ...payload })
}

/** Shared validation rules so both forms reject the same bad input. */
export const rules = {
  email: {
    required: 'Email address is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: 'Enter a valid email address',
    },
  },
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^(\+?\d{1,3}[\s-]?)?\d{10}$/,
      message: 'Enter a 10-digit phone number, optionally with a country code',
    },
  },
  fullName: {
    required: 'Full name is required',
    minLength: { value: 3, message: 'Enter your full name as it appears on your degree' },
  },
} as const
