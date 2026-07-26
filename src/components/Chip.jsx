import { useEffect, useRef, useState } from 'react'
import './Chip.css'

// An inline, editable word inside a sentence. Renders as underlined text
// that opens a dropdown of options on click. `kind` only tweaks styling.
export default function Chip({ value, options, onChange, kind = 'dimension', title }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const searchRef = useRef(null)

  const current = options.find((o) => o.value === value)
  const label = current ? current.label : value

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    // Focus the filter box for quick keyboard selection.
    const t = setTimeout(() => searchRef.current?.focus(), 0)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  const showSearch = options.length > 8
  const filtered = showSearch
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const select = (v) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <span className="chip-root" ref={rootRef}>
      <button
        type="button"
        className={`chip chip--${kind} ${open ? 'chip--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        <svg className="chip-caret" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="chip-menu" role="listbox">
          {showSearch && (
            <input
              ref={searchRef}
              className="chip-search"
              placeholder="Filter…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <div className="chip-options">
            {filtered.length === 0 && <div className="chip-empty">No matches</div>}
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                className={`chip-option ${o.value === value ? 'is-selected' : ''}`}
                role="option"
                aria-selected={o.value === value}
                onClick={() => select(o.value)}
              >
                {o.label}
                {o.hint != null && <span className="chip-option-hint">{o.hint}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}
