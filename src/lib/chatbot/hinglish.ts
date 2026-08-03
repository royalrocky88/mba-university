import type { ContentSnapshot } from '@/lib/repository'
import { formatDate, formatINR } from '@/lib/utils'
import { importantDates } from '@/data/admissions'
import type { ChatAnswer } from './types'

/**
 * Hinglish (Roman Hindi/Urdu) support.
 *
 * Two separate jobs, and conflating them would break both:
 *
 *  1. **Understanding.** `translateQuery` rewrites Hinglish keywords into their
 *     English equivalents *before* intent matching, so "fees kitni hai" reaches
 *     the same intent as "what are the fees". The original words are kept
 *     alongside the translations, because plenty of Hinglish questions are
 *     already half English ("MBA ki fees kya hai").
 *
 *  2. **Answering.** `localise` swaps the prose in an answer for a Hinglish
 *     rendering. Figures, dates, programme titles and people's names are left
 *     exactly as they are — that is how an Indian admissions desk actually
 *     speaks, and mangling a fee into Devanagari-transliterated digits would
 *     help nobody.
 */

/**
 * Hinglish word → the English word the intent triggers are written against.
 *
 * Every key here must be a word that only appears in Hinglish. Adding an
 * English word — "fees", "hostel", "package" — would make `isHinglish` fire on
 * plain English questions and answer them in Hinglish.
 */
const LEXICON: Record<string, string> = {
  // question words
  kya: 'what',
  kyaa: 'what',
  kaise: 'how',
  kese: 'how',
  kaisay: 'how',
  kaisa: 'how',
  kaisi: 'how',
  kab: 'when',
  kahan: 'where',
  kaha: 'where',
  kaun: 'which',
  kaunsa: 'which',
  konsa: 'which',
  kaunsi: 'which',
  konsi: 'which',
  kitna: 'how much',
  kitni: 'how much',
  kitne: 'how many',
  kyu: 'why',
  kyun: 'why',
  kyon: 'why',

  // admissions
  daakhila: 'admission',
  dakhila: 'admission',
  pravesh: 'admission',
  bharna: 'apply',
  bharne: 'apply',
  aavedan: 'application',
  avedan: 'application',
  yogyata: 'eligibility',
  patrata: 'eligibility',
  antim: 'last',
  tarikh: 'date',
  tareekh: 'date',
  samay: 'time',

  // money
  shulk: 'fees',
  paisa: 'fees',
  paise: 'fees',
  kharcha: 'cost',
  kharch: 'cost',
  rupaye: 'fees',
  chhatravritti: 'scholarship',
  chatravritti: 'scholarship',
  karza: 'loan',
  karz: 'loan',
  udhaar: 'loan',

  // study
  padhai: 'study',
  padai: 'study',
  padhna: 'study',
  padhne: 'study',
  vishay: 'subject',
  paathyakram: 'curriculum',
  pathyakram: 'curriculum',
  saal: 'year',
  varsh: 'year',

  // outcomes
  naukri: 'job',
  nokri: 'job',
  nakri: 'job',
  rozgar: 'job',
  vetan: 'salary',
  tankhwah: 'salary',
  tankhwa: 'salary',
  kampani: 'companies',
  kampaniyan: 'companies',

  // people & places
  adhyapak: 'faculty',
  shikshak: 'faculty',
  chhatravas: 'hostel',
  chatravas: 'hostel',
  rehna: 'accommodation',
  rehne: 'accommodation',
  khana: 'dining',
  bhojan: 'dining',
  pustakalay: 'library',
  parisar: 'campus',
  sansthan: 'institution',
  vishwavidyalaya: 'university',

  // general verbs / fillers that carry intent
  batao: 'tell',
  bataye: 'tell',
  bataiye: 'tell',
  batayein: 'tell',
  jankari: 'information',
  jaankari: 'information',
  suchna: 'information',
  // "lena chahiye" is the usual way of asking for a recommendation, so this
  // maps to "should" rather than "need" — that is the word the intent looks for.
  chahiye: 'should',
  chaahiye: 'should',
  milega: 'available',
  milegi: 'available',
  milti: 'available',
  hoga: 'is',
  hogi: 'is',
  sakta: 'can',
  sakte: 'can',
  sakti: 'can',
  karna: 'do',
  karne: 'do',
  lena: 'choose',
  lene: 'choose',
  sampark: 'contact',
  pata: 'address',
}

/** Words that signal the question is Hinglish rather than English. */
const MARKERS = new Set([
  ...Object.keys(LEXICON),
  'hai', 'hain', 'he', 'hu', 'hoon', 'ho', 'tha', 'thi', 'the',
  'mein', 'me', 'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'aur',
  'nahi', 'nahin', 'haan', 'ha', 'ji', 'to', 'toh', 'bhi', 'sab',
  'mujhe', 'muje', 'mera', 'meri', 'aap', 'apka', 'aapka', 'tum',
  'agar', 'lekin', 'phir', 'abhi', 'accha', 'acha', 'theek', 'thik',
  'namaste', 'namaskar', 'shukriya', 'dhanyavad',
])

/** English words that would otherwise be misread as Hinglish markers. */
const FALSE_FRIENDS = new Set(['he', 'me', 'to', 'ho', 'the', 'ha', 'par', 'so', 'ji'])

function words(text: string): string[] {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
}

/**
 * True when the question reads as Hinglish.
 *
 * Requires a marker that is not also a common English word, so "tell me the
 * fees" is not misclassified on the strength of "me" and "the".
 */
export function isHinglish(text: string): boolean {
  const tokens = words(text)
  return tokens.some((token) => MARKERS.has(token) && !FALSE_FRIENDS.has(token))
}

/**
 * Appends English equivalents for any Hinglish words found, leaving the original
 * text in place. Additive rather than substitutive because mixed-script
 * questions are the norm, and dropping the English half would lose signal.
 */
export function translateQuery(text: string): string {
  const extra: string[] = []
  for (const token of words(text)) {
    const english = LEXICON[token]
    if (english && !text.includes(english)) extra.push(english)
  }
  return extra.length > 0 ? `${text} ${extra.join(' ')}` : text
}

// ---------------------------------------------------------------------------
// Hinglish renderings
// ---------------------------------------------------------------------------

type Renderer = (content: ContentSnapshot) => Partial<ChatAnswer>

/**
 * Hinglish prose for the intents visitors ask most. Anything not listed falls
 * back to the English answer with a Hinglish opening line, which is far better
 * than a machine-mangled translation of a fee table.
 */
const RENDERERS: Record<string, Renderer> = {
  greeting: (c) => ({
    text: [
      `Namaste! Main ${c.settings.shortName} ka admissions assistant hoon.`,
      `Aap mujhse hamare ${c.programs.length} MBA specialisations, fees, admission process, placements, faculty ya campus ke baare mein kuch bhi puch sakte hain — Hindi, English ya Hinglish mein.`,
    ],
    chips: ['Kaunse programmes hain?', 'Fees kitni hai?', 'Admission kaise le?', 'Placement record'],
  }),

  capabilities: (c) => ({
    text: [
      `Main is website ka assistant hoon — jo bhi bataunga, wo isi site ke content se aata hai, isliye hamesha updated rehta hai.`,
      'Main in sab mein madad kar sakta hoon:',
      [
        `• Saare ${c.programs.length} MBA specialisations — curriculum, fees, seats, career`,
        '• Admission process, eligibility, entrance exams aur last dates',
        '• Fee structure, scholarships aur education loan',
        '• Placement statistics, recruiters aur sector split',
        `• Faculty profiles (${c.faculty.length} members) aur unki expertise`,
        '• Campus facilities, hostel aur student life',
        '• Latest news aur announcements',
        '• Contact details aur campus tak kaise pahunchein',
      ].join('\n'),
    ],
    chips: ['Programmes compare karein', 'Last date kab hai?', 'Highest package'],
  }),

  thanks: () => ({
    text: ['Koi baat nahi! Programmes, admission ya campus ke baare mein aur kuch puchna ho to bataiye.'],
    chips: ['Admission process', 'Scholarships', 'Campus facilities'],
  }),

  documents: () => ({
    text: [
      'Application *shuru* karne ke liye kuch nahi chahiye — form abhi bhar sakte hain aur entrance score baad mein, round close hone tak add kar sakte hain.',
      'Document verification enrolment ke waqt hota hai, seat accept karne ke baad. Original aur ek photocopy laayein:',
      [
        '• Degree certificate aur bachelor’s ke har saal ki marksheet',
        '• Class X aur XII ke certificates',
        '• Entrance scorecard (CAT / XAT / GMAT / GRE / MAT)',
        '• Photo ID aur address proof',
        '• Category certificate, agar relaxed cut-off claim kar rahe hain',
        '• Experience letters, agar work experience declare karna hai',
        '• Migration aur transfer certificate',
      ].join('\n'),
      'Final year ke students provisional certificate par enrol kar sakte hain — completion proof pehle term khatam hone se pehle dena hoga.',
    ],
    chips: ['Eligibility kya hai?', 'Admission kaise le?', 'Session kab start hoga?'],
  }),

  refund: () => ({
    text: [
      'Teen alag rakam, teen alag niyam:',
      [
        '• **₹2,500 application fee** — form submit karne ke baad wapas nahi hoti.',
        '• **₹25,000 security deposit** — poori refundable hai, graduate ya withdraw karne par milti hai (bakaya kaat kar).',
        '• **Tuition** — sliding scale par refund hoti hai, is baat par ki aap term shuru hone se kitna pehle chhod rahe hain aur seat dobara bhar paayi ja sakti hai ya nahi.',
      ].join('\n'),
      'Tuition ka scale regulator ke norms se aata hai, school ki apni policy se nahi — admissions office aapki exact date ke hisaab se figure likhit mein de dega.',
    ],
    chips: ['Fee structure', 'Scholarships'],
  }),

  'selection-process': () => ({
    text: [
      'Selection do stages mein hota hai, dono application close hone ke baad.',
      '**1. Shortlisting aur written ability test** — har round close hone ke teen hafton ke andar shortlist aati hai. Zyadatar specialisations mein interview wale din ek written ability test hota hai.',
      '**2. Personal interview** — Greater Noida campus par tees minute ka panel interview. India se bahar kaam kar rahe candidates ke liye kuch video slots bhi hain.',
      'Interview ke ikkis din ke andar offer aata hai, scholarship decision ke saath.',
    ],
    chips: ['Last date kab hai?', 'Documents kya chahiye?', 'Scholarships'],
  }),

  'session-start': () => ({
    text: [
      'Pre-term bridge course June mein shuru hota hai, aur pehla term uske turant baad.',
      'Bridge course sirf formality nahi hai — quantitative methods aur accounting ko us level tak le jaata hai jahan non-commerce background wale students comfortable ho jaayein, jo ek typical batch ka bada hissa hote hain.',
      'Enrolment aur document verification usse pehle poore ho jaate hain.',
    ],
    chips: ['Important dates', 'Documents kya chahiye?', 'Hostel milega kya?'],
  }),

  internship: () => ({
    text: [
      'Haan — **pehle aur doosre saal ke beech summer internship** hoti hai, aam taur par aath se das hafte, Career Development Centre ke through.',
      'Yehi final placement ka sabse bada factor hai: bahut saare pre-placement offers usi summer company se aate hain, isliye internship process bhi final recruitment jitni seriously chalti hai.',
      'Doosre saal mein partner firms ke saath live consulting projects bhi chalte hain.',
    ],
    chips: ['Placement kaisa hai?', 'Kaunsi kampani aati hai?', 'Career support'],
  }),

  safety: () => ({
    text: [
      'Campus gated hai aur chaubees ghante staff rehta hai — residential halls mein controlled entry, aur saare common areas mein lighting aur CCTV.',
      'Ragging aur harassment par **zero-tolerance policy** hai. Anti-ragging committee aur internal complaints committee dono hain, jinse student seedha sampark kar sakta hai — warden ya faculty ke through jaana zaroori nahi.',
      'Residential halls ke alag wings hain apne access control ke saath, aur har waqt ek warden on call rehta hai.',
    ],
    chips: ['Hostel milega kya?', 'Campus kaisa hai?', 'Student clubs'],
  }),

  'campus-visit': (c) => ({
    text: [
      'Haan — prospective students aur unke parents dono welcome hain, aur do saal aur itni fees commit karne se pehle ek baar aa kar dekh lena sach mein sahi rehta hai.',
      `Tours working days par office hours mein hote hain (${c.settings.officeHours}), aur current students karate hain — marketing team nahi, isliye jawab zyada seedhe milte hain.`,
      `Pehle se book kar lein: **${c.settings.admissionsPhone}** ya **${c.settings.admissionsEmail}**.`,
    ],
    chips: ['Campus tak kaise pahunchein?', 'Campus kaisa hai?', 'Hostel milega kya?'],
  }),

  'programs-list': (c) => ({
    text: [
      `Hum **${c.programs.length} MBA specialisations** offer karte hain — sab do-saal ke full-time programmes hain:`,
      c.programs
        .map((p) => `• **${p.shortTitle}** — ${p.seats} seats, ${formatINR(p.annualFeeINR)}/saal, median ₹${p.medianCtcLPA} LPA`)
        .join('\n'),
      'Jis mein interest ho bataiye — main uska curriculum, career options aur eligibility bata dunga.',
    ],
    chips: c.programs.slice(0, 4).map((p) => p.shortTitle),
  }),

  fees: (c) => {
    const cheapest = [...c.programs].sort((a, b) => a.annualFeeINR - b.annualFeeINR)[0]
    const priciest = [...c.programs].sort((a, b) => b.annualFeeINR - a.annualFeeINR)[0]
    return {
      text: [
        `Tuition fees **${formatINR(cheapest.annualFeeINR)}** (${cheapest.shortTitle}) se **${formatINR(priciest.annualFeeINR)}** (${priciest.shortTitle}) tak hai — per academic year.`,
        'Tuition ke alawa har saal:',
        [
          '• Hostel (twin sharing): ₹1,80,000',
          '• Dining plan: ₹96,000',
          '• Course material aur database access: ₹45,000',
          '• One-time admission aur alumni fee: ₹60,000 (sirf pehle saal)',
        ].join('\n'),
        'Merit par 100% tak tuition scholarship milti hai, aur nau lenders ke through education loan bhi available hai.',
      ],
      chips: ['Scholarship kaise milegi?', 'Education loan', 'Finance ki fees'],
    }
  },

  scholarship: () => ({
    text: [
      'Chaar scholarship schemes hain, aur har offer letter ke saath uska scholarship decision bhi aata hai — matlab seat accept karne se pehle hi aapko pata hoga ki kitna kharcha aayega:',
      [
        '• **AKU Merit Award** — 100% tak tuition. Automatic consideration, alag application nahi.',
        '• **Need-Based Grant** — 60% tak tuition, verified family income par.',
        '• **Women in Business Scholarship** — ₹4,00,000 per year, 24 awards.',
        '• **Armed Forces & Public Service Award** — ₹3,00,000 per year.',
      ].join('\n'),
      'Round 1 mein apply karne walon ko poore scholarship pool ke against dekha jata hai — jaldi apply karne ka yahi asli fayda hai.',
    ],
    chips: ['Total fees', 'Education loan', 'Round 1 ki last date'],
  }),

  loan: () => ({
    text: [
      'Ji haan — saat scheduled banks aur do NBFC ke saath hamari tie-up hai. Seat accept karne ke baad aam taur par **das working days** mein pre-approved sanction letter mil jata hai.',
      'Tuition bhi ek saath nahi, har saal do instalments mein deni hoti hai.',
      'School ko kisi bhi lender se commission nahi milta.',
    ],
    chips: ['Fee structure', 'Scholarships'],
  }),

  eligibility: () => ({
    text: [
      'Full-time MBA ke liye general eligibility:',
      [
        '• Kisi bhi stream mein kam se kam 3 saal ki bachelor’s degree (recognised university se)',
        '• Kul milakar 50% marks (reserved categories ke liye 45%)',
        '• Final year ke students bhi apply kar sakte hain — enrolment se pehle proof dena hoga',
        '• Pichhle 24 mahine ka valid CAT / XAT / GMAT / GRE / MAT score',
        '• Koi age limit nahi, aur work experience zaroori nahi',
      ].join('\n'),
      'Har specialisation ke apne extra requirements ho sakte hain — jaise Business Analytics & AI ke liye 85 percentile quant aur ek programming aptitude test.',
    ],
    chips: ['Kaunse entrance exam chalte hain?', 'Fresher apply kar sakta hai?', 'Admission kaise le?'],
  }),

  'entrance-exam': () => ({
    text: [
      'Hum **CAT, XAT, GMAT, GRE aur MAT** — paanchon accept karte hain, pichhle 24 mahine ke andar ka score hona chahiye. Kisi ek ko preference nahi di jati; agar ek se zyada score hain to sabse achha wala dekha jata hai.',
      'Percentile expectation specialisation ke hisaab se:',
      [
        '• Business Analytics & AI — quant mein 85 percentile ya upar',
        '• Finance — quant mein 75 percentile ya upar',
        '• Operations — quant mein 70 percentile ya upar',
        '• Baaki sabhi specialisations — koi fixed quant cut-off nahi',
      ].join('\n'),
      'Shortlist hone ke baad interview wale din ek 30-minute ka written ability test bhi hota hai — usme sahi jawab se zyada aapki soch aur structure dekha jata hai.',
    ],
    chips: ['Last date kab hai?', 'Interview process', 'Eligibility'],
  }),

  deadline: () => ({
    text: [
      'Is admission cycle ki important dates:',
      importantDates
        .map((d) => `• ${d.label} — **${formatDate(d.date)}**${d.status === 'open' ? '  _(abhi open hai)_' : ''}`)
        .join('\n'),
      'Applications teen rounds mein dekhi jati hain. Round 1 mein apply karne par poora scholarship pool available rehta hai, jo baad ke rounds mein nahi milta.',
    ],
    chips: ['Admission kaise le?', 'Scholarships', 'Eligibility'],
  }),

  'how-to-apply': () => ({
    text: [
      'Process chhe steps mein chalta hai:',
      [
        '**1. Online application bharein** — ek hi form saare specialisations ke liye, teen preferences tak rank kar sakte hain. Fee ₹2,500 (need-based scheme mein maaf).',
        '**2. Entrance score upload karein** — CAT / XAT / GMAT / GRE / MAT, round close hone tak add kar sakte hain.',
        '**3. Shortlist aur written test** — round band hone ke teen hafte ke andar shortlist aati hai.',
        '**4. Personal interview** — campus par 30 minute ka panel interview; bahar rehne walon ke liye video slots bhi hain.',
        '**5. Offer aur scholarship** — dono saath mein aate hain, interview ke 21 din ke andar.',
        '**6. Accept aur enrol** — pehli instalment se seat confirm, phir June 2027 mein bridge course.',
      ].join('\n\n'),
    ],
    chips: ['Application fee kitni hai?', 'Eligibility', 'Kaunse entrance exam?'],
  }),

  'work-experience': () => ({
    text: [
      'Nahi, work experience zaroori nahi hai. Har batch ka lagbhag paanchwa hissa seedha graduation ke baad aata hai.',
      'Lekin ye zaroor jaan lijiye — median admit **chautis mahine** ka experience lekar aata hai, aur classroom discussion mein professional context maan liya jata hai. Freshers ko pehle trimester mein thodi zyada mehnat karni padti hai.',
    ],
    chips: ['Admission process', 'Class profile', 'Placements'],
  }),

  placements: (c) => {
    const best = [...c.programs].sort((a, b) => b.medianCtcLPA - a.medianCtcLPA).slice(0, 3)
    return {
      text: [
        'Sabse recent graduating class ka placement record:',
        [
          '• Placement rate: **98%** — 90 din ke andar',
          '• Highest CTC: **₹62 LPA** — investment banking, Singapore',
          '• Median CTC: **₹18.4 LPA** — saare specialisations milakar',
          '• Total offers: **612** — 471 students ki class ko',
        ].join('\n'),
        'Median CTC ke hisaab se sabse strong specialisations:',
        best.map((p) => `• ${p.shortTitle} — ₹${p.medianCtcLPA} LPA`).join('\n'),
        '340+ recruiting partners ne chaudah sectors se participate kiya.',
      ],
      chips: ['Kaunsi companies aati hain?', 'Placement support', 'Sector split'],
    }
  },

  recruiters: (c) => ({
    text: [
      '**340+ organisations** campus par recruit karti hain, chaudah sectors mein. Kuch naam:',
      c.recruiters.slice(0, 12).map((r) => `• ${r.name} — ${r.sector}`).join('\n'),
    ],
    chips: ['Highest package', 'Placement rate', 'Placement support'],
  }),

  hostel: () => ({
    text: [
      'Pehle saal ke **sabhi students ko hostel guaranteed** hai. Doosre saal preference aur availability ke hisaab se allot hota hai.',
      'Chhe halls hain, 820 beds — single aur twin rooms, har hall mein apna common room, pantry aur 24-ghante khula study lounge.',
      'Hostel charges ₹1,80,000 per year (twin sharing) hain, aur dining plan alag se ₹96,000.',
    ],
    chips: ['Campus facilities', 'Student life', 'Fee structure'],
  }),

  campus: (c) => ({
    text: [
      'Campus **200 acres** ka hai, Greater Noida mein — 9.4 lakh sq ft built-up. Classrooms se teen guna zyada study rooms hain, aur library dono exam terms mein chaubees ghante khuli rehti hai.',
      c.facilities.map((f) => `• **${f.title}** (${f.stat}) — ${f.description}`).join('\n'),
    ],
    chips: ['Hostel', 'Library timings', 'Sports facilities'],
  }),

  faculty: (c) => {
    const departments = [...new Set(c.faculty.map((f) => f.department))]
    return {
      text: [
        `Hamare paas **${c.faculty.length} core faculty members** hain, ${departments.length} departments mein. Do-tihai ne join karne se pehle industry mein senior positions par kaam kiya hai.`,
        c.faculty.slice(0, 6).map((f) => `• **${f.name}** — ${f.designation}`).join('\n'),
        'Kisi ka bhi naam bataiye, main unki poori profile de dunga.',
      ],
      chips: c.faculty.slice(0, 3).map((f) => `${f.name} kaun hain?`),
    }
  },

  news: (c) => {
    const latest = [...c.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    return {
      text: [
        'School ki sabse nayi updates:',
        latest
          .map((n) => `• **${n.title}** _(${formatDate(n.date)}, ${n.category})_\n  ${n.excerpt}`)
          .join('\n\n'),
      ],
      chips: ['Admission news', 'Placement news', 'Aane wale events'],
    }
  },

  contact: (c) => ({
    text: [
      'Aap humse yahan sampark kar sakte hain:',
      [
        `• Admissions: **${c.settings.admissionsPhone}** · ${c.settings.admissionsEmail}`,
        `• General enquiries: ${c.settings.generalPhone} · ${c.settings.generalEmail}`,
        `• Campus: ${c.settings.address}`,
        `• Office hours: ${c.settings.officeHours}`,
      ].join('\n'),
      'Campus visit kisi bhi working day par admissions office ke through arrange ho sakti hai.',
    ],
    chips: ['Campus visit book karein', 'Admission process', 'Abhi apply karein'],
  }),

  'ranking-accreditation': (c) => ({
    text: [
      `${c.settings.name} ke paas ye accreditations hain: **${c.settings.accreditations.join(', ')}**.`,
      'NAAC A++ grade February 2026 mein dobara mila, 4 mein se 3.71 CGPA ke saath — paanch din ke peer team review ke baad.',
      'Peer report ne khaas taur par industry immersion trimester, industry background wale faculty ka proportion, aur placement reporting ki transparency ko saraha.',
    ],
    chips: ['Placement record', 'Faculty', 'Campus'],
  }),

  'duration-seats': (c) => {
    const totalSeats = c.programs.reduce((sum, p) => sum + p.seats, 0)
    return {
      text: [
        'Saare specialisations **do saal, full-time** hain — chaar semesters mein.',
        `Total intake **${totalSeats} seats** hai, ${c.programs.length} specialisations mein:`,
        c.programs.map((p) => `• ${p.shortTitle} — ${p.seats} seats`).join('\n'),
        'Har section maximum 60 students ka rakha jata hai — jaan-boojh kar, kyunki isse bada group ho to faculty har student ki soch nahi samajh paati.',
      ],
      chips: ['Eligibility', 'Admission kaise le?', 'Fees'],
    }
  },

  'international-student': (c) => ({
    text: [
      'International aur NRI candidates usi form se apply karte hain aur unhi criteria par assess hote hain — bas Indian entrance exams ki jagah **GMAT ya GRE** chalta hai.',
      'Video interview slots available hain, aur offer accept karne ke baad International Office student visa process mein madad karta hai.',
      'Alag se, hamare International Business specialisation mein Europe aur South-East Asia ke gyarah partner schools mein compulsory exchange term bhi hai.',
    ],
    chips: ['Exchange partners', 'Hostel', `Email ${c.settings.admissionsEmail}`],
  }),

  'program-recommend': () => ({
    text: [
      'Ye is baat par depend karta hai ki aap aage jaana kahan chahte hain — na ki kaunsa programme kagaz par sabse achha lagta hai. Mota-moti guide:',
      [
        '• **Finance** — investment banking, equity research, PE, corporate treasury',
        '• **Business Analytics & AI** — data science, product analytics, decision science',
        '• **Marketing** — brand management, growth, category aur product marketing',
        '• **Operations** — supply chain, procurement, plant aur network management',
        '• **Human Resources** — HR business partnering, people analytics, org design',
        '• **International Business** — cross-border strategy, trade, country management',
        '• **Sustainability & ESG** — climate risk, ESG assurance, impact investing',
        '• **Healthcare Management** — hospital administration, health-tech, payer strategy',
      ].join('\n'),
      'Sach ye hai ki sabse zyada package usi specialisation se milta hai jismein aap sabse zyada mehnat karenge.',
      'Ek hi application mein teen preferences rank kar sakte hain — aaj hi final decision lena zaroori nahi.',
    ],
    chips: ['Finance ki details', 'Business Analytics ki details', 'Placement by specialisation'],
  }),

  unresolved: (c) => ({
    text: [
      'Mujhe ye is site par nahi mila, aur andaaza lagane se behtar hai ki main saaf bata doon.',
      `Main sirf ${c.settings.name} se jude sawaalon ka jawab de sakta hoon — programmes, admission, fees, placements, faculty, campus aur news.`,
      `Baaki kisi cheez ke liye admissions se baat kar lijiye: **${c.settings.admissionsPhone}** ya **${c.settings.admissionsEmail}**.`,
    ],
    chips: ['Kaunse programmes hain?', 'Admission process', 'Fees aur scholarships', 'Placement record'],
  }),
}

/**
 * Returns the Hinglish version of an answer.
 *
 * Intents without a dedicated rendering keep their English body and gain a
 * Hinglish opening line — an honest partial beats a bad translation of a fee
 * table.
 */
export function localise(answer: ChatAnswer, content: ContentSnapshot): ChatAnswer {
  const id = answer.unresolved ? 'unresolved' : answer.intentId
  const renderer = id ? RENDERERS[id] : undefined

  if (renderer) {
    return { ...answer, ...renderer(content) }
  }

  return {
    ...answer,
    text: ['Ye rahi jankari — details English mein hain:', ...answer.text],
  }
}
