/** Shared chatbot types. Kept separate so `engine` and `hinglish` can both
 *  import them without a circular dependency. */

export type ChatLink = { label: string; to: string }

export type ChatAnswer = {
  /** Paragraphs. Supports `**bold**` and `_muted_` via the widget's RichText. */
  text: string[]
  links?: ChatLink[]
  /** Follow-up suggestions offered as tappable chips. */
  chips?: string[]
  /** Set when nothing matched — drives the "not sure" styling and the scope guard. */
  unresolved?: boolean
  /** Which intent produced this, used to pick a Hinglish rendering. */
  intentId?: string
}
