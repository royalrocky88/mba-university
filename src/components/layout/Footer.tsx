import { Link } from 'react-router-dom'
import { footerColumns, site } from '@/data/site'
import { useSettings } from '@/context/ContentProvider'
import { Icon } from '@/components/ui/Icon'

export function Footer() {
  const settings = useSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ivory/70">
      {/* Warm glow anchoring the footer to the brand */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl"
      />

      <div className="shell relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-gold-500 font-display text-xl font-bold text-ink-950">
                {settings.shortName.charAt(0)}
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-ivory">
                  {settings.shortName}
                </span>
                <span className="block text-[0.68rem] tracking-[0.14em] text-ivory/45 uppercase">
                  School of Business
                </span>
              </span>
            </Link>

            <p className="mt-5 text-[0.9rem] leading-relaxed text-ivory/55">
              {settings.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {settings.accreditations.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ivory/12 px-3 py-1 text-[0.7rem] text-ivory/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-[0.72rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.9rem] text-ivory/60 transition-colors duration-200 hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-ivory/10 pt-8 sm:grid-cols-3">
          <ContactLine icon="pin" label="Campus">
            {settings.address}
          </ContactLine>
          <ContactLine icon="mail" label="Admissions">
            <a
              href={`mailto:${settings.admissionsEmail}`}
              className="transition-colors hover:text-gold-300"
            >
              {settings.admissionsEmail}
            </a>
          </ContactLine>
          <ContactLine icon="phone" label="Enquiries">
            <a
              href={`tel:${settings.admissionsPhone.replace(/\s/g, '')}`}
              className="transition-colors hover:text-gold-300"
            >
              {settings.admissionsPhone}
            </a>
          </ContactLine>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-ivory/10 pt-8 sm:flex-row">
          <p className="text-center text-[0.8rem] text-ivory/40 sm:text-left">
            © {year} {settings.name}. Established {settings.established}. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-ivory/12 px-3.5 py-1.5 text-[0.75rem] text-ivory/60 transition-colors duration-200 hover:border-gold-500/50 hover:text-gold-300"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function ContactLine({
  icon,
  label,
  children,
}: {
  icon: 'pin' | 'mail' | 'phone'
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ivory/[0.07] text-gold-300">
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0">
        <div className="text-[0.68rem] tracking-[0.14em] text-ivory/35 uppercase">{label}</div>
        <div className="mt-0.5 text-[0.85rem] leading-relaxed text-ivory/65">{children}</div>
      </div>
    </div>
  )
}
