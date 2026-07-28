import type { CollectionKey } from '@/lib/repository'

/**
 * Field definitions for the admin editor.
 *
 * One generic form component reads these and renders the right control for every
 * collection, which is why adding a field to a programme is a two-line change
 * here rather than a new bespoke form.
 */

export type FieldSpec = {
  key: string
  label: string
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'url'
    | 'date'
    | 'select'
    | 'image'
    /** Newline-separated list → string[] */
    | 'list'
    /** Blank-line-separated paragraphs → string[] */
    | 'paragraphs'
    /** Nested semester structure → { title, subjects[] }[] */
    | 'semesters'
  required?: boolean
  placeholder?: string
  help?: string
  options?: string[]
  /** Renders side-by-side with the next field on wide screens. */
  half?: boolean
}

export type CollectionSchema = {
  /** Field used as the row title in list views. */
  titleField: string
  /** Secondary line in list views. */
  subtitleField?: string
  /** Fields that must be unique across the collection (slugs). */
  uniqueFields?: string[]
  fields: FieldSpec[]
}

const ICON_OPTIONS = [
  'chart', 'coin', 'people', 'globe', 'cpu', 'cart', 'leaf', 'health',
]

const FACILITY_ICONS = [
  'library', 'lab', 'hostel', 'sports', 'auditorium', 'cafe', 'incubator', 'wifi',
]

export const schemas: Record<CollectionKey, CollectionSchema> = {
  programs: {
    titleField: 'title',
    subtitleField: 'department',
    uniqueFields: ['slug'],
    fields: [
      { key: 'title', label: 'Full title', type: 'text', required: true, placeholder: 'MBA in Finance & Capital Markets' },
      { key: 'shortTitle', label: 'Short title', type: 'text', required: true, half: true, placeholder: 'Finance', help: 'Used on cards and in the navigation menu.' },
      { key: 'slug', label: 'URL slug', type: 'text', required: true, half: true, placeholder: 'finance', help: 'Lowercase, hyphens only. The page will live at /programs/<slug>.' },
      { key: 'department', label: 'Department', type: 'text', required: true, half: true, help: 'Programmes sharing a department are shown as related, and matched to faculty.' },
      { key: 'mode', label: 'Mode', type: 'select', options: ['Full-time', 'Part-time', 'Executive'], required: true, half: true },
      { key: 'tagline', label: 'Tagline', type: 'text', required: true, help: 'One line, shown under the title on cards.' },
      { key: 'overview', label: 'Overview', type: 'textarea', required: true, help: 'Two or three sentences for the top of the programme page.' },
      { key: 'durationYears', label: 'Duration (years)', type: 'number', required: true, half: true },
      { key: 'seats', label: 'Seats', type: 'number', required: true, half: true },
      { key: 'annualFeeINR', label: 'Annual tuition (₹)', type: 'number', required: true, half: true, placeholder: '1150000', help: 'Plain rupees, no commas.' },
      { key: 'medianCtcLPA', label: 'Median CTC (₹ LPA)', type: 'number', required: true, half: true, placeholder: '24.6' },
      { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, required: true },
      { key: 'highlights', label: 'Highlights', type: 'list', help: 'One per line.' },
      { key: 'eligibility', label: 'Eligibility criteria', type: 'list', help: 'One per line.' },
      { key: 'careers', label: 'Career outcomes', type: 'list', help: 'One job title per line.' },
      { key: 'curriculum', label: 'Curriculum', type: 'semesters', help: 'Add a semester, then list its courses one per line.' },
    ],
  },

  faculty: {
    titleField: 'name',
    subtitleField: 'designation',
    uniqueFields: ['slug'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Dr. Ananya Raghavan' },
      { key: 'slug', label: 'URL slug', type: 'text', required: true, half: true, placeholder: 'ananya-raghavan' },
      { key: 'initials', label: 'Initials', type: 'text', required: true, half: true, placeholder: 'AR', help: 'Two letters, shown in the avatar.' },
      { key: 'designation', label: 'Designation', type: 'text', required: true, half: true },
      { key: 'department', label: 'Department', type: 'text', required: true, half: true },
      { key: 'experienceYears', label: 'Experience (years)', type: 'number', required: true, half: true },
      { key: 'publications', label: 'Publications', type: 'number', required: true, half: true },
      { key: 'email', label: 'Email', type: 'email', required: true, half: true },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url', half: true },
      { key: 'bio', label: 'Biography', type: 'textarea', required: true },
      { key: 'qualifications', label: 'Qualifications', type: 'list', help: 'One per line.' },
      { key: 'expertise', label: 'Areas of expertise', type: 'list', help: 'One per line.' },
    ],
  },

  news: {
    titleField: 'title',
    subtitleField: 'date',
    uniqueFields: ['slug'],
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'text', required: true, half: true },
      { key: 'date', label: 'Publish date', type: 'date', required: true, half: true },
      { key: 'category', label: 'Category', type: 'select', required: true, half: true, options: ['Admissions', 'Campus', 'Placements', 'Research', 'Events'] },
      { key: 'author', label: 'Author or office', type: 'text', required: true, half: true },
      { key: 'readMinutes', label: 'Read time (minutes)', type: 'number', required: true, half: true },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, help: 'One or two sentences, shown on cards and in search.' },
      { key: 'body', label: 'Article body', type: 'paragraphs', required: true, help: 'Separate paragraphs with a blank line.' },
    ],
  },

  testimonials: {
    titleField: 'name',
    subtitleField: 'company',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, half: true },
      { key: 'initials', label: 'Initials', type: 'text', required: true, half: true },
      { key: 'batch', label: 'Batch', type: 'text', required: true, half: true, placeholder: 'MBA Finance, 2021' },
      { key: 'role', label: 'Current role', type: 'text', required: true, half: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
    ],
  },

  recruiters: {
    titleField: 'name',
    subtitleField: 'sector',
    fields: [
      { key: 'name', label: 'Organisation', type: 'text', required: true, half: true },
      { key: 'sector', label: 'Sector', type: 'text', required: true, half: true },
    ],
  },

  placementTrend: {
    titleField: 'year',
    subtitleField: 'averageLPA',
    fields: [
      { key: 'year', label: 'Year', type: 'text', required: true, half: true, placeholder: '2026' },
      { key: 'placedPct', label: 'Placed (%)', type: 'number', required: true, half: true },
      { key: 'averageLPA', label: 'Average CTC (₹ LPA)', type: 'number', required: true, half: true },
      { key: 'highestLPA', label: 'Highest CTC (₹ LPA)', type: 'number', required: true, half: true },
      { key: 'offers', label: 'Total offers', type: 'number', required: true, half: true },
    ],
  },

  facilities: {
    titleField: 'title',
    subtitleField: 'stat',
    fields: [
      { key: 'title', label: 'Facility', type: 'text', required: true, half: true },
      { key: 'stat', label: 'Headline figure', type: 'text', required: true, half: true, placeholder: '48 terminals' },
      { key: 'icon', label: 'Icon', type: 'select', options: FACILITY_ICONS, required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },

  gallery: {
    titleField: 'title',
    subtitleField: 'span',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, half: true },
      { key: 'span', label: 'Tile size', type: 'select', options: ['normal', 'wide', 'tall'], required: true, half: true },
      { key: 'caption', label: 'Caption', type: 'textarea', required: true },
      { key: 'tone', label: 'Gradient classes', type: 'text', required: true, placeholder: 'from-ink-800 via-ink-600 to-ink-400', help: 'Tailwind gradient stops used until a photograph is uploaded.' },
    ],
  },

  faqs: {
    titleField: 'question',
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true, help: 'The chatbot also answers from these, so write them the way you would say them.' },
    ],
  },

  leadership: {
    titleField: 'name',
    subtitleField: 'role',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, half: true },
      { key: 'role', label: 'Role', type: 'text', required: true, half: true },
      { key: 'initials', label: 'Initials', type: 'text', required: true, half: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
    ],
  },
}

/** Site-wide settings form. */
export const settingsFields: FieldSpec[] = [
  { key: 'name', label: 'Institution name', type: 'text', required: true },
  { key: 'shortName', label: 'Short name', type: 'text', required: true, half: true, help: 'Used in the navbar and page titles.' },
  { key: 'established', label: 'Established', type: 'number', required: true, half: true },
  { key: 'tagline', label: 'Tagline', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true, help: 'Appears in the footer and as the site meta description.' },
  { key: 'accreditations', label: 'Accreditations', type: 'list', help: 'One per line — shown as chips in the hero and footer.' },
  { key: 'address', label: 'Campus address', type: 'textarea', required: true },
  { key: 'mapQuery', label: 'Map search text', type: 'text', required: true, help: 'What to search for on Google Maps in the contact page embed.' },
  { key: 'admissionsPhone', label: 'Admissions phone', type: 'text', required: true, half: true },
  { key: 'generalPhone', label: 'General phone', type: 'text', required: true, half: true },
  { key: 'admissionsEmail', label: 'Admissions email', type: 'email', required: true, half: true },
  { key: 'generalEmail', label: 'General email', type: 'email', required: true, half: true },
  { key: 'officeHours', label: 'Office hours', type: 'text', required: true },
]

/** A blank record for the "new item" form, typed loosely on purpose. */
export function emptyRecord(schema: CollectionSchema): Record<string, unknown> {
  const record: Record<string, unknown> = {}
  for (const field of schema.fields) {
    switch (field.type) {
      case 'number':
        record[field.key] = 0
        break
      case 'list':
      case 'paragraphs':
        record[field.key] = []
        break
      case 'semesters':
        record[field.key] = []
        break
      case 'select':
        record[field.key] = field.options?.[0] ?? ''
        break
      default:
        record[field.key] = ''
    }
  }
  return record
}

/** Derives a URL slug from a title, for the slug field's auto-fill. */
export function slugFrom(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
