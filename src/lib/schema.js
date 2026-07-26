// Schema inference: classify each column as a measure (number),
// a time column (date), or a dimension (category), and gather the
// metadata the narrative engine needs (distinct values, ranges, format).

const MONTHS = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8,
  sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10,
  dec: 11, december: 11,
}

// Parse a value that is meant to be a number. Tolerates $, commas,
// %, and surrounding whitespace. Returns null if not numeric.
export function parseNumber(raw) {
  if (raw == null) return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  let s = String(raw).trim()
  if (s === '') return null
  let sign = 1
  // Accounting-style negatives: (1,234)
  if (/^\(.*\)$/.test(s)) {
    sign = -1
    s = s.slice(1, -1)
  }
  const isPercent = s.endsWith('%')
  s = s.replace(/[$£€,%\s]/g, '')
  if (s === '' || s === '-' || s === '.') return null
  const num = Number(s)
  if (!Number.isFinite(num)) return null
  return sign * (isPercent ? num : num)
}

// Try to interpret a value as a point in time. Returns
// { time (ms), granularity, label } or null.
export function parseDate(raw) {
  if (raw == null) return null
  const s = String(raw).trim()
  if (s === '') return null

  // Bare year, e.g. 1998 or 2023
  if (/^(19|20)\d{2}$/.test(s)) {
    const y = Number(s)
    return { time: Date.UTC(y, 0, 1), granularity: 'year', label: s }
  }
  // YYYY-MM or YYYY/MM
  let m = s.match(/^(\d{4})[-/](\d{1,2})$/)
  if (m) {
    const y = Number(m[1])
    const mo = Number(m[2]) - 1
    if (mo >= 0 && mo <= 11) {
      return { time: Date.UTC(y, mo, 1), granularity: 'month', label: s }
    }
  }
  // YYYY-MM-DD or YYYY/MM/DD
  m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (m) {
    const y = Number(m[1])
    const mo = Number(m[2]) - 1
    const d = Number(m[3])
    if (mo >= 0 && mo <= 11 && d >= 1 && d <= 31) {
      return { time: Date.UTC(y, mo, d), granularity: 'day', label: s }
    }
  }
  // MM/DD/YYYY or M/D/YYYY
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) {
    const mo = Number(m[1]) - 1
    const d = Number(m[2]) - 1 + 1
    const y = Number(m[3])
    if (mo >= 0 && mo <= 11 && d >= 1 && d <= 31) {
      return { time: Date.UTC(y, mo, d), granularity: 'day', label: s }
    }
  }
  // Month names: "January 2023", "Jan 2023", "2023 Jan"
  m = s.match(/^([a-zA-Z]{3,9})\.?\s+(\d{4})$/)
  if (m && MONTHS[m[1].toLowerCase()] !== undefined) {
    const mo = MONTHS[m[1].toLowerCase()]
    return { time: Date.UTC(Number(m[2]), mo, 1), granularity: 'month', label: s }
  }
  m = s.match(/^(\d{4})\s+([a-zA-Z]{3,9})\.?$/)
  if (m && MONTHS[m[2].toLowerCase()] !== undefined) {
    const mo = MONTHS[m[2].toLowerCase()]
    return { time: Date.UTC(Number(m[1]), mo, 1), granularity: 'month', label: s }
  }
  // Quarter: 2023 Q1 / Q1 2023
  m = s.match(/^(?:(\d{4})[\s-]*q([1-4])|q([1-4])[\s-]*(\d{4}))$/i)
  if (m) {
    const y = Number(m[1] || m[4])
    const q = Number(m[2] || m[3])
    return { time: Date.UTC(y, (q - 1) * 3, 1), granularity: 'quarter', label: s }
  }
  return null
}

function classifyColumn(name, rows) {
  const values = rows.map((r) => r[name])
  const nonEmpty = values.filter((v) => v != null && String(v).trim() !== '')
  const sampleSize = nonEmpty.length

  if (sampleSize === 0) {
    return { name, role: 'dimension', type: 'category', distinct: [], emptyRatio: 1 }
  }

  let numeric = 0
  let dated = 0
  let hadCurrency = false
  let hadPercent = false
  const granularities = {}

  for (const v of nonEmpty) {
    const s = String(v)
    if (parseNumber(v) != null) {
      numeric++
      if (/[$£€]/.test(s)) hadCurrency = true
      if (s.trim().endsWith('%')) hadPercent = true
    }
    const d = parseDate(v)
    if (d) {
      dated++
      granularities[d.granularity] = (granularities[d.granularity] || 0) + 1
    }
  }

  const distinctSet = new Set(nonEmpty.map((v) => String(v)))
  const distinct = [...distinctSet]

  // Date columns: mostly parseable as dates AND not better explained as a
  // plain low-cardinality number (bare years count as both; prefer date).
  if (dated / sampleSize >= 0.8 && distinct.length > 1) {
    const granularity =
      Object.entries(granularities).sort((a, b) => b[1] - a[1])[0]?.[0] || 'day'
    return {
      name,
      role: 'time',
      type: 'date',
      granularity,
      distinct,
      emptyRatio: 1 - sampleSize / values.length,
    }
  }

  // Numeric measures.
  if (numeric / sampleSize >= 0.8) {
    const nums = nonEmpty.map(parseNumber).filter((x) => x != null)
    const min = Math.min(...nums)
    const max = Math.max(...nums)
    let format = 'number'
    if (hadCurrency) format = 'currency'
    else if (hadPercent) format = 'percent'
    return {
      name,
      role: 'measure',
      type: 'number',
      format,
      min,
      max,
      distinctCount: distinctSet.size,
      emptyRatio: 1 - sampleSize / values.length,
    }
  }

  // Everything else is a dimension.
  return {
    name,
    role: 'dimension',
    type: 'category',
    distinct,
    distinctCount: distinctSet.size,
    emptyRatio: 1 - sampleSize / values.length,
  }
}

export function inferSchema(dataset) {
  const columns = dataset.columns.map((name) => classifyColumn(name, dataset.rows))
  return {
    columns,
    measures: columns.filter((c) => c.role === 'measure'),
    // A dimension is only useful for storytelling if it groups the data;
    // extremely high-cardinality columns (like free-text ids) are demoted.
    dimensions: columns.filter(
      (c) => c.role === 'dimension' && c.distinct.length >= 1 && c.distinct.length <= 1000,
    ),
    times: columns.filter((c) => c.role === 'time'),
    rowCount: dataset.rows.length,
  }
}
