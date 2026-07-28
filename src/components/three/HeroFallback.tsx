/**
 * Static stand-in for `HeroScene`.
 *
 * Rendered on phones, on touch devices and whenever the visitor has asked for
 * reduced motion. Deliberately pure CSS/SVG — no WebGL context is created, and
 * the `three` chunk is never fetched.
 */
export default function HeroFallback() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden">
      {/* Soft radial glow standing in for the scene lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(224,187,74,0.28),transparent_62%)]" />

      <svg
        viewBox="0 0 400 400"
        className="relative h-full w-full"
        role="presentation"
        focusable="false"
      >
        <defs>
          <linearGradient id="fallback-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#efd282" />
            <stop offset="55%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#a37d12" />
          </linearGradient>
          <linearGradient id="fallback-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e2f63" />
            <stop offset="100%" stopColor="#070d20" />
          </linearGradient>
        </defs>

        {/* Concentric orbit rings — the flat echo of the 3D particle shell */}
        {[150, 120, 90].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="url(#fallback-gold)"
            strokeWidth="1"
            opacity={0.18 + i * 0.08}
          />
        ))}

        {/* Sparse dots on the outer ring */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2
          return (
            <circle
              key={i}
              cx={200 + Math.cos(angle) * 150}
              cy={200 + Math.sin(angle) * 150 * 0.62}
              r={i % 3 === 0 ? 2.6 : 1.5}
              fill="#e0bb4a"
              opacity={0.55}
            />
          )
        })}

        {/* Mortarboard, drawn in the same isometric attitude as the 3D model */}
        <g transform="translate(200 196)">
          <path d="M0 -34 L74 0 L0 34 L-74 0 Z" fill="url(#fallback-ink)" />
          <path d="M0 -34 L74 0 L0 34 L-74 0 Z" fill="none" stroke="url(#fallback-gold)" strokeWidth="1.5" />
          <path d="M-26 12 L-26 40 Q0 54 26 40 L26 12 L0 26 Z" fill="url(#fallback-ink)" />
          <circle cx="0" cy="0" r="6" fill="url(#fallback-gold)" />
          <path d="M0 0 L44 6 L44 44" fill="none" stroke="url(#fallback-gold)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="44" cy="48" r="7" fill="url(#fallback-gold)" />
        </g>
      </svg>
    </div>
  )
}
