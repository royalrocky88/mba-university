/** Join conditional class names. Falsy values are dropped. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** `2026-09-30` → `30 September 2026` */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** `2026-09-30` → `30 Sep 2026` */
export function formatDateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** `1150000` → `₹11,50,000` (Indian digit grouping). */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** `1150000` → `₹11.5 L` — for tight spaces like card footers. */
export function formatLakh(amount: number): string {
  const lakhs = amount / 100000
  const rounded = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)
  return `₹${rounded} L`
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Stable slug for anchor ids generated from headings. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
