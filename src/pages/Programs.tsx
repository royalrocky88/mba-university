import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgramCard } from '@/components/ui/ProgramCard'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { usePrograms, useProgramDepartments } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Programme catalogue with client-side search and department filter.
 *
 * Filtering happens in a `useMemo` over live content — a new specialisation
 * added in the admin panel appears here, and in the department list, on its own.
 */
export default function Programs() {
  const programs = usePrograms()
  const departments = useProgramDepartments()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')

  useDocumentTitle(
    'MBA Programmes',
    'Compare all MBA specialisations — curriculum, fees, seats, eligibility and career outcomes.',
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return programs.filter((program) => {
      const matchesDepartment = department === 'All' || program.department === department
      if (!q) return matchesDepartment
      const haystack = [
        program.title,
        program.shortTitle,
        program.tagline,
        program.department,
        ...program.careers,
        ...program.highlights,
      ]
        .join(' ')
        .toLowerCase()
      return matchesDepartment && haystack.includes(q)
    })
  }, [programs, query, department])

  const totalSeats = programs.reduce((sum, program) => sum + program.seats, 0)

  return (
    <>
      <PageHeader
        eyebrow="Programmes"
        title={`${programs.length} MBA specialisations`}
        description={`All two-year, full-time, sharing a common core year and a compulsory industry immersion trimester. Total intake ${totalSeats} seats, with sections capped at sixty.`}
        breadcrumbs={[{ label: 'Programmes' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="shell">
          {/* Controls */}
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:max-w-sm">
              <span className="sr-only">Search programmes</span>
              <Icon
                name="search"
                size={17}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-900/35"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, career or keyword…"
                className="h-12 w-full rounded-full border border-ink-900/12 bg-white/70 pr-4 pl-11 text-[0.92rem] text-ink-900 transition-colors outline-none placeholder:text-ink-900/35 focus:border-gold-500/60"
              />
            </label>

            <div
              className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
              role="group"
              aria-label="Filter by department"
            >
              {departments.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDepartment(item)}
                  aria-pressed={department === item}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
                    department === item
                      ? 'border-transparent bg-ink-900 text-ivory'
                      : 'border-ink-900/12 text-ink-900/65 hover:border-ink-900/30 hover:text-ink-900',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-6 text-[0.85rem] text-ink-900/50" role="status" aria-live="polite">
            Showing {results.length} of {programs.length} specialisations
            {department !== 'All' && ` in ${department}`}
            {query && ` matching “${query}”`}
          </p>

          {results.length > 0 ? (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((program) => (
                <RevealItem key={program.id} className="h-full">
                  <ProgramCard program={program} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="rounded-3xl border border-dashed border-ink-900/15 py-20 text-center">
              <Icon name="search" size={30} className="mx-auto mb-4 text-ink-900/20" />
              <h2 className="font-display text-xl text-ink-900">No specialisation matches that</h2>
              <p className="mx-auto mt-2 max-w-md text-[0.92rem] text-ink-900/55">
                Try a broader term, or clear the filters to see all {programs.length} programmes.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setQuery('')
                  setDepartment('All')
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
