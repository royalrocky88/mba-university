import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  /** Small uppercase label above the title. */
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
  /** Slot for a "view all" link or filter control on the right. */
  action?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
  action,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow && (
          <div
            className={cn(
              'mb-3 flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.16em] uppercase',
              align === 'center' && 'justify-center',
              tone === 'dark' ? 'text-gold-300' : 'text-gold-600',
            )}
          >
            <span className="h-px w-7 bg-current opacity-50" />
            {eyebrow}
          </div>
        )}

        <h2
          className={cn(
            'text-3xl sm:text-4xl lg:text-[2.75rem]',
            tone === 'dark' && 'text-ivory',
          )}
        >
          {title}
        </h2>

        {description && (
          <p
            className={cn(
              'mt-4 text-[1.02rem] leading-relaxed',
              tone === 'dark' ? 'text-ivory/70' : 'text-ink-900/65',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  )
}
