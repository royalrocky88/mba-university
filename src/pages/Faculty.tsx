import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { TiltCard } from '@/components/ui/TiltCard'
import { Avatar, Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import { useFaculty, useFacultyDepartments } from '@/context/ContentProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function FacultyPage() {
  const faculty = useFaculty()
  const departments = useFacultyDepartments()
  const [department, setDepartment] = useState('All')

  useDocumentTitle('Faculty', 'Meet the faculty — two-thirds held substantive industry roles before joining.')

  const results = useMemo(
    () => (department === 'All' ? faculty : faculty.filter((f) => f.department === department)),
    [faculty, department],
  )

  const industryShare = Math.round(
    (faculty.filter((f) => f.experienceYears >= 15).length / Math.max(faculty.length, 1)) * 100,
  )

  return (
    <>
      <PageHeader
        eyebrow="Faculty"
        title="Taught by people who have done the job"
        description={`${faculty.length} core faculty members across ${departments.length - 1} departments. ${industryShare}% bring fifteen years or more of combined academic and industry experience.`}
        breadcrumbs={[{ label: 'Faculty' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="shell">
          <div
            className="scrollbar-none -mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter faculty by department"
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

          <p className="mb-6 text-[0.85rem] text-ink-900/50" role="status" aria-live="polite">
            Showing {results.length} of {faculty.length} faculty members
            {department !== 'All' && ` in ${department}`}
          </p>

          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((person) => (
              <RevealItem key={person.id} className="h-full">
                <TiltCard className="h-full" intensity={5}>
                  <Link
                    to={`/faculty/${person.slug}`}
                    className="flex h-full flex-col rounded-2xl border border-ink-900/10 bg-white/75 p-6 transition-all duration-500 hover:border-gold-500/45 hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar initials={person.initials} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-[1.08rem] leading-snug text-ink-900">
                          {person.name}
                        </h2>
                        <p className="mt-0.5 text-[0.85rem] leading-snug text-ink-900/55">
                          {person.designation}
                        </p>
                      </div>
                    </div>

                    <Badge tone="muted" className="mt-4 self-start">
                      {person.department}
                    </Badge>

                    <p className="mt-3 line-clamp-3 flex-1 text-[0.88rem] leading-relaxed text-ink-900/60">
                      {person.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {person.expertise.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-ink-900/[0.05] px-2.5 py-1 text-[0.72rem] text-ink-900/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-ink-900/8 pt-4 text-[0.78rem] text-ink-900/50">
                      <span>
                        {person.experienceYears} yrs · {person.publications} papers
                      </span>
                      <Icon
                        name="arrow-right"
                        size={15}
                        className="text-gold-600 transition-transform duration-300 group-hover/tilt:translate-x-1"
                      />
                    </div>
                  </Link>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  )
}
