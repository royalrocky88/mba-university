import type { ContentSnapshot } from '@/lib/repository'
import { formatDate, formatINR, formatLakh } from '@/lib/utils'
import {
  admissionSteps,
  feeStructure,
  generalEligibility,
  importantDates,
  scholarships,
} from '@/data/admissions'
import { placementStats, placementSupport, sectorSplit } from '@/data/placements'
import { campusIntro, studentLife } from '@/data/campus'
import { aboutStory, milestones } from '@/data/about'
import { whyAKU } from '@/data/site'
import { bestNameMatch, hasAny, normalize, overlapScore, tokenize } from './text'
import { isHinglish, localise, translateQuery } from './hinglish'
import type { ChatAnswer, ChatLink } from './types'

export type { ChatAnswer, ChatLink }

/**
 * The admissions assistant.
 *
 * Answers are composed from the live `ContentSnapshot`, so anything an
 * administrator edits — a new specialisation, a changed fee, a fresh news post —
 * is reflected in the bot's replies immediately, with no retraining and no
 * separate knowledge base to keep in sync.
 *
 * The pipeline is: rule-based intent match first (precise, hand-written answers
 * for the questions visitors actually ask), then a scored retrieval fallback
 * across every content record, then a scope guard that declines politely and
 * redirects rather than inventing an answer.
 */

type Intent = {
  id: string
  /** Substrings that trigger this intent, checked against the normalised query. */
  triggers: string[]
  /** Optional extra guard, for intents that need two signals to fire. */
  guard?: (query: string) => boolean
  answer: (content: ContentSnapshot, query: string) => ChatAnswer | null
  /** Higher runs first. Defaults to 0. */
  priority?: number
}

const listOf = (items: string[]) => items.map((item) => `• ${item}`).join('\n')

// ---------------------------------------------------------------------------
// Scope guard
//
// Intents match on substrings, which makes them cheap and predictable but also
// blind to context: "is there a dress code" and "is there a dress code at
// Google" trigger the same rule, and answering the second one with our dress
// code is worse than saying nothing. The lists below run before intent matching
// and catch the case where a question borrows our vocabulary to ask about
// somewhere else.
//
// This is a blunt instrument by design. A false decline costs the visitor one
// rephrase; a false answer puts a confident, wrong statement about another
// organisation in our name.
// ---------------------------------------------------------------------------

/** Named organisations we can never speak for. */
const FOREIGN_ORGANISATIONS = [
  'google', 'microsoft', 'amazon', 'netflix', 'facebook', 'instagram', 'linkedin',
  'infosys', 'tcs$', 'wipro', 'cognizant', 'capgemini',
  'harvard', 'stanford', 'wharton', 'insead', 'oxford', 'cambridge',
  'iim$', 'iims$', 'iit$', 'iits$', 'nit$', 'bits$', 'symbiosis', 'amity', 'ignou',
  'american universit', 'foreign universit', 'other universit', 'other college',
]

/** Subject matter that shares our vocabulary but none of our scope. */
const FOREIGN_TOPICS = [
  'bitcoin', 'crypto', 'nifty', 'sensex', 'stock market', 'share market', 'mutual fund',
  'passport', 'visa applic', 'driving licen', 'aadhaar', 'pan card', 'income tax',
  'volvo', 'poem', 'joke', 'prime minister', 'president of', 'world cup', 'cricket',
  'weather', 'recipe', 'python script', 'javascript', 'harry potter',
]

/** Places that are not where we are. Only disqualifying with no anchor to us. */
const ELSEWHERE = [
  'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'pune', 'hyderabad',
  'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'kerala', 'london', 'new york',
  'dubai', 'singapore',
]

/** Words that tie a question back to this school. */
const SELF_ANCHORS = [
  'aku', 'campus', 'college', 'school', 'universit', 'hostel', 'mba',
  'admission', 'placement', 'faculty', 'programme', 'program', 'course', 'class',
  'student', 'here$', 'your', 'you$', 'apka', 'aapka', 'apke', 'aapke', 'hamare', 'hamari',
]

/**
 * True when the question is anchored somewhere other than this school.
 *
 * A place name only disqualifies a question when nothing else ties it back to
 * us — "how do I reach the campus from Delhi" is ours, "how do I reach Mumbai
 * from Delhi" is not.
 */
function asksAboutSomewhereElse(query: string): boolean {
  if (hasAny(query, FOREIGN_ORGANISATIONS)) return true
  if (hasAny(query, FOREIGN_TOPICS)) return true
  if (hasAny(query, ELSEWHERE) && !hasAny(query, SELF_ANCHORS)) return true
  return false
}

// ---------------------------------------------------------------------------
// Intents
// ---------------------------------------------------------------------------

const intents: Intent[] = [
  // --- conversational ------------------------------------------------------
  {
    id: 'greeting',
    priority: 90,
    triggers: ['hello', 'hi$', 'hey$', 'namaste', 'good morning', 'good afternoon', 'good evening', 'salaam'],
    guard: (q) => q.length < 32,
    answer: (content) => ({
      text: [
        `Hello — I'm the ${content.settings.shortName} admissions assistant.`,
        `I can answer anything on this site: our ${content.programs.length} MBA specialisations, fees and scholarships, eligibility, the admission process, placements, faculty, campus facilities and the latest news.`,
        'What would you like to know?',
      ],
      chips: ['Which programmes do you offer?', 'What are the fees?', 'How do I apply?', 'Placement record'],
    }),
  },
  {
    id: 'thanks',
    priority: 90,
    triggers: ['thank', 'thanks', 'shukriya', 'dhanyavad', 'appreciate it'],
    answer: () => ({
      text: ['Happy to help. Ask me anything else about the programmes, admissions or campus.'],
      chips: ['Talk to admissions', 'Scholarships', 'Campus facilities'],
    }),
  },
  {
    id: 'bye',
    priority: 90,
    triggers: ['bye', 'goodbye', 'see you', 'that is all', "that's all"],
    answer: (content) => ({
      text: [
        'Thanks for visiting. If you would like to speak to a person, admissions are on ' +
          `**${content.settings.admissionsPhone}** or **${content.settings.admissionsEmail}**.`,
      ],
      links: [{ label: 'Contact page', to: '/contact' }],
    }),
  },
  {
    id: 'capabilities',
    priority: 88,
    triggers: ['what can you do', 'who are you', 'what are you', 'how can you help', 'help me'],
    // "who are you" is a substring of "who are your parents". Personal
    // questions about the assistant are not questions about the school.
    guard: (q) => !hasAny(q, ['parent', 'mother', 'father', 'family', 'married', 'age$', 'human', 'real person']),
    answer: (content) => ({
      text: [
        `I'm an assistant for the ${content.settings.name} website. Everything I tell you comes from this site's own content, so it stays current when the school updates it.`,
        'I can help with:',
        listOf([
          `All ${content.programs.length} MBA specialisations — curriculum, fees, seats, careers`,
          'Admission process, eligibility, entrance exams and deadlines',
          'Fee structure, scholarships and education loans',
          'Placement statistics, recruiters and sector split',
          `Faculty profiles (${content.faculty.length} members) and their expertise`,
          'Campus facilities, hostels and student life',
          'Latest news and announcements',
          'Contact details and how to reach the campus',
        ]),
      ],
      chips: ['Compare programmes', 'Admission deadlines', 'Highest package'],
    }),
  },

  // --- programmes ----------------------------------------------------------
  {
    id: 'program-specific',
    priority: 80,
    triggers: [
      'finance', 'financial', 'marketing', 'analytic', 'human resource', 'hr$', 'operation',
      'supply chain', 'international business', 'sustainab', 'esg$', 'healthcare', 'hospital',
    ],
    answer: (content, query) => {
      const program = bestNameMatch(
        query,
        content.programs,
        (p) => `${p.shortTitle} ${p.title} ${p.department}`,
      )
      if (!program) return null

      const wantsCurriculum = hasAny(query, ['curriculum', 'syllabus', 'subject', 'course structure', 'semester'])
      const wantsCareer = hasAny(query, ['career', 'job', 'role', 'work after', 'profile'])
      const wantsFee = hasAny(query, ['fee', 'cost', 'price', 'charge'])

      if (wantsCurriculum) {
        return {
          text: [
            `**${program.title}** — curriculum across ${program.curriculum.length} semesters:`,
            ...program.curriculum.map((sem) => `**${sem.title}**\n${listOf(sem.subjects)}`),
          ],
          links: [{ label: `Full ${program.shortTitle} page`, to: `/programs/${program.slug}` }],
          chips: [`${program.shortTitle} fees`, `${program.shortTitle} careers`, 'Eligibility'],
        }
      }

      if (wantsCareer) {
        return {
          text: [
            `Graduates of **${program.title}** typically move into:`,
            listOf(program.careers),
            `The median CTC for this specialisation was **₹${program.medianCtcLPA} LPA** in the most recent placement cycle.`,
          ],
          links: [
            { label: `${program.shortTitle} programme`, to: `/programs/${program.slug}` },
            { label: 'Placement report', to: '/placements' },
          ],
          chips: [`${program.shortTitle} curriculum`, 'Which recruiters visit?'],
        }
      }

      if (wantsFee) {
        return {
          text: [
            `**${program.title}** costs **${formatINR(program.annualFeeINR)} per year** in tuition (${formatLakh(program.annualFeeINR * program.durationYears)} across the full ${program.durationYears}-year programme).`,
            'Residential charges, dining and course materials are billed separately — the full breakdown is on the admissions page.',
            'Scholarships of up to 100% of tuition are awarded automatically on merit; there is no separate application.',
          ],
          links: [
            { label: 'Fee structure & scholarships', to: '/admissions#fees' },
            { label: `${program.shortTitle} programme`, to: `/programs/${program.slug}` },
          ],
          chips: ['Are education loans available?', 'Scholarship criteria'],
        }
      }

      return {
        text: [
          `**${program.title}**`,
          program.tagline,
          program.overview,
          listOf([
            `Duration: ${program.durationYears} years, ${program.mode}`,
            `Seats: ${program.seats}`,
            `Tuition: ${formatINR(program.annualFeeINR)} per year`,
            `Median CTC: ₹${program.medianCtcLPA} LPA`,
            `Department: ${program.department}`,
          ]),
        ],
        links: [
          { label: `Full ${program.shortTitle} page`, to: `/programs/${program.slug}` },
          { label: 'Apply now', to: '/admissions' },
        ],
        chips: [
          `${program.shortTitle} curriculum`,
          `${program.shortTitle} eligibility`,
          `${program.shortTitle} careers`,
        ],
      }
    },
  },
  {
    id: 'programs-list',
    priority: 70,
    triggers: [
      'programme', 'program', 'course', 'specialis', 'specializ', 'stream', 'branch', 'what do you offer',
      'which mba', 'list of', 'subjects offered',
    ],
    answer: (content) => ({
      text: [
        `We offer **${content.programs.length} MBA specialisations**, all two-year full-time programmes:`,
        content.programs
          .map((p) => `• **${p.shortTitle}** — ${p.seats} seats, ${formatLakh(p.annualFeeINR)}/yr, median ₹${p.medianCtcLPA} LPA`)
          .join('\n'),
        'Tell me which one interests you and I will give you the curriculum, careers and eligibility.',
      ],
      links: [{ label: 'Compare all programmes', to: '/programs' }],
      chips: content.programs.slice(0, 4).map((p) => p.shortTitle),
    }),
  },
  {
    id: 'program-recommend',
    priority: 82,
    // Split into a choice word plus a subject word rather than fixed phrases:
    // Hinglish word order ("kaunsa programme lena chahiye") never produces the
    // contiguous English phrase a `'which programme should'` trigger needs.
    triggers: ['should', 'recommend', 'suggest', 'choose', 'best', 'confused', 'better', 'prefer'],
    guard: (q) => hasAny(q, ['programme', 'program', 'course', 'specialis', 'specializ', 'stream', 'mba']),
    answer: (content) => {
      const topPaying = [...content.programs].sort((a, b) => b.medianCtcLPA - a.medianCtcLPA)[0]
      return {
        text: [
          'That depends on where you want to end up rather than on which programme looks strongest on paper. A rough guide:',
          listOf([
            '**Finance** — investment banking, equity research, PE, corporate treasury',
            '**Business Analytics & AI** — data science, product analytics, decision science',
            '**Marketing** — brand management, growth, category and product marketing',
            '**Operations** — supply chain, procurement, plant and network management',
            '**Human Resources** — HR business partnering, people analytics, org design',
            '**International Business** — cross-border strategy, trade, country management',
            '**Sustainability & ESG** — climate risk, ESG assurance, impact investing',
            '**Healthcare Management** — hospital administration, health-tech, payer strategy',
          ]),
          `By median outcome, **${topPaying.shortTitle}** currently leads at ₹${topPaying.medianCtcLPA} LPA — but the honest answer is that the specialisation you will work hardest at is the one that pays best.`,
          `You may rank up to three preferences on a single application, so you do not have to decide finally today.`,
        ],
        links: [
          { label: 'Compare all programmes', to: '/programs' },
          { label: 'Talk to admissions', to: '/contact' },
        ],
        chips: ['Finance details', 'Business Analytics details', 'Placement by specialisation'],
      }
    },
  },

  // --- fees & money --------------------------------------------------------
  {
    id: 'scholarship',
    priority: 78,
    triggers: ['scholarship', 'financial aid', 'waiver', 'concession', 'free seat', 'stipend'],
    answer: () => ({
      text: [
        'There are four scholarship schemes, and every offer letter carries its scholarship decision — so you never have to accept a seat before knowing what it costs:',
        scholarships.map((s) => `• **${s.title}** — ${s.amount}\n  ${s.body}`).join('\n'),
        'Round 1 applicants are assessed against the entire scholarship pool, which is the main practical reason to apply early.',
      ],
      links: [{ label: 'Fees & scholarships', to: '/admissions#fees' }],
      chips: ['Total fee', 'Education loan', 'Round 1 deadline'],
    }),
  },
  {
    id: 'loan',
    priority: 78,
    triggers: ['loan', 'emi', 'instal', 'financ my', 'pay in part'],
    answer: () => ({
      text: [
        'Yes — we have arrangements with seven scheduled banks and two non-banking lenders. Admitted students typically receive a pre-approved sanction letter within ten working days of accepting a seat.',
        'Tuition is also payable in two instalments per academic year rather than as a single upfront sum.',
        'The school does not receive commission from any lender on the panel.',
      ],
      links: [{ label: 'Fee structure', to: '/admissions#fees' }],
      chips: ['Fee structure', 'Scholarships'],
    }),
  },
  {
    id: 'fees',
    priority: 74,
    triggers: ['fee', 'fees', 'cost', 'price', 'expensive', 'how much', 'charges', 'tuition', 'budget', 'total expense'],
    answer: (content) => {
      const cheapest = [...content.programs].sort((a, b) => a.annualFeeINR - b.annualFeeINR)[0]
      const priciest = [...content.programs].sort((a, b) => b.annualFeeINR - a.annualFeeINR)[0]
      return {
        text: [
          `Tuition ranges from **${formatINR(cheapest.annualFeeINR)}** (${cheapest.shortTitle}) to **${formatINR(priciest.annualFeeINR)}** (${priciest.shortTitle}) per academic year.`,
          'On top of tuition, per year:',
          listOf(
            feeStructure.rows
              .filter((r) => !r.head.startsWith('Tuition'))
              .map((r) => `${r.head}: ${r.year1}`),
          ),
          feeStructure.note,
          'Scholarships of up to 100% of tuition are awarded on merit, and education loans are available through a panel of nine lenders.',
        ],
        links: [
          { label: 'Full fee structure', to: '/admissions#fees' },
          { label: 'Scholarships', to: '/admissions#fees' },
        ],
        chips: ['Scholarships', 'Education loan', 'Fees for Finance'],
      }
    },
  },

  // --- admissions ----------------------------------------------------------
  {
    id: 'eligibility',
    priority: 76,
    triggers: ['eligib', 'criteria', 'qualif', 'requirement', 'am i eligible', 'can i apply', 'percentage required', 'minimum marks', 'who can apply'],
    answer: () => ({
      text: [
        'General eligibility for the full-time MBA:',
        listOf(generalEligibility),
        'Individual specialisations add their own requirements — Business Analytics & AI, for instance, wants an 85th-percentile quantitative score and a programming aptitude assessment.',
      ],
      links: [
        { label: 'Eligibility in full', to: '/admissions#eligibility' },
        { label: 'Programme-specific criteria', to: '/programs' },
      ],
      chips: ['Which entrance exams?', 'Do I need work experience?', 'How do I apply?'],
    }),
  },
  {
    id: 'entrance-exam',
    priority: 79,
    // Exam codes are exact-word matches — see `hasAny` for why.
    triggers: ['cat$', 'xat$', 'gmat$', 'gre$', 'mat$', 'cmat$', 'nmat$', 'snap$', 'cet$', 'atma$', 'entrance exam', 'entrance test', 'which exam', 'percentile', 'score required'],
    answer: (_content, query) => ({
      text: [
        'We accept **CAT, XAT, GMAT, GRE and MAT** scores obtained within the preceding twenty-four months, with no preference given to one over another. If you hold more than one valid score we consider the strongest.',
        // Naming an exam we do not take is the single most common way to waste
        // an applicant's round, so say it plainly rather than leaving them to
        // infer it from a list.
        ...(hasAny(query, ['cmat$', 'nmat$', 'snap$', 'cet$', 'atma$'])
          ? ['That list is exhaustive — CMAT, NMAT, SNAP, state CETs and ATMA are **not** accepted. If you hold one of those, you would need a valid score from an accepted exam to apply.']
          : []),
        'Percentile expectations vary by specialisation:',
        listOf([
          'Business Analytics & AI — 85th percentile or above in quantitative',
          'Finance — 75th percentile or above in quantitative',
          'Operations — 70th percentile or above in quantitative',
          'All other specialisations — no fixed quantitative cut-off',
        ]),
        'Shortlisted candidates also sit a thirty-minute written ability test on the interview day, assessed for structure and argument rather than for a correct answer.',
      ],
      links: [{ label: 'Admission process', to: '/admissions' }],
      chips: ['Application deadlines', 'Interview process', 'Eligibility'],
    }),
  },
  {
    id: 'deadline',
    priority: 80,
    triggers: ['deadline', 'last date', 'important date', 'when to apply', 'application close', 'round 1', 'round 2', 'round 3', 'admission open', 'when does admission'],
    answer: () => ({
      text: [
        'Key dates for the current admission cycle:',
        importantDates
          .map((d) => `• ${d.label} — **${formatDate(d.date)}**${d.status === 'open' ? '  _(open now)_' : ''}`)
          .join('\n'),
        'Applications are assessed in three rounds. Applying in Round 1 puts you in front of the full scholarship pool, which later rounds cannot offer.',
      ],
      links: [{ label: 'Admissions', to: '/admissions' }],
      chips: ['How do I apply?', 'Scholarships', 'Eligibility'],
    }),
  },
  {
    id: 'how-to-apply',
    priority: 75,
    // Bare 'admission' / 'apply' land here by default. More specific intents —
    // deadline (80), eligibility (76) — outrank this, so "admission last date"
    // and "admission eligibility" still go where they should.
    triggers: ['how to apply', 'how do i apply', 'application process', 'admission', 'apply', 'admission procedure', 'steps to', 'registration', 'form fill'],
    answer: () => ({
      text: [
        'The process runs in six steps:',
        admissionSteps.map((s) => `**${s.step}. ${s.title}** _(${s.window})_\n${s.description}`).join('\n\n'),
      ],
      links: [
        { label: 'Start your application', to: '/admissions#apply' },
        { label: 'Important dates', to: '/admissions' },
      ],
      chips: ['Application fee', 'Eligibility', 'Which entrance exams?'],
    }),
  },
  {
    id: 'work-experience',
    priority: 79,
    triggers: ['work experience', 'fresher', 'experience required', 'need experience', 'without experience', 'job experience'],
    answer: () => ({
      text: [
        'No work experience is required. Roughly a fifth of each intake joins directly from an undergraduate degree.',
        'That said, the median admit brings **thirty-four months** of experience across nineteen industries, and classroom discussion assumes some professional context. Candidates joining as freshers should expect the first trimester to be harder work than their peers find it.',
      ],
      links: [{ label: 'Eligibility', to: '/admissions#eligibility' }],
      chips: ['Admission process', 'Class profile', 'Placements for freshers'],
    }),
  },
  {
    id: 'international-student',
    // Above `program-specific`, or "I'm an international student" is answered
    // with the International Business programme page instead.
    priority: 84,
    triggers: ['international student', 'nri', 'foreign student', 'from abroad', 'visa', 'outside india', 'overseas'],
    answer: (content) => ({
      text: [
        'International and NRI candidates apply through the same form and are assessed on the same criteria, using **GMAT or GRE** in place of the Indian entrance examinations.',
        'Video interview slots are available, and the International Office assists with the student visa process once an offer is accepted.',
        'Separately, our International Business specialisation includes a compulsory exchange term across eleven partner schools in Europe and South-East Asia.',
      ],
      links: [
        { label: 'Admissions', to: '/admissions' },
        { label: 'International Business', to: '/programs/international-business' },
        { label: 'Contact the International Office', to: '/contact' },
      ],
      chips: ['Exchange partners', 'Hostel accommodation', `Email ${content.settings.admissionsEmail}`],
    }),
  },

  // --- placements ----------------------------------------------------------
  {
    id: 'recruiters',
    priority: 79,
    triggers: ['recruiter', 'recruit', 'recruits', 'recruiting', 'which company', 'companies', 'company visit', 'who recruits', 'hiring partner', 'top company'],
    answer: (content) => ({
      text: [
        // The stat, not the list length — the stored list is a curated selection.
        '**340+ organisations** recruit on campus across fourteen sectors. A selection:',
        content.recruiters.slice(0, 12).map((r) => `• ${r.name} — ${r.sector}`).join('\n'),
        'Sector split of the most recent offer book:',
        listOf(sectorSplit.map((s) => `${s.sector}: ${s.pct}%`)),
      ],
      links: [{ label: 'Full placement report', to: '/placements#recruiters' }],
      chips: ['Highest package', 'Placement rate', 'Placement support'],
    }),
  },
  {
    id: 'placements',
    priority: 74,
    triggers: ['placement', 'package', 'salary', 'ctc', 'lpa', 'job', 'naukri', 'average package', 'highest package', 'career outcome', 'roi', 'return on investment'],
    answer: (content) => {
      const latest = [...content.placementTrend].sort((a, b) => a.year.localeCompare(b.year)).at(-1)
      const best = [...content.programs].sort((a, b) => b.medianCtcLPA - a.medianCtcLPA).slice(0, 3)

      return {
        text: [
          `Placement record for the most recent graduating class${latest ? ` (${latest.year})` : ''}:`,
          listOf(placementStats.map((s) => `${s.label}: **${s.prefix ?? ''}${s.value}${s.suffix ?? ''}** — ${s.note}`)),
          'Strongest specialisations by median CTC:',
          listOf(best.map((p) => `${p.shortTitle} — ₹${p.medianCtcLPA} LPA`)),
          '340+ recruiting partners participated across fourteen sectors.',
        ],
        links: [
          { label: 'Full placement report', to: '/placements' },
          { label: 'Recruiters', to: '/placements#recruiters' },
        ],
        chips: ['Which companies recruit?', 'Placement support', 'Sector split'],
      }
    },
  },
  {
    id: 'placement-support',
    priority: 77,
    triggers: ['placement support', 'placement cell', 'career service', 'career development', 'interview prep', 'mock interview', 'resume', 'cv help'],
    answer: () => ({
      text: [
        'The Career Development Centre is a team of nine, including three former recruiters, working with students from the first week of semester I:',
        placementSupport.map((s) => `• **${s.title}** — ${s.body}`).join('\n'),
      ],
      links: [{ label: 'Placements', to: '/placements' }],
      chips: ['Placement rate', 'Recruiters', 'Alumni network'],
    }),
  },

  // --- faculty -------------------------------------------------------------
  {
    id: 'faculty-specific',
    priority: 81,
    triggers: ['who is', 'tell me about dr', 'tell me about prof', 'professor', 'dr.', 'faculty member'],
    answer: (content, query) => {
      const person = bestNameMatch(query, content.faculty, (f) => f.name)
      if (!person) return null
      return {
        text: [
          `**${person.name}** — ${person.designation}, ${person.department}`,
          person.bio,
          listOf([
            `Qualifications: ${person.qualifications.join('; ')}`,
            `Expertise: ${person.expertise.join(', ')}`,
            `Experience: ${person.experienceYears} years`,
            `Publications: ${person.publications}`,
            `Email: ${person.email}`,
          ]),
        ],
        links: [
          { label: `${person.name}'s profile`, to: `/faculty/${person.slug}` },
          { label: 'All faculty', to: '/faculty' },
        ],
        chips: [`${person.department} programmes`, 'All faculty'],
      }
    },
  },
  {
    id: 'faculty',
    priority: 70,
    triggers: ['faculty', 'teacher', 'professor', 'who teaches', 'teaching staff', 'staff'],
    answer: (content) => {
      const departments = [...new Set(content.faculty.map((f) => f.department))]
      return {
        text: [
          `We have **${content.faculty.length} core faculty members** across ${departments.length} departments. Two-thirds held substantive industry positions before joining.`,
          content.faculty.slice(0, 6).map((f) => `• **${f.name}** — ${f.designation}`).join('\n'),
          `Departments: ${departments.join(', ')}.`,
          'Ask me about any individual by name and I will give you their full profile.',
        ],
        links: [{ label: 'Faculty directory', to: '/faculty' }],
        chips: content.faculty.slice(0, 3).map((f) => `Who is ${f.name}?`),
      }
    },
  },

  // --- campus --------------------------------------------------------------
  {
    id: 'hostel',
    priority: 80,
    triggers: ['hostel', 'accommodation', 'stay', 'residence', 'room', 'living', 'mess', 'dining', 'food'],
    answer: (content) => {
      const hostel = content.facilities.find((f) => f.icon === 'hostel')
      const cafe = content.facilities.find((f) => f.icon === 'cafe')
      return {
        text: [
          'Accommodation is **guaranteed for all first-year students**. Second-year students are allocated by preference and hall availability.',
          hostel ? `**${hostel.title}** — ${hostel.description}` : '',
          cafe ? `**${cafe.title}** — ${cafe.description}` : '',
          'Residential charges are ₹1,80,000 per year on twin sharing, with the dining plan billed separately at ₹96,000.',
        ].filter(Boolean),
        links: [
          { label: 'Campus & facilities', to: '/campus' },
          { label: 'Fee structure', to: '/admissions#fees' },
        ],
        chips: ['Campus facilities', 'Student life', 'Sports'],
      }
    },
  },
  {
    id: 'campus',
    priority: 72,
    triggers: ['campus', 'facilit', 'library', 'lab', 'sport', 'gym', 'infrastructure', 'wifi', 'student life', 'club', 'activities', 'auditorium'],
    answer: (content) => ({
      text: [
        `${campusIntro.heading}. The campus runs to **${campusIntro.acres} acres** with ${campusIntro.builtUpLakhSqFt} lakh sq ft built up.`,
        content.facilities.map((f) => `• **${f.title}** (${f.stat}) — ${f.description}`).join('\n'),
        'Student life:',
        listOf(studentLife.map((s) => `**${s.title}** — ${s.body}`)),
      ],
      links: [{ label: 'Campus & student life', to: '/campus' }],
      chips: ['Hostel accommodation', 'Library hours', 'Sports facilities'],
    }),
  },

  // --- news ----------------------------------------------------------------
  {
    id: 'news',
    priority: 76,
    triggers: ['news', 'latest update', 'update', 'announcement', 'what is new', "what's new", 'recent', 'happening', 'event', 'notice'],
    answer: (content) => {
      const latest = [...content.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      if (latest.length === 0) return null
      return {
        text: [
          'The most recent updates from the school:',
          latest
            .map((n) => `• **${n.title}** _(${formatDate(n.date)}, ${n.category})_\n  ${n.excerpt}`)
            .join('\n\n'),
        ],
        links: [
          { label: 'All news & events', to: '/news' },
          { label: latest[0].title, to: `/news/${latest[0].slug}` },
        ],
        chips: ['Admission news', 'Placement news', 'Upcoming events'],
      }
    },
  },

  // --- institution ---------------------------------------------------------
  {
    id: 'contact',
    priority: 82,
    triggers: ['contact', 'phone', 'call', 'email', 'address', 'location', 'where is', 'reach you', 'visit campus', 'office hour', 'talk to someone', 'speak to'],
    answer: (content) => ({
      text: [
        'You can reach us at:',
        listOf([
          `Admissions: **${content.settings.admissionsPhone}** · ${content.settings.admissionsEmail}`,
          `General enquiries: ${content.settings.generalPhone} · ${content.settings.generalEmail}`,
          `Campus: ${content.settings.address}`,
          `Office hours: ${content.settings.officeHours}`,
        ]),
        'Campus visits can be arranged through the admissions office on any working day.',
      ],
      links: [{ label: 'Contact page', to: '/contact' }],
      chips: ['Book a campus visit', 'Admission process', 'Apply now'],
    }),
  },
  {
    id: 'ranking-accreditation',
    priority: 80,
    triggers: ['ranking', 'rank', 'nirf', 'naac', 'aicte', 'accredit', 'approved', 'recognis', 'recogniz', 'aacsb', 'is it good', 'reputation'],
    answer: (content) => ({
      text: [
        `${content.settings.name} holds: **${content.settings.accreditations.join(', ')}**.`,
        'The NAAC A++ grade was re-awarded in February 2026 with a cumulative grade point average of 3.71 out of 4, following a five-day peer team review.',
        'The peer report singled out the industry immersion trimester, the proportion of faculty with industry backgrounds, and the transparency of our placement reporting.',
      ],
      links: [
        { label: 'About the school', to: '/about' },
        { label: 'NAAC re-accreditation news', to: '/news/naac-a-double-plus' },
      ],
      chips: ['Placement record', 'Faculty', 'Campus'],
    }),
  },
  {
    id: 'about',
    priority: 68,
    triggers: ['about', 'history', 'founded', 'established', 'who founded', 'mission', 'vision', 'value', 'why choose', 'why should i', 'what makes you different', 'usp', 'leadership', 'dean'],
    answer: (content) => ({
      text: [
        `${aboutStory.heading}.`,
        aboutStory.paragraphs[0],
        'What we would point to specifically:',
        listOf(whyAKU.map((w) => `**${w.title}** — ${w.body}`)),
        `Founded ${content.settings.established}. ${milestones.at(-1)?.event ?? ''}`,
      ],
      links: [{ label: 'About us', to: '/about' }],
      chips: ['Rankings & accreditation', 'Alumni network', 'Faculty'],
    }),
  },
  {
    id: 'alumni',
    priority: 77,
    triggers: ['alumni', 'alumnus', 'network', 'graduate', 'testimonial', 'review', 'what do students say', 'student feedback'],
    answer: (content) => {
      const quote = content.testimonials[0]
      return {
        text: [
          '**21,000+ alumni across 46 countries**, organised into sector chapters with a named lead in each of our top fourteen recruiting industries.',
          'The referral programme originated 94 of the offers made to the most recent graduating class — a figure that has grown for four consecutive years.',
          quote
            ? `One example — ${quote.name}, ${quote.batch}, now ${quote.role} at ${quote.company}:\n"${quote.quote}"`
            : '',
        ].filter(Boolean),
        links: [
          { label: 'Alumni network', to: '/about#alumni' },
          { label: 'Placements', to: '/placements' },
        ],
        chips: ['Placement record', 'Recruiters', 'About the school'],
      }
    },
  },
  {
    id: 'duration-seats',
    priority: 78,
    triggers: ['duration', 'how long', 'how many year', 'seat', 'intake', 'batch size', 'class size'],
    answer: (content) => {
      const totalSeats = content.programs.reduce((sum, p) => sum + p.seats, 0)
      return {
        text: [
          `All specialisations are **two-year, full-time** programmes across four semesters.`,
          `Total intake is **${totalSeats} seats** across ${content.programs.length} specialisations:`,
          content.programs.map((p) => `• ${p.shortTitle} — ${p.seats} seats`).join('\n'),
          'Sections are capped at sixty students, deliberately — it is the largest group in which a faculty member can still know how each student thinks.',
        ],
        links: [{ label: 'All programmes', to: '/programs' }],
        chips: ['Eligibility', 'How do I apply?', 'Fees'],
      }
    },
  },
  {
    id: 'admin-help',
    priority: 85,
    triggers: ['admin panel', 'admin login', 'edit website', 'update content', 'manage content', 'cms'],
    answer: () => ({
      text: [
        'Content on this site is managed through the admin panel at **/admin** — programmes, faculty, news, placements, campus, FAQs and site settings can all be created, edited and deleted there without touching any code.',
        'Access requires an administrator account. If you are a visitor rather than staff, the admissions office can help with anything you need.',
      ],
      links: [
        { label: 'Admin panel', to: '/admin' },
        { label: 'Contact admissions', to: '/contact' },
      ],
    }),
  },

  // --- process detail ------------------------------------------------------
  //
  // Everything below answers a question a real applicant asks but the pages
  // above only imply. Each answer is derived from `src/data/admissions.ts` or
  // `src/data/campus.ts` rather than invented, so editing the data edits the
  // reply. Where the site genuinely has no policy the answer says so and hands
  // over to the admissions office instead of guessing.
  {
    id: 'refund',
    priority: 83,
    triggers: ['refund', 'withdraw', 'cancel my admission', 'cancel admission', 'money back', 'deposit back', 'leave the course'],
    answer: () => ({
      text: [
        'Three different sums, three different rules:',
        listOf([
          'The **₹2,500 application fee** is non-refundable once the form is submitted.',
          'The **₹25,000 security deposit** is fully refundable, returned after you graduate or withdraw, less any outstanding dues.',
          '**Tuition** is refunded on a sliding scale that depends on how close to the start of term you withdraw, and on whether the seat can be reallocated.',
        ]),
        'The tuition scale follows the regulator’s norms rather than a school policy, so the admissions office will give you the exact figure for your withdrawal date in writing before you decide.',
      ],
      links: [{ label: 'Fee structure', to: '/admissions#fees' }, { label: 'Contact admissions', to: '/contact' }],
      chips: ['Fee structure', 'Scholarships'],
    }),
  },
  {
    id: 'documents',
    priority: 81,
    triggers: ['document', 'marksheet', 'mark sheet', 'transcript', 'paperwork', 'what to bring', 'verification', 'certificate'],
    answer: () => ({
      text: [
        'Nothing is needed to *start* an application — you can submit the form and add your entrance score later, up to the round deadline.',
        'Document verification happens at enrolment, after you accept a seat. Bring the originals plus one photocopy of each:',
        listOf([
          'Degree certificate and mark sheets for every year of your bachelor’s',
          'Class X and XII certificates',
          'Entrance scorecard (CAT, XAT, GMAT, GRE or MAT)',
          'Photo identity and address proof',
          'Category certificate, if you are claiming a relaxed cut-off',
          'Experience letters, if you have work experience to declare',
          'Migration and transfer certificates from your previous institution',
        ]),
        'Final-year students may enrol against a provisional certificate, with proof of completion due before the end of the first term.',
      ],
      links: [{ label: 'Admission process', to: '/admissions' }],
      chips: ['Eligibility', 'How do I apply?', 'When does the session start?'],
    }),
  },
  {
    id: 'selection-process',
    priority: 76,
    // `placement-support` sits at 77 and owns "interview prep" / "mock
    // interview", so those reach the careers answer before this one. The guard
    // is belt-and-braces in case that intent is ever reordered.
    triggers: ['interview', 'written ability', 'selection process', 'shortlist', 'group discussion', 'how are candidates selected', 'wat'],
    guard: (q) => !/(prepar|mock|resume|cv |career service)/.test(q),
    answer: () => {
      const shortlisting = admissionSteps.find((s) => s.step === 3)
      const interview = admissionSteps.find((s) => s.step === 4)
      return {
        text: [
          'Selection is two stages, both after the application closes.',
          `**Shortlisting and written ability test.** ${shortlisting?.description ?? ''}`,
          `**Personal interview.** ${interview?.description ?? ''}`,
          'Offers follow within twenty-one days of the interview, with the scholarship decision attached.',
        ],
        links: [{ label: 'Admission process', to: '/admissions' }],
        chips: ['Key dates', 'What documents do I need?', 'Scholarships'],
      }
    },
  },
  {
    id: 'session-start',
    priority: 79,
    triggers: ['session start', 'classes start', 'class start', 'term start', 'term begin', 'academic calendar', 'joining date', 'bridge course', 'induction', 'when does the session', 'when do classes', 'kab se start', 'session kab', 'class kab'],
    answer: () => {
      const bridge = importantDates.find((d) => d.label.toLowerCase().includes('bridge'))
      return {
        text: [
          bridge
            ? `The pre-term bridge course begins on **${formatDate(bridge.date)}**, and the first term follows immediately after it.`
            : 'The pre-term bridge course runs in June, with the first term following immediately after.',
          'The bridge course is not optional padding — it levels up quantitative methods and accounting for candidates from non-commerce backgrounds, which is most of a typical cohort.',
          'Enrolment and document verification are completed before it starts.',
        ],
        links: [{ label: 'Key dates', to: '/admissions#dates' }],
        chips: ['Key dates', 'What documents do I need?', 'Hostel'],
      }
    },
  },
  {
    id: 'reservation-quota',
    priority: 81,
    triggers: ['reservation', 'quota', 'management seat', 'management quota', 'donation', 'capitation', 'nri seat', 'paid seat'],
    answer: () => ({
      text: [
        'There is **no management quota, donation seat or capitation fee** at AKU. Every seat is filled on the published selection criteria, and no amount of money will buy one.',
        'Statutory reservation is applied as required, and reserved-category candidates need a 45% aggregate rather than 50%.',
        'If anybody offers you a seat here in exchange for a payment outside the fee structure, it is a fraud — please report it to the admissions office.',
      ],
      links: [{ label: 'Eligibility', to: '/admissions#eligibility' }, { label: 'Contact admissions', to: '/contact' }],
      chips: ['Eligibility', 'Scholarships', 'How do I apply?'],
    }),
  },
  {
    id: 'waitlist',
    priority: 80,
    triggers: ['waitlist', 'waiting list', 'wait list', 'reserve list'],
    answer: () => ({
      text: [
        'Yes. Each round publishes a ranked waitlist alongside its offers, and your position on it is visible to you — not just a "you are waitlisted" message.',
        'Movement happens as admitted candidates decline, which is heaviest in the two weeks after each offer release. Waitlisted candidates are considered again in later rounds without reapplying or paying a second application fee.',
      ],
      links: [{ label: 'Key dates', to: '/admissions#dates' }],
      chips: ['Key dates', 'How do I apply?'],
    }),
  },
  {
    id: 'executive-mba',
    priority: 84,
    triggers: ['executive mba', 'part time', 'part-time', 'weekend program', 'weekend class', 'distance learning', 'correspondence', 'online mba', 'evening class', 'work while study'],
    answer: (content) => ({
      text: [
        `All ${content.programs.length} specialisations are **two-year, full-time, residential** programmes. There is no executive, part-time, weekend, evening, online or distance variant.`,
        'That is a deliberate choice rather than a gap: the cohort model, the live projects and the summer internship all assume you are on campus full time.',
        'If you need to keep working, the honest answer is that this is not the right programme for you right now.',
      ],
      links: [{ label: 'All programmes', to: '/programs' }],
      chips: ['Which programmes do you offer?', 'Fees', 'Placement record'],
    }),
  },
  {
    id: 'internship',
    priority: 79,
    triggers: ['internship', 'intern', 'summer project', 'live project', 'summer placement'],
    answer: () => ({
      text: [
        'Every student does a **summer internship between the first and second year**, typically eight to ten weeks, arranged through the Career Development Centre.',
        'It is the single biggest driver of final placement — a large share of pre-placement offers come from the summer host, so the internship process is run with the same seriousness as final recruitment.',
        'Live consulting projects with partner firms also run through the second year alongside coursework.',
      ],
      links: [{ label: 'Placements', to: '/placements' }],
      chips: ['Placement record', 'Which companies recruit here', 'Career support'],
    }),
  },
  {
    id: 'teaching-method',
    priority: 73,
    // No bare "lecture" — it matches "recommend a lecture on quantum physics".
    triggers: ['teaching method', 'pedagogy', 'case method', 'case study', 'how are classes', 'classes online', 'online or offline', 'mode of teaching', 'teaching style', 'guest lecture'],
    answer: () => ({
      text: [
        'Teaching is **in person on campus** — the programme is residential and full time, not hybrid.',
        'The core is the case method: you read the case beforehand, defend a position in class, and are graded partly on that contribution. It is supplemented by simulations on the trading floor, live consulting projects and a capstone in the final term.',
        'Classes are small enough that there is nowhere to hide, which is the point.',
      ],
      links: [{ label: 'All programmes', to: '/programs' }, { label: 'Campus', to: '/campus' }],
      chips: ['Class size', 'Campus facilities', 'Curriculum'],
    }),
  },
  {
    id: 'grading',
    priority: 76,
    // No bare "grade" — it matches "what grade of steel is strongest".
    triggers: ['grading', 'cgpa', 'gpa$', 'exam pattern', 'evaluation', 'assessment', 'attendance', 'marking scheme'],
    answer: () => ({
      text: [
        'Assessment is continuous rather than one final paper: class contribution, group work, mid-term and end-term examinations, and project submissions all count, in proportions published in each course outline at the start of the term.',
        'Results are reported on a ten-point CGPA. Attendance is tracked per course, with a minimum threshold to be eligible for the end-term examination — an inevitable consequence of the case method, which does not work if half the room has not read the case.',
      ],
      links: [{ label: 'All programmes', to: '/programs' }],
      chips: ['Teaching method', 'Curriculum', 'Class size'],
    }),
  },
  {
    id: 'sector-split',
    priority: 79,
    triggers: ['sector', 'which industry', 'industry hire', 'industries recruit', 'domain wise', 'sector wise'],
    answer: () => ({
      text: [
        'The cohort spreads across these sectors at the final placement:',
        listOf(
          [...sectorSplit]
            .sort((a, b) => b.pct - a.pct)
            .map((s) => `**${s.sector}** — ${s.pct}%`),
        ),
        'The spread matters more than any single number: a school where four fifths of the batch goes into one sector is a school with one strong relationship, not a broad market.',
      ],
      links: [{ label: 'Placements', to: '/placements' }],
      chips: ['Which companies recruit here', 'Average package', 'Career support'],
    }),
  },
  {
    id: 'getting-there',
    priority: 79,
    // No bare "transport" — it matches "how do i transport furniture".
    triggers: ['how to reach', 'how do i reach', 'nearest metro', 'nearest railway', 'railway station', 'airport', 'bus service', 'shuttle', 'public transport', 'directions', 'how far is'],
    answer: (content) => ({
      text: [
        `The campus is at **${content.settings.address}**.`,
        listOf([
          'Indira Gandhi International Airport is roughly 60 km by road.',
          'The nearest metro is on the Aqua Line, with a campus shuttle meeting scheduled services.',
          'Nearest major railheads are Hazrat Nizamuddin and New Delhi.',
          'A shuttle runs between campus and the nearest metro station through the teaching day.',
        ]),
        'If you are travelling for an interview, tell the admissions office your arrival time and they will confirm the shuttle slot.',
      ],
      links: [{ label: 'Find us', to: '/contact' }, { label: 'Campus', to: '/campus' }],
      chips: ['Can I visit the campus?', 'Contact admissions', 'Hostel'],
    }),
  },
  {
    id: 'campus-visit',
    priority: 79,
    // `parent` is deliberately a bare trigger: translated Hinglish scatters the
    // words ("parents aa can hain"), so a two-word trigger never matches, and a
    // question mentioning parents at all is asking about visiting.
    triggers: ['can i visit', 'campus tour', 'open day', 'parent', 'family visit', 'see the campus', 'come and see'],
    // "parent" alone matches "who are your parents" — require the question to
    // be about coming here. `aa` covers the Hinglish "parents aa sakte hain",
    // which translation scatters into non-adjacent words.
    guard: (q) =>
      hasAny(q, ['visit', 'campus', 'tour', 'open day', 'come', 'see$', 'family', 'aa$', 'aana', 'aayen', 'ghumne']),
    answer: (content) => ({
      text: [
        'Yes — prospective students and their families are welcome, and it is genuinely worth doing before you commit two years and a fee like this one.',
        `Tours run on working days during office hours (${content.settings.officeHours}) and are led by current students rather than the marketing team, which tends to produce more honest answers.`,
        `Book ahead on **${content.settings.admissionsPhone}** or **${content.settings.admissionsEmail}** so somebody is expecting you.`,
      ],
      links: [{ label: 'Contact admissions', to: '/contact' }, { label: 'Campus', to: '/campus' }],
      chips: ['How do I reach the campus?', 'Campus facilities', 'Hostel'],
    }),
  },
  {
    id: 'safety',
    priority: 79,
    triggers: ['safe', 'safety', 'security', 'ragging', 'harassment', 'women safety', 'girls safety'],
    // "safe" on its own also matches "is bitcoin safe" — require something that
    // places the question on this campus.
    guard: (q) =>
      hasAny(q, ['campus', 'hostel', 'college', 'school', 'girl', 'ladki', 'ladkiy', 'student', 'ragging', 'harass', 'women', 'residence', 'warden', 'night', 'here$']),
    answer: () => ({
      text: [
        'The campus is gated and staffed around the clock, with controlled entry to the residential halls and lighting and CCTV across the shared areas.',
        'AKU operates a **zero-tolerance policy on ragging and harassment**, with an anti-ragging committee and an internal complaints committee that a student can approach directly, without going through a warden or faculty member first.',
        'Residential halls have separate wings with their own access control, and a warden on call at every hour.',
      ],
      links: [{ label: 'Campus life', to: '/campus' }, { label: 'Contact', to: '/contact' }],
      chips: ['Hostel', 'Campus facilities', 'Student clubs'],
    }),
  },
  {
    id: 'dress-code',
    priority: 79,
    triggers: ['dress code', 'uniform', 'what to wear', 'formal dress', 'formals'],
    answer: () => ({
      text: [
        'There is no daily uniform. Everyday classes are smart casual.',
        'Business formals are expected for interviews, guest lectures, industry visits, live-project client meetings and the placement season — and the Career Development Centre says so well before the first of those, so nobody is caught out.',
      ],
      links: [{ label: 'Campus life', to: '/campus' }],
      chips: ['Campus facilities', 'Student clubs', 'Placement support'],
    }),
  },
  {
    id: 'brochure',
    priority: 80,
    // No bare "pdf" — it matches "give me a pdf of harry potter".
    triggers: ['brochure', 'prospectus', 'information booklet', 'download the', 'send me details'],
    answer: (content) => ({
      text: [
        'Everything a printed brochure would carry is on this site and kept current here first — programmes, curriculum, fees, scholarships, eligibility, placement figures, faculty and campus.',
        `For a PDF pack or anything specific to your profile, email **${content.settings.admissionsEmail}** or call **${content.settings.admissionsPhone}** and the admissions office will send it across.`,
      ],
      links: [
        { label: 'All programmes', to: '/programs' },
        { label: 'Admissions', to: '/admissions' },
        { label: 'Contact admissions', to: '/contact' },
      ],
      chips: ['Fees', 'Eligibility', 'Placement record'],
    }),
  },
]

// ---------------------------------------------------------------------------
// Retrieval fallback — searches every content record when no intent fires
// ---------------------------------------------------------------------------

type Doc = { tokens: Set<string>; answer: () => ChatAnswer }

function buildDocs(content: ContentSnapshot): Doc[] {
  const docs: Doc[] = []

  for (const program of content.programs) {
    const text = [
      program.title, program.shortTitle, program.tagline, program.overview, program.department,
      ...program.highlights, ...program.careers, ...program.eligibility,
      ...program.curriculum.flatMap((s) => [s.title, ...s.subjects]),
    ].join(' ')
    docs.push({
      tokens: new Set(tokenize(text)),
      answer: () => ({
        text: [
          `**${program.title}**`,
          program.overview,
          listOf([
            `Duration: ${program.durationYears} years`,
            `Seats: ${program.seats}`,
            `Tuition: ${formatINR(program.annualFeeINR)} per year`,
            `Median CTC: ₹${program.medianCtcLPA} LPA`,
          ]),
        ],
        links: [{ label: `${program.shortTitle} programme`, to: `/programs/${program.slug}` }],
        chips: [`${program.shortTitle} curriculum`, `${program.shortTitle} careers`],
      }),
    })
  }

  for (const person of content.faculty) {
    const text = [person.name, person.designation, person.department, person.bio, ...person.expertise, ...person.qualifications].join(' ')
    docs.push({
      tokens: new Set(tokenize(text)),
      answer: () => ({
        text: [`**${person.name}** — ${person.designation}, ${person.department}`, person.bio, `Expertise: ${person.expertise.join(', ')}.`],
        links: [{ label: 'View profile', to: `/faculty/${person.slug}` }],
        chips: ['All faculty', `${person.department} programmes`],
      }),
    })
  }

  for (const item of content.news) {
    const text = [item.title, item.excerpt, item.category, ...item.body].join(' ')
    docs.push({
      tokens: new Set(tokenize(text)),
      answer: () => ({
        text: [`**${item.title}** _(${formatDate(item.date)})_`, item.excerpt, item.body[0]],
        links: [{ label: 'Read the full post', to: `/news/${item.slug}` }],
        chips: ['Latest news', 'Admission updates'],
      }),
    })
  }

  for (const faq of content.faqs) {
    docs.push({
      tokens: new Set(tokenize(`${faq.question} ${faq.answer}`)),
      answer: () => ({
        text: [`**${faq.question}**`, faq.answer],
        links: [{ label: 'More admission FAQs', to: '/admissions#faq' }],
        chips: ['Admission process', 'Eligibility', 'Fees'],
      }),
    })
  }

  for (const facility of content.facilities) {
    docs.push({
      tokens: new Set(tokenize(`${facility.title} ${facility.description} ${facility.stat}`)),
      answer: () => ({
        text: [`**${facility.title}** — ${facility.stat}`, facility.description],
        links: [{ label: 'Campus facilities', to: '/campus' }],
        chips: ['Hostel', 'Student life'],
      }),
    })
  }

  for (const quote of content.testimonials) {
    docs.push({
      tokens: new Set(tokenize(`${quote.name} ${quote.role} ${quote.company} ${quote.batch} ${quote.quote}`)),
      answer: () => ({
        text: [`${quote.name} — ${quote.batch}, now ${quote.role} at ${quote.company}:`, `"${quote.quote}"`],
        links: [{ label: 'More alumni stories', to: '/about#alumni' }],
        chips: ['Placements', 'Alumni network'],
      }),
    })
  }

  return docs
}

let cachedDocs: { source: ContentSnapshot; docs: Doc[] } | null = null

function getDocs(content: ContentSnapshot): Doc[] {
  // Rebuilt only when the snapshot object identity changes, i.e. after an
  // admin edit triggers a content refresh.
  if (cachedDocs?.source === content) return cachedDocs.docs
  cachedDocs = { source: content, docs: buildDocs(content) }
  return cachedDocs.docs
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/** Opening message, rebuilt from live content so the counts are never stale. */
export function greeting(content: ContentSnapshot): ChatAnswer {
  return {
    intentId: 'greeting',
    text: [
      `Hello. I'm the ${content.settings.shortName} assistant.`,
      `Ask me anything about our ${content.programs.length} MBA specialisations, fees, admissions, placements, faculty or campus — I answer from this site's own content, so everything I tell you is current.`,
      'Aap Hindi ya Hinglish mein bhi puch sakte hain.',
    ],
    chips: ['Which programmes do you offer?', 'What are the fees?', 'How do I apply?', 'Placement record'],
  }
}

/**
 * Resolve a visitor's question to an answer.
 *
 * Hinglish is handled at both ends: the query is enriched with English
 * equivalents before matching, and the resulting answer is re-rendered in
 * Hinglish. Matching therefore only ever has to reason about English triggers.
 */
export function answerQuestion(content: ContentSnapshot, rawQuery: string): ChatAnswer {
  const original = normalize(rawQuery)
  if (!original) return greeting(content)

  const hinglish = isHinglish(original)
  const query = hinglish ? normalize(translateQuery(original)) : original

  const answer = resolve(content, query)
  return hinglish ? localise(answer, content) : answer
}

function resolve(content: ContentSnapshot, query: string): ChatAnswer {
  // 0. Scope. Runs first: an intent that matches a question about another
  //    organisation would otherwise answer it in our voice.
  if (asksAboutSomewhereElse(query)) return decline(content)

  // 1. Rule-based intents, highest priority first.
  const ordered = [...intents].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  for (const intent of ordered) {
    if (!hasAny(query, intent.triggers)) continue
    if (intent.guard && !intent.guard(query)) continue
    const answer = intent.answer(content, query)
    if (answer) return { ...answer, intentId: intent.id }
  }

  // 2. Scored retrieval across every content record.
  const queryTokens = tokenize(query)
  if (queryTokens.length > 0) {
    let best: { score: number; doc: Doc } | null = null
    for (const doc of getDocs(content)) {
      const score = overlapScore(queryTokens, doc.tokens)
      if (!best || score > best.score) best = { score, doc }
    }
    // Threshold scales with query length so a single strong keyword still wins,
    // but a long off-topic sentence cannot squeak past on one incidental match.
    const threshold = 1.8 + Math.min(queryTokens.length, 6) * 0.32
    if (best && best.score >= threshold) return best.doc.answer()
  }

  // 3. Nothing matched — decline rather than invent.
  return decline(content)
}

/** The one refusal, shared by the scope guard and the no-match path. */
function decline(content: ContentSnapshot): ChatAnswer {
  return {
    unresolved: true,
    text: [
      'I could not find that on this site, and I would rather say so than guess.',
      `I only answer questions about ${content.settings.name} — programmes, admissions, fees, placements, faculty, campus and news.`,
      `For anything I cannot cover, admissions are on **${content.settings.admissionsPhone}** or **${content.settings.admissionsEmail}**.`,
    ],
    links: [{ label: 'Contact admissions', to: '/contact' }],
    chips: ['Which programmes do you offer?', 'Admission process', 'Fees & scholarships', 'Placement record'],
  }
}
