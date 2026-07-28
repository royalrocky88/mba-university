import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from '@/context/ContentProvider'
import { AuthProvider } from '@/context/AuthProvider'
import { PageShell } from '@/components/layout/PageShell'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

/**
 * Route table.
 *
 * Public pages below the home page are lazy-loaded — a first visit only pays for
 * the home route and the shell. The whole admin panel is a single lazy chunk, so
 * ordinary visitors never download it at all.
 */

const Programs = lazy(() => import('@/pages/Programs'))
const ProgramDetail = lazy(() => import('@/pages/ProgramDetail'))
const Admissions = lazy(() => import('@/pages/Admissions'))
const Faculty = lazy(() => import('@/pages/Faculty'))
const FacultyDetail = lazy(() => import('@/pages/FacultyDetail'))
const Placements = lazy(() => import('@/pages/Placements'))
const Campus = lazy(() => import('@/pages/Campus'))
const News = lazy(() => import('@/pages/News'))
const NewsDetail = lazy(() => import('@/pages/NewsDetail'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const AdminRoutes = lazy(() => import('@/pages/admin/AdminRoutes'))

/** Neutral placeholder while a route chunk loads. */
function RouteFallback() {
  return (
    <div className="grid min-h-[70svh] place-items-center">
      <span className="sr-only">Loading…</span>
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-ink-900/15 border-t-gold-500"
      />
    </div>
  )
}

export default function App() {
  // basename follows Vite's `base`, so the same build works at the domain root
  // or under a GitHub Pages /<repo>/ prefix without touching a single route.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <ContentProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Admin sits outside the public shell — its own chrome, no chatbot. */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              <Route element={<PageShell />}>
                <Route index element={<Home />} />
                <Route path="programs" element={<Programs />} />
                <Route path="programs/:slug" element={<ProgramDetail />} />
                <Route path="admissions" element={<Admissions />} />
                <Route path="faculty" element={<Faculty />} />
                <Route path="faculty/:slug" element={<FacultyDetail />} />
                <Route path="placements" element={<Placements />} />
                <Route path="campus" element={<Campus />} />
                <Route path="news" element={<News />} />
                <Route path="news/:slug" element={<NewsDetail />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
