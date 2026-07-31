import './Icon.css'

// A small inline-SVG icon set. Icons are stroke-based and inherit
// `currentColor`, so they sit inside prose like a piece of punctuation and
// take on the surrounding text colour. No external icon font, no images.

const ICONS = {
  book: (
    <>
      <path d="M12 6c-1.6-1.2-3.7-2-6-2v13c2.3 0 4.4.8 6 2 1.6-1.2 3.7-2 6-2V4c-2.3 0-4.4.8-6 2z" />
      <path d="M12 6v13" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6" />
      <path d="M16.5 5.3a3 3 0 010 5.6" />
      <path d="M19 20c0-2.7-1.2-4.7-3-5.6" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6 1.1 0 2.2.3 3 .9" />
      <path d="M18 12.5v6M15 15.5h6" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h3.5A1.5 1.5 0 0119 5.5v13a1.5 1.5 0 01-1.5 1.5H14" />
      <path d="M3.5 12H14" />
      <path d="M10 7.5L14.5 12 10 16.5" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      <path d="M10 21v-3.2h4V21" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 10-13 0C5.5 15.2 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v3.5a4 4 0 01-8 0V4z" />
      <path d="M8 5.2H5.2v.8a3 3 0 003 3M16 5.2h2.8v.8a3 3 0 01-3 3" />
      <path d="M12 11.5V16M9 20h6M10.2 20l.4-4h2.8l.4 4" />
    </>
  ),
  arrowUp: <path d="M12 19V5.5M6.5 11L12 5.5 17.5 11" />,
  arrowDown: <path d="M12 5v13.5M6.5 13L12 18.5 17.5 13" />,
  arrowRight: <path d="M5 12h13.5M13 6.5l6 5.5-6 5.5" />,
  percent: (
    <>
      <path d="M18.5 5.5l-13 13" />
      <circle cx="7.5" cy="7.5" r="2.3" />
      <circle cx="16.5" cy="16.5" r="2.3" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5l8.5 4.6L12 12.7 3.5 8.1 12 3.5z" />
      <path d="M3.5 12.5l8.5 4.6 8.5-4.6" />
    </>
  ),
  table: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7.5 20h9M4.5 7h15l-3-2.4h-9L4.5 7z" />
      <path d="M4.5 7L2 12.5h5L4.5 7zM19.5 7L17 12.5h5L19.5 7z" />
    </>
  ),
  sigma: <path d="M17 4H6.5l6 8-6 8H17" />,
}

export default function Icon({ name, className = '', title }) {
  const glyph = ICONS[name] || ICONS.book
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {glyph}
    </svg>
  )
}
