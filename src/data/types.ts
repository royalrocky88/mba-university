/**
 * Shared content model.
 *
 * Every page in this site renders from the typed collections in `src/data/`.
 * Nothing user-facing is hardcoded in JSX, so adding a programme, a faculty
 * member or a news post is a data edit — never a component edit.
 */

export type Semester = {
  title: string
  subjects: string[]
}

export type Program = {
  slug: string
  title: string
  shortTitle: string
  department: string
  tagline: string
  overview: string
  durationYears: number
  mode: 'Full-time' | 'Part-time' | 'Executive'
  seats: number
  annualFeeINR: number
  /** Lucide-free inline icon key — see `ProgramIcon` in `components/ui/ProgramIcon.tsx`. */
  icon: 'chart' | 'coin' | 'people' | 'globe' | 'cpu' | 'cart' | 'leaf' | 'health'
  highlights: string[]
  eligibility: string[]
  curriculum: Semester[]
  careers: string[]
  /** Median CTC for this specialisation, in lakhs per annum. */
  medianCtcLPA: number
}

export type Faculty = {
  slug: string
  name: string
  designation: string
  department: string
  qualifications: string[]
  expertise: string[]
  bio: string
  /** Years of combined academic + industry experience. */
  experienceYears: number
  publications: number
  email: string
  linkedin?: string
  /** Two-letter monogram used by the avatar fallback. */
  initials: string
}

export type NewsCategory = 'Admissions' | 'Campus' | 'Placements' | 'Research' | 'Events'

export type NewsItem = {
  slug: string
  title: string
  /** ISO date — formatted for display by `formatDate` in `lib/utils.ts`. */
  date: string
  category: NewsCategory
  excerpt: string
  /** Array of paragraphs; rendered as <p> blocks on the detail page. */
  body: string[]
  author: string
  readMinutes: number
}

export type Testimonial = {
  name: string
  batch: string
  role: string
  company: string
  quote: string
  initials: string
}

export type Recruiter = {
  name: string
  sector: string
}

export type PlacementYear = {
  year: string
  placedPct: number
  averageLPA: number
  highestLPA: number
  offers: number
}

export type Facility = {
  title: string
  description: string
  icon: 'library' | 'lab' | 'hostel' | 'sports' | 'auditorium' | 'cafe' | 'incubator' | 'wifi'
  stat: string
}

export type GalleryItem = {
  title: string
  caption: string
  /** Tailwind gradient classes — stands in for photography until real images drop in. */
  tone: string
  /** Grid span on large screens, so the gallery reads as a mosaic rather than a grid. */
  span: 'wide' | 'tall' | 'normal'
}

export type FaqItem = {
  question: string
  answer: string
}

export type AdmissionStep = {
  step: number
  title: string
  description: string
  window: string
}

export type ImportantDate = {
  label: string
  date: string
  status: 'open' | 'upcoming' | 'closed'
}

export type Stat = {
  label: string
  value: number
  suffix?: string
  prefix?: string
  /** One-line context shown under the number. */
  note: string
}

export type NavLink = {
  label: string
  to: string
}

export type Leader = {
  name: string
  role: string
  message: string
  initials: string
}
