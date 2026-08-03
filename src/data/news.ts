import type { NewsCategory, NewsItem } from './types'

/** Newsroom. Drives `/news`, its category filter, `/news/:slug`, and the home teaser. */
export const news: NewsItem[] = [
  {
    slug: 'admissions-2027-open',
    title: 'Applications open for the MBA Class of 2027',
    date: '2026-07-14',
    category: 'Admissions',
    author: 'Office of Admissions',
    readMinutes: 3,
    excerpt:
      'The application window for all eight specialisations is now open, with the first of three rounds closing on 30 September 2026.',
    body: [
      'Aryabhatta Knowledge University has opened applications for the MBA Class of 2027 across all eight specialisations. The intake remains capped at 480 seats, unchanged from last year, in line with our commitment to a section size of no more than sixty.',
      'Applications are assessed in three rounds. Candidates applying in Round 1 are considered for the full scholarship pool, which this year totals ₹8.4 crore across merit, need-based and diversity awards. Round 1 closes on 30 September 2026, Round 2 on 15 November 2026, and Round 3 on 10 January 2027.',
      'We accept CAT, XAT, GMAT, GRE and MAT scores obtained within the preceding twenty-four months. The Business Analytics & AI specialisation additionally requires an 85th-percentile quantitative score and a programming aptitude assessment conducted on campus.',
      'Shortlisted candidates will be invited to a personal interview and, for most specialisations, a written ability test. Interview slots run from late October through February at our Greater Noida campus, with a limited number of video slots for candidates currently working outside India.',
    ],
  },
  {
    slug: 'record-placements-2026',
    title: 'Class of 2026 closes at 98% placement and ₹18.4 LPA median',
    date: '2026-06-28',
    category: 'Placements',
    author: 'Career Development Centre',
    readMinutes: 4,
    excerpt:
      'A graduating class of 471 received 612 offers from 340 recruiting partners, with the highest package at ₹62 LPA.',
    body: [
      'The final placement report for the Class of 2026 records a 98% placement rate within ninety days of the process opening — the highest in the institution’s history and a one-point improvement on last year.',
      'A graduating class of 471 students received 612 offers in total, meaning a meaningful proportion of the cohort held multiple offers at the point of accepting. The median cost-to-company settled at ₹18.4 lakh per annum, up 12% year on year, while the highest single offer was ₹62 LPA for an investment banking role based in Singapore.',
      'BFSI remained the largest recruiting sector at 26% of the offer book, narrowly ahead of consulting at 22%. The sharpest movement came from technology and analytics, which grew from 15% to 19% of offers, driven almost entirely by demand from the Business Analytics & AI cohort — whose own median of ₹26.8 LPA was the highest of any specialisation.',
      'Three hundred and forty organisations participated, of which forty-one were first-time recruiters at AKU. The Career Development Centre notes that the alumni referral programme originated 94 of the offers made, a figure that has now grown for four consecutive years.',
    ],
  },
  {
    slug: 'capital-markets-lab-expansion',
    title: 'Capital markets lab expands to 48 Bloomberg terminals',
    date: '2026-06-09',
    category: 'Campus',
    author: 'Office of the Dean',
    readMinutes: 2,
    excerpt:
      'A ₹6 crore expansion doubles trading floor capacity and adds a dedicated derivatives simulation room.',
    body: [
      'The Anand Sharma Capital Markets Laboratory has completed a ₹6 crore expansion, doubling its capacity from 24 to 48 Bloomberg terminals and adding a dedicated twelve-seat derivatives simulation room.',
      'The expansion means that, for the first time, an entire Finance section can trade simultaneously during a live market session rather than rotating through the floor in shifts. Professor Nikhil Verma, who runs the trading simulation, notes that the change allows the desk exercises to be run as genuine multi-participant markets, with students taking the other side of each other’s positions.',
      'The lab also houses the student-managed fund, which has run a real ₹2 crore long-only mandate since 2019. Positions are defended each trimester before an investment committee chaired by Dean Ananya Raghavan and staffed by practising portfolio managers.',
    ],
  },
  {
    slug: 'esg-research-grant',
    title: 'Faculty win ₹2.1 crore grant for climate transition research',
    date: '2026-05-22',
    category: 'Research',
    author: 'Research Office',
    readMinutes: 3,
    excerpt:
      'Dr. Priya Nandakumar will lead a three-year study on transition risk pricing in Indian manufacturing.',
    body: [
      'A faculty team led by Dr. Priya Nandakumar has been awarded a ₹2.1 crore research grant to study how transition risk is priced — or, more often, not priced — into the valuations of listed Indian manufacturers.',
      'The three-year study will build a sector-level dataset of Scope 1, 2 and 3 emissions disclosures under the BRSR framework and test whether equity analysts systematically adjust for the capital expenditure implied by announced decarbonisation targets.',
      'Two doctoral candidates and a rotating cohort of six MBA students from the Sustainability & ESG specialisation will work on the project, which the Research Office describes as the largest single grant awarded to the school in the past decade.',
    ],
  },
  {
    slug: 'annual-summit-2026',
    title: 'AKU Business Summit returns in October',
    date: '2026-05-05',
    category: 'Events',
    author: 'Student Affairs',
    readMinutes: 2,
    excerpt:
      'The two-day summit brings 40 speakers across four tracks, with the flagship case competition carrying a ₹10 lakh prize pool.',
    body: [
      'The eleventh AKU Business Summit will take place on 16 and 17 October 2026 at the Greater Noida campus. This year’s theme, "Capital After Certainty", examines investment decision-making in an environment of persistent policy and supply-chain volatility.',
      'Forty speakers will appear across four tracks — capital markets, operations and supply chain, technology and AI, and sustainability. The summit is organised entirely by the student council, which has run it without faculty intervention since 2018.',
      'The flagship case competition, open to teams from any AICTE-approved business school, carries a prize pool of ₹10 lakh. Registrations open on 1 August 2026.',
    ],
  },
  {
    slug: 'exchange-partners-expanded',
    title: 'Three new exchange partners added in South-East Asia',
    date: '2026-04-18',
    category: 'Campus',
    author: 'International Office',
    readMinutes: 2,
    excerpt:
      'The International Business exchange network grows to eleven schools across Europe and Asia.',
    body: [
      'AKU has signed exchange agreements with three additional business schools in Singapore, Ho Chi Minh City and Jakarta, taking the total partner network to eleven institutions across Europe and South-East Asia.',
      'The additions materially widen the options available to the International Business cohort, whose third semester is spent entirely at a partner institution. Professor Daniel Mathew, who convenes the exchange term, notes that student demand had been running well ahead of European capacity for two intakes.',
      'All three agreements are reciprocal, and the school expects to host its first inbound students from the new partners in the January 2027 term.',
    ],
  },
  {
    slug: 'incubator-cohort-five',
    title: 'Campus incubator opens applications for its fifth cohort',
    date: '2026-03-30',
    category: 'Events',
    author: 'AKU Ventures',
    readMinutes: 2,
    excerpt:
      'Selected teams receive ₹15 lakh in pre-seed capital, campus workspace and twelve months of structured mentorship.',
    body: [
      'AKU Ventures, the campus incubator, has opened applications for its fifth cohort. Up to eight teams will be selected, each receiving ₹15 lakh in pre-seed capital, dedicated workspace on campus, and twelve months of structured mentorship.',
      'The incubator is open to current students and to alumni within three years of graduating. Across four previous cohorts, twenty-six ventures have been supported; eleven remain operating, four have raised institutional seed rounds, and two have been acquired.',
      'Professor Arjun Kapadia, who runs the programme, is characteristically blunt about the arithmetic: "Most of what walks through the door should not be a company. The useful part of the year is finding that out cheaply."',
    ],
  },
  {
    slug: 'naac-a-double-plus',
    title: 'AKU re-accredited with NAAC A++ grade',
    date: '2026-02-11',
    category: 'Campus',
    author: 'Office of the Registrar',
    readMinutes: 2,
    excerpt:
      'The school retains the highest available accreditation grade following a five-day peer review.',
    body: [
      'Following a five-day peer team review in January, the National Assessment and Accreditation Council has re-accredited Aryabhatta Knowledge University with an A++ grade and a cumulative grade point average of 3.71 out of 4.',
      'The peer team’s report singled out the industry immersion trimester, the proportion of core faculty with substantive industry backgrounds, and the transparency of the placement reporting process. It recommended further investment in doctoral research output, an area in which the school has already committed to funding six additional fellowships from the 2027 intake.',
      'The accreditation is valid for seven years.',
    ],
  },
]

export const newsCategories: (NewsCategory | 'All')[] = [
  'All',
  'Admissions',
  'Placements',
  'Campus',
  'Research',
  'Events',
]

/** Newest first. All accessors below derive from this, so ordering is defined once. */
const byDateDesc = [...news].sort((a, b) => b.date.localeCompare(a.date))

export function getLatestNews(limit = 3): NewsItem[] {
  return byDateDesc.slice(0, limit)
}

export function getNewsBySlug(slug: string | undefined): NewsItem | undefined {
  return news.find((n) => n.slug === slug)
}

export function getNewsByCategory(category: NewsCategory | 'All'): NewsItem[] {
  if (category === 'All') return byDateDesc
  return byDateDesc.filter((n) => n.category === category)
}

/** "You might also read" rail on the article page. */
export function getRelatedNews(slug: string, limit = 3): NewsItem[] {
  const current = getNewsBySlug(slug)
  const others = byDateDesc.filter((n) => n.slug !== slug)
  if (!current) return others.slice(0, limit)
  const sameCategory = others.filter((n) => n.category === current.category)
  const rest = others.filter((n) => n.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}
