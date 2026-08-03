import type { Leader, Stat } from './types'

export const aboutStory = {
  heading: 'A state university built to organise professional education in Bihar',
  paragraphs: [
    'Aryabhatta Knowledge University was established by the Government of Bihar through the Aryabhatta Knowledge University Act, 2008 (Bihar Act 24 of 2008), and began functioning in March 2010. It is a collegiate state university with jurisdiction across the whole of Bihar, named after the mathematician and astronomer Aryabhatta.',
    'The University was created to develop and manage professional and general higher education across the state — management, law, journalism, engineering and technology, medicine, public health, pharmacy, nursing and education among them — rather than to teach a single discipline on a single campus.',
    'The Master of Business Administration is taught under the School of Management Teachings and governed by the University ordinances: four semesters across two academic years, 120 credits, twenty-four papers, and a summer training programme carried out with a host organisation. The ordinance on this site is the authoritative statement of those rules.',
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
  { year: '2008', event: 'Aryabhatta Knowledge University Act, 2008 (Bihar Act 24 of 2008) passed by the Bihar legislature.' },
  { year: '2010', event: 'University begins functioning on 19 March 2010, with jurisdiction across the state of Bihar.' },
  { year: '2011', event: 'Affiliation extended across engineering, management, medicine, pharmacy, nursing, education and law.' },
  { year: '2013', event: 'School of Management Teachings constituted to run the MBA programme.' },
  { year: '2015', event: 'MBA ordinances adopted: four semesters, 120 credits, 75% attendance, CIA and end-semester evaluation.' },
  { year: '2017', event: 'Centres established for Geographical Studies, River Studies and Journalism & Mass Communication.' },
  { year: '2019', event: 'Patliputra School of Economics added to the University’s teaching centres.' },
  { year: '2021', event: 'Admissions and examination moved onto the University’s own online systems.' },
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
