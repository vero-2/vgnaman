import Icon from './Icon.jsx'
import './Sidebar.css'

export default function Sidebar({ name, schema, sections, activeId, onSelect, onReset }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <p className="sidebar-eyebrow">Storygram</p>
        <button type="button" className="sidebar-reset" onClick={onReset} title="Load another dataset">
          Change data
        </button>
      </div>

      <div className="sidebar-dataset">
        <h2 className="sidebar-name">{name}</h2>
        <p className="sidebar-meta">
          {schema.rowCount.toLocaleString()} rows · {schema.columns.length} columns
        </p>
      </div>

      <nav className="section-nav" aria-label="Story sections">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`nav-item ${s.id === activeId ? 'is-active' : ''}`}
            onClick={() => onSelect(s.id)}
            aria-current={s.id === activeId ? 'page' : undefined}
          >
            <span className="nav-icon">
              <Icon name={s.icon} />
            </span>
            <span className="nav-text">
              <span className="nav-title">{s.title}</span>
              <span className="nav-sub">{s.subtitle}</span>
            </span>
          </button>
        ))}
      </nav>

      <p className="sidebar-tip">
        The <span className="tip-underline">underlined words</span> in each sentence are editable — click one to
        explore.
      </p>
    </aside>
  )
}
