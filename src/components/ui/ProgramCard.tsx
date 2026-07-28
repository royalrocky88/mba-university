import { Link } from 'react-router-dom'
import { TiltCard } from './TiltCard'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { formatLakh } from '@/lib/utils'
import type { Program } from '@/data/types'

/** Programme tile used on the home page and on `/programs`. */
export function ProgramCard({ program }: { program: Program }) {
  return (
    <TiltCard className="h-full">
      <Link
        to={`/programs/${program.slug}`}
        className="flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/75 p-6 shadow-[var(--shadow-card)] transition-all duration-500 hover:border-gold-500/45 hover:shadow-[var(--shadow-lift)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 text-gold-300 ring-1 ring-gold-500/20">
            <Icon name={program.icon} size={22} />
          </span>
          <Badge tone="muted">{program.department}</Badge>
        </div>

        <h3 className="mt-5 font-display text-xl leading-snug text-ink-900">{program.shortTitle}</h3>
        <p className="mt-2 line-clamp-3 text-[0.92rem] leading-relaxed text-ink-900/60">
          {program.tagline}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-900/8 pt-4 text-center">
          <div>
            <dt className="text-[0.68rem] tracking-wide text-ink-900/45 uppercase">Duration</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">{program.durationYears} yrs</dd>
          </div>
          <div className="border-x border-ink-900/8">
            <dt className="text-[0.68rem] tracking-wide text-ink-900/45 uppercase">Seats</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">{program.seats}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] tracking-wide text-ink-900/45 uppercase">Fee / yr</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">
              {formatLakh(program.annualFeeINR)}
            </dd>
          </div>
        </dl>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600">
          Explore programme
          <Icon
            name="arrow-right"
            size={15}
            className="transition-transform duration-300 group-hover/tilt:translate-x-1"
          />
        </span>
      </Link>
    </TiltCard>
  )
}
