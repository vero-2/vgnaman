import { useRef, useState } from 'react'
import { SAMPLES } from '../lib/samples.js'
import './DataLoader.css'

export default function DataLoader({ onLoad }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    setError(null)
    if (!file) return
    const isCsv = /\.(csv|tsv|txt)$/i.test(file.name) || file.type.includes('csv')
    if (!isCsv) {
      setError('Please choose a .csv file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onLoad({ name: file.name.replace(/\.[^.]+$/, ''), csv: String(reader.result) })
    reader.onerror = () => setError('Could not read that file.')
    reader.readAsText(file)
  }

  return (
    <div className="loader">
      <div className="loader-hero">
        <p className="loader-eyebrow">Storygram</p>
        <h1 className="loader-title">Read your data like a story.</h1>
        <p className="loader-sub">
          Upload a spreadsheet and Storygram turns it into plain sentences. Then click any{' '}
          <span className="loader-underline">underlined word</span> — a team, a date, a metric — and watch the
          numbers rewrite themselves.
        </p>
      </div>

      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files[0])
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <svg className="dropzone-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 16V4m0 0L7 9m5-5l5 5M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="dropzone-main">Drop a CSV here, or click to browse</p>
        <p className="dropzone-hint">Everything stays in your browser — nothing is uploaded.</p>
        {error && <p className="dropzone-error">{error}</p>}
      </div>

      <div className="samples">
        <p className="samples-label">or explore a sample</p>
        <div className="samples-grid">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="sample-card"
              onClick={() => onLoad({ name: s.name, csv: s.csv })}
            >
              <span className="sample-name">{s.name}</span>
              <span className="sample-blurb">{s.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
