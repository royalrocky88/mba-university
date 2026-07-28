import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useIsTouch } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Pointer-tracked 3D tilt.
 *
 * Writes CSS custom properties directly on the node rather than going through
 * React state — a card grid re-rendering on every mousemove would be the most
 * expensive thing on the page. Disabled on touch devices and under reduced
 * motion, where it degrades to a plain card.
 */

type TiltCardProps = {
  children: ReactNode
  className?: string
  /** Maximum rotation in degrees at the card's corners. */
  intensity?: number
  /** Adds the moving specular sheen. Off for dense grids. */
  glare?: boolean
}

export function TiltCard({ children, className, intensity = 7, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const reduced = usePrefersReducedMotion()
  const enabled = !isTouch && !reduced

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current
    if (!node || !enabled) return

    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    node.style.setProperty('--tilt-x', `${(0.5 - py) * intensity * 2}deg`)
    node.style.setProperty('--tilt-y', `${(px - 0.5) * intensity * 2}deg`)
    node.style.setProperty('--glare-x', `${px * 100}%`)
    node.style.setProperty('--glare-y', `${py * 100}%`)
  }

  function reset() {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn(
        'group/tilt relative isolate transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        enabled && 'hover:duration-100',
        className,
      )}
      style={
        enabled
          ? {
              transform:
                'perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
    >
      {children}

      {enabled && glare && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.32), transparent 55%)',
          }}
        />
      )}
    </div>
  )
}
