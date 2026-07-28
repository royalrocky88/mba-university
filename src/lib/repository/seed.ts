import { site } from '@/data/site'
import { programs } from '@/data/programs'
import { faculty } from '@/data/faculty'
import { news } from '@/data/news'
import { testimonials } from '@/data/testimonials'
import { recruiters, placementTrend } from '@/data/placements'
import { facilities, gallery } from '@/data/campus'
import { admissionFaqs } from '@/data/admissions'
import { leadership } from '@/data/about'
import type { CollectionKey, ContentSnapshot, Persisted, SiteSettings } from './types'

/**
 * The bundled starting content.
 *
 * Used directly when Supabase is not configured, and offered as a one-click
 * "seed the database" action in the admin panel when it is — so a fresh project
 * never shows an empty site.
 */

/** Stable ids for seed rows so React keys and admin edit links behave sensibly. */
function persist<T extends object>(items: T[], prefix: string): Persisted<T>[] {
  return items.map((item, index) => ({
    ...item,
    id: `seed-${prefix}-${index}`,
    sort_order: index,
  }))
}

export const seedSettings: SiteSettings = {
  name: site.name,
  shortName: site.shortName,
  tagline: site.tagline,
  description: site.description,
  established: site.established,
  accreditations: [...site.accreditations],
  address: site.contact.address,
  admissionsPhone: site.contact.admissionsPhone,
  generalPhone: site.contact.generalPhone,
  admissionsEmail: site.contact.admissionsEmail,
  generalEmail: site.contact.generalEmail,
  officeHours: site.contact.officeHours,
  mapQuery: site.contact.mapQuery,
}

export function buildSeedSnapshot(): ContentSnapshot {
  return {
    programs: persist(programs, 'programs'),
    faculty: persist(faculty, 'faculty'),
    news: persist(news, 'news'),
    testimonials: persist(testimonials, 'testimonials'),
    recruiters: persist(recruiters, 'recruiters'),
    placementTrend: persist(placementTrend, 'placement-trend'),
    facilities: persist(facilities, 'facilities'),
    gallery: persist(gallery, 'gallery'),
    faqs: persist(admissionFaqs, 'faqs'),
    leadership: persist(leadership, 'leadership'),
    settings: seedSettings,
  }
}

/** Raw seed rows (without ids) for the "populate database" admin action. */
export const seedRows: Record<CollectionKey, object[]> = {
  programs,
  faculty,
  news,
  testimonials,
  recruiters,
  placementTrend,
  facilities,
  gallery,
  faqs: admissionFaqs,
  leadership,
}
