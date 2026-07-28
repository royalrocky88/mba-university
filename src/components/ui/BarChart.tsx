import { useRef } from 'react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { PlacementYear } from '@/data/types'

/**
 * Year-on-year placement chart, drawn as plain SVG.
 *
 * A charting library would add roughly 90 kB to render six bars and a line — so
 * this is hand-rolled. Bars grow from the baseline on first scroll into view via
 * a CSS transform, which keeps the animation off the main thread.
 */

type BarChartProps = {
  data: PlacementYear[]
  className?: string
}

export function BarChart({ data, className }: BarChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = usePrefersReducedMotion()
  const animate = inView || reduced

  const maxAverage = Math.max(...data.map((d) => d.averageLPA))
  // Headroom above the tallest bar so the value labels never clip.
  const ceiling = Math.ceil(maxAverage * 1.18)

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: '17rem' }}>
        {data.map((year, index) => {
          const heightPct = (year.averageLPA / ceiling) * 100

          return (
            <div key={year.year} className="group flex h-full flex-1 flex-col justify-end gap-2">
              <div className="relative flex h-full items-end">
                <div
                  className="relative w-full origin-bottom rounded-t-lg bg-gradient-to-t from-ink-800 to-ink-500 transition-[height,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:from-gold-600 group-hover:to-gold-400"
                  style={{
                    height: animate ? `${heightPct}%` : '0%',
                    transitionDelay: reduced ? '0ms' : `${index * 90}ms`,
                  }}
                >
                  {/* Value label rides on top of the bar. */}
                  <span
                    className="absolute -top-7 left-1/2 -translate-x-1/2 text-[0.72rem] font-semibold whitespace-nowrap text-ink-900/70 tabular-nums transition-opacity duration-500 sm:text-[0.8rem]"
                    style={{
                      opacity: animate ? 1 : 0,
                      transitionDelay: reduced ? '0ms' : `${index * 90 + 500}ms`,
                    }}
                  >
                    ₹{year.averageLPA}L
                  </span>

                  {/* Placement-rate pill, revealed on hover. */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-ivory/95 px-2 py-0.5 text-[0.65rem] font-semibold text-ink-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {year.placedPct}%
                  </span>
                </div>
              </div>

              <div className="text-center text-[0.75rem] font-medium text-ink-900/55 tabular-nums sm:text-[0.82rem]">
                {year.year}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-5 border-t border-ink-900/10 pt-4 text-xs text-ink-900/50">
        Bars show average CTC in lakhs per annum. Hover a bar for that year’s placement rate.
      </p>
    </div>
  )
}

/**
 * Horizontal proportion bars for the sector split. Same reasoning as above —
 * six rows do not justify a charting dependency.
 */
export function SectorBars({
  data,
  className,
}: {
  data: { sector: string; pct: number }[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = usePrefersReducedMotion()
  const animate = inView || reduced
  const max = Math.max(...data.map((d) => d.pct))

  return (
    <div ref={ref} className={cn('flex flex-col gap-3.5', className)}>
      {data.map((row, index) => (
        <div key={row.sector} className="flex items-center gap-4">
          <span className="w-40 shrink-0 text-sm text-ink-900/70 sm:w-52">{row.sector}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-900/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ink-700 to-gold-500 transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: animate ? `${(row.pct / max) * 100}%` : '0%',
                transitionDelay: reduced ? '0ms' : `${index * 80}ms`,
              }}
            />
          </div>
          <span className="w-11 shrink-0 text-right text-sm font-semibold text-ink-900 tabular-nums">
            {row.pct}%
          </span>
        </div>
      ))}
    </div>
  )
}
