import type { NavLink, Stat } from './types'

/**
 * Institution-wide identity. The navbar, footer, contact page and document
 * titles all read from here — rename the university in one place.
 */
export const site = {
  name: 'Meridian School of Business',
  shortName: 'Meridian',
  monogram: 'M',
  parentUniversity: 'Meridian University',
  tagline: 'Where ambition meets rigour.',
  established: 1994,
  description:
    'An AICTE-approved, NAAC A++ accredited business school offering eight MBA specialisations, taught by a faculty drawn from industry and the world’s leading research universities.',
  accreditations: ['NAAC A++', 'AICTE Approved', 'AACSB Member', 'NIRF Rank 12'],
  contact: {
    address: 'Meridian Knowledge Park, Sector 62, Greater Noida, Uttar Pradesh 201310',
    admissionsPhone: '+91 120 480 1200',
    generalPhone: '+91 120 480 1100',
    admissionsEmail: 'admissions@meridian.edu.in',
    generalEmail: 'hello@meridian.edu.in',
    officeHours: 'Monday – Saturday, 9:00 AM – 6:00 PM IST',
    mapQuery: 'Greater Noida, Uttar Pradesh, India',
  },
  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
    { label: 'X', href: 'https://x.com' },
  ],
} as const

/** Primary navigation. `/programs` renders a data-driven dropdown of specialisations. */
export const navLinks: NavLink[] = [
  { label: 'Programmes', to: '/programs' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Placements', to: '/placements' },
  { label: 'Campus', to: '/campus' },
  { label: 'News', to: '/news' },
  { label: 'About', to: '/about' },
]

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Study',
    links: [
      { label: 'All Programmes', to: '/programs' },
      { label: 'Admissions', to: '/admissions' },
      { label: 'Fees & Scholarships', to: '/admissions#fees' },
      { label: 'Eligibility', to: '/admissions#eligibility' },
    ],
  },
  {
    heading: 'Institution',
    links: [
      { label: 'About Meridian', to: '/about' },
      { label: 'Faculty', to: '/faculty' },
      { label: 'Campus Life', to: '/campus' },
      { label: 'News & Events', to: '/news' },
    ],
  },
  {
    heading: 'Outcomes',
    links: [
      { label: 'Placements', to: '/placements' },
      { label: 'Recruiters', to: '/placements#recruiters' },
      { label: 'Alumni Network', to: '/about#alumni' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

/** The headline stat strip on the home page. */
export const heroStats: Stat[] = [
  { label: 'Placement rate', value: 98, suffix: '%', note: 'Class of 2026, within 90 days' },
  { label: 'Median CTC', value: 18.4, prefix: '₹', suffix: ' LPA', note: 'Up 12% year on year' },
  { label: 'Recruiting partners', value: 340, suffix: '+', note: 'Across 14 sectors' },
  { label: 'Alumni worldwide', value: 21, suffix: 'k', note: 'In 46 countries' },
]

/** Differentiators surfaced on the home page. */
export const whyMeridian = [
  {
    title: 'Taught by practitioners',
    body: 'Two-thirds of our core faculty have led functions at Fortune 500 firms before returning to the classroom. Cases are drawn from deals they closed.',
    icon: 'people' as const,
  },
  {
    title: 'A live capital markets lab',
    body: '48 Bloomberg terminals, a real ₹2 crore student-managed fund, and a trading floor that mirrors an institutional desk tick for tick.',
    icon: 'chart' as const,
  },
  {
    title: 'Industry immersion, not internships',
    body: 'Every student spends a full trimester embedded with a partner organisation, owning a P&L-linked deliverable that is graded by the host.',
    icon: 'globe' as const,
  },
  {
    title: 'A cohort worth learning from',
    body: 'We cap intake at 480 across eight specialisations. The median admit brings 34 months of work experience from 19 industries.',
    icon: 'cpu' as const,
  },
]
