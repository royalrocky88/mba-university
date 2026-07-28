import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Field, Select, TextArea } from '@/components/ui/Field'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { rules, submitApplication, type ApplicationPayload } from '@/lib/forms'
import { usePrograms } from '@/context/ContentProvider'

/**
 * MBA application form.
 *
 * Validation is entirely client-side via react-hook-form; submission goes
 * through `submitApplication` in `lib/forms.ts`, which is the single seam to
 * replace when a real endpoint exists.
 */
export function ApplicationForm() {
  const programs = usePrograms()
  const [reference, setReference] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationPayload>({ mode: 'onBlur' })

  async function onSubmit(values: ApplicationPayload) {
    setSubmitError(null)
    const result = await submitApplication(values)
    if (result.ok) {
      setReference(result.reference)
      reset()
    } else {
      setSubmitError(result.error)
    }
  }

  if (reference) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-xl rounded-3xl border border-emerald-600/25 bg-emerald-500/[0.07] px-8 py-12 text-center"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-white">
          <Icon name="check" size={26} />
        </span>
        <h2 className="mt-6 font-display text-2xl text-ink-900">Application received</h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-900/65">
          Your reference number is{' '}
          <strong className="font-semibold text-ink-900">{reference}</strong>. Keep it for any
          correspondence — the admissions office will be in touch within three working days.
        </p>
        <Button variant="outline" className="mt-7" onClick={() => setReference(null)}>
          Submit another application
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading
        align="center"
        eyebrow="Apply"
        title="Start your application"
        description="Takes about five minutes. You may rank up to three specialisation preferences after this first step."
        className="mb-10"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-3xl border border-ink-900/10 bg-white/75 p-6 shadow-[var(--shadow-card)] sm:p-9"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            required
            error={errors.fullName?.message}
            placeholder="As it appears on your degree"
            {...register('fullName', rules.fullName)}
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
            label="Phone number"
            type="tel"
            required
            error={errors.phone?.message}
            placeholder="98765 43210"
            {...register('phone', rules.phone)}
          />
          <Select
            label="Preferred specialisation"
            required
            error={errors.programSlug?.message}
            {...register('programSlug', { required: 'Choose a specialisation' })}
          >
            <option value="">Select a programme…</option>
            {programs.map((program) => (
              <option key={program.id} value={program.slug}>
                {program.shortTitle}
              </option>
            ))}
          </Select>
          <Select
            label="Entrance examination"
            required
            error={errors.entranceExam?.message}
            {...register('entranceExam', { required: 'Select your entrance exam' })}
          >
            <option value="">Select an exam…</option>
            {['CAT', 'XAT', 'GMAT', 'GRE', 'MAT', 'Yet to appear'].map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </Select>
          <Field
            label="Score or percentile"
            required
            error={errors.entranceScore?.message}
            placeholder="e.g. 92.4 percentile"
            {...register('entranceScore', { required: 'Enter your score or percentile' })}
          />
          <Field
            label="Graduation year"
            type="number"
            required
            error={errors.graduationYear?.message}
            placeholder="2024"
            {...register('graduationYear', {
              required: 'Enter your graduation year',
              min: { value: 1970, message: 'Enter a four-digit year' },
              max: { value: 2030, message: 'Enter a four-digit year' },
            })}
          />
          <Select
            label="Work experience"
            required
            error={errors.workExperience?.message}
            {...register('workExperience', { required: 'Select your experience band' })}
          >
            <option value="">Select…</option>
            {['None (fresher)', 'Under 1 year', '1–3 years', '3–5 years', 'Over 5 years'].map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </Select>
        </div>

        <TextArea
          className="mt-5"
          label="Anything you would like us to know"
          rows={4}
          placeholder="Optional — a sentence on why this specialisation, or anything unusual about your record."
          {...register('message')}
        />

        {submitError && (
          <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.88rem] text-red-700">
            {submitError}
          </p>
        )}

        <div className="mt-7 flex flex-col items-center gap-4 border-t border-ink-900/8 pt-6 sm:flex-row sm:justify-between">
          <p className="text-[0.8rem] leading-relaxed text-ink-900/50">
            An application fee of ₹2,500 applies, waived under the need-based scheme.
          </p>
          <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} icon="arrow-right">
            {isSubmitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </div>
      </form>
    </div>
  )
}
