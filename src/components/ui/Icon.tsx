import type { ReactElement, SVGProps } from 'react'

/**
 * Inline icon set — a small stroked family drawn on a 24×24 grid.
 *
 * Kept local rather than pulled from an icon package so the bundle carries only
 * the twenty-odd glyphs this site actually uses, and so `Program.icon` /
 * `Facility.icon` in the data layer can stay simple string keys.
 */

export type IconName =
  | 'chart'
  | 'coin'
  | 'people'
  | 'globe'
  | 'cpu'
  | 'cart'
  | 'leaf'
  | 'health'
  | 'library'
  | 'lab'
  | 'hostel'
  | 'sports'
  | 'auditorium'
  | 'cafe'
  | 'incubator'
  | 'wifi'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'menu'
  | 'search'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'clock'
  | 'calendar'
  | 'check'
  | 'quote'
  | 'sparkle'
  | 'send'
  | 'chat'
  | 'download'
  | 'external'

const paths: Record<IconName, ReactElement> = {
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15l4-5 3 3 5-7" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9a3 3 0 0 0-5 2.2c0 2.6 5 1.4 5 3.8A3 3 0 0 1 9.5 16" />
      <path d="M12 6.5v11" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16.5 5.6a3.2 3.2 0 0 1 0 6.3" />
      <path d="M18 14.6a6.5 6.5 0 0 1 3.5 5.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  cart: (
    <>
      <path d="M2.5 3h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20 7H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-8 5-14 16-15 0 10-5 15-12 15H4Z" />
      <path d="M4 20c4-6 8-9 12-10.5" />
    </>
  ),
  health: (
    <>
      <path d="M20.5 8.5a5 5 0 0 0-8.5-3.2A5 5 0 0 0 3.5 8.5c0 5 8.5 11 8.5 11s8.5-6 8.5-11Z" />
      <path d="M9 11h2.2l1-2 1.6 3.6 1.1-1.6H17" />
    </>
  ),
  library: (
    <>
      <path d="M4 4h5v16H4zM10.5 4h4v16h-4z" />
      <path d="m16.5 5.2 3.6.9-3 14.4-3.6-1z" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3v6.2L4.2 18A2 2 0 0 0 6 21h12a2 2 0 0 0 1.8-3L15 9.2V3" />
      <path d="M7.5 3h9M7 14h10" />
    </>
  ),
  hostel: (
    <>
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M3 21h18" />
    </>
  ),
  sports: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18" />
      <path d="M3.5 9h17M3.5 15h17" />
    </>
  ),
  auditorium: (
    <>
      <path d="M3 20V8l9-5 9 5v12" />
      <path d="M7 20v-5h10v5" />
      <path d="M2 20h20" />
      <path d="M10 11h4" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9.5h1.8a2.5 2.5 0 0 1 0 5H17" />
      <path d="M7 2.5v2M10.5 2.5v2M14 2.5v2" />
    </>
  ),
  incubator: (
    <>
      <path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3Z" />
      <path d="M9.5 20.5h5M10 17h4" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9a15 15 0 0 1 19 0" />
      <path d="M5.8 12.5a10 10 0 0 1 12.4 0" />
      <path d="M9 16a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="1" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  'arrow-up-right': (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M6.2 3h3l1.5 4-2 1.4a12 12 0 0 0 6 6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.2 5.2 2 2 0 0 1 6.2 3Z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  quote: (
    <path d="M9.5 6C6.5 7.4 5 9.9 5 13.5V18h5.4v-5.4H7.9c0-2 .8-3.4 2.5-4.3L9.5 6Zm9 0c-3 1.4-4.5 3.9-4.5 7.5V18h5.4v-5.4h-2.5c0-2 .8-3.4 2.5-4.3L18.5 6Z" />
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z" />
      <path d="M18.5 3.5v3M20 5h-3" />
    </>
  ),
  send: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.2-4.2A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7.5 11 4.5 4.5L16.5 11" />
      <path d="M4 20h16" />
    </>
  ),
  external: (
    <>
      <path d="M13 4h7v7" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </>
  ),
}

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
