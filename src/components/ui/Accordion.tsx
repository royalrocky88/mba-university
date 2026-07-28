import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Keyboard-accessible disclosure list.
 *
 * Built on real <button> elements with `aria-expanded` / `aria-controls` rather
 * than <details>, because the animated height needs to be under our control and
 * `<details>` cannot be transitioned reliably across browsers.
 */

export type AccordionEntry = {
  title: string
  /** Optional short text on the right of the trigger — e.g. a date or count. */
  meta?: string
  content: ReactNode
}

type AccordionProps = {
  items: AccordionEntry[]
  /** Index open on mount; `null` collapses everything. */
  defaultOpen?: number | null
  /** Allow several panels open at once. */
  multiple?: boolean
  className?: string
}

export function Accordion({ items, defaultOpen = 0, multiple = false, className }: AccordionProps) {
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState<number[]>(defaultOpen === null ? [] : [defaultOpen])

  function toggle(index: number) {
    setOpen((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index)
      return multiple ? [...current, index] : [index]
    })
  }

  return (
    <div className={cn('divide-y divide-ink-900/10 overflow-hidden rounded-2xl border border-ink-900/10 bg-white/60', className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(index)
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div key={item.title}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center gap-4 px-5 py-4.5 text-left transition-colors duration-200 hover:bg-ink-900/[0.03] sm:px-6"
              >
                <span
                  className={cn(
                    'flex-1 font-sans text-[0.98rem] font-medium tracking-tight transition-colors sm:text-[1.05rem]',
                    isOpen ? 'text-ink-900' : 'text-ink-900/80',
                  )}
                >
                  {item.title}
                </span>
                {item.meta && (
                  <span className="hidden shrink-0 text-xs text-ink-900/45 sm:block">{item.meta}</span>
                )}
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300',
                    isOpen
                      ? 'rotate-180 border-gold-500 bg-gold-500 text-ink-950'
                      : 'border-ink-900/15 text-ink-900/60',
                  )}
                >
                  <Icon name="chevron-down" size={15} />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? undefined : { height: 0, opacity: 0 }}
                  animate={reduced ? undefined : { height: 'auto', opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink-900/70 sm:px-6 sm:pb-6">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
