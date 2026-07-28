import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TiltCard } from '@/components/ui/TiltCard'
import { Lightbox } from '@/components/ui/Lightbox'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { campusIntro, studentLife } from '@/data/campus'
import { useContent } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

export default function Campus() {
  const { content } = useContent()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useDocumentTitle(
    'Campus & Student Life',
    'A 200-acre campus in Greater Noida — library, capital markets lab, residential halls, sports and 31 student clubs.',
  )

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title={campusIntro.heading}
        description={campusIntro.body}
        breadcrumbs={[{ label: 'Campus' }]}
      >
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Campus', value: `${campusIntro.acres} acres` },
            { label: 'Built up', value: `${campusIntro.builtUpLakhSqFt} lakh sq ft` },
            { label: 'Residential', value: '820 beds' },
            { label: 'Student clubs', value: '31' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-ivory/12 bg-ivory/[0.06] px-5 py-3.5 backdrop-blur-sm"
            >
              <div className="text-[0.68rem] tracking-[0.12em] text-ivory/45 uppercase">
                {item.label}
              </div>
              <div className="mt-1 font-display text-[1.05rem] text-ivory">{item.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      {/* Facilities */}
      <section className="py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Facilities"
            title="What is actually on the ground"
            description="Study rooms outnumber classrooms three to one, and the library runs twenty-four hours through both examination terms."
            className="mb-12"
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.facilities.map((facility) => (
              <RevealItem key={facility.id} className="h-full">
                <TiltCard className="h-full" intensity={5} glare={false}>
                  <div className="flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/75 p-6 transition-colors duration-500 hover:border-gold-500/45">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 text-gold-300">
                        <Icon name={facility.icon} size={20} />
                      </span>
                      <Badge tone="gold">{facility.stat}</Badge>
                    </div>
                    <h3 className="mt-4 font-display text-[1.08rem] leading-snug text-ink-900">
                      {facility.title}
                    </h3>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-900/60">
                      {facility.description}
                    </p>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Gallery */}
      <section className="border-y border-ink-900/8 bg-ivory-dim py-16 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Gallery"
            title="The campus, as it is"
            description="Select any tile to open it full screen. Use the arrow keys to move between images."
            className="mb-12"
          />

          <RevealGroup className="grid auto-rows-[13rem] grid-cols-2 gap-4 lg:grid-cols-4">
            {content.gallery.map((item, index) => (
              <RevealItem
                key={item.id}
                className={cn(
                  item.span === 'wide' && 'col-span-2',
                  item.span === 'tall' && 'row-span-2',
                )}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Open ${item.title} full screen`}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl text-left"
                >
                  {/* Gradient placeholder — swap for an <img> when photography exists. */}
                  <span
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105',
                      item.tone,
                    )}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />

                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block font-display text-[1rem] font-semibold text-ivory">
                      {item.title}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[0.76rem] leading-snug text-ivory/60">
                      {item.caption}
                    </span>
                  </span>

                  <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-ivory/15 text-ivory opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                    <Icon name="arrow-up-right" size={15} />
                  </span>
                </button>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Student life */}
      <section className="py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Student life"
            title="What happens outside the lecture theatre"
            description="Most of an MBA does. The campus is laid out so cohorts collide rather than pass."
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            {studentLife.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6">
                  <h3 className="font-display text-[1.08rem] text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-900/60">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <Lightbox
        items={content.gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
