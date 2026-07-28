import type { Leader, Stat } from './types'

export const aboutStory = {
  heading: 'Founded to close a gap that had become embarrassing',
  paragraphs: [
    'Meridian School of Business was established in 1994 by a group of eleven industrialists and academics who shared a specific frustration: the management graduates they were hiring could construct a strategy but had never carried one out. The founding charter committed the school to a curriculum in which every core course would be co-taught by someone who had done the job.',
    'Three decades later that principle has survived contact with growth. Two-thirds of our core faculty held substantive industry positions before joining, and the industry immersion trimester — a full term embedded with a partner organisation, graded by the host rather than by us — remains compulsory for every student in every specialisation.',
    'The school now enrols 480 students a year across eight specialisations on a 200-acre campus in Greater Noida, and counts 21,000 alumni in 46 countries. It has been accredited A++ by NAAC and ranked twelfth nationally by NIRF. We are, by design, not the largest business school in the country, and we have repeatedly declined to become one.',
  ],
}

export const missionVision = [
  {
    title: 'Our mission',
    body: 'To produce managers who can both design a decision and be held to it — by combining academic rigour with sustained, graded exposure to real organisations under real constraints.',
  },
  {
    title: 'Our vision',
    body: 'To be the business school Indian industry turns to first when it needs someone who will still be right in the second year of a plan, not just persuasive in the first week.',
  },
  {
    title: 'Our values',
    body: 'Intellectual honesty over comfortable consensus. Transparency in how we report outcomes. A cohort small enough that no student is anonymous to the faculty who teach them.',
  },
]

export const milestones = [
  { year: '1994', event: 'Founded by eleven industrialists and academics; first cohort of 60 students.' },
  { year: '2001', event: 'Greater Noida campus opens on 200 acres; residential halls admit the first 240 students.' },
  { year: '2008', event: 'Industry immersion trimester made compulsory across all specialisations.' },
  { year: '2014', event: 'Capital Markets Laboratory opens with 24 Bloomberg terminals.' },
  { year: '2019', event: 'Student-managed fund launched with a real ₹2 crore long-only mandate.' },
  { year: '2021', event: 'Business Analytics & AI specialisation introduced; first cohort of 40.' },
  { year: '2024', event: 'Sustainability & ESG specialisation introduced; exchange network reaches eight schools.' },
  { year: '2026', event: 'Re-accredited NAAC A++; placement rate reaches 98% with a ₹18.4 LPA median.' },
]

export const leadership: Leader[] = [
  {
    name: 'Dr. Ananya Raghavan',
    role: 'Dean',
    initials: 'AR',
    message:
      'We are asked, fairly often, why we do not expand the intake. The answer is that a section of sixty is the largest group in which a faculty member can still know how each student thinks. Everything we are good at follows from that constraint, and we intend to keep it.',
  },
  {
    name: 'Mr. Hariprasad Anand',
    role: 'Chairman, Board of Governors',
    initials: 'HA',
    message:
      'The founding group set out to fix a hiring problem we were all living with. Three decades on, the thing I am most pleased about is not the rankings — it is that our graduates are trusted with a P&L earlier than their peers, because they have already answered to one.',
  },
  {
    name: 'Ms. Ritika Sen',
    role: 'Registrar',
    initials: 'RS',
    message:
      'We publish our placement data in full, including the cohorts and the specialisations that had a difficult year. Prospective students are making a two-year financial decision, and they are entitled to the unflattering numbers alongside the flattering ones.',
  },
]

export const institutionStats: Stat[] = [
  { label: 'Years of teaching', value: 32, suffix: '', note: 'Founded in 1994' },
  { label: 'Alumni worldwide', value: 21, suffix: 'k+', note: 'Across 46 countries' },
  { label: 'Core faculty', value: 84, suffix: '', note: '67% with prior industry roles' },
  { label: 'Campus', value: 200, suffix: ' acres', note: 'Greater Noida, Uttar Pradesh' },
]

export const alumniNetwork = {
  heading: 'A network that answers the phone',
  body: 'Twenty-one thousand alumni across 46 countries, organised into sector chapters with a named lead in each of our top fourteen recruiting industries. The referral programme originated 94 of the offers made to the Class of 2026 — a figure that has grown for four consecutive years. Chapter dinners run quarterly in eleven cities, and the mentorship register pairs every second-year student with an alumnus in their target sector.',
  chapters: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Singapore', 'Dubai', 'London', 'New York', 'Sydney'],
}
