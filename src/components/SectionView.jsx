import Icon from './Icon.jsx'
import './SectionView.css'

// Renders one topic section: a header (icon + title + subtitle) followed by
// that section's editable story blocks.
export default function SectionView({ section, rows, schema, ctx }) {
  return (
    <div className="section-view" key={section.id}>
      <header className="section-header">
        <span className="section-icon" aria-hidden="true">
          <Icon name={section.icon} />
        </span>
        <div>
          <h1 className="section-title">{section.title}</h1>
          <p className="section-subtitle">{section.subtitle}</p>
        </div>
      </header>

      <div className="section-body">
        {section.blocks.map((Block, i) => (
          <div className="story-block" key={i}>
            <Block rows={rows} schema={schema} ctx={ctx} />
          </div>
        ))}
      </div>
    </div>
  )
}
