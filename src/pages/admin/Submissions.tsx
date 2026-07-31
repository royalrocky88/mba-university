import { useMemo, useState } from 'react'
import {
  deleteSubmission,
  setSubmissionStatus,
  submissionKindLabel,
  submissionStatusLabel,
  submissionsToCsv,
  submissionStatuses,
  type Submission,
  type SubmissionKind,
  type SubmissionStatus,
} from '@/lib/repository'
import { useSubmissions } from '@/hooks/useSubmissions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/**
 * Inbox for MBA applications and contact enquiries.
 *
 * Read-and-triage only — there is no editor, because a submission is a record of
 * what somebody actually typed and editing it would destroy that. The available
 * actions are marking it read, archiving it, exporting to CSV and deleting.
 */

type StatusFilter = SubmissionStatus | 'all'
type KindFilter = SubmissionKind | 'all'

/** Human labels for the payload keys, which come from two different form shapes. */
const fieldLabels: Record<string, string> = {
  fullName: 'Full name',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  programSlug: 'Specialisation',
  entranceExam: 'Entrance exam',
  entranceScore: 'Score / percentile',
  graduationYear: 'Graduation year',
  workExperience: 'Work experience',
  subject: 'Subject',
  message: 'Message',
}

/** Order fields the way the admissions office reads them, unknown keys last. */
const fieldOrder = Object.keys(fieldLabels)

function orderedEntries(data: Record<string, unknown>): [string, unknown][] {
  const known = fieldOrder.filter((key) => key in data)
  const extra = Object.keys(data)
    .filter((key) => !fieldOrder.includes(key))
    .sort()
  return [...known, ...extra]
    .map((key) => [key, data[key]] as [string, unknown])
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
}

/** `created_at` is a full timestamp, so `formatDateShort` (date-only) will not do. */
function formatReceived(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Best-effort display name for a row, whichever form it came from. */
function displayName(item: Submission): string {
  const data = item.data
  const name = data.fullName ?? data.name
  return typeof name === 'string' && name.trim() ? name : 'Unnamed'
}

function summaryLine(item: Submission): string {
  const data = item.data
  if (item.kind === 'contact') {
    return typeof data.subject === 'string' ? data.subject : ''
  }
  const parts = [data.programSlug, data.entranceExam, data.entranceScore]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
  return parts.join(' · ')
}

function downloadCsv(items: Submission[]): void {
  const blob = new Blob([`﻿${submissionsToCsv(items)}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminSubmissions() {
  const { items, loading, error, reload, configured } = useSubmissions()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [kind, setKind] = useState<KindFilter>('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useDocumentTitle('Enquiries & applications')

  const newCount = useMemo(() => items.filter((item) => item.status === 'new').length, [items])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false
      if (kind !== 'all' && item.kind !== kind) return false
      if (!q) return true
      return `${item.reference} ${JSON.stringify(item.data)}`.toLowerCase().includes(q)
    })
  }, [items, status, kind, query])

  async function run(action: () => Promise<void>, failure: string) {
    setBusy(true)
    setActionError(null)
    try {
      await action()
      await reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : failure)
    } finally {
      setBusy(false)
    }
  }

  /** Opening a new submission marks it read — the same gesture as any mail client. */
  function onToggle(item: Submission) {
    const opening = expanded !== item.id
    setExpanded(opening ? item.id : null)
    if (opening && item.status === 'new') {
      void run(() => setSubmissionStatus(item.id, 'read'), 'Could not mark as read')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Enquiries &amp; applications</h1>
          <p className="mt-1.5 text-[0.92rem] text-ink-900/60">
            {items.length} total
            {newCount > 0 && (
              <>
                {' · '}
                <strong className="font-semibold text-ink-900">{newCount} new</strong>
              </>
            )}
            . Everything submitted through the application and contact forms lands here.
          </p>
        </div>

        {results.length > 0 && (
          <Button size="sm" variant="outline" icon="download" onClick={() => downloadCsv(results)}>
            Export {results.length === items.length ? 'all' : 'filtered'} as CSV
          </Button>
        )}
      </header>

      {!configured && (
        <div className="mb-5 flex gap-3.5 rounded-2xl border border-gold-500/30 bg-gold-500/8 px-5 py-4">
          <Icon name="sparkle" size={19} className="mt-0.5 shrink-0 text-gold-600" />
          <div className="text-[0.9rem] leading-relaxed text-ink-900/75">
            <strong className="font-semibold text-ink-900">No database connected.</strong> The public
            forms still validate and show a reference number, but submissions are logged to the
            browser console instead of being stored — so this list stays empty. Connect Supabase to
            start collecting them. See README.md.
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700"
        >
          {error}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700"
        >
          {actionError}
        </p>
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            ...submissionStatuses.map((value) => ({
              value,
              label: submissionStatusLabel[value],
            })),
          ]}
        />
        <span className="mx-1 hidden h-5 w-px bg-ink-900/12 sm:block" />
        <FilterGroup
          label="Type"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all', label: 'All' },
            { value: 'application', label: 'Applications' },
            { value: 'contact', label: 'Enquiries' },
          ]}
        />
      </div>

      <label className="relative mb-5 block">
        <span className="sr-only">Search submissions</span>
        <Icon
          name="search"
          size={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-900/35"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, reference or message…"
          className="h-11 w-full rounded-xl border border-ink-900/12 bg-white/70 pr-4 pl-10 text-[0.9rem] text-ink-900 outline-none focus:border-gold-500/60"
        />
      </label>

      {loading ? (
        <p className="py-16 text-center text-[0.9rem] text-ink-900/55">Loading submissions…</p>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-900/15 py-16 text-center">
          <p className="font-display text-lg text-ink-900">
            {items.length === 0 ? 'Nothing submitted yet' : 'Nothing matches those filters'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[0.88rem] leading-relaxed text-ink-900/55">
            {items.length === 0
              ? 'Applications from /admissions and messages from /contact will appear here as they arrive.'
              : 'Try clearing the search or switching the status filter back to All.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {results.map((item) => {
            const open = expanded === item.id
            const confirming = pendingDelete === item.id

            return (
              <li
                key={item.id}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white/70 transition-colors',
                  item.status === 'new' ? 'border-gold-500/40' : 'border-ink-900/10',
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-900/[0.02]"
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg',
                      item.kind === 'application'
                        ? 'bg-gold-500/15 text-gold-700'
                        : 'bg-ink-900/8 text-ink-900/60',
                    )}
                  >
                    <Icon name={item.kind === 'application' ? 'people' : 'mail'} size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[0.95rem] font-medium text-ink-900">
                        {displayName(item)}
                      </span>
                      {item.status === 'new' && (
                        <span className="shrink-0 rounded-full bg-gold-500 px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide text-ink-950 uppercase">
                          New
                        </span>
                      )}
                      {item.status === 'archived' && (
                        <span className="shrink-0 rounded-full bg-ink-900/10 px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide text-ink-900/50 uppercase">
                          Archived
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.8rem] text-ink-900/50">
                      {submissionKindLabel[item.kind]} · {item.reference} ·{' '}
                      {formatReceived(item.created_at)}
                      {summaryLine(item) && ` · ${summaryLine(item)}`}
                    </span>
                  </span>

                  <Icon
                    name="chevron-down"
                    size={16}
                    className={cn(
                      'shrink-0 text-ink-900/35 transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </button>

                {open && (
                  <div className="border-t border-ink-900/8 px-4 py-4">
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {orderedEntries(item.data).map(([key, value]) => {
                        const isLong = key === 'message'
                        return (
                          <div key={key} className={cn(isLong && 'sm:col-span-2')}>
                            <dt className="text-[0.7rem] font-semibold tracking-[0.1em] text-ink-900/40 uppercase">
                              {fieldLabels[key] ?? key}
                            </dt>
                            <dd
                              className={cn(
                                'mt-1 text-[0.9rem] text-ink-900',
                                isLong && 'leading-relaxed whitespace-pre-wrap',
                              )}
                            >
                              {key === 'email' ? (
                                <a
                                  href={`mailto:${String(value)}`}
                                  className="text-gold-700 underline decoration-gold-700/30 underline-offset-2 hover:decoration-gold-700"
                                >
                                  {String(value)}
                                </a>
                              ) : key === 'phone' ? (
                                <a
                                  href={`tel:${String(value).replace(/\s/g, '')}`}
                                  className="text-gold-700 underline decoration-gold-700/30 underline-offset-2 hover:decoration-gold-700"
                                >
                                  {String(value)}
                                </a>
                              ) : (
                                String(value)
                              )}
                            </dd>
                          </div>
                        )
                      })}
                    </dl>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-900/8 pt-4">
                      {item.status !== 'archived' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => setSubmissionStatus(item.id, 'archived'),
                              'Could not archive',
                            )
                          }
                          className="rounded-lg border border-ink-900/15 px-3 py-1.5 text-[0.8rem] text-ink-900/70 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void run(() => setSubmissionStatus(item.id, 'read'), 'Could not restore')
                          }
                          className="rounded-lg border border-ink-900/15 px-3 py-1.5 text-[0.8rem] text-ink-900/70 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
                        >
                          Move back to inbox
                        </button>
                      )}

                      {item.status === 'read' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => setSubmissionStatus(item.id, 'new'),
                              'Could not mark unread',
                            )
                          }
                          className="rounded-lg border border-ink-900/15 px-3 py-1.5 text-[0.8rem] text-ink-900/70 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
                        >
                          Mark unread
                        </button>
                      )}

                      <span className="flex-1" />

                      {confirming ? (
                        <>
                          <span className="text-[0.78rem] text-red-600">Delete permanently?</span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await deleteSubmission(item.id)
                                setPendingDelete(null)
                              }, 'Delete failed')
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-[0.78rem] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            {busy ? 'Deleting…' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(null)}
                            className="rounded-lg border border-ink-900/15 px-3 py-1.5 text-[0.78rem] text-ink-900/70 transition-colors hover:bg-ink-900/5"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item.id)}
                          className="rounded-lg px-3 py-1.5 text-[0.8rem] text-red-600/75 transition-colors hover:bg-red-500/8 hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Segmented filter control. Generic so status and kind share one implementation. */
function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (next: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.7rem] font-semibold tracking-[0.1em] text-ink-900/40 uppercase">
        {label}
      </span>
      <div className="flex gap-1 rounded-lg border border-ink-900/10 bg-white/60 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'rounded-md px-2.5 py-1 text-[0.8rem] transition-colors',
              value === option.value
                ? 'bg-ink-900 font-medium text-ivory'
                : 'text-ink-900/60 hover:bg-ink-900/6 hover:text-ink-900',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}