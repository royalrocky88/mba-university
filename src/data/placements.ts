import type { PlacementYear, Recruiter, Stat } from './types'

/** Headline numbers for the `/placements` hero. */
export const placementStats: Stat[] = [
  { label: 'Students placed', value: 98, suffix: '%', note: 'Class of 2026, within 90 days' },
  { label: 'Highest CTC', value: 62, prefix: '₹', suffix: ' LPA', note: 'Investment banking, Singapore' },
  { label: 'Median CTC', value: 18.4, prefix: '₹', suffix: ' LPA', note: 'Across all specialisations' },
  { label: 'Offers made', value: 612, suffix: '', note: 'To a graduating class of 471' },
]

/** Six-year trend — rendered as a pure-SVG bar chart, no charting library. */
export const placementTrend: PlacementYear[] = [
  { year: '2021', placedPct: 89, averageLPA: 11.2, highestLPA: 34, offers: 402 },
  { year: '2022', placedPct: 92, averageLPA: 12.8, highestLPA: 41, offers: 448 },
  { year: '2023', placedPct: 94, averageLPA: 14.1, highestLPA: 46, offers: 489 },
  { year: '2024', placedPct: 95, averageLPA: 15.6, highestLPA: 52, offers: 528 },
  { year: '2025', placedPct: 97, averageLPA: 16.9, highestLPA: 58, offers: 574 },
  { year: '2026', placedPct: 98, averageLPA: 18.4, highestLPA: 62, offers: 612 },
]

export const recruiters: Recruiter[] = [
  { name: 'Aurelius Capital', sector: 'Investment Banking' },
  { name: 'Northwind Consulting', sector: 'Strategy Consulting' },
  { name: 'Vertex Analytics', sector: 'Data & AI' },
  { name: 'Kestrel Retail Group', sector: 'Retail & FMCG' },
  { name: 'Solaris Energy', sector: 'Energy & Utilities' },
  { name: 'Meridian Health Systems', sector: 'Healthcare' },
  { name: 'BlueHarbour Logistics', sector: 'Supply Chain' },
  { name: 'Cobalt Software', sector: 'Enterprise SaaS' },
  { name: 'Ashwood & Partners', sector: 'Professional Services' },
  { name: 'Indus Manufacturing', sector: 'Industrial' },
  { name: 'Sable Insurance', sector: 'Insurance' },
  { name: 'Lantern Media', sector: 'Media & Entertainment' },
  { name: 'Quantum Pharma', sector: 'Pharmaceuticals' },
  { name: 'Peregrine Telecom', sector: 'Telecommunications' },
  { name: 'Ironbark Realty', sector: 'Real Estate' },
  { name: 'Verdant Agritech', sector: 'Agriculture' },
]

/** Sector-wise split of the 2026 offer book. Values are percentages and sum to 100. */
export const sectorSplit = [
  { sector: 'Consulting', pct: 22 },
  { sector: 'BFSI', pct: 26 },
  { sector: 'Technology & Analytics', pct: 19 },
  { sector: 'FMCG & Retail', pct: 13 },
  { sector: 'Healthcare', pct: 8 },
  { sector: 'Manufacturing & Energy', pct: 7 },
  { sector: 'Others', pct: 5 },
]

/** The support students actually receive, listed on `/placements`. */
export const placementSupport = [
  {
    title: 'Career Development Centre',
    body: 'A dedicated team of nine, including three former recruiters, working with students from the first week of semester I.',
  },
  {
    title: 'Mock interview circuit',
    body: 'Every student sits a minimum of six recorded mock interviews with alumni before the first live process opens.',
  },
  {
    title: 'Résumé and profile clinics',
    body: 'One-to-one clinics run each fortnight; no student enters a process without a reviewed and signed-off profile.',
  },
  {
    title: 'Alumni referral network',
    body: 'A structured referral programme across 21,000 alumni, with sector leads in each of our top fourteen recruiting industries.',
  },
]

/** Convenience accessor for the home-page teaser. */
export function getLatestPlacementYear(): PlacementYear {
  return placementTrend[placementTrend.length - 1]
}
