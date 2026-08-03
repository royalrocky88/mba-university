import type { NavLink, Stat } from './types'

/**
 * Institution-wide identity. The navbar, footer, contact page and document
 * titles all read from here — rename the university in one place.
 */
export const site = {
  name: 'Aryabhatta Knowledge University',
  shortName: 'AKU',
  monogram: 'A',
  parentUniversity: 'Government of Bihar',
  tagline: 'Master of Business Administration, Patna.',
  established: 2008,
  description:
    'The MBA programme of Aryabhatta Knowledge University, Patna — a collegiate state university established by the Aryabhatta Knowledge University Act, 2008. A two-year, four-semester, 120-credit programme governed by the University ordinances.',
  accreditations: ['State University', 'Bihar Act 24 of 2008', 'UGC Recognised', 'Functioning since 2010'],
  contact: {
    address: 'Gyan Parisar, Mithapur, Patna, Bihar 800001',
    admissionsPhone: '+91 612 295 2741',
    generalPhone: '+91 612 295 2752',
    admissionsEmail: 'akuniv10@gmail.com',
    generalEmail: 'akuniv10@gmail.com',
    officeHours: 'Monday – Saturday, 10:00 AM – 5:00 PM IST',
    mapQuery: 'Aryabhatta Knowledge University, Mithapur, Patna, Bihar',
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
      { label: 'About AKU', to: '/about' },
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
export const whyAKU = [
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
