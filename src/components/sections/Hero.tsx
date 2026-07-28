import { Suspense, lazy } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import HeroFallback from '@/components/three/HeroFallback'
import { useIsSmallScreen, useIsTouch } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { usePrograms, useSettings } from '@/context/ContentProvider'

// Split out so the `three` chunk is only fetched by visitors who will see it.
const HeroScene = lazy(() => import('@/components/three/HeroScene'))

export function Hero() {
  const settings = useSettings()
  const programs = usePrograms()
  const isSmall = useIsSmallScreen()
  const isTouch = useIsTouch()
  const reduced = usePrefersReducedMotion()

  // Three independent reasons to skip WebGL entirely. Any one is sufficient.
  const use3D = !isSmall && !isTouch && !reduced

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ink-950 pt-28 pb-16 lg:min-h-svh lg:pt-32">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(30,47,99,0.75),transparent_60%)]" />
        <div className="absolute -top-40 -right-32 size-[38rem] rounded-full bg-gold-500/12 blur-[120px]" />
        <div className="absolute -bottom-48 -left-24 size-[32rem] rounded-full bg-ink-500/25 blur-[110px]" />
        {/* Faint grid, to give the dark field some structure */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="shell relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Copy */}
        <div className="max-w-2xl">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-[0.72rem] font-medium tracking-wide text-gold-300"
          >
            <Icon name="sparkle" size={14} />
            Applications open for the Class of 2027
          </motion.div>

          <motion.h1
            initial={reduced ? undefined : { opacity: 0, y: 26 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[2.6rem] leading-[1.05] text-ivory sm:text-6xl lg:text-[4.2rem]"
          >
            Where ambition
            <br />
            meets <span className="text-gradient-gold">rigour</span>.
          </motion.h1>

          <motion.p
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ivory/65"
          >
            {programs.length} MBA specialisations taught by people who have done the job — with a
            compulsory trimester embedded in a real organisation, graded by the host rather than by us.
          </motion.p>

          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 22 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button to="/admissions" variant="gold" size="lg" icon="arrow-right">
              Start your application
            </Button>
            <Button to="/programs" variant="onDark" size="lg">
              Explore programmes
            </Button>
          </motion.div>

          <motion.div
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.36 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/10 pt-6"
          >
            {settings.accreditations.map((item) => (
              <span key={item} className="flex items-center gap-2 text-[0.78rem] text-ivory/45">
                <Icon name="check" size={13} className="text-gold-400" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[30rem] lg:max-w-none"
        >
          {use3D ? (
            <Suspense fallback={<HeroFallback />}>
              <HeroScene />
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/30 lg:flex"
      >
        <span className="text-[0.68rem] tracking-[0.2em] uppercase">Scroll</span>
        <span className="h-9 w-px bg-gradient-to-b from-ivory/40 to-transparent" />
      </div>
    </section>
  )
}
