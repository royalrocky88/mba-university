import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  collectionKeys,
  deleteItem,
  labelFor,
  reorderItems,
  type CollectionKey,
} from '@/lib/repository'
import { schemas } from '@/lib/admin/schemas'
import { useContent } from '@/context/ContentProvider'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

/** List view for any collection: search, reorder, edit, delete. */
export function CollectionList() {
  const { collection } = useParams<{ collection: string }>()
  const { content, live, refresh } = useContent()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const key = collection as CollectionKey
  const valid = collectionKeys.includes(key)

  useDocumentTitle(valid ? labelFor[key].plural : 'Admin')

  const schema = valid ? schemas[key] : null
  const items = valid ? content[key] : []

  const results = useMemo(() => {
    if (!query.trim() || !schema) return items
    const q = query.trim().toLowerCase()
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q),
    )
  }, [items, query, schema])

  if (!valid) return <Navigate to="/admin" replace />

  async function onDelete(id: string) {
    setBusy(true)
    setError(null)
    try {
      await deleteItem(key, id)
      await refresh()
      setPendingDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return

    const ordered = [...items]
    const [moved] = ordered.splice(index, 1)
    ordered.splice(target, 0, moved)

    setBusy(true)
    setError(null)
    try {
      await reorderItems(key, ordered.map((item) => item.id))
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900">{labelFor[key].plural}</h1>
          <p className="mt-1.5 text-[0.92rem] text-ink-900/60">
            {items.length} {items.length === 1 ? 'item' : 'items'}. Order here is the order shown on
            the public site.
          </p>
        </div>

        {live && (
          <Button to={`/admin/${key}/new`} variant="primary" icon="arrow-right">
            New {labelFor[key].singular.toLowerCase()}
          </Button>
        )}
      </header>

      {!live && (
        <div className="mb-5 rounded-xl border border-gold-500/30 bg-gold-500/8 px-4 py-3 text-[0.86rem] text-ink-900/75">
          Read-only — connect Supabase to create, edit or delete. See README.md.
        </div>
      )}

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700">
          {error}
        </p>
      )}

      <label className="relative mb-5 block">
        <span className="sr-only">Search {labelFor[key].plural}</span>
        <Icon
          name="search"
          size={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-900/35"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${labelFor[key].plural.toLowerCase()}…`}
          className="h-11 w-full rounded-xl border border-ink-900/12 bg-white/70 pr-4 pl-10 text-[0.9rem] text-ink-900 outline-none focus:border-gold-500/60"
        />
      </label>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-900/15 py-16 text-center">
          <p className="font-display text-lg text-ink-900">
            {items.length === 0 ? `No ${labelFor[key].plural.toLowerCase()} yet` : 'Nothing matches that search'}
          </p>
          {items.length === 0 && live && (
            <Button to={`/admin/${key}/new`} variant="outline" className="mt-5">
              Create the first one
            </Button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-ink-900/8 overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70">
          {results.map((item, index) => {
            const record = item as unknown as Record<string, unknown>
            const title = String(record[schema!.titleField] ?? 'Untitled')
            const subtitle = schema!.subtitleField ? String(record[schema!.subtitleField] ?? '') : ''
            const confirming = pendingDelete === item.id

            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-900/[0.02]">
                {/* Reorder — only meaningful when not filtered */}
                <div className={cn('flex shrink-0 flex-col', query && 'invisible')}>
                  <button
                    type="button"
                    onClick={() => void move(index, -1)}
                    disabled={busy || index === 0 || !live}
                    aria-label={`Move ${title} up`}
                    className="grid size-5 place-items-center rounded text-ink-900/35 transition-colors hover:bg-ink-900/8 hover:text-ink-900 disabled:opacity-20"
                  >
                    <Icon name="chevron-down" size={13} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(index, 1)}
                    disabled={busy || index === items.length - 1 || !live}
                    aria-label={`Move ${title} down`}
                    className="grid size-5 place-items-center rounded text-ink-900/35 transition-colors hover:bg-ink-900/8 hover:text-ink-900 disabled:opacity-20"
                  >
                    <Icon name="chevron-down" size={13} />
                  </button>
                </div>

                <Link to={`/admin/${key}/${item.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-medium text-ink-900">{title}</span>
                  {subtitle && (
                    <span className="block truncate text-[0.8rem] text-ink-900/50">{subtitle}</span>
                  )}
                </Link>

                {confirming ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[0.78rem] text-red-600">Delete permanently?</span>
                    <button
                      type="button"
                      onClick={() => void onDelete(item.id)}
                      disabled={busy}
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
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      to={`/admin/${key}/${item.id}`}
                      className="rounded-lg px-3 py-1.5 text-[0.8rem] text-ink-900/65 transition-colors hover:bg-ink-900/6 hover:text-ink-900"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item.id)}
                      disabled={!live}
                      className="rounded-lg px-3 py-1.5 text-[0.8rem] text-red-600/75 transition-colors hover:bg-red-500/8 hover:text-red-600 disabled:opacity-30"
                    >
                      Delete
                    </button>
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
