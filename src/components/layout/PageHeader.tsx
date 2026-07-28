import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Icon } from '@/components/ui/Icon'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Dark banner that opens every inner page, with a breadcrumb trail. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: { label: string; to?: string }[]
  children?: ReactNode
}) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className="relative overflow-hidden bg-ink-950 pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(30,47,99,0.7),transparent_58%)]" />
        <div className="absolute -top-32 right-0 size-[30rem] rounded-full bg-gold-500/10 blur-[110px]" />
      </div>

      <div className="shell relative">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.78rem] text-ivory/45">
              <li>
                <Link to="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <Icon name="chevron-right" size={13} className="text-ivory/25" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition-colors hover:text-gold-300">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ivory/70">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {eyebrow && (
            <div className="mb-4 flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">
              <span className="h-px w-7 bg-current opacity-50" />
              {eyebrow}
            </div>
          )}

          <h1 className="text-[2.2rem] leading-[1.08] text-ivory sm:text-5xl lg:text-[3.4rem]">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ivory/65">{description}</p>
          )}
        </motion.div>

        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}
