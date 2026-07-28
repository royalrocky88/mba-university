import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { BarChart, SectorBars } from '@/components/ui/BarChart'
import { Marquee } from '@/components/ui/Marquee'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { placementStats, placementSupport, sectorSplit } from '@/data/placements'
import { useContent, usePrograms } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Placements() {
  const { content } = useContent()
  const programs = usePrograms()

  useDocumentTitle(
    'Placements',
    '98% placement rate, ₹18.4 LPA median and 340+ recruiting partners. The full placement report.',
  )

  const trend = [...content.placementTrend].sort((a, b) => a.year.localeCompare(b.year))
  const byMedian = [...programs].sort((a, b) => b.medianCtcLPA - a.medianCtcLPA)

  return (
    <>
      <PageHeader
        eyebrow="Outcomes"
        title="The placement report, in full"
        description="We publish the unflattering numbers alongside the flattering ones. A prospective student is making a two-year financial decision and is entitled to both."
        breadcrumbs={[{ label: 'Placements' }]}
      >
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {placementStats.map((stat) => (
            <StatCounter key={stat.label} stat={stat} tone="dark" />
          ))}
        </div>
      </PageHeader>

      {/* Trend */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Six-year trend"
              title="Average CTC, year on year"
              description="Every bar is the average across the whole graduating class, not the top decile. Hover a bar for that year's placement rate."
              className="mb-10"
            />
            <BarChart data={trend} />
          </div>

          <div>
            <SectionHeading
              eyebrow="Where they went"
              title="Sector split"
              description="Share of the most recent offer book by recruiting sector."
              className="mb-10"
            />
            <SectorBars data={sectorSplit} />

            <div className="mt-10 rounded-2xl border border-ink-900/10 bg-ivory-dim p-6">
              <h3 className="font-display text-lg text-ink-900">Reading these numbers</h3>
              <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-900/60">
                Offers exceed the class size because a meaningful proportion of students hold more than
                one offer at the point of accepting. The placement rate counts students placed within
                ninety days of the process opening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* By specialisation */}
      <section className="border-y border-ink-900/8 bg-ivory-dim py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="By specialisation"
            title="Median CTC across the eight programmes"
            description="Ranked by median, not by highest single offer — a headline number that one exceptional outcome can distort."
            className="mb-12"
          />

          <RevealGroup className="grid gap-3">
            {byMedian.map((program, index) => {
              const share = (program.medianCtcLPA / byMedian[0].medianCtcLPA) * 100
              return (
                <RevealItem key={program.id}>
                  <div className="flex items-center gap-4 rounded-2xl border border-ink-900/10 bg-white/70 px-5 py-4">
                    <span className="w-6 shrink-0 font-display text-sm font-semibold text-ink-900/35 tabular-nums">
                      {index + 1}
                    </span>
                    <Icon name={program.icon} size={18} className="shrink-0 text-gold-600" />
                    <span className="w-40 shrink-0 truncate text-[0.92rem] font-medium text-ink-900 sm:w-56">
                      {program.shortTitle}
                    </span>
                    <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-ink-900/[0.07] sm:block">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ink-700 to-gold-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="ml-auto shrink-0 font-display text-[1.02rem] font-semibold text-ink-900 tabular-nums">
                      ₹{program.medianCtcLPA} LPA
                    </span>
                  </div>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </section>

      {/* Recruiters */}
      <section id="recruiters" className="scroll-mt-24 bg-ink-950 py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            tone="dark"
            eyebrow="Recruiters"
            title="340+ organisations recruit on campus"
            description="Across fourteen sectors, of which forty-one were first-time recruiters in the most recent cycle. A selection is listed below."
            className="mb-12"
          />

          <Reveal>
            <Marquee items={content.recruiters} />
            <Marquee items={[...content.recruiters].reverse()} reverse durationSeconds={50} className="mt-3" />
          </Reveal>

          <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.recruiters.slice(0, 8).map((recruiter) => (
              <RevealItem key={recruiter.id}>
                <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4">
                  <div className="font-display text-[0.98rem] font-semibold text-ivory">
                    {recruiter.name}
                  </div>
                  <div className="mt-0.5 text-[0.78rem] text-ivory/45">{recruiter.sector}</div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Preparation"
            title="What the Career Development Centre actually does"
            description="A team of nine, including three former recruiters, working with students from the first week of semester I."
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            {placementSupport.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <h3 className="font-display text-[1.08rem] text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-900/60">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="shell mt-14">
          <Reveal className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-ink-800 to-ink-950 px-8 py-12 text-center">
            <h2 className="max-w-xl text-2xl text-ivory sm:text-3xl">
              Applications for the Class of 2027 close 30 September
            </h2>
            <p className="max-w-lg text-[0.98rem] text-ivory/60">
              Round 1 applicants are assessed against the full scholarship pool.
            </p>
            <Button to="/admissions#apply" variant="gold" size="lg" icon="arrow-right">
              Apply now
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
