/**
 * Form submission boundary.
 *
 * There is no backend in this build, so both handlers below simulate a network
 * round-trip and log the payload. To go live, replace the body of each function
 * with a `fetch` to your endpoint (or a Formspree / Google Forms URL) — nothing
 * in the components needs to change, because they only await these promises.
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

/** Human-readable reference so the success screen has something to show. */
function makeReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  return `${prefix}-${stamp}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function submitApplication(payload: ApplicationPayload): Promise<SubmitResult> {
  await delay(1200)
  // TODO: replace with `await fetch('/api/applications', { method: 'POST', ... })`
  console.info('[application submitted]', payload)
  return { ok: true, reference: makeReference('MSB') }
}

export async function submitContact(payload: ContactPayload): Promise<SubmitResult> {
  await delay(900)
  // TODO: replace with `await fetch('/api/contact', { method: 'POST', ... })`
  console.info('[contact submitted]', payload)
  return { ok: true, reference: makeReference('MSG') }
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
