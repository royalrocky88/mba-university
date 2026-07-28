import type {
  Facility,
  Faculty,
  FaqItem,
  GalleryItem,
  Leader,
  NewsItem,
  PlacementYear,
  Program,
  Recruiter,
  Testimonial,
} from '@/data/types'

/**
 * Every editable collection in one place.
 *
 * `CollectionKey` is the single source of truth used by the repository, the
 * content provider, the admin navigation and the admin field schemas — adding a
 * new collection means adding one entry here and one field schema, nothing else.
 */

/** Rows carry a database id and an explicit display order once they live in Postgres. */
export type Persisted<T> = T & {
  id: string
  sort_order: number
  updated_at?: string
}

/** Free-form key/value settings — university name, contact details, stat strip, etc. */
export type SiteSettings = {
  name: string
  shortName: string
  tagline: string
  description: string
  established: number
  accreditations: string[]
  address: string
  admissionsPhone: string
  generalPhone: string
  admissionsEmail: string
  generalEmail: string
  officeHours: string
  mapQuery: string
}

export type CollectionMap = {
  programs: Program
  faculty: Faculty
  news: NewsItem
  testimonials: Testimonial
  recruiters: Recruiter
  placementTrend: PlacementYear
  facilities: Facility
  gallery: GalleryItem
  faqs: FaqItem
  leadership: Leader
}

export type CollectionKey = keyof CollectionMap

/** Postgres table backing each collection. */
export const tableFor: Record<CollectionKey, string> = {
  programs: 'programs',
  faculty: 'faculty',
  news: 'news',
  testimonials: 'testimonials',
  recruiters: 'recruiters',
  placementTrend: 'placement_trend',
  facilities: 'facilities',
  gallery: 'gallery',
  faqs: 'faqs',
  leadership: 'leadership',
}

/** Human labels used across the admin UI. */
export const labelFor: Record<CollectionKey, { singular: string; plural: string }> = {
  programs: { singular: 'Programme', plural: 'Programmes' },
  faculty: { singular: 'Faculty member', plural: 'Faculty' },
  news: { singular: 'News post', plural: 'News & updates' },
  testimonials: { singular: 'Testimonial', plural: 'Testimonials' },
  recruiters: { singular: 'Recruiter', plural: 'Recruiters' },
  placementTrend: { singular: 'Placement year', plural: 'Placement trend' },
  facilities: { singular: 'Facility', plural: 'Campus facilities' },
  gallery: { singular: 'Gallery item', plural: 'Campus gallery' },
  faqs: { singular: 'FAQ', plural: 'Admission FAQs' },
  leadership: { singular: 'Leader', plural: 'Leadership' },
}

export const collectionKeys = Object.keys(tableFor) as CollectionKey[]

/** Everything the site renders, loaded in one pass by the content provider. */
export type ContentSnapshot = {
  [K in CollectionKey]: Persisted<CollectionMap[K]>[]
} & {
  settings: SiteSettings
}
