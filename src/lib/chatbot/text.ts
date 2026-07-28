/** Text utilities shared by the chatbot's intent matcher and its search fallback. */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'to', 'of',
  'in', 'on', 'at', 'for', 'with', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these',
  'those', 'it', 'its', 'as', 'by', 'from', 'me', 'my', 'i', 'you', 'your', 'we', 'our', 'us', 'they',
  'them', 'their', 'he', 'she', 'his', 'her', 'can', 'could', 'would', 'should', 'will', 'shall',
  'may', 'might', 'must', 'have', 'has', 'had', 'get', 'got', 'there', 'here', 'about', 'please',
  'tell', 'want', 'need', 'know', 'give', 'any', 'some', 'so', 'just', 'also', 'very', 'much',
  'many', 'more', 'most', 'up', 'out', 'over', 'into', 'per',
  // Interrogatives. These carry no retrieval signal but appear in ordinary prose,
  // so leaving them in lets an off-topic question ("what is the capital of
  // Australia?") score against any article that happens to contain "what".
  'what', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'which', 'whether',
])

/**
 * Very small stemmer — enough to make "fees"/"fee", "courses"/"course" and
 * "placements"/"placement" collide, without pulling in a linguistics library.
 */
function stem(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`
  if (word.endsWith('sses')) return word.slice(0, -2)
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2)
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3)
  return word
}

/** Lowercase, strip punctuation, drop stopwords, stem. */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem)
}

/** Normalised haystack for substring checks. */
export function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * True when any of `terms` matches the normalised text.
 *
 * Three matching modes, because one rule cannot cover all three cases:
 *   • `"how to apply"` — contains a space, matched as a plain substring.
 *   • `"cat$"`         — trailing `$`, matched as an exact whole word. Needed for
 *                        short exam codes: a loose "cat" fires inside
 *                        "edu**cat**ion", answering a loan question with the
 *                        entrance-exam list.
 *   • `"programme"`    — anything else, matched against the *start* of a word.
 *                        This is what lets one trigger cover "programme",
 *                        "programmes" and "specialis" cover "specialisation",
 *                        while still refusing to match mid-word.
 */
export function hasAny(text: string, terms: string[]): boolean {
  const words = splitWords(text)

  return terms.some((term) => {
    const needle = term.trim()
    if (!needle) return false
    if (needle.includes(' ')) return text.includes(needle)
    if (needle.endsWith('$')) return words.includes(needle.slice(0, -1))
    return words.some((word) => word.startsWith(needle))
  })
}

function splitWords(text: string): string[] {
  return text.split(/[^\p{L}\p{N}+]+/u).filter(Boolean)
}

/**
 * Overlap score between a query and a document, weighted so that rarer, longer
 * words count for more than short common ones.
 */
export function overlapScore(queryTokens: string[], docTokens: Set<string>): number {
  let score = 0
  for (const token of queryTokens) {
    if (docTokens.has(token)) score += 1 + Math.min(token.length, 10) / 12
  }
  return score
}

/** Pick the item whose name best matches the query — used for "who is Dr. X". */
export function bestNameMatch<T>(
  query: string,
  items: T[],
  nameOf: (item: T) => string,
): T | undefined {
  const text = normalize(query)
  let best: { item: T; score: number } | undefined

  for (const item of items) {
    const name = normalize(nameOf(item))
    // Compare on the significant words of the name, ignoring titles.
    const parts = name.split(' ').filter((p) => p.length > 2 && !['dr', 'prof', 'mr', 'ms', 'mrs'].includes(p))
    let score = 0
    if (text.includes(name)) score += 10
    for (const part of parts) {
      if (text.includes(part)) score += part.length >= 5 ? 3 : 1.5
    }
    if (score > 0 && (!best || score > best.score)) best = { item, score }
  }

  return best && best.score >= 3 ? best.item : undefined
}
