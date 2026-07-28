import { Link } from 'react-router-dom'
import { Hero } from '@/components/sections/Hero'
import { Testimonials } from '@/components/sections/Testimonials'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { ProgramCard } from '@/components/ui/ProgramCard'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Marquee } from '@/components/ui/Marquee'
import { heroStats, whyMeridian } from '@/data/site'
import { placementStats } from '@/data/placements'
import { useContent, usePrograms } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDateShort } from '@/lib/utils'

export default function Home() {
  const { content } = useContent()
  const programs = usePrograms()
  const latestNews = [...content.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  useDocumentTitle(
    'MBA Programmes',
    'Eight MBA specialisations, 98% placements and a 200-acre campus. Applications open for the Class of 2027.',
  )

  return (
    <>
      <Hero />

      {/* Stat strip */}
      <section className="border-b border-ink-900/8 bg-ivory-dim py-12 lg:py-14">
        <div className="shell grid grid-cols-2 gap-8 lg:grid-cols-4">
          {heroStats.map((stat) => (
            <StatCounter key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Programmes"
            title={`${programs.length} specialisations, one standard`}
            description="Every specialisation shares the same core year and the same compulsory industry immersion trimester. What changes is the second year — and where it takes you."
            action={
              <Button to="/programs" variant="outline" icon="arrow-right">
                Compare all
              </Button>
            }
            className="mb-12"
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((program) => (
              <RevealItem key={program.id} className="h-full">
                <ProgramCard program={program} />
              </RevealItem>
            ))}
          </RevealGroup>

          {programs.length > 6 && (
            <Reveal className="mt-8 text-center">
              <Button to="/programs" variant="ghost" icon="arrow-right">
                View the remaining {programs.length - 6} specialisations
              </Button>
            </Reveal>
          )}
        </div>
      </section>

      {/* Why Meridian */}
      <section className="border-y border-ink-900/8 bg-ivory-dim py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Why Meridian"
            title="Four things we would put on the record"
            description="We are not the largest business school in the country, and we have repeatedly declined to become one. This is what the size buys."
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            {whyMeridian.map((item) => (
              <RevealItem key={item.title}>
                <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-ink-900 text-gold-300">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-lg text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-900/60">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Placements teaser */}
      <section className="relative overflow-hidden bg-ink-900 py-20 lg:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 size-[34rem] rounded-full bg-gold-500/10 blur-[120px]"
        />

        <div className="shell relative">
          <SectionHeading
            tone="dark"
            eyebrow="Outcomes"
            title="The placement report, in full"
            description="We publish the unflattering numbers alongside the flattering ones. Prospective students are making a two-year financial decision and are entitled to both."
            action={
              <Button to="/placements" variant="onDark" icon="arrow-right">
                Full report
              </Button>
            }
            className="mb-12"
          />

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {placementStats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} tone="dark" />
            ))}
          </div>

          <Reveal className="mt-14">
            {/* Deliberately not `recruiters.length` — this list is a curated
                selection, while the 340+ figure in the stat strip is the real
                total. Deriving the headline from the list would contradict it. */}
            <p className="mb-4 text-[0.72rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">
              A selection of our recruiting partners
            </p>
            <Marquee items={content.recruiters} />
          </Reveal>
        </div>
      </section>

      <Testimonials />

      {/* Latest news */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Newsroom"
            title="Latest from campus"
            action={
              <Button to="/news" variant="outline" icon="arrow-right">
                All news
              </Button>
            }
            className="mb-12"
          />

          <RevealGroup className="grid gap-5 md:grid-cols-3">
            {latestNews.map((item) => (
              <RevealItem key={item.id} className="h-full">
                <Link
                  to={`/news/${item.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/70 p-6 transition-all duration-400 hover:border-gold-500/45 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-3">
                    <Badge tone="gold">{item.category}</Badge>
                    <span className="text-[0.75rem] text-ink-900/45">{formatDateShort(item.date)}</span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.15rem] leading-snug text-ink-900 transition-colors group-hover:text-gold-600">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 flex-1 text-[0.88rem] leading-relaxed text-ink-900/60">
                    {item.excerpt}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-gold-600">
                    Read more
                    <Icon
                      name="arrow-right"
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-20 lg:pb-28">
        <div className="shell">
          <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-8 py-14 text-center sm:px-14 lg:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,187,74,0.2),transparent_60%)]"
            />

            <div className="relative mx-auto max-w-2xl">
              <Badge tone="onDark" className="mb-6">
                Round 1 closes 30 September 2026
              </Badge>
              <h2 className="text-3xl text-ivory sm:text-4xl lg:text-[2.9rem]">
                One application. Up to three specialisations.
              </h2>
              <p className="mt-5 text-[1.02rem] leading-relaxed text-ivory/65">
                Every offer is released with its scholarship decision attached, so you never have to
                accept a seat before you know what it costs.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button to="/admissions" variant="gold" size="lg" icon="arrow-right">
                  Apply for the Class of 2027
                </Button>
                <Button to="/contact" variant="onDark" size="lg">
                  Talk to admissions
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
