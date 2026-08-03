import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collectionKeys, labelFor, seedDatabase } from '@/lib/repository'
import { useContent } from '@/context/ContentProvider'
import { useAuth } from '@/context/AuthProvider'
import { useNewSubmissionCount } from '@/hooks/useSubmissions'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDateShort } from '@/lib/utils'

export function AdminDashboard() {
  const { content, live, refresh } = useContent()
  const { isSuperadmin } = useAuth()
  const newSubmissions = useNewSubmissionCount()
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useDocumentTitle('Admin dashboard')

  const totalItems = collectionKeys.reduce((sum, key) => sum + content[key].length, 0)
  const latestNews = [...content.news].sort((a, b) => b.date.localeCompare(a.date))[0]

  async function onSeed() {
    setSeeding(true)
    setError(null)
    setMessage(null)
    try {
      const counts = await seedDatabase()
      const inserted = Object.entries(counts).filter(([, n]) => n > 0)
      await refresh()
      setMessage(
        inserted.length === 0
          ? 'Every table already had content — nothing was overwritten.'
          : `Inserted ${inserted.reduce((sum, [, n]) => sum + n, 0)} rows across ${inserted.length} tables.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seeding failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
        <p className="mt-2 text-[0.95rem] text-ink-900/60">
          {totalItems} content items across {collectionKeys.length} collections. Every change here
          appears on the public site and in the chatbot immediately.
        </p>
      </header>

      {!live && (
        <div className="mb-6 flex gap-3.5 rounded-2xl border border-gold-500/30 bg-gold-500/8 px-5 py-4">
          <Icon name="sparkle" size={19} className="mt-0.5 shrink-0 text-gold-600" />
          <div className="text-[0.9rem] leading-relaxed text-ink-900/75">
            <strong className="font-semibold text-ink-900">Running on bundled seed content.</strong>{' '}
            The site works and looks complete, but nothing can be saved until Supabase is configured.
            Add your project URL and anon key to <code className="rounded bg-ink-900/8 px-1.5 py-0.5">.env.local</code> and restart the dev server — see README.md.
          </div>
        </div>
      )}

      {live && (
        <div className="mb-6 rounded-2xl border border-ink-900/10 bg-white/70 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-[0.9rem] leading-relaxed text-ink-900/70">
              <strong className="font-semibold text-ink-900">Populate empty tables.</strong> Copies the
              bundled starting content into any collection that is currently empty. Existing rows are
              never touched.
            </div>
            <Button size="sm" variant="outline" onClick={() => void onSeed()} disabled={seeding}>
              {seeding ? 'Copying…' : 'Seed database'}
            </Button>
          </div>

          {message && <p className="mt-3 text-[0.85rem] text-emerald-700">{message}</p>}
          {error && <p className="mt-3 text-[0.85rem] text-red-600">{error}</p>}
        </div>
      )}

      {isSuperadmin && newSubmissions > 0 && (
        <Link
          to="/admin/submissions"
          className="group mb-6 flex items-center gap-4 rounded-2xl border border-gold-500/40 bg-gold-500/8 px-5 py-4 transition-colors hover:border-gold-500/70"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-500 text-ink-950">
            <Icon name="mail" size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[1.02rem] text-ink-900">
              {newSubmissions} new {newSubmissions === 1 ? 'submission' : 'submissions'}
            </div>
            <p className="mt-0.5 text-[0.86rem] text-ink-900/60">
              Applications and enquiries waiting to be read.
            </p>
          </div>
          <Icon
            name="arrow-right"
            size={17}
            className="shrink-0 text-gold-700 transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collectionKeys.map((key) => (
          <Link
            key={key}
            to={`/admin/${key}`}
            className="group rounded-2xl border border-ink-900/10 bg-white/70 p-5 transition-all hover:border-gold-500/45 hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-[1.02rem] text-ink-900">{labelFor[key].plural}</span>
              <Icon
                name="arrow-right"
                size={16}
                className="mt-1 shrink-0 text-ink-900/25 transition-transform group-hover:translate-x-1 group-hover:text-gold-600"
              />
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-ink-900 tabular-nums">
              {content[key].length}
            </div>
            <div className="mt-0.5 text-[0.78rem] text-ink-900/45">
              {content[key].length === 1 ? 'item' : 'items'}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
          <h2 className="font-display text-lg text-ink-900">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {isSuperadmin && (
              <Button to="/admin/submissions" size="sm" variant="primary" icon="arrow-right">
                View enquiries
              </Button>
            )}
            <Button to="/admin/news/new" size="sm" variant={isSuperadmin ? 'outline' : 'primary'}>
              Post an update
            </Button>
            <Button to="/admin/programs/new" size="sm" variant="outline">
              Add a programme
            </Button>
            <Button to="/admin/faculty/new" size="sm" variant="outline">
              Add faculty
            </Button>
            <Button to="/admin/media" size="sm" variant="outline">
              Upload images
            </Button>
            {isSuperadmin && (
              <Button to="/admin/settings" size="sm" variant="ghost">
                Site settings
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
          <h2 className="font-display text-lg text-ink-900">Most recent update</h2>
          {latestNews ? (
            <div className="mt-3">
              <Link
                to={`/admin/news/${latestNews.id}`}
                className="font-display text-[1.02rem] text-ink-900 transition-colors hover:text-gold-600"
              >
                {latestNews.title}
              </Link>
              <p className="mt-1 text-[0.8rem] text-ink-900/45">
                {formatDateShort(latestNews.date)} · {latestNews.category}
              </p>
              <p className="mt-2 line-clamp-2 text-[0.86rem] leading-relaxed text-ink-900/60">
                {latestNews.excerpt}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[0.88rem] text-ink-900/55">No news posts yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
