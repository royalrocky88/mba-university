/**
 * Chatbot regression check.
 *
 * Run with `npm run check:chatbot`. Asserts that every question a visitor is
 * likely to ask resolves to a real answer (not the "I could not find that"
 * fallback), that each one lands on the intent we expect, and that off-topic
 * questions are still declined rather than answered with something plausible.
 *
 * Cheap to extend: add a row to `cases` whenever you add an intent. The trigger
 * matching in `src/lib/chatbot/text.ts` is subtle enough that a change which
 * fixes one question routinely breaks another — this catches that.
 */
import { buildSeedSnapshot } from '../src/lib/repository/seed'
import { answerQuestion } from '../src/lib/chatbot/engine'

const content = buildSeedSnapshot()

/** `expect` is a substring the answer must contain. */
const cases: { question: string; expect: string }[] = [
  { question: 'hello', expect: 'admissions assistant' },
  { question: 'what can you do?', expect: 'assistant for the' },
  { question: 'which programmes do you offer?', expect: 'MBA specialisations' },
  { question: 'what are the fees?', expect: 'Tuition ranges from' },
  { question: 'tell me about the finance specialisation', expect: 'Finance & Capital Markets' },
  { question: 'finance curriculum', expect: 'curriculum across' },
  { question: 'business analytics careers', expect: 'typically move into' },
  { question: 'fees for the marketing programme', expect: 'per year' },
  { question: 'which programme should i choose', expect: 'depends on where you want' },
  { question: 'am i eligible without work experience?', expect: 'No work experience is required' },
  { question: 'what is the eligibility criteria', expect: 'General eligibility' },
  { question: 'which entrance exams do you accept', expect: 'CAT, XAT, GMAT, GRE and MAT' },
  { question: 'what is the last date to apply', expect: 'Key dates' },
  { question: 'how do i apply', expect: 'six steps' },
  { question: 'scholarships available?', expect: 'scholarship schemes' },
  { question: 'can i get an education loan', expect: 'scheduled banks' },
  { question: 'placement record and highest package', expect: 'Placement record' },
  { question: 'which companies recruit here', expect: 'recruit on campus' },
  { question: 'is there interview preparation support', expect: 'Career Development Centre' },
  { question: 'who is Dr. Ananya Raghavan', expect: 'Ananya Raghavan' },
  { question: 'tell me about the faculty', expect: 'core faculty members' },
  { question: 'is hostel accommodation available', expect: 'guaranteed for all first-year' },
  { question: 'what facilities are on campus', expect: 'acres' },
  { question: 'latest news', expect: 'most recent updates' },
  { question: 'contact number and address', expect: 'reach us at' },
  { question: 'what is your NIRF ranking', expect: 'NAAC A++' },
  { question: 'how many seats in total', expect: 'two-year, full-time' },
  { question: 'i am an international student, can i apply', expect: 'International and NRI' },
  { question: 'what do alumni say', expect: 'alumni across' },
  { question: 'tell me about the school history', expect: 'gap that had become' },
]

/**
 * Hinglish questions must reach the same intent *and* come back in Hinglish.
 * `expect` is checked against the answer, so each string is deliberately a
 * Hinglish phrase — an English answer here means the localisation silently
 * stopped firing.
 */
const hinglishCases: { question: string; expect: string }[] = [
  { question: 'namaste', expect: 'admissions assistant hoon' },
  { question: 'fees kitni hai', expect: 'per academic year' },
  { question: 'MBA ki fees kya hai', expect: 'Tuition fees' },
  { question: 'admission kaise le', expect: 'chhe steps' },
  { question: 'last date kab hai', expect: 'important dates' },
  { question: 'kaunse programmes hain', expect: 'MBA specialisations' },
  { question: 'eligibility kya hai', expect: 'general eligibility' },
  { question: 'placement kaisa hai', expect: 'placement record' },
  { question: 'kaunsi kampani aati hai', expect: 'campus par recruit' },
  { question: 'hostel milega kya', expect: 'hostel guaranteed' },
  { question: 'chhatravritti milti hai kya', expect: 'scholarship schemes' },
  { question: 'education loan mil sakta hai', expect: 'scheduled banks' },
  { question: 'kitni seats hain', expect: 'Total intake' },
  { question: 'campus kaisa hai', expect: '200 acres' },
  { question: 'sampark number batao', expect: 'sampark kar sakte hain' },
  { question: 'faculty ke baare mein batao', expect: 'core faculty members' },
  { question: 'naukri kaisi milti hai', expect: 'placement record' },
  { question: 'kaunsa programme lena chahiye', expect: 'depend karta hai' },
  { question: 'shukriya', expect: 'Koi baat nahi' },
]

/** These must NOT be answered — the bot is scoped to this site only. */
const offTopic = [
  'who won the world cup in 1998',
  'what is the capital of australia',
  'write me a python script',
  'mausam kaisa hai aaj',
]

let failures = 0

function check(question: string, expect: string, label: string) {
  const answer = answerQuestion(content, question)
  const body = answer.text.join(' ')

  if (answer.unresolved) {
    console.error(`FAIL  ${label} ${question}\n      declined, but should have been answered`)
    failures++
  } else if (!body.toLowerCase().includes(expect.toLowerCase())) {
    console.error(
      `FAIL  ${label} ${question}\n      expected to contain "${expect}"\n      got: ${body.slice(0, 140)}`,
    )
    failures++
  } else {
    console.log(`ok    ${label} ${question}`)
  }
}

for (const { question, expect } of cases) check(question, expect, '[en]')
for (const { question, expect } of hinglishCases) check(question, expect, '[hi]')

for (const question of offTopic) {
  const answer = answerQuestion(content, question)
  if (!answer.unresolved) {
    console.error(`FAIL  ${question}\n      answered, but is off-topic and should be declined`)
    failures++
  } else {
    console.log(`ok    (declined) ${question}`)
  }
}

const total = cases.length + hinglishCases.length + offTopic.length
console.log(`\n${total - failures}/${total} passed.`)

if (failures > 0) process.exit(1)
