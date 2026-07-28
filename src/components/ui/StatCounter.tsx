import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Stat } from '@/data/types'

/**
 * Counts a number up the first time it scrolls into view.
 *
 * Uses `requestAnimationFrame` with an eased curve rather than a fixed interval,
 * so the tally lands exactly on the target value regardless of frame rate.
 */
function useCountUp(target: number, active: boolean, durationMs = 1600): number {
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!active) return
    if (reduced) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1)
      // easeOutExpo — fast start, long settle.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, durationMs, reduced])

  return value
}

/** Whole numbers stay whole; decimals keep exactly one place. */
function format(value: number, target: number): string {
  return Number.isInteger(target) ? Math.round(value).toLocaleString('en-IN') : value.toFixed(1)
}

type StatCounterProps = {
  stat: Stat
  className?: string
  tone?: 'light' | 'dark'
}

export function StatCounter({ stat, className, tone = 'light' }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const value = useCountUp(stat.value, inView)

  return (
    <div ref={ref} className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'font-display text-4xl leading-none font-semibold tabular-nums sm:text-5xl',
          tone === 'dark' ? 'text-gold-300' : 'text-ink-900',
        )}
      >
        {stat.prefix}
        {format(value, stat.value)}
        {stat.suffix}
      </div>
      <div
        className={cn(
          'text-[0.9rem] font-medium',
          tone === 'dark' ? 'text-ivory/90' : 'text-ink-900/85',
        )}
      >
        {stat.label}
      </div>
      <div className={cn('text-[0.8rem]', tone === 'dark' ? 'text-ivory/55' : 'text-ink-900/50')}>
        {stat.note}
      </div>
    </div>
  )
}
