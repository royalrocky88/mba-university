import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { cn, formatDate, formatDateShort } from '@/lib/utils'
import { useNews } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function News() {
  const news = useNews()
  const [category, setCategory] = useState('All')

  useDocumentTitle('News & Events', 'Latest announcements, placements updates, research and events.')

  const categories = useMemo(
    () => ['All', ...new Set(news.map((item) => item.category))],
    [news],
  )

  const results = useMemo(
    () => (category === 'All' ? news : news.filter((item) => item.category === category)),
    [news, category],
  )

  const [featured, ...rest] = results

  return (
    <>
      <PageHeader
        eyebrow="Newsroom"
        title="News & events"
        description="Announcements, placement updates, research and everything happening on campus."
        breadcrumbs={[{ label: 'News' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="shell">
          <div
            className="scrollbar-none -mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter news by category"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
                  category === item
                    ? 'border-transparent bg-ink-900 text-ivory'
                    : 'border-ink-900/12 text-ink-900/65 hover:border-ink-900/30 hover:text-ink-900',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink-900/15 py-20 text-center">
              <h2 className="font-display text-xl text-ink-900">Nothing filed under {category} yet</h2>
              <p className="mt-2 text-[0.92rem] text-ink-900/55">
                Choose another category, or view everything.
              </p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link
                  to={`/news/${featured.slug}`}
                  className="group mb-10 grid gap-8 overflow-hidden rounded-3xl border border-ink-900/10 bg-white/70 p-6 transition-all duration-500 hover:border-gold-500/45 hover:shadow-[var(--shadow-card)] sm:p-8 lg:grid-cols-[1.15fr_0.85fr]"
                >
                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="ink">Latest</Badge>
                      <Badge tone="gold">{featured.category}</Badge>
                      <span className="text-[0.8rem] text-ink-900/45">
                        {formatDate(featured.date)} · {featured.readMinutes} min read
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-2xl leading-snug text-ink-900 transition-colors group-hover:text-gold-600 sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-900/60">
                      {featured.excerpt}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-2 text-[0.88rem] font-medium text-gold-600">
                      Read the full post
                      <Icon
                        name="arrow-right"
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>

                  <div className="relative hidden min-h-[14rem] overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 via-ink-600 to-gold-600 lg:block">
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
                    <span className="absolute right-5 bottom-5 font-display text-[0.8rem] tracking-[0.12em] text-ivory/60 uppercase">
                      {featured.author}
                    </span>
                  </div>
                </Link>
              )}

              {/* Rest */}
              <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                  <RevealItem key={item.id} className="h-full">
                    <Link
                      to={`/news/${item.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/70 p-6 transition-all duration-400 hover:border-gold-500/45 hover:shadow-[var(--shadow-card)]"
                    >
                      <div className="flex items-center gap-3">
                        <Badge tone="gold">{item.category}</Badge>
                        <span className="text-[0.75rem] text-ink-900/45">
                          {formatDateShort(item.date)}
                        </span>
                      </div>

                      <h2 className="mt-4 font-display text-[1.15rem] leading-snug text-ink-900 transition-colors group-hover:text-gold-600">
                        {item.title}
                      </h2>
                      <p className="mt-2.5 line-clamp-3 flex-1 text-[0.88rem] leading-relaxed text-ink-900/60">
                        {item.excerpt}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-ink-900/8 pt-4 text-[0.78rem] text-ink-900/45">
                        <span className="truncate">{item.author}</span>
                        <span className="shrink-0">{item.readMinutes} min</span>
                      </div>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </section>
    </>
  )
}
