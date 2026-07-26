import { parseNumber, parseDate } from './schema.js'

// ---- Aggregation ---------------------------------------------------------

export const AGGREGATIONS = {
  sum: { label: 'total', verb: 'is' },
  average: { label: 'average', verb: 'is' },
  count: { label: 'number of rows', verb: 'is' },
  max: { label: 'highest', verb: 'is' },
  min: { label: 'lowest', verb: 'is' },
  median: { label: 'median', verb: 'is' },
}

function applyFilters(rows, filters) {
  if (!filters || filters.length === 0) return rows
  return rows.filter((row) =>
    filters.every((f) => {
      if (f.value == null || f.value === '__all__') return true
      return String(row[f.column]) === String(f.value)
    }),
  )
}

// Compute an aggregation of a measure over a filtered set of rows.
// `agg` is a key of AGGREGATIONS. For 'count', measure may be null.
export function aggregate(rows, { measure, agg = 'sum', filters }) {
  const filtered = applyFilters(rows, filters)
  if (agg === 'count') return { value: filtered.length, n: filtered.length }

  const nums = []
  for (const row of filtered) {
    const v = parseNumber(row[measure])
    if (v != null) nums.push(v)
  }
  const n = nums.length
  if (n === 0) return { value: null, n: 0 }

  let value
  switch (agg) {
    case 'sum':
      value = nums.reduce((a, b) => a + b, 0)
      break
    case 'average':
      value = nums.reduce((a, b) => a + b, 0) / n
      break
    case 'max':
      value = Math.max(...nums)
      break
    case 'min':
      value = Math.min(...nums)
      break
    case 'median': {
      const sorted = [...nums].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      break
    }
    default:
      value = nums.reduce((a, b) => a + b, 0)
  }
  return { value, n }
}

// Rank the distinct values of a dimension by an aggregated measure.
// Returns [{ key, value }] sorted descending, respecting extra filters.
export function rankBy(rows, { dimension, measure, agg = 'sum', filters }) {
  const filtered = applyFilters(rows, filters)
  const groups = new Map()
  for (const row of filtered) {
    const key = String(row[dimension] ?? '')
    if (key === '') continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  const result = []
  for (const [key, groupRows] of groups) {
    const { value } = aggregate(groupRows, { measure, agg, filters: [] })
    if (value != null) result.push({ key, value })
  }
  result.sort((a, b) => b.value - a.value)
  return result
}

// Group and aggregate by a time column, returning ordered periods.
export function seriesByTime(rows, { timeColumn, measure, agg = 'sum', filters }) {
  const filtered = applyFilters(rows, filters)
  const groups = new Map()
  for (const row of filtered) {
    const d = parseDate(row[timeColumn])
    if (!d) continue
    const key = row[timeColumn] // keep original label
    if (!groups.has(key)) groups.set(key, { time: d.time, rows: [] })
    groups.get(key).rows.push(row)
  }
  const result = []
  for (const [label, { time, rows: groupRows }] of groups) {
    const { value } = aggregate(groupRows, { measure, agg, filters: [] })
    result.push({ label, time, value })
  }
  result.sort((a, b) => a.time - b.time)
  return result
}

// ---- Formatting ----------------------------------------------------------

function compactCurrencyOrNumber(value, { currency }) {
  const abs = Math.abs(value)
  const prefix = currency ? '$' : ''
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000)
    return `${sign}${prefix}${trim(abs / 1_000_000_000)}B`
  if (abs >= 1_000_000) return `${sign}${prefix}${trim(abs / 1_000_000)}M`
  if (abs >= 10_000) return `${sign}${prefix}${trim(abs / 1_000)}K`
  return null
}

function trim(n) {
  // One decimal place, but drop a trailing ".0".
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

function withThousands(n, decimals) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Human-friendly value formatting driven by the measure's inferred format.
export function formatValue(value, format = 'number', { compact = true } = {}) {
  if (value == null || !Number.isFinite(value)) return '—'

  if (format === 'percent') {
    return `${withThousands(value, Math.abs(value) < 10 ? 1 : 0)}%`
  }

  const currency = format === 'currency'
  if (compact) {
    const c = compactCurrencyOrNumber(value, { currency })
    if (c) return c
  }

  const decimals = !Number.isInteger(value) && Math.abs(value) < 100 ? 2 : 0
  const body = withThousands(value, decimals)
  return currency ? `$${body}` : body
}

export function formatPercentChange(pct) {
  if (pct == null || !Number.isFinite(pct)) return '—'
  const rounded = Math.abs(pct) < 10 ? Math.round(pct * 10) / 10 : Math.round(pct)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

// Return { pct, direction, word } describing change from a→b.
export function describeChange(from, to) {
  if (from == null || to == null || from === 0) {
    return { pct: null, direction: 'flat', word: 'changed', compareWord: 'the same as' }
  }
  const pct = ((to - from) / Math.abs(from)) * 100
  if (Math.abs(pct) < 0.05)
    return { pct: 0, direction: 'flat', word: 'held steady', compareWord: 'about the same as' }
  if (pct > 0)
    return { pct, direction: 'up', word: 'rose', compareWord: 'more than' }
  return { pct, direction: 'down', word: 'fell', compareWord: 'less than' }
}
