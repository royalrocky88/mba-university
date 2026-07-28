import { useState } from 'react'
import type { FieldSpec } from '@/lib/admin/schemas'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { uploadImage } from '@/lib/repository'

/**
 * Renders one form control per `FieldSpec`.
 *
 * The whole admin panel has exactly one form component; every collection gets
 * its create and edit screens from its schema. That is what makes "add a field"
 * a data change rather than a code change.
 */

type SchemaFormProps = {
  fields: FieldSpec[]
  values: Record<string, unknown>
  errors: Record<string, string>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

const controlClasses =
  'w-full rounded-xl border border-ink-900/12 bg-ivory px-3.5 py-2.5 text-[0.9rem] text-ink-900 outline-none transition-colors focus:border-gold-500/70 disabled:opacity-60'

export function SchemaForm({ fields, values, errors, onChange, disabled }: SchemaFormProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className={cn('flex flex-col gap-1.5', !field.half && 'sm:col-span-2')}>
          <label htmlFor={`f-${field.key}`} className="text-[0.82rem] font-medium text-ink-900/75">
            {field.label}
            {field.required && (
              <span aria-hidden="true" className="ml-1 text-gold-600">
                *
              </span>
            )}
          </label>

          <Control
            field={field}
            value={values[field.key]}
            invalid={Boolean(errors[field.key])}
            onChange={(value) => onChange(field.key, value)}
            disabled={disabled}
          />

          {errors[field.key] ? (
            <p role="alert" className="text-[0.78rem] text-red-600">
              {errors[field.key]}
            </p>
          ) : field.help ? (
            <p className="text-[0.78rem] leading-relaxed text-ink-900/45">{field.help}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function Control({
  field,
  value,
  invalid,
  onChange,
  disabled,
}: {
  field: FieldSpec
  value: unknown
  invalid: boolean
  onChange: (value: unknown) => void
  disabled?: boolean
}) {
  const id = `f-${field.key}`
  const className = cn(controlClasses, invalid && 'border-red-500/60')

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={cn(className, 'resize-y')}
        />
      )

    case 'number':
      return (
        <input
          id={id}
          type="number"
          step="any"
          value={value === '' || value === undefined || value === null ? '' : Number(value)}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
          placeholder={field.placeholder}
          disabled={disabled}
          className={className}
        />
      )

    case 'select':
      return (
        <select
          id={id}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={className}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )

    case 'list':
      return (
        <textarea
          id={id}
          rows={5}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(event) =>
            onChange(
              event.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
          placeholder={field.placeholder ?? 'One item per line'}
          disabled={disabled}
          className={cn(className, 'resize-y font-mono text-[0.84rem]')}
        />
      )

    case 'paragraphs':
      return (
        <textarea
          id={id}
          rows={12}
          value={Array.isArray(value) ? (value as string[]).join('\n\n') : ''}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(/\n\s*\n/)
                .map((block) => block.trim())
                .filter(Boolean),
            )
          }
          placeholder="Separate paragraphs with a blank line."
          disabled={disabled}
          className={cn(className, 'resize-y leading-relaxed')}
        />
      )

    case 'semesters':
      return <SemesterEditor value={value} onChange={onChange} disabled={disabled} />

    case 'image':
      return <ImageField id={id} value={String(value ?? '')} onChange={onChange} disabled={disabled} />

    default:
      return (
        <input
          id={id}
          type={field.type === 'text' ? 'text' : field.type}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={className}
        />
      )
  }
}

type Semester = { title: string; subjects: string[] }

/** Nested repeater for a programme's semester-by-semester course list. */
function SemesterEditor({
  value,
  onChange,
  disabled,
}: {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}) {
  const semesters: Semester[] = Array.isArray(value) ? (value as Semester[]) : []

  function update(index: number, patch: Partial<Semester>) {
    const next = semesters.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange(next)
  }

  function add() {
    onChange([...semesters, { title: `Semester ${semesters.length + 1}`, subjects: [] }])
  }

  function remove(index: number) {
    onChange(semesters.filter((_, i) => i !== index))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= semesters.length) return
    const next = [...semesters]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {semesters.map((semester, index) => (
        <div key={index} className="rounded-xl border border-ink-900/12 bg-ivory p-4">
          <div className="flex items-center gap-2">
            <input
              value={semester.title}
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder="Semester title"
              disabled={disabled}
              className="flex-1 rounded-lg border border-ink-900/12 bg-white px-3 py-2 text-[0.88rem] font-medium text-ink-900 outline-none focus:border-gold-500/70"
            />
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={disabled || index === 0}
              aria-label="Move semester up"
              className="grid size-8 place-items-center rounded-lg border border-ink-900/12 text-ink-900/50 transition-colors hover:bg-ink-900/5 disabled:opacity-25"
            >
              <Icon name="chevron-down" size={14} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={disabled || index === semesters.length - 1}
              aria-label="Move semester down"
              className="grid size-8 place-items-center rounded-lg border border-ink-900/12 text-ink-900/50 transition-colors hover:bg-ink-900/5 disabled:opacity-25"
            >
              <Icon name="chevron-down" size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={disabled}
              aria-label="Remove semester"
              className="grid size-8 place-items-center rounded-lg border border-red-500/25 text-red-600/70 transition-colors hover:bg-red-500/8"
            >
              <Icon name="close" size={14} />
            </button>
          </div>

          <textarea
            rows={5}
            value={semester.subjects.join('\n')}
            onChange={(event) =>
              update(index, {
                subjects: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
            placeholder="One course per line"
            disabled={disabled}
            className="mt-2.5 w-full resize-y rounded-lg border border-ink-900/12 bg-white px-3 py-2 font-mono text-[0.82rem] text-ink-900 outline-none focus:border-gold-500/70"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink-900/20 px-4 py-3 text-[0.86rem] text-ink-900/60 transition-colors hover:border-gold-500/50 hover:text-ink-900 disabled:opacity-50"
      >
        <Icon name="sparkle" size={15} />
        Add a semester
      </button>
    </div>
  )
}

/** URL field with an upload button that writes straight to Supabase Storage. */
function ImageField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: unknown) => void
  disabled?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… or upload"
          disabled={disabled}
          className={controlClasses}
        />
        <label
          className={cn(
            'flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-ink-900/15 px-4 text-[0.84rem] text-ink-900/70 transition-colors hover:bg-ink-900/5',
            (disabled || uploading) && 'pointer-events-none opacity-50',
          )}
        >
          <Icon name="download" size={15} className="rotate-180" />
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
        </label>
      </div>

      {error && <p className="text-[0.78rem] text-red-600">{error}</p>}

      {value && (
        <img
          src={value}
          alt=""
          loading="lazy"
          className="h-32 w-full rounded-xl border border-ink-900/10 object-cover"
        />
      )}
    </div>
  )
}
