import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Scroll-triggered entrance. Wraps a section so it eases up into place the first
 * time it enters the viewport — the animation that gives the site its depth
 * without any WebGL below the hero.
 */

type RevealProps = {
  children: ReactNode
  /** Seconds of delay, used to stagger siblings by index. */
  delay?: number
  /** Direction the element travels from. */
  from?: 'below' | 'left' | 'right' | 'scale'
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'span'
}

const offsets = {
  below: { y: 28, x: 0, scale: 1 },
  left: { y: 0, x: -32, scale: 1 },
  right: { y: 0, x: 32, scale: 1 },
  scale: { y: 14, x: 0, scale: 0.96 },
}

export function Reveal({ children, delay = 0, from = 'below', className, as = 'div' }: RevealProps) {
  const reduced = usePrefersReducedMotion()
  const Component = motion[as]

  if (reduced) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  const offset = offsets[from]

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}

/** Parent that staggers `RevealChild` descendants — cheaper than per-item delays. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-64px' }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  )
}
