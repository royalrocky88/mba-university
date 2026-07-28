import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { navLinks } from '@/data/site'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-ink-950 pt-32 pb-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(30,47,99,0.7),transparent_60%)]" />
        <div className="absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-gold-500/8 blur-[110px]" />
      </div>

      <div className="shell relative text-center">
        <span className="font-display text-[6rem] leading-none font-bold text-gold-500/25 sm:text-[9rem]">
          404
        </span>

        <h1 className="mt-2 text-3xl text-ivory sm:text-4xl">This page is not on the syllabus</h1>
        <p className="mx-auto mt-4 max-w-md text-[1.02rem] leading-relaxed text-ivory/60">
          The link may be out of date, or the page may have been moved. Here is where you can go
          instead.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="gold" size="lg" icon="arrow-right">
            Back to home
          </Button>
          <Button to="/contact" variant="onDark" size="lg">
            Contact us
          </Button>
        </div>

        <nav aria-label="Site sections" className="mt-14">
          <ul className="flex flex-wrap justify-center gap-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ivory/12 px-4 py-2 text-[0.84rem] text-ivory/60 transition-colors hover:border-gold-500/50 hover:text-gold-300"
                >
                  {link.label}
                  <Icon name="arrow-up-right" size={13} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
