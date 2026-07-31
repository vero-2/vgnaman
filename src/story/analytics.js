// Rate calculations for the Attrition section — what fraction of a group
// carries the flag's "positive" value (e.g. Left Company = Yes).

function nonEmpty(rows, col) {
  return rows.filter((r) => String(r[col] ?? '').trim() !== '')
}

export function overallRate(rows, { column, positive }) {
  const valid = nonEmpty(rows, column)
  const hit = valid.filter((r) => String(r[column]) === String(positive)).length
  return { total: valid.length, hit, rate: valid.length ? (hit / valid.length) * 100 : null }
}

export function rateByDimension(rows, { dimension, column, positive }) {
  const groups = new Map()
  for (const r of rows) {
    const key = String(r[dimension] ?? '')
    if (key === '' || String(r[column] ?? '').trim() === '') continue
    if (!groups.has(key)) groups.set(key, { total: 0, hit: 0 })
    const g = groups.get(key)
    g.total++
    if (String(r[column]) === String(positive)) g.hit++
  }
  const out = []
  for (const [key, { total, hit }] of groups) {
    if (total >= 1) out.push({ key, total, hit, rate: (hit / total) * 100 })
  }
  out.sort((a, b) => b.rate - a.rate)
  return out
}
