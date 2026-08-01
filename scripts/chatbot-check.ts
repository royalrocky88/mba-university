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

  // Process detail — questions applicants ask that the pages only imply.
  { question: 'what documents do i need', expect: 'Document verification happens at enrolment' },
  { question: 'is there a refund if i withdraw', expect: 'non-refundable once the form' },
  { question: 'what is the selection process', expect: 'Selection is two stages' },
  { question: 'is there an interview round', expect: 'Personal interview' },
  { question: 'when does the session start', expect: 'pre-term bridge course begins' },
  { question: 'is there a management quota', expect: 'no management quota' },
  { question: 'what is the reservation policy', expect: '45% aggregate rather than 50%' },
  { question: 'do you have a waiting list', expect: 'ranked waitlist' },
  { question: 'do you offer executive mba', expect: 'two-year, full-time, residential' },
  { question: 'can i study part time while working', expect: 'not the right programme for you' },
  { question: 'is there a summer internship', expect: 'between the first and second year' },
  { question: 'what is the teaching methodology', expect: 'in person on campus' },
  { question: 'are classes online or offline', expect: 'residential and full time' },
  { question: 'what is the grading system', expect: 'ten-point CGPA' },
  { question: 'which sector hires the most', expect: 'spreads across these sectors' },
  { question: 'what is the nearest railway station', expect: 'Nizamuddin' },
  { question: 'is there a bus service', expect: 'shuttle' },
  { question: 'can i visit the campus', expect: 'led by current students' },
  { question: 'can parents visit', expect: 'families are welcome' },
  { question: 'is the campus safe for girls', expect: 'zero-tolerance policy on ragging' },
  { question: 'is there a dress code', expect: 'no daily uniform' },
  { question: 'do you have a brochure', expect: 'kept current here first' },
  // Naming an exam we do not accept must say so, not just list the ones we do.
  { question: 'do you accept CMAT', expect: 'state CETs and ATMA' },
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
  { question: 'documents kya kya chahiye', expect: 'Document verification enrolment ke waqt' },
  { question: 'documents lekar aana hai kya', expect: 'Original aur ek photocopy' },
  { question: 'refund milega kya', expect: 'Teen alag rakam' },
  { question: 'interview hota hai kya', expect: 'Selection do stages mein' },
  { question: 'session kab start hoga', expect: 'bridge course June mein' },
  { question: 'class kab se start hoti hai', expect: 'pehla term uske turant baad' },
  { question: 'internship milti hai', expect: 'summer internship' },
  { question: 'ladkiyon ke liye safe hai', expect: 'zero-tolerance policy' },
  { question: 'parents aa sakte hain', expect: 'parents dono welcome hain' },
  { question: 'bus service hai kya', expect: 'shuttle' },
  { question: 'brochure mil sakta hai', expect: 'brochure' },
]

/**
 * These must NOT be answered — the bot is scoped to this site only.
 *
 * Most of these borrow our own vocabulary to ask about somewhere else, which is
 * exactly the case substring triggers get wrong: "is there a dress code" and
 * "is there a dress code at Google" fire the same rule. Answering the second in
 * our voice is worse than declining, so `asksAboutSomewhereElse` in the engine
 * runs before intent matching and these cases lock that behaviour in.
 */
const offTopic = [
  'who won the world cup in 1998',
  'what is the capital of australia',
  'write me a python script',
  'mausam kaisa hai aaj',
  // our vocabulary, somebody else's subject
  'is bitcoin safe to invest in',
  'what is the safety rating of a volvo',
  'what grade of steel is strongest',
  'give me a pdf of harry potter',
  'how do i transport furniture',
  'recommend a lecture on quantum physics',
  'write a poem about rain',
  'which documents do i need for a passport',
  'what is the refund policy of amazon',
  'is there a dress code at google',
  'best interview tips for a google job',
  'can i get an internship at microsoft',
  'what is the grading system in american universities',
  'sector performance of nifty 50',
  'how do i cancel my netflix subscription',
  // a place that is not ours, with nothing tying the question back to us
  'how to reach mumbai from delhi',
  'bus service in bangalore',
  // personal questions about the assistant are not questions about the school
  'who are your parents',
  'my parents are angry with me',
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
