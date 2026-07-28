import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Form controls with labels, required markers and accessible error wiring.
 *
 * Each control links its message with `aria-describedby` and sets
 * `aria-invalid`, so screen readers announce the failure rather than leaving the
 * red text as a purely visual cue.
 */

const controlClasses =
  'w-full rounded-xl border bg-ivory px-4 py-2.5 text-[0.92rem] text-ink-900 transition-colors outline-none placeholder:text-ink-900/30 focus:border-gold-500/70 disabled:opacity-60'

function Shell({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[0.82rem] font-medium text-ink-900/75">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-gold-600">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[0.78rem] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.78rem] text-ink-900/45">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, className, required, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClasses, error ? 'border-red-500/60' : 'border-ink-900/12')}
        {...rest}
      />
    </Shell>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, required, children, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClasses, 'appearance-none', error ? 'border-red-500/60' : 'border-ink-900/12')}
        {...rest}
      >
        {children}
      </select>
    </Shell>
  )
})

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, className, required, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClasses, 'resize-y', error ? 'border-red-500/60' : 'border-ink-900/12')}
        {...rest}
      />
    </Shell>
  )
})
