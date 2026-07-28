import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Field, TextArea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { rules, submitContact, type ContactPayload } from '@/lib/forms'
import { site } from '@/data/site'
import { useSettings } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Contact() {
  const settings = useSettings()
  const [reference, setReference] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactPayload>({ mode: 'onBlur' })

  useDocumentTitle('Contact', 'Reach admissions, book a campus visit or send us a question.')

  async function onSubmit(values: ContactPayload) {
    setSubmitError(null)
    const result = await submitContact(values)
    if (result.ok) {
      setReference(result.reference)
      reset()
    } else {
      setSubmitError(result.error)
    }
  }

  const cards: { icon: IconName; label: string; lines: { text: string; href?: string }[] }[] = [
    {
      icon: 'mail',
      label: 'Email',
      lines: [
        { text: settings.admissionsEmail, href: `mailto:${settings.admissionsEmail}` },
        { text: settings.generalEmail, href: `mailto:${settings.generalEmail}` },
      ],
    },
    {
      icon: 'phone',
      label: 'Telephone',
      lines: [
        { text: `${settings.admissionsPhone} (admissions)`, href: `tel:${settings.admissionsPhone.replace(/\s/g, '')}` },
        { text: `${settings.generalPhone} (general)`, href: `tel:${settings.generalPhone.replace(/\s/g, '')}` },
      ],
    },
    {
      icon: 'pin',
      label: 'Campus',
      lines: [{ text: settings.address }],
    },
    {
      icon: 'clock',
      label: 'Office hours',
      lines: [{ text: settings.officeHours }],
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description="Admissions answer within one working day. Campus visits can be arranged on any working day through the admissions office."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Details */}
          <div>
            <SectionHeading eyebrow="Reach us" title="Direct lines" className="mb-8" />

            <RevealGroup className="grid gap-4 sm:grid-cols-2">
              {cards.map((card) => (
                <RevealItem key={card.label} className="h-full">
                  <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-ink-900 text-gold-300">
                      <Icon name={card.icon} size={18} />
                    </span>
                    <h3 className="mt-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-ink-900/45 uppercase">
                      {card.label}
                    </h3>
                    <div className="mt-1.5 space-y-1">
                      {card.lines.map((line) => (
                        <p key={line.text} className="text-[0.88rem] leading-relaxed text-ink-900/70">
                          {line.href ? (
                            <a href={line.href} className="transition-colors hover:text-gold-600">
                              {line.text}
                            </a>
                          ) : (
                            line.text
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-ink-900/10">
                <iframe
                  title={`Map showing ${settings.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&output=embed`}
                  className="h-64 w-full border-0 grayscale-[0.35]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>

            <Reveal className="mt-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-ink-900/45 uppercase">
                Follow
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/12 px-4 py-2 text-[0.84rem] text-ink-900/65 transition-colors hover:border-gold-500/50 hover:text-ink-900"
                  >
                    {social.label}
                    <Icon name="arrow-up-right" size={13} />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div>
            {reference ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl border border-emerald-600/25 bg-emerald-500/[0.07] px-8 py-14 text-center"
              >
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-white">
                  <Icon name="check" size={26} />
                </span>
                <h2 className="mt-6 font-display text-2xl text-ink-900">Message sent</h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-900/65">
                  Your reference is{' '}
                  <strong className="font-semibold text-ink-900">{reference}</strong>. We reply within
                  one working day.
                </p>
                <Button variant="outline" className="mt-7" onClick={() => setReference(null)}>
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="rounded-3xl border border-ink-900/10 bg-white/75 p-6 shadow-[var(--shadow-card)] sm:p-8"
              >
                <SectionHeading eyebrow="Enquiry" title="Send a message" className="mb-8" />

                <div className="grid gap-5">
                  <Field
                    label="Your name"
                    required
                    error={errors.name?.message}
                    placeholder="Full name"
                    {...register('name', rules.fullName)}
                  />
                  <Field
                    label="Email address"
                    type="email"
                    required
                    error={errors.email?.message}
                    placeholder="you@example.com"
                    {...register('email', rules.email)}
                  />
                  <Field
                    label="Subject"
                    required
                    error={errors.subject?.message}
                    placeholder="What is this about?"
                    {...register('subject', {
                      required: 'Enter a subject',
                      minLength: { value: 4, message: 'Give the subject a few more words' },
                    })}
                  />
                  <TextArea
                    label="Message"
                    rows={6}
                    required
                    error={errors.message?.message}
                    placeholder="Tell us what you need."
                    {...register('message', {
                      required: 'Enter your message',
                      minLength: { value: 20, message: 'A little more detail helps us route this correctly' },
                    })}
                  />
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.88rem] text-red-700"
                  >
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="mt-7 w-full"
                  disabled={isSubmitting}
                  icon="send"
                >
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
