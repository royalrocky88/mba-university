import type { Facility, GalleryItem } from './types'

export const campusIntro = {
  heading: 'Two hundred acres, built for the way work actually happens',
  body: 'The Greater Noida campus was designed around a simple observation: most of an MBA happens outside the lecture theatre. Study rooms outnumber classrooms three to one, the library runs twenty-four hours through both examination terms, and every academic block opens onto shared ground so cohorts collide rather than pass.',
  acres: 200,
  builtUpLakhSqFt: 9.4,
}

export const facilities: Facility[] = [
  {
    title: 'Chandrika Rao Library',
    description:
      'Four floors, 92,000 volumes and subscriptions to 240 journals and every major financial database. Open twenty-four hours through both examination terms.',
    icon: 'library',
    stat: '24/7 in term',
  },
  {
    title: 'Capital Markets Laboratory',
    description:
      '48 Bloomberg terminals on a live trading floor, plus a twelve-seat derivatives simulation room and the desk that runs the student-managed fund.',
    icon: 'lab',
    stat: '48 terminals',
  },
  {
    title: 'Residential Halls',
    description:
      'Six halls housing 820 students in single and twin rooms, each with its own common room, pantry and twenty-four-hour study lounge.',
    icon: 'hostel',
    stat: '820 beds',
  },
  {
    title: 'Sports Complex',
    description:
      'An eight-lane track, floodlit cricket and football grounds, four tennis courts, a 25-metre pool and a gymnasium open from five in the morning.',
    icon: 'sports',
    stat: '14 disciplines',
  },
  {
    title: 'Sabarmati Auditorium',
    description:
      'A 900-seat auditorium with full broadcast infrastructure, home to the annual Business Summit and the weekly practitioner lecture series.',
    icon: 'auditorium',
    stat: '900 seats',
  },
  {
    title: 'Dining & Cafés',
    description:
      'A central refectory seating 600, four satellite cafés across the academic blocks, and a night canteen that keeps going until two in the morning.',
    icon: 'cafe',
    stat: '5 outlets',
  },
  {
    title: 'Meridian Ventures Incubator',
    description:
      'Dedicated workspace for eight resident startup teams, a hardware prototyping bay and a pitch room wired for investor calls.',
    icon: 'incubator',
    stat: '26 ventures',
  },
  {
    title: 'Campus-wide Connectivity',
    description:
      'Wi-Fi 6E across all 200 acres with a 10 Gbps backbone, redundant power on every academic block, and a GPU cluster available to analytics coursework.',
    icon: 'wifi',
    stat: '10 Gbps',
  },
]

/**
 * Gallery tiles. `tone` holds the Tailwind gradient used as a stand-in for
 * photography — replace each with an <img> once real campus images are available;
 * the component already reserves the correct aspect ratio.
 */
export const gallery: GalleryItem[] = [
  {
    title: 'The Quadrangle',
    caption: 'The central lawn at the end of Michaelmas term, ringed by the four original academic blocks.',
    tone: 'from-ink-800 via-ink-600 to-ink-400',
    span: 'wide',
  },
  {
    title: 'Trading Floor',
    caption: 'The capital markets lab during a live session — 48 terminals, one very quiet room.',
    tone: 'from-ink-950 via-ink-800 to-gold-600',
    span: 'normal',
  },
  {
    title: 'Library Atrium',
    caption: 'Four floors of reading rooms around a full-height atrium, lit from a glazed roof.',
    tone: 'from-gold-600 via-gold-500 to-gold-300',
    span: 'tall',
  },
  {
    title: 'Convocation',
    caption: 'The Class of 2026 crossing the Sabarmati stage on a wet afternoon in June.',
    tone: 'from-ink-700 via-ink-500 to-ink-300',
    span: 'normal',
  },
  {
    title: 'Residential Halls',
    caption: 'Hall Three at dusk. Common rooms stay lit well past the point that is defensible.',
    tone: 'from-ink-900 via-ink-700 to-ink-500',
    span: 'normal',
  },
  {
    title: 'Sports Ground',
    caption: 'The inter-hall final under floodlights, which is taken considerably more seriously than it should be.',
    tone: 'from-ink-600 via-ink-500 to-gold-400',
    span: 'wide',
  },
  {
    title: 'Case Room',
    caption: 'Tiered case rooms seating sixty, arranged so every student can see every other student.',
    tone: 'from-ink-800 via-ink-700 to-ink-600',
    span: 'normal',
  },
  {
    title: 'Incubator Bay',
    caption: 'Meridian Ventures, late in the pitch cycle, in its usual state of controlled disorder.',
    tone: 'from-gold-500 via-gold-400 to-ink-400',
    span: 'normal',
  },
]

/** Student life, listed on `/campus`. */
export const studentLife = [
  {
    title: '31 student-run clubs',
    body: 'From the Finance & Investment Society to the campus radio station, every club is student-founded and student-funded through a council-administered budget.',
  },
  {
    title: 'The council runs the summit',
    body: 'The annual Business Summit — forty speakers, two days, a ₹10 lakh case competition — has been organised entirely by students without faculty intervention since 2018.',
  },
  {
    title: 'Compulsory community engagement',
    body: 'Every student contributes forty hours to a partnered non-profit across the two years. It is graded, and it is not optional.',
  },
  {
    title: 'Inter-hall championship',
    body: 'Six halls, fourteen disciplines, one trophy, and a level of institutional memory about past results that visiting alumni find alarming.',
  },
]
