import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { collectionKeys, labelFor } from '@/lib/repository'
import { useAuth } from '@/context/AuthProvider'
import { useContent } from '@/context/ContentProvider'
import { useNewSubmissionCount } from '@/hooks/useSubmissions'
import { Icon, type IconName } from '@/components/ui/Icon'

/** Sidebar chrome for every admin screen. Deliberately plain — this is a tool. */
export function AdminLayout() {
  const { user, signOut, role, isSuperadmin } = useAuth()
  const { content, live, refresh, loading } = useContent()
  const newSubmissions = useNewSubmissionCount()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)

  const icons: Record<string, IconName> = {
    programs: 'chart',
    faculty: 'people',
    news: 'calendar',
    testimonials: 'quote',
    recruiters: 'cart',
    placementTrend: 'coin',
    facilities: 'library',
    gallery: 'sparkle',
    faqs: 'chat',
    leadership: 'people',
  }

  async function handleSignOut() {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-svh bg-ivory-dim">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-ink-900/10 bg-ink-950 transition-transform duration-300 lg:static lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-ivory/10 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-lg bg-gold-500 font-display text-base font-bold text-ink-950">
            {content.settings.shortName.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[0.95rem] font-semibold text-ivory">Admin</div>
            <div className="truncate text-[0.68rem] text-ivory/45">{content.settings.shortName}</div>
          </div>
        </div>

        <nav className="flex-1 p-3" aria-label="Admin sections">
          <AdminNavLink to="/admin" end icon="chart" label="Dashboard" />
          {/* Enquiries hold applicant contact details, and settings carry the
              institution's identity — both are superadmin-only, in the database
              as well as here. */}
          {isSuperadmin && (
            <>
              <AdminNavLink
                to="/admin/submissions"
                icon="mail"
                label="Enquiries"
                badge={newSubmissions}
              />
              <AdminNavLink to="/admin/settings" icon="cpu" label="Site settings" />
            </>
          )}
          <AdminNavLink to="/admin/media" icon="download" label="Media library" />

          <p className="mt-5 px-3 pb-2 text-[0.65rem] font-semibold tracking-[0.14em] text-ivory/35 uppercase">
            Content
          </p>
          {collectionKeys.map((key) => (
            <AdminNavLink
              key={key}
              to={`/admin/${key}`}
              icon={icons[key] ?? 'chart'}
              label={labelFor[key].plural}
              count={content[key].length}
            />
          ))}
        </nav>

        <div className="border-t border-ivory/10 p-3">
          <div
            className={cn(
              'mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[0.72rem]',
              live ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gold-500/10 text-gold-300',
            )}
          >
            <span className={cn('size-1.5 rounded-full', live ? 'bg-emerald-400' : 'bg-gold-400')} />
            {live ? 'Connected to database' : 'Seed content (read-only)'}
          </div>

          {user && (
            <div className="px-3 pb-2">
              <p className="truncate text-[0.7rem] text-ivory/40" title={user.email}>
                {user.email}
              </p>
              {role && (
                <p className="mt-1 text-[0.66rem] text-ivory/35">
                  {isSuperadmin ? 'Superadmin — full access' : 'Admin — navbar content only'}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ivory/15 px-3 py-2 text-[0.78rem] text-ivory/70 transition-colors hover:bg-ivory/10 disabled:opacity-50"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            {user && (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-lg border border-ivory/15 px-3 py-2 text-[0.78rem] text-ivory/70 transition-colors hover:bg-ivory/10"
              >
                Sign out
              </button>
            )}
          </div>

          <Link
            to="/"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.78rem] text-ivory/50 transition-colors hover:text-gold-300"
          >
            View public site
            <Icon name="arrow-up-right" size={13} />
          </Link>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-900/10 bg-ivory/85 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open admin navigation"
            className="grid size-9 place-items-center rounded-lg border border-ink-900/12 text-ink-900"
          >
            <Icon name="menu" size={18} />
          </button>
          <span className="font-display text-[0.95rem] font-semibold text-ink-900">Admin</span>
        </header>

        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({
  to,
  icon,
  label,
  count,
  badge,
  end,
}: {
  to: string
  icon: IconName
  label: string
  /** Muted total, for collections. */
  count?: number
  /** Highlighted attention count — rendered only when non-zero. */
  badge?: number
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.85rem] transition-colors',
          isActive ? 'bg-gold-500 font-medium text-ink-950' : 'text-ivory/65 hover:bg-ivory/8 hover:text-ivory',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} size={16} className="shrink-0" />
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              aria-label={`${badge} new`}
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums',
                // The active row is already gold, so the badge inverts to stay legible.
                isActive ? 'bg-ink-950 text-gold-300' : 'bg-gold-500 text-ink-950',
              )}
            >
              {badge}
            </span>
          )}
          {count !== undefined && (
            <span className="shrink-0 text-[0.72rem] opacity-60">{count}</span>
          )}
        </>
      )}
    </NavLink>
  )
}
