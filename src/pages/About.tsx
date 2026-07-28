import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { Avatar, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { aboutStory, alumniNetwork, institutionStats, milestones, missionVision } from '@/data/about'
import { useContent, useSettings } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function About() {
  const { content } = useContent()
  const settings = useSettings()

  useDocumentTitle(
    'About',
    'Founded in 1994 to close a gap in management education. NAAC A++, NIRF 12, 21,000 alumni in 46 countries.',
  )

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={aboutStory.heading}
        description={aboutStory.paragraphs[0]}
        breadcrumbs={[{ label: 'About' }]}
      >
        <div className="flex flex-wrap gap-2">
          {settings.accreditations.map((item) => (
            <Badge key={item} tone="onDark" className="px-4 py-2">
              {item}
            </Badge>
          ))}
        </div>
      </PageHeader>

      {/* Stats */}
      <section className="border-b border-ink-900/8 bg-ivory-dim py-12 lg:py-14">
        <div className="shell grid grid-cols-2 gap-8 lg:grid-cols-4">
          {institutionStats.map((stat) => (
            <StatCounter key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Our story" title="Three decades, one constraint" className="mb-8" />
            <div className="space-y-5">
              {aboutStory.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[1.02rem] leading-[1.75] text-ink-900/70">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <RevealGroup className="grid gap-5">
            {missionVision.map((item) => (
              <RevealItem key={item.title}>
                <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <h3 className="font-display text-lg text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-900/60">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-ink-900/8 bg-ivory-dim py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Milestones"
            title="How we got here"
            description="Eight moments that changed what the school could offer."
            className="mb-12"
          />

          <RevealGroup className="relative border-l border-ink-900/12 pl-8">
            {milestones.map((milestone) => (
              <RevealItem key={milestone.year} className="relative pb-9 last:pb-0">
                <span className="absolute top-2 -left-[2.28rem] size-3.5 rounded-full bg-gold-500 ring-4 ring-ivory-dim" />
                <div className="font-display text-xl font-semibold text-gold-600 tabular-nums">
                  {milestone.year}
                </div>
                <p className="mt-1 max-w-2xl text-[0.98rem] leading-relaxed text-ink-900/70">
                  {milestone.event}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Leadership"
            title="In their own words"
            className="mb-12"
          />

          <RevealGroup className="grid gap-5 lg:grid-cols-3">
            {content.leadership.map((leader) => (
              <RevealItem key={leader.id} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-ink-900/70">
                    “{leader.message}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3.5 border-t border-ink-900/8 pt-5">
                    <Avatar initials={leader.initials} />
                    <div>
                      <div className="font-display text-[1rem] font-semibold text-ink-900">
                        {leader.name}
                      </div>
                      <div className="text-[0.82rem] text-ink-900/55">{leader.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Alumni */}
      <section id="alumni" className="scroll-mt-24 bg-ink-950 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <SectionHeading
            tone="dark"
            eyebrow="Alumni"
            title={alumniNetwork.heading}
            description={alumniNetwork.body}
          />

          <Reveal className="self-center">
            <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">
              Chapters
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {alumniNetwork.chapters.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-ivory/12 px-4 py-2 text-[0.85rem] text-ivory/70 transition-colors hover:border-gold-500/45 hover:text-gold-300"
                >
                  {city}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/placements" variant="gold" icon="arrow-right">
                Placement report
              </Button>
              <Button to="/contact" variant="onDark">
                Contact us
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
