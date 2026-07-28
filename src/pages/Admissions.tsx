import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { ApplicationForm } from '@/components/sections/ApplicationForm'
import {
  admissionSteps,
  feeStructure,
  generalEligibility,
  importantDates,
  scholarships,
} from '@/data/admissions'
import { useContent } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/lib/utils'

export default function Admissions() {
  const { content } = useContent()

  useDocumentTitle(
    'Admissions',
    'Admission process, eligibility, fee structure, scholarships and application form for the MBA Class of 2027.',
  )

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title="Applications open for the Class of 2027"
        description="One application covers every specialisation — you may rank up to three preferences. Every offer is released with its scholarship decision attached."
        breadcrumbs={[{ label: 'Admissions' }]}
      >
        <div className="flex flex-wrap gap-3">
          {importantDates.slice(0, 3).map((date) => (
            <div
              key={date.label}
              className="rounded-2xl border border-ivory/12 bg-ivory/[0.06] px-5 py-3.5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.1em] text-ivory/45 uppercase">
                <Icon name="calendar" size={13} className="text-gold-400" />
                {date.label}
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="font-display text-[1.05rem] text-ivory">{formatDate(date.date)}</span>
                {date.status === 'open' && <Badge tone="success">Open</Badge>}
              </div>
            </div>
          ))}
        </div>
      </PageHeader>

      {/* Process */}
      <section className="py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="The process"
            title="Six steps, start to enrolment"
            description="Shortlists are published within three weeks of each round closing, and offers within twenty-one days of interview."
            className="mb-12"
          />

          <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {admissionSteps.map((step) => (
              <RevealItem key={step.step} className="h-full">
                <div className="relative h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ink-900 font-display text-base font-semibold text-gold-300">
                      {step.step}
                    </span>
                    <Badge tone={step.window === 'Now open' ? 'success' : 'muted'}>{step.window}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-[1.1rem] leading-snug text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-900/60">
                    {step.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Eligibility + dates */}
      <section id="eligibility" className="scroll-mt-24 border-y border-ink-900/8 bg-ivory-dim py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Eligibility" title="Who can apply" className="mb-8" />
            <ul className="space-y-3.5">
              {generalEligibility.map((item) => (
                <li key={item} className="flex gap-3">
                  <Icon name="check" size={17} className="mt-0.5 shrink-0 text-gold-600" />
                  <span className="text-[0.95rem] leading-relaxed text-ink-900/70">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-gold-500/25 bg-gold-500/8 px-5 py-4 text-[0.88rem] leading-relaxed text-ink-900/70">
              Individual specialisations add their own requirements. Business Analytics & AI, for
              example, expects an 85th-percentile quantitative score and a programming aptitude
              assessment taken on campus.
            </p>
          </div>

          <div>
            <SectionHeading eyebrow="Calendar" title="Important dates" className="mb-8" />
            <ol className="relative space-y-0 border-l border-ink-900/12 pl-6">
              {importantDates.map((date) => (
                <li key={date.label} className="relative pb-7 last:pb-0">
                  <span
                    className={
                      date.status === 'open'
                        ? 'absolute top-1.5 -left-[1.9rem] size-3 rounded-full bg-gold-500 ring-4 ring-gold-500/20'
                        : 'absolute top-1.5 -left-[1.9rem] size-3 rounded-full bg-ink-900/20'
                    }
                  />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-[1.02rem] font-semibold text-ink-900">
                      {formatDate(date.date)}
                    </span>
                    {date.status === 'open' && <Badge tone="success">Open now</Badge>}
                  </div>
                  <p className="mt-0.5 text-[0.9rem] text-ink-900/60">{date.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Fees + scholarships */}
      <section id="fees" className="scroll-mt-24 py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Fees & funding"
            title="What it costs, and what we do about it"
            description={feeStructure.note}
            className="mb-12"
          />

          <Reveal className="overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-[0.92rem]">
                <caption className="sr-only">Annual fee structure by component</caption>
                <thead>
                  <tr className="border-b border-ink-900/10 bg-ink-900/[0.03]">
                    <th scope="col" className="px-5 py-3.5 font-medium text-ink-900/70">
                      Component
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium text-ink-900/70">
                      Year 1
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium text-ink-900/70">
                      Year 2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/8">
                  {feeStructure.rows.map((row) => (
                    <tr key={row.head} className="transition-colors hover:bg-ink-900/[0.02]">
                      <th scope="row" className="px-5 py-3.5 font-normal text-ink-900/75">
                        {row.head}
                      </th>
                      <td className="px-5 py-3.5 text-right font-medium text-ink-900 tabular-nums">
                        {row.year1}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink-900 tabular-nums">
                        {row.year2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <div className="mt-14">
            <SectionHeading
              eyebrow="Scholarships"
              title="₹8.4 crore awarded this cycle"
              description="Merit awards are considered automatically — there is no separate application. Round 1 applicants are assessed against the entire pool."
              className="mb-10"
            />

            <RevealGroup className="grid gap-5 sm:grid-cols-2">
              {scholarships.map((item) => (
                <RevealItem key={item.title} className="h-full">
                  <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-[1.1rem] leading-snug text-ink-900">
                        {item.title}
                      </h3>
                      <Badge tone="gold">{item.amount}</Badge>
                    </div>
                    <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-900/60">{item.body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal className="mt-6 flex gap-3.5 rounded-2xl border border-ink-900/10 bg-ivory-dim px-6 py-5">
              <Icon name="coin" size={20} className="mt-0.5 shrink-0 text-gold-600" />
              <p className="text-[0.9rem] leading-relaxed text-ink-900/70">
                <strong className="font-semibold text-ink-900">Education loans.</strong> We have
                arrangements with seven scheduled banks and two non-banking lenders; admitted students
                typically receive a pre-approved sanction letter within ten working days of accepting a
                seat. The school does not receive commission from any lender on the panel.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="scroll-mt-24 border-t border-ink-900/8 bg-ivory-dim py-16 lg:py-24">
        <div className="shell">
          <ApplicationForm />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Questions"
            title="Frequently asked"
            description="If your question is not here, the assistant in the corner answers from this site's content — or you can call admissions directly."
          />

          <Accordion
            multiple
            defaultOpen={0}
            items={content.faqs.map((faq) => ({ title: faq.question, content: faq.answer }))}
          />
        </div>
      </section>
    </>
  )
}
