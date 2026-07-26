import './Sidebar.css'

const ROLE_META = {
  measure: { label: 'metric', className: 'role-measure' },
  time: { label: 'time', className: 'role-time' },
  dimension: { label: 'category', className: 'role-dimension' },
}

export default function Sidebar({ name, schema, onReset }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <p className="sidebar-eyebrow">Storygram</p>
        <button type="button" className="sidebar-reset" onClick={onReset} title="Load another dataset">
          Change data
        </button>
      </div>

      <h2 className="sidebar-name">{name}</h2>
      <p className="sidebar-meta">
        {schema.rowCount.toLocaleString()} rows · {schema.columns.length} columns
      </p>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Columns</p>
        <ul className="col-list">
          {schema.columns.map((c) => {
            const meta = ROLE_META[c.role] || ROLE_META.dimension
            return (
              <li key={c.name} className="col-item">
                <span className="col-name" title={c.name}>{c.name}</span>
                <span className={`col-role ${meta.className}`}>{meta.label}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="sidebar-tip">
        Tip: the <span className="tip-underline">underlined words</span> in each sentence are editable. Click one to
        swap it and the numbers update instantly.
      </p>
    </aside>
  )
}
