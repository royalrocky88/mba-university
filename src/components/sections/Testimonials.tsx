import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useContent } from '@/context/ContentProvider'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Avatar } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Alumni carousel — one quote at a time, with keyboard-reachable controls. */
export function Testimonials() {
  const { content } = useContent()
  const quotes = content.testimonials
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  if (quotes.length === 0) return null
  const quote = quotes[index]

  function go(next: number) {
    setDirection(next > index || (index === quotes.length - 1 && next === 0) ? 1 : -1)
    setIndex(next)
  }

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-600/20 blur-[130px]"
      />

      <div className="shell relative">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="Alumni"
          title="What the last six cohorts say"
          description="Twenty-one thousand alumni across forty-six countries. These are six of them."
          className="mb-14"
        />

        <div className="relative mx-auto max-w-3xl">
          <Icon
            name="quote"
            size={52}
            className="mx-auto mb-6 text-gold-500/25"
            strokeWidth={0}
            fill="currentColor"
          />

          <div className="min-h-[16rem] sm:min-h-[13rem]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.blockquote
                key={quote.id}
                custom={direction}
                initial={reduced ? undefined : { opacity: 0, x: direction * 32 }}
                animate={reduced ? undefined : { opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: direction * -32 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <p className="font-display text-[1.15rem] leading-relaxed text-ivory/90 sm:text-[1.4rem]">
                  {quote.quote}
                </p>

                <footer className="mt-8 flex items-center justify-center gap-4">
                  <Avatar initials={quote.initials} size="lg" />
                  <div className="text-left">
                    <div className="font-display text-[1.02rem] font-semibold text-ivory">
                      {quote.name}
                    </div>
                    <div className="text-[0.85rem] text-gold-300">{quote.batch}</div>
                    <div className="text-[0.82rem] text-ivory/45">
                      {quote.role}, {quote.company}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go((index - 1 + quotes.length) % quotes.length)}
              aria-label="Previous testimonial"
              className="grid size-10 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold-500/60 hover:text-gold-300"
            >
              <Icon name="chevron-left" size={18} />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Choose a testimonial">
              {quotes.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonial ${i + 1}: ${item.name}`}
                  onClick={() => go(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-400',
                    i === index ? 'w-7 bg-gold-500' : 'w-1.5 bg-ivory/25 hover:bg-ivory/45',
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go((index + 1) % quotes.length)}
              aria-label="Next testimonial"
              className="grid size-10 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold-500/60 hover:text-gold-300"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
