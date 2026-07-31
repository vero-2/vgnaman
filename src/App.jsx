import { useMemo, useState } from 'react'
import DataLoader from './components/DataLoader.jsx'
import Sidebar from './components/Sidebar.jsx'
import SectionView from './components/SectionView.jsx'
import { parseCSV } from './lib/csv.js'
import { inferSchema } from './lib/schema.js'
import { buildContext } from './story/detect.js'
import { getSections } from './story/sectionRegistry.js'
import './App.css'

export default function App() {
  const [loaded, setLoaded] = useState(null) // { name, dataset, schema, ctx }
  const [loadError, setLoadError] = useState(null)
  const [activeId, setActiveId] = useState('overview')

  const handleLoad = ({ name, csv }) => {
    try {
      const dataset = parseCSV(csv)
      if (!dataset.columns.length || !dataset.rows.length) {
        setLoadError('That file did not contain any rows we could read.')
        return
      }
      const schema = inferSchema(dataset)
      const ctx = buildContext(schema)
      setLoadError(null)
      setActiveId('overview')
      setLoaded({ name, dataset, schema, ctx })
    } catch (err) {
      setLoadError('Something went wrong reading that data.')
      console.error(err)
    }
  }

  const sections = useMemo(
    () => (loaded ? getSections(loaded.schema, loaded.ctx) : []),
    [loaded],
  )

  // Guard against an active id that this dataset doesn't offer.
  const active = sections.find((s) => s.id === activeId) || sections[0]

  if (!loaded) {
    return (
      <main className="app-landing">
        <DataLoader onLoad={handleLoad} />
        {loadError && <p className="app-load-error">{loadError}</p>}
      </main>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        name={loaded.name}
        schema={loaded.schema}
        sections={sections}
        activeId={active?.id}
        onSelect={setActiveId}
        onReset={() => setLoaded(null)}
      />
      <main className="app-main">
        {active && (
          <SectionView section={active} rows={loaded.dataset.rows} schema={loaded.schema} ctx={loaded.ctx} />
        )}
      </main>
    </div>
  )
}
