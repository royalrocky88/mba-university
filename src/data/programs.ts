import type { Program } from './types'

/**
 * The MBA catalogue.
 *
 * Adding an object here is all it takes to get: a card on `/programs`, an entry
 * in the navbar dropdown, a slot in the home-page grid, and a fully rendered
 * `/programs/<slug>` detail page. No component needs touching.
 */
export const programs: Program[] = [
  {
    slug: 'finance',
    title: 'MBA in Finance & Capital Markets',
    shortTitle: 'Finance',
    department: 'Finance',
    tagline: 'Valuation, risk and capital allocation — taught on a live trading floor.',
    overview:
      'A quantitatively demanding specialisation built for students heading into investment banking, asset management, private equity and corporate treasury. The programme runs on our capital markets lab, where cohorts manage a real ₹2 crore fund and defend their positions to an investment committee of practising portfolio managers each trimester.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 72,
    annualFeeINR: 1150000,
    icon: 'coin',
    medianCtcLPA: 24.6,
    highlights: [
      '48-terminal Bloomberg lab with live market data',
      'Student-managed ₹2 crore long-only fund',
      'CFA Level I curriculum mapped into semesters 1–2',
      'Deal-room simulation with practising M&A bankers',
    ],
    eligibility: [
      "Bachelor's degree in any discipline with a minimum 50% aggregate",
      'CAT / XAT / GMAT / GRE score from the last 24 months',
      'Quantitative aptitude percentile of 75 or above',
      'Work experience preferred but not mandatory',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Financial Accounting & Reporting',
          'Managerial Economics',
          'Statistics for Decision Making',
          'Organisational Behaviour',
          'Business Communication',
        ],
      },
      {
        title: 'Semester II — Core Finance',
        subjects: [
          'Corporate Finance',
          'Investment Analysis & Portfolio Management',
          'Financial Modelling in Excel & Python',
          'Marketing Management',
          'Operations Management',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Derivatives & Risk Management',
          'Mergers, Acquisitions & Restructuring',
          'Fixed Income Securities',
          'Private Equity & Venture Capital',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Behavioural Finance',
          'Algorithmic Trading Strategies',
          'International Finance',
          'Financial Regulation & Ethics',
          'Capstone Research Dissertation',
        ],
      },
    ],
    careers: [
      'Investment Banking Analyst',
      'Equity Research Associate',
      'Portfolio Manager',
      'Corporate Treasury Lead',
      'Private Equity Associate',
      'Risk & Compliance Manager',
    ],
  },
  {
    slug: 'marketing',
    title: 'MBA in Marketing & Brand Strategy',
    shortTitle: 'Marketing',
    department: 'Marketing',
    tagline: 'Build brands people defend, not just brands people recognise.',
    overview:
      'This specialisation treats marketing as a P&L discipline rather than a communications function. Students run live campaigns with real media budgets provided by partner brands, and are assessed on the commercial outcome — incremental revenue, contribution margin, retention — not on the deck.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 68,
    annualFeeINR: 1050000,
    icon: 'cart',
    medianCtcLPA: 19.2,
    highlights: [
      'Live campaigns with ₹5 lakh media budgets from partner brands',
      'Consumer neuroscience lab with eye-tracking and facial coding',
      'Semester-long brand audit of a listed Indian FMCG company',
      'Guest studios with CMOs from four unicorn businesses',
    ],
    eligibility: [
      "Bachelor's degree in any discipline with a minimum 50% aggregate",
      'CAT / XAT / GMAT / MAT score from the last 24 months',
      'Portfolio or written statement demonstrating creative judgement',
      'Group discussion and personal interview',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Marketing Management',
          'Consumer Behaviour',
          'Managerial Economics',
          'Financial Accounting',
          'Business Statistics',
        ],
      },
      {
        title: 'Semester II — Core Marketing',
        subjects: [
          'Brand Management',
          'Marketing Research & Analytics',
          'Integrated Marketing Communication',
          'Sales & Distribution Management',
          'Corporate Finance',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Digital & Performance Marketing',
          'Pricing Strategy',
          'Retail & Channel Strategy',
          'Marketing Analytics with Python',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Strategic Brand Positioning',
          'Customer Lifetime Value Management',
          'Services & Experience Marketing',
          'Marketing Ethics & Regulation',
          'Capstone Campaign Project',
        ],
      },
    ],
    careers: [
      'Brand Manager',
      'Growth & Performance Lead',
      'Category Manager',
      'Marketing Analytics Manager',
      'Product Marketing Manager',
      'Account Director, Agency',
    ],
  },
  {
    slug: 'business-analytics',
    title: 'MBA in Business Analytics & AI',
    shortTitle: 'Business Analytics',
    department: 'Analytics & Technology',
    tagline: 'Decision science for people who will own the decision.',
    overview:
      'A rigorous, code-first specialisation for managers who need to build the model, not just read its output. Students work in Python, SQL and R from week one, and every capstone must ship against a real dataset from a partner organisation with a measurable business metric attached.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 60,
    annualFeeINR: 1250000,
    icon: 'cpu',
    medianCtcLPA: 26.8,
    highlights: [
      'Python, SQL, R and cloud ML pipelines taught in-course',
      'GPU cluster access for deep learning coursework',
      'Live datasets from partner banks, retailers and health systems',
      'Joint certification track with a leading cloud provider',
    ],
    eligibility: [
      "Bachelor's degree with a minimum 55% aggregate",
      'Demonstrated quantitative background — mathematics, statistics, engineering, economics or commerce',
      'CAT / XAT / GMAT / GRE with an 85+ quantitative percentile',
      'Programming aptitude assessment conducted on campus',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Statistics & Probability for Business',
          'Programming for Analytics (Python)',
          'Database Systems & SQL',
          'Managerial Economics',
          'Financial Accounting',
        ],
      },
      {
        title: 'Semester II — Core Analytics',
        subjects: [
          'Machine Learning for Business',
          'Data Visualisation & Storytelling',
          'Optimisation & Decision Models',
          'Marketing Management',
          'Operations Management',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Deep Learning & Neural Networks',
          'Natural Language Processing',
          'Big Data Engineering on the Cloud',
          'Experimentation & Causal Inference',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'AI Strategy & Governance',
          'Time Series & Demand Forecasting',
          'Responsible AI and Model Risk',
          'Analytics Consulting Practicum',
          'Capstone Data Product',
        ],
      },
    ],
    careers: [
      'Data Scientist',
      'Analytics Consultant',
      'Product Analytics Manager',
      'AI Strategy Associate',
      'Decision Scientist',
      'Business Intelligence Lead',
    ],
  },
  {
    slug: 'human-resources',
    title: 'MBA in Human Resources & Organisation Design',
    shortTitle: 'Human Resources',
    department: 'Organisation & Leadership',
    tagline: 'Design the organisation, not just the policy manual.',
    overview:
      'Built for students who will shape how companies are structured, staffed and led. The specialisation combines organisational psychology with hard workforce analytics, so graduates can argue for a restructure in the language of both the CHRO and the CFO.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 54,
    annualFeeINR: 950000,
    icon: 'people',
    medianCtcLPA: 16.4,
    highlights: [
      'Workforce analytics taught on anonymised HRIS data',
      'Live organisation-design engagement with a partner firm',
      'Assessment centre certification built into semester III',
      'Employment law clinic run with practising counsel',
    ],
    eligibility: [
      "Bachelor's degree in any discipline with a minimum 50% aggregate",
      'CAT / XAT / GMAT / MAT score from the last 24 months',
      'Structured behavioural interview',
      'Prior team or people-leadership exposure viewed favourably',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Organisational Behaviour',
          'Human Resource Management',
          'Managerial Economics',
          'Financial Accounting',
          'Business Statistics',
        ],
      },
      {
        title: 'Semester II — Core HR',
        subjects: [
          'Talent Acquisition & Assessment',
          'Compensation & Benefits Design',
          'Labour Law & Industrial Relations',
          'Marketing Management',
          'Corporate Finance',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Organisation Design & Change',
          'People Analytics',
          'Learning & Capability Building',
          'Negotiation & Conflict Resolution',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Strategic HR Business Partnering',
          'Culture, Ethics & Employee Voice',
          'Global Mobility & Future of Work',
          'Leadership Development Practicum',
          'Capstone Organisation Study',
        ],
      },
    ],
    careers: [
      'HR Business Partner',
      'Talent Acquisition Lead',
      'Compensation & Benefits Analyst',
      'People Analytics Manager',
      'Organisation Development Consultant',
      'Learning & Development Manager',
    ],
  },
  {
    slug: 'operations-supply-chain',
    title: 'MBA in Operations & Supply Chain',
    shortTitle: 'Operations',
    department: 'Operations',
    tagline: 'Where the plan meets the freight, the factory and the forecast.',
    overview:
      'A hands-on specialisation for students who want to run physical and digital operations at scale. Cohorts spend time on partner shop floors and in distribution centres, and every optimisation model built in class is stress-tested against the messiness of real throughput data.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 56,
    annualFeeINR: 980000,
    icon: 'chart',
    medianCtcLPA: 17.9,
    highlights: [
      'Plant and distribution-centre residencies each trimester',
      'Simulation lab running discrete-event and digital-twin models',
      'Lean Six Sigma Green Belt certification embedded in the course',
      'Live network-design project with a national logistics operator',
    ],
    eligibility: [
      "Bachelor's degree with a minimum 50% aggregate",
      'CAT / XAT / GMAT score from the last 24 months',
      'Quantitative percentile of 70 or above',
      'Engineering or manufacturing exposure viewed favourably',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Operations Management',
          'Business Statistics',
          'Managerial Economics',
          'Financial Accounting',
          'Organisational Behaviour',
        ],
      },
      {
        title: 'Semester II — Core Operations',
        subjects: [
          'Supply Chain Management',
          'Quality Management & Six Sigma',
          'Operations Research & Optimisation',
          'Marketing Management',
          'Corporate Finance',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Logistics & Network Design',
          'Procurement & Strategic Sourcing',
          'Demand Planning & Forecasting',
          'Manufacturing Systems & Industry 4.0',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Service Operations',
          'Sustainable & Circular Supply Chains',
          'Project Management',
          'Operations Strategy',
          'Capstone Improvement Project',
        ],
      },
    ],
    careers: [
      'Supply Chain Manager',
      'Operations Consultant',
      'Demand Planning Lead',
      'Procurement Manager',
      'Plant Operations Manager',
      'Logistics Network Analyst',
    ],
  },
  {
    slug: 'international-business',
    title: 'MBA in International Business',
    shortTitle: 'International Business',
    department: 'Strategy & Global Business',
    tagline: 'Trade policy, cross-border strategy and a term abroad.',
    overview:
      'For students who intend to operate across jurisdictions. The specialisation pairs trade economics and international finance with a compulsory exchange term at one of our eleven partner schools in Europe and South-East Asia, culminating in a market-entry study defended before regional business leaders.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 48,
    annualFeeINR: 1180000,
    icon: 'globe',
    medianCtcLPA: 20.1,
    highlights: [
      'Compulsory exchange term across 11 partner schools',
      'Live market-entry study for an India-bound multinational',
      'Trade documentation and customs practicum',
      'Second-language track in French, German, Spanish or Japanese',
    ],
    eligibility: [
      "Bachelor's degree with a minimum 50% aggregate",
      'CAT / XAT / GMAT / GRE score from the last 24 months',
      'Valid passport at the time of admission',
      'English proficiency evidence for the exchange term',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'International Business Environment',
          'Managerial Economics',
          'Financial Accounting',
          'Business Statistics',
          'Cross-Cultural Management',
        ],
      },
      {
        title: 'Semester II — Core',
        subjects: [
          'International Trade & Policy',
          'International Finance',
          'Global Marketing',
          'Operations Management',
          'Corporate Finance',
        ],
      },
      {
        title: 'Semester III — Exchange Term',
        subjects: [
          'Host-School Electives',
          'Comparative Business Systems',
          'Regional Market Study',
          'Foreign Language Immersion',
          'International Consulting Project',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Global Strategy',
          'Export–Import Documentation & Logistics',
          'Geopolitics & Business Risk',
          'International Business Law',
          'Capstone Market-Entry Dissertation',
        ],
      },
    ],
    careers: [
      'International Business Manager',
      'Trade & Export Manager',
      'Global Strategy Analyst',
      'Country Manager',
      'Cross-Border M&A Associate',
      'Trade Compliance Specialist',
    ],
  },
  {
    slug: 'sustainability-esg',
    title: 'MBA in Sustainability & ESG',
    shortTitle: 'Sustainability & ESG',
    department: 'Strategy & Global Business',
    tagline: 'Decarbonisation as a balance-sheet problem.',
    overview:
      'An emerging-field specialisation for students entering climate strategy, ESG assurance and impact investing. Students learn to audit a supply chain’s emissions, price transition risk into a valuation, and write a disclosure that survives regulatory scrutiny.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 42,
    annualFeeINR: 1020000,
    icon: 'leaf',
    medianCtcLPA: 18.6,
    highlights: [
      'Scope 1–3 emissions audit of a listed manufacturer',
      'BRSR and ISSB disclosure drafting workshops',
      'Impact investing practicum with a climate fund',
      'Field study at a renewable generation site',
    ],
    eligibility: [
      "Bachelor's degree in any discipline with a minimum 50% aggregate",
      'CAT / XAT / GMAT / GRE score from the last 24 months',
      'Statement of purpose addressing a sustainability challenge',
      'Personal interview with the ESG faculty panel',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Sustainability & Business Systems',
          'Managerial Economics',
          'Financial Accounting',
          'Business Statistics',
          'Organisational Behaviour',
        ],
      },
      {
        title: 'Semester II — Core',
        subjects: [
          'Environmental Economics',
          'Corporate Governance & Ethics',
          'Carbon Accounting & GHG Protocol',
          'Corporate Finance',
          'Marketing Management',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Climate Risk & Transition Finance',
          'ESG Reporting Standards (BRSR, ISSB, GRI)',
          'Circular Economy & Product Stewardship',
          'Impact Measurement & Management',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Sustainable Finance & Green Bonds',
          'Renewable Energy Business Models',
          'Stakeholder & Policy Engagement',
          'ESG Assurance Practicum',
          'Capstone Transition Plan',
        ],
      },
    ],
    careers: [
      'ESG Analyst',
      'Sustainability Consultant',
      'Climate Risk Associate',
      'Impact Investing Analyst',
      'Corporate Sustainability Manager',
      'Carbon Markets Specialist',
    ],
  },
  {
    slug: 'healthcare-management',
    title: 'MBA in Healthcare & Hospital Management',
    shortTitle: 'Healthcare Management',
    department: 'Operations',
    tagline: 'Run the hospital, the payer network or the health-tech platform.',
    overview:
      'A specialisation for the fastest-growing managed sector in India. Students rotate through partner hospital systems, model payer economics, and confront the operational reality of clinical throughput, regulatory compliance and patient outcomes as simultaneous constraints.',
    durationYears: 2,
    mode: 'Full-time',
    seats: 40,
    annualFeeINR: 1080000,
    icon: 'health',
    medianCtcLPA: 17.2,
    highlights: [
      'Clinical operations rotation across three partner hospitals',
      'Health economics and payer-mix modelling',
      'NABH accreditation readiness workshop',
      'Digital health and telemedicine product studio',
    ],
    eligibility: [
      "Bachelor's degree in any discipline with a minimum 50% aggregate",
      'Clinical, life-sciences or pharma background preferred',
      'CAT / XAT / GMAT / MAT score from the last 24 months',
      'Personal interview with the healthcare faculty panel',
    ],
    curriculum: [
      {
        title: 'Semester I — Foundations',
        subjects: [
          'Healthcare Systems & Policy',
          'Managerial Economics',
          'Financial Accounting',
          'Business Statistics',
          'Organisational Behaviour',
        ],
      },
      {
        title: 'Semester II — Core',
        subjects: [
          'Hospital Operations Management',
          'Health Economics & Payer Systems',
          'Healthcare Quality & Patient Safety',
          'Corporate Finance',
          'Marketing Management',
        ],
      },
      {
        title: 'Semester III — Specialisation',
        subjects: [
          'Clinical Services Planning',
          'Healthcare Analytics & Informatics',
          'Pharmaceutical & Medical Device Management',
          'Health Insurance & Claims Management',
          'Industry Immersion Trimester',
        ],
      },
      {
        title: 'Semester IV — Applied',
        subjects: [
          'Digital Health & Telemedicine',
          'Healthcare Regulation & Accreditation',
          'Public Health Programme Management',
          'Hospital Financial Management',
          'Capstone Health Systems Project',
        ],
      },
    ],
    careers: [
      'Hospital Administrator',
      'Healthcare Consultant',
      'Health-Tech Product Manager',
      'Clinical Operations Manager',
      'Payer Relations Manager',
      'Public Health Programme Lead',
    ],
  },
]

/** Unique department list, derived — never maintained by hand. */
export const programDepartments = [...new Set(programs.map((p) => p.department))].sort()

export function getProgramBySlug(slug: string | undefined): Program | undefined {
  return programs.find((p) => p.slug === slug)
}

/** Same-department programmes first, topped up with others so the rail is never empty. */
export function getRelatedPrograms(slug: string, limit = 3): Program[] {
  const current = getProgramBySlug(slug)
  if (!current) return programs.slice(0, limit)

  const others = programs.filter((p) => p.slug !== slug)
  const sameDept = others.filter((p) => p.department === current.department)
  const rest = others.filter((p) => p.department !== current.department)
  return [...sameDept, ...rest].slice(0, limit)
}

/** Powers the search box on `/programs`. */
export function searchPrograms(query: string, department: string): Program[] {
  const q = query.trim().toLowerCase()
  return programs.filter((p) => {
    const matchesDept = department === 'All' || p.department === department
    if (!q) return matchesDept
    const haystack = [p.title, p.shortTitle, p.tagline, p.department, ...p.careers, ...p.highlights]
      .join(' ')
      .toLowerCase()
    return matchesDept && haystack.includes(q)
  })
}
