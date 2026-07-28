import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  collectionKeys,
  createItem,
  deleteItem,
  labelFor,
  updateItem,
  type CollectionKey,
} from '@/lib/repository'
import { emptyRecord, schemas, slugFrom } from '@/lib/admin/schemas'
import { SchemaForm } from '@/components/admin/SchemaForm'
import { useContent } from '@/context/ContentProvider'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Create / edit screen for any collection, driven entirely by its schema. */
export function CollectionEditor() {
  const { collection, id } = useParams<{ collection: string; id: string }>()
  const { content, live, refresh } = useContent()
  const navigate = useNavigate()

  const key = collection as CollectionKey
  const valid = collectionKeys.includes(key)
  const isNew = id === 'new'

  const schema = valid ? schemas[key] : null
  const existing = valid && !isNew ? content[key].find((item) => item.id === id) : undefined

  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Seed the form once the target record is available. `content` arrives
  // asynchronously, so this cannot be done in useState's initialiser.
  useEffect(() => {
    if (!schema) return
    if (isNew) {
      setValues(emptyRecord(schema))
      return
    }
    if (existing) {
      const { id: _id, sort_order: _s, updated_at: _u, ...rest } = existing as Record<string, unknown>
      setValues(rest)
    }
  }, [schema, isNew, existing])

  const title = useMemo(() => {
    if (!schema) return 'Admin'
    if (isNew) return `New ${labelFor[key].singular.toLowerCase()}`
    return String(values[schema.titleField] ?? labelFor[key].singular)
  }, [schema, isNew, key, values])

  useDocumentTitle(title)

  if (!valid) return <Navigate to="/admin" replace />
  if (!isNew && !existing && content[key].length > 0) return <Navigate to={`/admin/${key}`} replace />

  function setValue(fieldKey: string, value: unknown) {
    setDirty(true)
    setValues((current) => {
      const next = { ...current, [fieldKey]: value }

      // Auto-fill an empty slug from the title field as it is typed — saves the
      // most common piece of manual busywork, and never overwrites a slug the
      // administrator has already set.
      const hasSlug = schema!.fields.some((f) => f.key === 'slug')
      if (hasSlug && fieldKey === schema!.titleField && !current.slug) {
        next.slug = slugFrom(String(value))
      }
      return next
    })
    setErrors((current) => {
      if (!current[fieldKey]) return current
      const { [fieldKey]: _removed, ...rest } = current
      return rest
    })
  }

  function validate(): boolean {
    const found: Record<string, string> = {}

    for (const field of schema!.fields) {
      const value = values[field.key]
      if (!field.required) continue

      const empty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)

      if (empty) found[field.key] = `${field.label} is required`
    }

    // Slug uniqueness — a duplicate would make one of the two pages unreachable.
    for (const uniqueKey of schema!.uniqueFields ?? []) {
      const value = String(values[uniqueKey] ?? '').trim()
      if (!value) continue

      const clash = content[key].some(
        (item) =>
          item.id !== id && String((item as unknown as Record<string, unknown>)[uniqueKey]) === value,
      )
      if (clash) found[uniqueKey] = `Another ${labelFor[key].singular.toLowerCase()} already uses “${value}”`

      if (uniqueKey === 'slug' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        found[uniqueKey] = 'Use lowercase letters, numbers and hyphens only'
      }
    }

    setErrors(found)
    return Object.keys(found).length === 0
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) {
      // Bring the first failing field into view rather than leaving the user to
      // hunt for red text on a long form.
      const firstError = Object.keys(errors)[0]
      document.getElementById(`f-${firstError}`)?.scrollIntoView({ block: 'center' })
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      if (isNew) {
        await createItem(key, values as never, content[key].length)
      } else {
        await updateItem(key, id!, values as never)
      }
      await refresh()
      setDirty(false)
      navigate(`/admin/${key}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id || isNew) return
    setDeleting(true)
    setSaveError(null)
    try {
      await deleteItem(key, id)
      await refresh()
      navigate(`/admin/${key}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/admin/${key}`}
        className="mb-5 inline-flex items-center gap-2 text-[0.85rem] text-ink-900/55 transition-colors hover:text-ink-900"
      >
        <Icon name="chevron-left" size={15} />
        {labelFor[key].plural}
      </Link>

      <header className="mb-7">
        <h1 className="font-display text-3xl text-ink-900">{title}</h1>
        <p className="mt-1.5 text-[0.92rem] text-ink-900/60">
          {isNew
            ? `Fill this in and it will appear on the public site and in the chatbot immediately.`
            : `Changes go live as soon as you save.`}
        </p>
      </header>

      {!live && (
        <div className="mb-5 rounded-xl border border-gold-500/30 bg-gold-500/8 px-4 py-3 text-[0.86rem] text-ink-900/75">
          Read-only — connect Supabase to save changes. See README.md.
        </div>
      )}

      <form onSubmit={onSave} noValidate>
        <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-6 sm:p-7">
          <SchemaForm
            fields={schema!.fields}
            values={values}
            errors={errors}
            onChange={setValue}
            disabled={!live || saving}
          />
        </div>

        {saveError && (
          <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700">
            {saveError}
          </p>
        )}

        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-900/10 bg-ivory/90 px-5 py-4 backdrop-blur">
          <div className="text-[0.8rem] text-ink-900/50">
            {dirty ? 'Unsaved changes' : isNew ? 'Nothing saved yet' : 'All changes saved'}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isNew && (
              <DeleteButton onDelete={() => void onDelete()} busy={deleting} disabled={!live} />
            )}
            <Button to={`/admin/${key}`} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!live || saving}>
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

/** Two-step delete so a stray click cannot destroy a record. */
function DeleteButton({
  onDelete,
  busy,
  disabled,
}: {
  onDelete: () => void
  busy: boolean
  disabled: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className="rounded-full px-4 py-2 text-[0.84rem] text-red-600/80 transition-colors hover:bg-red-500/8 hover:text-red-600 disabled:opacity-30"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.78rem] text-red-600">Delete permanently?</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-full bg-red-600 px-4 py-2 text-[0.82rem] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-ink-900/15 px-4 py-2 text-[0.82rem] text-ink-900/70 transition-colors hover:bg-ink-900/5"
      >
        Keep
      </button>
    </div>
  )
}
