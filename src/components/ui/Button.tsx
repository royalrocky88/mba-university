import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'onDark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-ivory hover:bg-ink-700 shadow-[0_8px_24px_-8px_rgba(5,10,24,0.5)] hover:shadow-[0_14px_32px_-10px_rgba(5,10,24,0.6)] hover:-translate-y-0.5',
  gold: 'bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-[0_8px_28px_-8px_rgba(201,162,39,0.6)] hover:-translate-y-0.5',
  outline:
    'border border-ink-900/20 text-ink-900 hover:border-ink-900/45 hover:bg-ink-900/[0.04] hover:-translate-y-0.5',
  ghost: 'text-ink-900 hover:bg-ink-900/[0.06]',
  onDark: 'border border-ivory/25 text-ivory hover:bg-ivory/10 hover:border-ivory/50 hover:-translate-y-0.5',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-13 px-8 text-base',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  icon?: IconName
  /** Place the icon before the label instead of after it. */
  iconLeading?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never }
type InternalLinkProps = CommonProps & { to: string; href?: never }
type ExternalLinkProps = CommonProps & { href: string; to?: never }

export function Button(props: ButtonProps | InternalLinkProps | ExternalLinkProps) {
  const { variant = 'primary', size = 'md', icon, iconLeading, className, children } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  const content = (
    <>
      {icon && iconLeading && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
      {icon && !iconLeading && (
        <Icon
          name={icon}
          size={size === 'sm' ? 15 : 17}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </>
  )

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cn('group', classes)}>
        {content}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer noopener" className={cn('group', classes)}>
        {content}
      </a>
    )
  }

  const { variant: _v, size: _s, icon: _i, iconLeading: _il, className: _c, children: _ch, ...rest } =
    props as ButtonProps
  return (
    <button className={cn('group', classes)} {...rest}>
      {content}
    </button>
  )
}
