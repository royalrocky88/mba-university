import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = {
  children: ReactNode
  tone?: 'neutral' | 'gold' | 'ink' | 'onDark' | 'success' | 'muted'
  className?: string
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'border-ink-900/12 bg-white/70 text-ink-900/70',
  gold: 'border-gold-500/35 bg-gold-500/12 text-gold-600',
  ink: 'border-transparent bg-ink-900 text-ivory',
  onDark: 'border-ivory/20 bg-ivory/10 text-ivory/85',
  success: 'border-emerald-600/25 bg-emerald-500/12 text-emerald-700',
  muted: 'border-ink-900/8 bg-ink-900/[0.04] text-ink-900/55',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-medium tracking-wide whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Circular monogram used wherever a person appears without a photograph. */
export function Avatar({
  initials,
  size = 'md',
  className,
}: {
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'size-9 text-[0.75rem]',
    md: 'size-12 text-sm',
    lg: 'size-16 text-lg',
    xl: 'size-24 text-2xl',
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 font-display font-semibold text-gold-300 ring-1 ring-gold-500/25',
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
