import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useContent, useFaculty } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function FacultyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const faculty = useFaculty()
  const { content } = useContent()

  const person = faculty.find((f) => f.slug === slug)

  useDocumentTitle(person?.name ?? 'Faculty', person?.designation)

  if (!person) return <NotFound />

  const colleagues = faculty.filter((f) => f.department === person.department && f.slug !== person.slug)
  const relatedPrograms = content.programs.filter((p) => p.department === person.department)

  return (
    <>
      <PageHeader
        eyebrow={person.department}
        title={person.name}
        description={person.designation}
        breadcrumbs={[{ label: 'Faculty', to: '/faculty' }, { label: person.name }]}
      >
        <div className="flex flex-wrap items-center gap-6">
          <Avatar initials={person.initials} size="xl" />
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Experience', value: `${person.experienceYears} years` },
              { label: 'Publications', value: String(person.publications) },
              { label: 'Department', value: person.department },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-ivory/12 bg-ivory/[0.06] px-5 py-3.5 backdrop-blur-sm"
              >
                <div className="text-[0.68rem] tracking-[0.12em] text-ivory/45 uppercase">
                  {item.label}
                </div>
                <div className="mt-1 font-display text-[1.02rem] text-ivory">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="font-display text-2xl text-ink-900">Biography</h2>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-900/70">{person.bio}</p>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="font-display text-2xl text-ink-900">Areas of expertise</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {person.expertise.map((topic) => (
                  <Badge key={topic} tone="gold" className="px-4 py-2 text-[0.82rem]">
                    {topic}
                  </Badge>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="font-display text-2xl text-ink-900">Qualifications</h2>
              <ul className="mt-4 space-y-3">
                {person.qualifications.map((qualification) => (
                  <li key={qualification} className="flex gap-3">
                    <Icon name="check" size={17} className="mt-0.5 shrink-0 text-gold-600" />
                    <span className="text-[0.95rem] leading-relaxed text-ink-900/70">
                      {qualification}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-ink-900/10 bg-white/75 p-6">
              <h2 className="font-display text-lg text-ink-900">Get in touch</h2>
              <a
                href={`mailto:${person.email}`}
                className="mt-4 flex items-center gap-3 rounded-xl border border-ink-900/8 px-4 py-3 text-[0.88rem] text-ink-900/70 transition-colors hover:border-gold-500/45 hover:text-ink-900"
              >
                <Icon name="mail" size={16} className="shrink-0 text-gold-600" />
                <span className="truncate">{person.email}</span>
              </a>
              {person.linkedin && (
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2.5 flex items-center gap-3 rounded-xl border border-ink-900/8 px-4 py-3 text-[0.88rem] text-ink-900/70 transition-colors hover:border-gold-500/45 hover:text-ink-900"
                >
                  <Icon name="external" size={16} className="shrink-0 text-gold-600" />
                  LinkedIn profile
                </a>
              )}
            </div>

            {relatedPrograms.length > 0 && (
              <div className="mt-5 rounded-2xl border border-ink-900/10 bg-white/75 p-6">
                <h2 className="font-display text-lg text-ink-900">Teaches on</h2>
                <ul className="mt-4 space-y-2">
                  {relatedPrograms.map((program) => (
                    <li key={program.id}>
                      <Link
                        to={`/programs/${program.slug}`}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.88rem] text-ink-900/70 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-900"
                      >
                        <Icon name={program.icon} size={16} className="shrink-0 text-gold-600" />
                        <span className="flex-1 truncate">{program.shortTitle}</span>
                        <Icon
                          name="arrow-right"
                          size={14}
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button to="/faculty" variant="outline" className="mt-5 w-full" icon="arrow-right">
              All faculty
            </Button>
          </aside>
        </div>
      </section>

      {colleagues.length > 0 && (
        <section className="border-t border-ink-900/8 bg-ivory-dim py-16 lg:py-20">
          <div className="shell">
            <SectionHeading eyebrow="Same department" title={`More from ${person.department}`} className="mb-10" />
            <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {colleagues.slice(0, 3).map((colleague) => (
                <RevealItem key={colleague.id}>
                  <Link
                    to={`/faculty/${colleague.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-ink-900/10 bg-white/70 p-5 transition-colors hover:border-gold-500/45"
                  >
                    <Avatar initials={colleague.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[1rem] font-semibold text-ink-900">
                        {colleague.name}
                      </div>
                      <div className="truncate text-[0.82rem] text-ink-900/55">
                        {colleague.designation}
                      </div>
                    </div>
                    <Icon
                      name="arrow-right"
                      size={15}
                      className="shrink-0 text-ink-900/30 transition-transform group-hover:translate-x-1 group-hover:text-gold-600"
                    />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </>
  )
}
