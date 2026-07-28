import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useContent } from '@/context/ContentProvider'
import { answerQuestion, greeting, type ChatAnswer } from '@/lib/chatbot/engine'
import { useIsSmallScreen } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

/**
 * Floating admissions assistant.
 *
 * Answers are generated locally from the live content snapshot — no API key, no
 * network round-trip, and no possibility of the bot inventing a fee or a
 * deadline that is not on the site.
 */

type Message = {
  id: number
  role: 'user' | 'bot'
  answer?: ChatAnswer
  text?: string
}

let messageId = 0

export function ChatWidget() {
  const { content } = useContent()
  const isSmall = useIsSmallScreen()
  const reduced = usePrefersReducedMotion()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [nudged, setNudged] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useLockBodyScroll(open && isSmall)
  useFocusTrap(panelRef, open && isSmall)

  // Seed the greeting the first time the panel opens, so the counts in it
  // reflect whatever content has loaded by then.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: messageId++, role: 'bot', answer: greeting(content) }])
    }
  }, [open, messages.length, content])

  // A single, non-repeating nudge after the visitor has had time to read.
  useEffect(() => {
    if (open || nudged) return
    const timer = setTimeout(() => setNudged(true), 9000)
    return () => clearTimeout(timer)
  }, [open, nudged])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [messages, thinking, reduced])

  const ask = useCallback(
    (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || thinking) return

      setMessages((current) => [...current, { id: messageId++, role: 'user', text: trimmed }])
      setDraft('')
      setThinking(true)

      // A short pause reads as considered rather than canned; the work itself is
      // synchronous and instant.
      const answer = answerQuestion(content, trimmed)
      const delay = reduced ? 120 : 420 + Math.min(trimmed.length * 8, 400)

      setTimeout(() => {
        setMessages((current) => [...current, { id: messageId++, role: 'bot', answer }])
        setThinking(false)
      }, delay)
    },
    [content, thinking, reduced],
  )

  return (
    <>
      {/* Launcher */}
      <div className="fixed right-4 bottom-4 z-[80] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {nudged && !open && (
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[15rem] rounded-2xl rounded-br-md border border-ink-900/10 bg-ivory px-4 py-3 text-left text-[0.82rem] leading-snug text-ink-900/75 shadow-[var(--shadow-lift)]"
            >
              Fees, eligibility ya placements ke baare mein puchna hai? Ask me in English or
              Hinglish.
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close the admissions assistant' : 'Open the admissions assistant'}
          aria-expanded={open}
          className={cn(
            'group relative grid size-14 place-items-center rounded-full shadow-[0_12px_36px_-8px_rgba(201,162,39,0.6)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 active:scale-95',
            open ? 'bg-ink-900 text-ivory' : 'bg-gold-500 text-ink-950',
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'chat'}
              initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name={open ? 'close' : 'chat'} size={23} />
            </motion.span>
          </AnimatePresence>

          {!open && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-gold-500/35 [animation-duration:2.6s]"
            />
          )}
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {isSmall && (
              <motion.div
                className="fixed inset-0 z-[78] bg-ink-950/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
            )}

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-label="Admissions assistant"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'fixed z-[79] flex flex-col overflow-hidden border border-ink-900/10 bg-ivory shadow-[var(--shadow-lift)]',
                isSmall
                  ? 'inset-x-3 bottom-24 top-16 rounded-3xl'
                  : 'right-6 bottom-24 h-[min(38rem,calc(100svh-9rem))] w-[24.5rem] rounded-3xl',
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-ink-900/8 bg-ink-950 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-500 text-ink-950">
                  <Icon name="sparkle" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[0.98rem] font-semibold text-ivory">
                    {content.settings.shortName} Assistant
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.72rem] text-ivory/50">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    English · Hinglish · हिंदी
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close the assistant"
                  className="grid size-8 place-items-center rounded-lg text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>

              {/* Transcript */}
              <div ref={scrollRef} className="scrollbar-none flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-4 py-2.5 text-[0.88rem] leading-relaxed text-ivory">
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    <BotMessage
                      key={message.id}
                      answer={message.answer!}
                      onChip={ask}
                      onNavigate={() => isSmall && setOpen(false)}
                    />
                  ),
                )}

                {thinking && (
                  <div className="flex gap-1.5 pl-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-2 animate-bounce rounded-full bg-ink-900/25"
                        style={{ animationDelay: `${i * 140}ms`, animationDuration: '1s' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Composer */}
              <form
                className="border-t border-ink-900/8 bg-white/70 p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  ask(draft)
                }}
              >
                <div className="flex items-center gap-2 rounded-2xl border border-ink-900/12 bg-ivory px-3 py-1.5 transition-colors focus-within:border-gold-500/60">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask in English or Hinglish…"
                    aria-label="Your question"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[0.88rem] text-ink-900 outline-none placeholder:text-ink-900/35"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || thinking}
                    aria-label="Send question"
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-900 text-ivory transition-all hover:bg-ink-700 disabled:opacity-30"
                  >
                    <Icon name="send" size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/** Renders one bot turn: text paragraphs, page links, and follow-up chips. */
function BotMessage({
  answer,
  onChip,
  onNavigate,
}: {
  answer: ChatAnswer
  onChip: (question: string) => void
  onNavigate: () => void
}) {
  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          'max-w-[92%] space-y-2.5 rounded-2xl rounded-bl-md border px-4 py-3 text-[0.88rem] leading-relaxed',
          answer.unresolved
            ? 'border-gold-500/30 bg-gold-100 text-ink-900/80'
            : 'border-ink-900/8 bg-white text-ink-900/80',
        )}
      >
        {answer.text.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            <RichText value={paragraph} />
          </p>
        ))}
      </div>

      {answer.links && answer.links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {answer.links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[0.75rem] font-medium text-ivory transition-colors hover:bg-ink-700"
            >
              {link.label}
              <Icon name="arrow-right" size={13} />
            </Link>
          ))}
        </div>
      )}

      {answer.chips && answer.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {answer.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChip(chip)}
              className="rounded-full border border-ink-900/15 px-3 py-1.5 text-[0.75rem] text-ink-900/70 transition-colors hover:border-gold-500/60 hover:bg-gold-500/10 hover:text-ink-900"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Minimal **bold** and _italic_ rendering — the only markup answers use. */
function RichText({ value }: { value: string }) {
  const parts = value.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-ink-900">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return (
            <em key={index} className="text-ink-900/55 not-italic">
              {part.slice(1, -1)}
            </em>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
