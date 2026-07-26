import { useMemo, useState } from 'react'
import DataLoader from './components/DataLoader.jsx'
import Sidebar from './components/Sidebar.jsx'
import Narrative from './components/Narrative.jsx'
import { parseCSV } from './lib/csv.js'
import { inferSchema } from './lib/schema.js'
import './App.css'

export default function App() {
  // loaded: { name, dataset: {columns, rows}, schema }
  const [loaded, setLoaded] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const handleLoad = ({ name, csv }) => {
    try {
      const dataset = parseCSV(csv)
      if (!dataset.columns.length || !dataset.rows.length) {
        setLoadError('That file did not contain any rows we could read.')
        return
      }
      const schema = inferSchema(dataset)
      setLoadError(null)
      setLoaded({ name, dataset, schema })
    } catch (err) {
      setLoadError('Something went wrong reading that data.')
      console.error(err)
    }
  }

  const content = useMemo(() => {
    if (!loaded) return null
    return <Narrative rows={loaded.dataset.rows} schema={loaded.schema} />
  }, [loaded])

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
      <Sidebar name={loaded.name} schema={loaded.schema} onReset={() => setLoaded(null)} />
      <main className="app-main">{content}</main>
    </div>
  )
}
