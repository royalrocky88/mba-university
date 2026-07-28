import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { formatDate, formatDateShort } from '@/lib/utils'
import { useNews } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import NotFound from './NotFound'

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()
  const news = useNews()
  const progress = useScrollProgress()

  const item = news.find((n) => n.slug === slug)

  useDocumentTitle(item?.title ?? 'News', item?.excerpt)

  if (!item) return <NotFound />

  const related = [
    ...news.filter((n) => n.slug !== item.slug && n.category === item.category),
    ...news.filter((n) => n.slug !== item.slug && n.category !== item.category),
  ].slice(0, 3)

  return (
    <>
      {/* Reading progress bar */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gold-500 transition-transform duration-100"
        style={{ transform: `scaleX(${progress})` }}
      />

      <PageHeader
        eyebrow={item.category}
        title={item.title}
        breadcrumbs={[{ label: 'News', to: '/news' }, { label: item.category }]}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.85rem] text-ivory/55">
          <span className="flex items-center gap-2">
            <Icon name="calendar" size={14} className="text-gold-400" />
            {formatDate(item.date)}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="clock" size={14} className="text-gold-400" />
            {item.readMinutes} min read
          </span>
          <span className="flex items-center gap-2">
            <Icon name="people" size={14} className="text-gold-400" />
            {item.author}
          </span>
        </div>
      </PageHeader>

      <article className="py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-2xl">
            <p className="border-l-2 border-gold-500 pl-5 font-display text-[1.2rem] leading-relaxed text-ink-900/85">
              {item.excerpt}
            </p>

            <div className="mt-9 space-y-5">
              {item.body.map((paragraph, index) => (
                <p key={index} className="text-[1.02rem] leading-[1.75] text-ink-900/72">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-ink-900/10 pt-7">
              <div className="flex items-center gap-3">
                <Badge tone="gold">{item.category}</Badge>
                <span className="text-[0.82rem] text-ink-900/45">
                  Filed {formatDateShort(item.date)} by {item.author}
                </span>
              </div>
              <Button to="/news" variant="outline" size="sm" icon="arrow-right">
                All news
              </Button>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-900/8 bg-ivory-dim py-16 lg:py-20">
          <div className="shell">
            <SectionHeading eyebrow="Also read" title="More from the newsroom" className="mb-10" />

            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <RevealItem key={post.id} className="h-full">
                  <Link
                    to={`/news/${post.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/70 p-6 transition-colors hover:border-gold-500/45"
                  >
                    <div className="flex items-center gap-3">
                      <Badge tone="muted">{post.category}</Badge>
                      <span className="text-[0.75rem] text-ink-900/45">
                        {formatDateShort(post.date)}
                      </span>
                    </div>
                    <h3 className="mt-3.5 font-display text-[1.08rem] leading-snug text-ink-900 transition-colors group-hover:text-gold-600">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-[0.86rem] leading-relaxed text-ink-900/60">
                      {post.excerpt}
                    </p>
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
