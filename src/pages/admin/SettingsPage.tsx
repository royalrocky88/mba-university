import { useEffect, useState } from 'react'
import { saveSettings, type SiteSettings } from '@/lib/repository'
import { settingsFields } from '@/lib/admin/schemas'
import { SchemaForm } from '@/components/admin/SchemaForm'
import { useContent } from '@/context/ContentProvider'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Institution-wide settings — name, contact details, accreditations. */
export function AdminSettings() {
  const { content, live, refresh } = useContent()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useDocumentTitle('Site settings')

  useEffect(() => {
    setValues({ ...content.settings })
  }, [content.settings])

  function setValue(key: string, value: unknown) {
    setSaved(false)
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const { [key]: _removed, ...rest } = current
      return rest
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    const found: Record<string, string> = {}
    for (const field of settingsFields) {
      if (!field.required) continue
      const value = values[field.key]
      const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
      if (empty) found[field.key] = `${field.label} is required`
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setError(null)
    try {
      await saveSettings(values as SiteSettings)
      await refresh()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-7">
        <h1 className="font-display text-3xl text-ink-900">Site settings</h1>
        <p className="mt-1.5 text-[0.92rem] text-ink-900/60">
          These values feed the navbar, footer, contact page, page titles and the chatbot's answers.
        </p>
      </header>

      {!live && (
        <div className="mb-5 rounded-xl border border-gold-500/30 bg-gold-500/8 px-4 py-3 text-[0.86rem] text-ink-900/75">
          Read-only — connect Supabase to save changes. See README.md.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-6 sm:p-7">
          <SchemaForm
            fields={settingsFields}
            values={values}
            errors={errors}
            onChange={setValue}
            disabled={!live || saving}
          />
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700">
            {error}
          </p>
        )}

        <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-ink-900/10 bg-ivory/90 px-5 py-4 backdrop-blur">
          <span className="text-[0.8rem] text-ink-900/50">
            {saved ? 'Settings saved' : 'Changes apply site-wide'}
          </span>
          <Button type="submit" variant="primary" size="sm" disabled={!live || saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
