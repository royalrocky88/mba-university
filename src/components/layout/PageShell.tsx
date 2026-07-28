import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Public site frame: navigation, animated page body, footer and the chatbot.
 *
 * Also owns scroll restoration — router navigation should land at the top of the
 * new page, except when the URL carries a hash, which must win.
 */
export function PageShell() {
  const location = useLocation()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (location.hash) {
      // Let the target render before trying to scroll to it.
      const id = location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
      })
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname, location.hash, reduced])

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <motion.main
        id="main"
        key={location.pathname}
        className="flex-1"
        initial={reduced ? undefined : { opacity: 0, y: 12 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
