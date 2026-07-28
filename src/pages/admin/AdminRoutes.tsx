import { Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { AdminLayout } from './AdminLayout'
import { AdminLogin } from './Login'
import { AdminDashboard } from './Dashboard'
import { AdminSettings } from './SettingsPage'
import { CollectionList } from './CollectionList'
import { CollectionEditor } from './CollectionEditor'
import { MediaLibrary } from './MediaLibrary'

/**
 * Admin routing and the authentication gate.
 *
 * Everything under `/admin` is behind a signed-in session. Note that this guard
 * is a convenience, not the security boundary — the real enforcement is the
 * row-level security policy in `supabase/schema.sql`, which rejects writes from
 * anyone without a valid session regardless of what the browser renders.
 */
export default function AdminRoutes() {
  const { user, loading, configured } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-ink-950">
        <span className="sr-only">Checking your session…</span>
        <span
          aria-hidden="true"
          className="size-8 animate-spin rounded-full border-2 border-ivory/15 border-t-gold-500"
        />
      </div>
    )
  }

  // Without Supabase there is no session to have; show the login screen, which
  // explains the setup rather than pretending the panel is broken.
  if (!user || !configured) return <AdminLogin />

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path=":collection" element={<CollectionList />} />
        <Route path=":collection/:id" element={<CollectionEditor />} />
        <Route path="*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}
