import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Badge, Avatar } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { ProgramCard } from '@/components/ui/ProgramCard'
import { formatINR } from '@/lib/utils'
import { useContent, usePrograms } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function ProgramDetail() {
  const { slug } = useParams<{ slug: string }>()
  const programs = usePrograms()
  const { content } = useContent()

  const program = programs.find((p) => p.slug === slug)

  useDocumentTitle(program?.shortTitle ?? 'Programme', program?.tagline)

  // A slug that no longer exists — e.g. a programme deleted in the admin panel.
  if (!program) return <NotFound />

  const related = [
    ...programs.filter((p) => p.slug !== program.slug && p.department === program.department),
    ...programs.filter((p) => p.slug !== program.slug && p.department !== program.department),
  ].slice(0, 3)

  const teachingFaculty = content.faculty.filter((f) => f.department === program.department).slice(0, 3)
  const totalTuition = program.annualFeeINR * program.durationYears

  return (
    <>
      <PageHeader
        eyebrow={program.department}
        title={program.title}
        description={program.tagline}
        breadcrumbs={[{ label: 'Programmes', to: '/programs' }, { label: program.shortTitle }]}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Duration', value: `${program.durationYears} years`, icon: 'clock' as const },
            { label: 'Mode', value: program.mode, icon: 'people' as const },
            { label: 'Seats', value: String(program.seats), icon: 'chart' as const },
            { label: 'Median CTC', value: `₹${program.medianCtcLPA} LPA`, icon: 'coin' as const },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-ivory/12 bg-ivory/[0.06] px-5 py-4 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] text-ivory/45 uppercase">
                <Icon name={item.icon} size={14} className="text-gold-400" />
                {item.label}
              </span>
              <span className="mt-1.5 block font-display text-xl text-ivory">{item.value}</span>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* Main column */}
          <div className="min-w-0">
            <Reveal>
              <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">Overview</h2>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-900/70">{program.overview}</p>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">What sets it apart</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {program.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-3 rounded-xl border border-ink-900/8 bg-white/60 px-4 py-3.5"
                  >
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold-600" />
                    <span className="text-[0.9rem] leading-relaxed text-ink-900/70">{highlight}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">Curriculum</h2>
              <p className="mt-3 text-[0.95rem] text-ink-900/60">
                {program.curriculum.length} semesters. Semester III includes the compulsory industry
                immersion trimester, graded by the host organisation.
              </p>
              <Accordion
                className="mt-6"
                items={program.curriculum.map((semester) => ({
                  title: semester.title,
                  meta: `${semester.subjects.length} courses`,
                  content: (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {semester.subjects.map((subject) => (
                        <li key={subject} className="flex gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" />
                          {subject}
                        </li>
                      ))}
                    </ul>
                  ),
                }))}
              />
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">Career outcomes</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {program.careers.map((career) => (
                  <Badge key={career} tone="neutral" className="px-4 py-2 text-[0.82rem]">
                    {career}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 text-[0.92rem] text-ink-900/60">
                Median CTC for this specialisation was{' '}
                <strong className="font-semibold text-ink-900">₹{program.medianCtcLPA} LPA</strong> in
                the most recent cycle.{' '}
                <Link to="/placements" className="text-gold-600 underline-offset-4 hover:underline">
                  See the full placement report
                </Link>
                .
              </p>
            </Reveal>

            {teachingFaculty.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">Who teaches it</h2>
                <RevealGroup className="mt-5 grid gap-3">
                  {teachingFaculty.map((person) => (
                    <RevealItem key={person.id}>
                      <Link
                        to={`/faculty/${person.slug}`}
                        className="group flex items-center gap-4 rounded-2xl border border-ink-900/8 bg-white/60 p-4 transition-colors hover:border-gold-500/40"
                      >
                        <Avatar initials={person.initials} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-[1.02rem] font-semibold text-ink-900">
                            {person.name}
                          </div>
                          <div className="truncate text-[0.85rem] text-ink-900/55">
                            {person.designation}
                          </div>
                        </div>
                        <Icon
                          name="arrow-right"
                          size={16}
                          className="shrink-0 text-ink-900/30 transition-transform group-hover:translate-x-1 group-hover:text-gold-600"
                        />
                      </Link>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-ink-900/10 bg-white/75 p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-lg text-ink-900">Fees</h2>
              <dl className="mt-4 space-y-3 text-[0.9rem]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-900/55">Tuition, per year</dt>
                  <dd className="font-semibold text-ink-900">{formatINR(program.annualFeeINR)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-ink-900/8 pt-3">
                  <dt className="text-ink-900/55">Full programme</dt>
                  <dd className="font-semibold text-ink-900">{formatINR(totalTuition)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-900/50">
                Residential charges, dining and materials are billed separately. Scholarships of up to
                100% of tuition are awarded automatically on merit.
              </p>
              <Button to="/admissions#fees" variant="ghost" size="sm" className="mt-3 -ml-2">
                Full fee structure
              </Button>
            </div>

            <div className="mt-5 rounded-2xl border border-ink-900/10 bg-white/75 p-6">
              <h2 className="font-display text-lg text-ink-900">Eligibility</h2>
              <ul className="mt-4 space-y-3">
                {program.eligibility.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.88rem] leading-relaxed text-ink-900/65">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 p-6">
              <h2 className="font-display text-lg text-ivory">Ready to apply?</h2>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ivory/60">
                One application covers every specialisation — you may rank up to three preferences.
              </p>
              <Button to="/admissions#apply" variant="gold" className="mt-5 w-full" icon="arrow-right">
                Apply now
              </Button>
              <Button to="/contact" variant="onDark" className="mt-2.5 w-full">
                Ask a question
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-900/8 bg-ivory-dim py-16 lg:py-20">
          <div className="shell">
            <SectionHeading
              eyebrow="Also consider"
              title="Related specialisations"
              className="mb-10"
              action={
                <Button to="/programs" variant="outline" icon="arrow-right">
                  All programmes
                </Button>
              }
            />
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <RevealItem key={item.id} className="h-full">
                  <ProgramCard program={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </>
  )
}
