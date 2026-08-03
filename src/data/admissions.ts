import type { AdmissionStep, FaqItem, ImportantDate } from './types'

export const admissionSteps: AdmissionStep[] = [
  {
    step: 1,
    title: 'Submit the online application',
    description:
      'One form covers every specialisation — you may rank up to three preferences. A non-refundable fee of ₹2,500 applies, waived for candidates qualifying under the need-based scheme.',
    window: 'Now open',
  },
  {
    step: 2,
    title: 'Upload your entrance score',
    description:
      'CAT, XAT, GMAT, GRE or MAT results obtained within the last twenty-four months are accepted. Scores may be added after submission, up to the round deadline.',
    window: 'Until round close',
  },
  {
    step: 3,
    title: 'Shortlisting and written ability test',
    description:
      'Shortlists are published within three weeks of each round closing. Most specialisations require a written ability test taken on the interview day.',
    window: 'Oct 2026 – Feb 2027',
  },
  {
    step: 4,
    title: 'Personal interview',
    description:
      'A thirty-minute panel interview at the Greater Noida campus, with a limited number of video slots for candidates currently working outside India.',
    window: 'Oct 2026 – Feb 2027',
  },
  {
    step: 5,
    title: 'Offer and scholarship decision',
    description:
      'Offers are released with the scholarship decision attached, so you never have to accept a seat before you know what it costs.',
    window: 'Within 21 days of interview',
  },
  {
    step: 6,
    title: 'Accept and enrol',
    description:
      'Confirm your seat with the first instalment, complete document verification, and join the pre-term bridge course in June 2027.',
    window: 'Rolling',
  },
]

export const importantDates: ImportantDate[] = [
  { label: 'Round 1 application closes', date: '2026-09-30', status: 'open' },
  { label: 'Round 1 interviews begin', date: '2026-10-20', status: 'upcoming' },
  { label: 'Round 2 application closes', date: '2026-11-15', status: 'upcoming' },
  { label: 'Round 3 application closes', date: '2027-01-10', status: 'upcoming' },
  { label: 'Final offer release', date: '2027-03-05', status: 'upcoming' },
  { label: 'Pre-term bridge course', date: '2027-06-08', status: 'upcoming' },
]

/** General eligibility. Specialisation-specific rules live on each Program. */
export const generalEligibility = [
  "A bachelor's degree of a minimum three years' duration from a recognised university",
  'A minimum aggregate of 50% (45% for reserved categories) across all years of the degree',
  'Final-year students may apply, subject to submitting proof of completion before enrolment',
  'A valid CAT, XAT, GMAT, GRE or MAT score obtained within the preceding twenty-four months',
  'No upper age limit; no minimum work experience for full-time programmes',
]

export const feeStructure = {
  note: 'Figures are per academic year. Tuition is payable in two instalments per year; residential and one-time charges are billed with the first instalment.',
  rows: [
    { head: 'Tuition (varies by specialisation)', year1: '₹9,50,000 – ₹12,50,000', year2: '₹9,50,000 – ₹12,50,000' },
    { head: 'Residential charges (twin sharing)', year1: '₹1,80,000', year2: '₹1,80,000' },
    { head: 'Dining plan', year1: '₹96,000', year2: '₹96,000' },
    { head: 'Course materials & database access', year1: '₹45,000', year2: '₹45,000' },
    { head: 'One-time admission & alumni fee', year1: '₹60,000', year2: '—' },
    { head: 'Refundable security deposit', year1: '₹25,000', year2: '—' },
  ],
}

export const scholarships = [
  {
    title: 'AKU Merit Award',
    amount: 'Up to 100% of tuition',
    body: 'Awarded on entrance percentile and academic record. Considered automatically — there is no separate application. Round 1 applicants are assessed against the full pool.',
  },
  {
    title: 'Need-Based Grant',
    amount: 'Up to 60% of tuition',
    body: 'Assessed on verified family income and assets. Applications are reviewed by a committee that does not see the candidate’s name or entrance score.',
  },
  {
    title: 'Women in Business Scholarship',
    amount: '₹4,00,000 per year',
    body: 'Open to women candidates across all specialisations, with twenty-four awards available for the 2027 intake.',
  },
  {
    title: 'Armed Forces & Public Service Award',
    amount: '₹3,00,000 per year',
    body: 'For candidates who are, or whose parent is, serving or retired armed forces or civil service personnel.',
  },
]

export const admissionFaqs: FaqItem[] = [
  {
    question: 'Do I need work experience to apply?',
    answer:
      'No. The full-time MBA has no minimum work experience requirement, and roughly a fifth of each intake joins directly from an undergraduate degree. That said, the median admit brings thirty-four months of experience, and the classroom discussion assumes some professional context — freshers should expect to work harder in the first trimester to keep pace.',
  },
  {
    question: 'Which entrance examinations do you accept?',
    answer:
      'CAT, XAT, GMAT, GRE and MAT scores obtained within the preceding twenty-four months are all accepted, and no preference is given to one over another. If you hold more than one valid score we will consider the strongest. The Business Analytics & AI specialisation additionally requires an 85th-percentile quantitative score.',
  },
  {
    question: 'Can I change my specialisation after admission?',
    answer:
      'A change is possible at the end of the first semester, subject to seat availability in the receiving specialisation and to your having met its specific eligibility criteria. In practice around eight to twelve students move each year. Changes after semester two are not permitted, as the specialisation coursework has already diverged.',
  },
  {
    question: 'Is the scholarship decision separate from the admission decision?',
    answer:
      'No — and this is deliberate. Every offer is released with the scholarship decision attached, so you are never asked to accept a seat before you know what it will cost you. Round 1 applicants are assessed against the entire scholarship pool, which is one of the few genuine advantages of applying early.',
  },
  {
    question: 'What does the written ability test involve?',
    answer:
      'A thirty-minute written response to a short prompt, taken on the interview day. It is assessed for structure and argument rather than for a correct answer, and there is no preparation material to buy. Candidates for the Business Analytics & AI specialisation take a programming aptitude assessment instead.',
  },
  {
    question: 'Do you offer education loan assistance?',
    answer:
      'Yes. We have arrangements with seven scheduled banks and two non-banking lenders under which admitted students receive pre-approved sanction letters, typically within ten working days of accepting a seat. The Admissions Office will share the panel and current rates once your offer is confirmed. We do not receive commission from any lender on the panel.',
  },
  {
    question: 'Is on-campus accommodation guaranteed?',
    answer:
      'Accommodation is guaranteed for all first-year students. Second-year students are allocated by preference and hall availability, and a small number choose to move off campus — though given that most study groups meet in hall common rooms until unreasonable hours, few do.',
  },
  {
    question: 'Can international candidates apply?',
    answer:
      'Yes. International and NRI candidates apply through the same form and are assessed on the same criteria, with GMAT or GRE in place of the Indian entrance examinations. Video interview slots are available, and the International Office assists with the student visa process once an offer is accepted.',
  },
]
