import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Infinite horizontal scroller for the recruiter strip.
 *
 * The list is rendered twice and translated by exactly -50%, which is what makes
 * the loop seamless. Under reduced motion it becomes a normal scrollable row.
 */

type MarqueeProps = {
  items: { name: string; sector: string }[]
  /** Seconds for one full pass. Longer = slower. */
  durationSeconds?: number
  reverse?: boolean
  className?: string
}

export function Marquee({ items, durationSeconds = 42, reverse = false, className }: MarqueeProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <div className={cn('scrollbar-none flex gap-3 overflow-x-auto pb-2', className)}>
        {items.map((item) => (
          <RecruiterChip key={item.name} {...item} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        // Fade the strip into the page background at both ends.
        '[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max gap-3 group-hover:[animation-play-state:paused]"
        style={{
          animation: `marquee-x ${durationSeconds}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {/* Duplicated so the -50% translation lands on an identical frame. */}
        {[...items, ...items].map((item, index) => (
          <RecruiterChip key={`${item.name}-${index}`} {...item} />
        ))}
      </div>
    </div>
  )
}

function RecruiterChip({ name, sector }: { name: string; sector: string }) {
  return (
    <div className="flex shrink-0 flex-col justify-center rounded-xl border border-ivory/12 bg-ivory/[0.06] px-5 py-3.5 backdrop-blur-sm transition-colors duration-300 hover:border-gold-500/40 hover:bg-ivory/10">
      <span className="font-display text-[0.95rem] font-semibold whitespace-nowrap text-ivory">
        {name}
      </span>
      <span className="text-[0.72rem] whitespace-nowrap text-ivory/45">{sector}</span>
    </div>
  )
}
