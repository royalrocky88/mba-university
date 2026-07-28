import { useEffect, useRef, useState } from 'react'
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { navLinks } from '@/data/site'
import { usePrograms, useSettings } from '@/context/ContentProvider'
import { useScrolledPast } from '@/hooks/useScrollProgress'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

/**
 * Sticky navigation.
 *
 * Transparent over the hero, frosted once scrolled. The Programmes item opens a
 * dropdown built from live programme data, so a specialisation added in the
 * admin panel appears in the menu without anyone touching this file.
 */
export function Navbar() {
  const location = useLocation()
  const scrolled = useScrolledPast(24)
  const programs = usePrograms()
  const settings = useSettings()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLLIElement>(null)

  useLockBodyScroll(mobileOpen)
  useFocusTrap(drawerRef, mobileOpen)

  // Close both surfaces on navigation.
  useEffect(() => {
    setMobileOpen(false)
    setProgramsOpen(false)
  }, [location.pathname])

  // Dismiss the dropdown on outside click and on Escape.
  useEffect(() => {
    if (!programsOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setProgramsOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProgramsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [programsOpen])

  const onHome = location.pathname === '/'
  // Over the dark hero the bar must be light; everywhere else it sits on ivory.
  const transparent = onHome && !scrolled

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:text-ivory"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          transparent
            ? 'bg-transparent py-4'
            : 'glass border-b border-ink-900/8 py-2.5 shadow-[0_1px_24px_-12px_rgba(5,10,24,0.3)]',
        )}
      >
        <nav className="shell flex items-center justify-between gap-6" aria-label="Primary">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
            aria-label={`${settings.name} — home`}
          >
            <span
              className={cn(
                'grid size-10 place-items-center rounded-xl font-display text-lg font-bold transition-colors duration-500',
                transparent
                  ? 'bg-gold-500 text-ink-950'
                  : 'bg-ink-900 text-gold-300 ring-1 ring-gold-500/25',
              )}
            >
              {settings.shortName.charAt(0)}
            </span>
            <span className="hidden sm:block">
              <span
                className={cn(
                  'block font-display text-[1.05rem] leading-tight font-semibold transition-colors duration-500',
                  transparent ? 'text-ivory' : 'text-ink-900',
                )}
              >
                {settings.shortName}
              </span>
              <span
                className={cn(
                  'block text-[0.65rem] tracking-[0.14em] uppercase transition-colors duration-500',
                  transparent ? 'text-ivory/55' : 'text-ink-900/45',
                )}
              >
                School of Business
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.to === '/programs' ? (
                <li key={link.to} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProgramsOpen((open) => !open)}
                    aria-expanded={programsOpen}
                    aria-haspopup="true"
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors duration-300',
                      transparent
                        ? 'text-ivory/85 hover:bg-ivory/10 hover:text-ivory'
                        : 'text-ink-900/75 hover:bg-ink-900/[0.05] hover:text-ink-900',
                      location.pathname.startsWith('/programs') &&
                        (transparent ? 'text-gold-300' : 'text-gold-600'),
                    )}
                  >
                    {link.label}
                    <Icon
                      name="chevron-down"
                      size={14}
                      className={cn('transition-transform duration-300', programsOpen && 'rotate-180')}
                    />
                  </button>

                  <AnimatePresence>
                    {programsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 mt-3 w-[34rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-ink-900/10 bg-ivory/95 p-2.5 shadow-[var(--shadow-lift)] backdrop-blur-xl"
                      >
                        <div className="grid grid-cols-2 gap-1">
                          {programs.map((program) => (
                            <Link
                              key={program.id}
                              to={`/programs/${program.slug}`}
                              className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-ink-900/[0.05]"
                            >
                              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ink-900/[0.06] text-ink-700 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950">
                                <Icon name={program.icon} size={16} />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-[0.88rem] font-medium text-ink-900">
                                  {program.shortTitle}
                                </span>
                                <span className="block truncate text-[0.75rem] text-ink-900/50">
                                  {program.durationYears} years · {program.seats} seats
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>

                        <Link
                          to="/programs"
                          className="mt-2 flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-ivory transition-colors hover:bg-ink-700"
                        >
                          Compare all {programs.length} specialisations
                          <Icon name="arrow-right" size={16} />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={link.to}>
                  <RouterNavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors duration-300',
                        transparent
                          ? 'text-ivory/85 hover:bg-ivory/10 hover:text-ivory'
                          : 'text-ink-900/75 hover:bg-ink-900/[0.05] hover:text-ink-900',
                        isActive && (transparent ? 'text-gold-300' : 'text-gold-600'),
                      )
                    }
                  >
                    {link.label}
                  </RouterNavLink>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              to="/admissions"
              size="sm"
              variant={transparent ? 'gold' : 'primary'}
              className="hidden sm:inline-flex"
            >
              Apply now
            </Button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className={cn(
                'grid size-10 place-items-center rounded-xl border transition-colors duration-300 lg:hidden',
                transparent
                  ? 'border-ivory/25 text-ivory hover:bg-ivory/10'
                  : 'border-ink-900/12 text-ink-900 hover:bg-ink-900/[0.05]',
              )}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-ivory shadow-[var(--shadow-lift)] lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b border-ink-900/8 px-5 py-4">
                <span className="font-display text-lg font-semibold text-ink-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="grid size-10 place-items-center rounded-xl border border-ink-900/12 text-ink-900 transition-colors hover:bg-ink-900/[0.05]"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <ul className="flex flex-col gap-0.5 p-3">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <RouterNavLink
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between rounded-xl px-4 py-3 text-[0.98rem] font-medium transition-colors',
                          isActive
                            ? 'bg-ink-900 text-ivory'
                            : 'text-ink-900/80 hover:bg-ink-900/[0.05]',
                        )
                      }
                    >
                      {link.label}
                      <Icon name="chevron-right" size={16} />
                    </RouterNavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-2 border-t border-ink-900/8 px-3 pt-3">
                <p className="px-4 pb-2 text-[0.7rem] font-semibold tracking-[0.14em] text-ink-900/40 uppercase">
                  Specialisations
                </p>
                <ul className="flex flex-col gap-0.5">
                  {programs.map((program) => (
                    <li key={program.id}>
                      <Link
                        to={`/programs/${program.slug}`}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9rem] text-ink-900/70 transition-colors hover:bg-ink-900/[0.05]"
                      >
                        <Icon name={program.icon} size={16} className="text-gold-600" />
                        {program.shortTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto p-5">
                <Button to="/admissions" variant="gold" className="w-full" icon="arrow-right">
                  Apply now
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
