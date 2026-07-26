import { aggregate, AGGREGATIONS } from '../lib/stats.js'

// A synthetic measure meaning "count of rows", so every dataset — even one
// with no numeric columns — always has something to talk about.
export const COUNT = '__count__'
export const ALL = '__all__'

export function buildMeasureOptions(schema) {
  return [
    { value: COUNT, label: 'records' },
    ...schema.measures.map((m) => ({ value: m.name, label: m.name })),
  ]
}

export function buildAggOptions() {
  // 'count' is implied by the "records" measure, so it's excluded here.
  return Object.entries(AGGREGATIONS)
    .filter(([k]) => k !== 'count')
    .map(([value, meta]) => ({ value, label: meta.label }))
}

export function measureLabel(schema, measureValue) {
  if (measureValue === COUNT) return 'records'
  return measureValue
}

export function measureFormat(schema, measureValue) {
  if (measureValue === COUNT) return 'number'
  const m = schema.measures.find((c) => c.name === measureValue)
  return m ? m.format : 'number'
}

// One entry point for every "compute a number" the story blocks need.
export function computeMetric(rows, { measure, agg, filters }) {
  if (measure === COUNT) {
    const { value } = aggregate(rows, { agg: 'count', filters })
    return value
  }
  const { value } = aggregate(rows, { measure, agg, filters })
  return value
}

export function dimColumnOptions(schema) {
  return schema.dimensions.map((d) => ({
    value: d.name,
    label: d.name,
    hint: `${d.distinct.length}`,
  }))
}

export function dimValueOptions(schema, colName, { includeAll = false } = {}) {
  const col = schema.dimensions.find((d) => d.name === colName)
  const values = col ? [...col.distinct].sort(collator()) : []
  const opts = values.map((v) => ({ value: v, label: v }))
  if (includeAll) return [{ value: ALL, label: 'any' }, ...opts]
  return opts
}

export function timeValueOptions(rows, timeCol) {
  // Preserve first-seen order but de-duplicate.
  const seen = new Set()
  const out = []
  for (const r of rows) {
    const v = String(r[timeCol] ?? '')
    if (v === '' || seen.has(v)) continue
    seen.add(v)
    out.push({ value: v, label: v })
  }
  return out
}

function collator() {
  const c = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
  return (a, b) => c.compare(a, b)
}

// Pick a sensible default measure: the first real numeric measure if any,
// else the record count.
export function defaultMeasure(schema) {
  return schema.measures.length ? schema.measures[0].name : COUNT
}

// Pick a sensible default dimension to group by: the one that most looks like
// an "entity" (teams, countries, regions) — i.e. the highest-cardinality
// dimension that isn't so unique it names every row. Falls back to the first.
export function defaultDimension(schema) {
  const dims = schema.dimensions
  if (!dims.length) return undefined
  const scored = dims
    .filter((d) => d.distinct.length < schema.rowCount)
    .sort((a, b) => b.distinct.length - a.distinct.length)
  return (scored[0] || dims[0]).name
}
