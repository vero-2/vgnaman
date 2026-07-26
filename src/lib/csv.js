// A small, dependency-free CSV parser that handles quoted fields,
// escaped quotes ("") and both \n and \r\n line endings.

export function parseCSV(text) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false
  let i = 0
  const n = text.length

  // Strip a UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) i = 1

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    // Skip fully blank rows.
    if (row.length > 1 || row[0] !== '') rows.push(row)
    row = []
  }

  while (i < n) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ',') {
      pushField()
      i++
      continue
    }
    if (c === '\n') {
      pushRow()
      i++
      continue
    }
    if (c === '\r') {
      // Handle \r\n and lone \r.
      pushRow()
      if (text[i + 1] === '\n') i++
      i++
      continue
    }
    field += c
    i++
  }
  // Flush trailing field/row.
  if (field !== '' || row.length > 0) pushRow()

  if (rows.length === 0) return { columns: [], rows: [] }

  const header = rows[0].map((h, idx) => {
    const name = (h ?? '').trim()
    return name === '' ? `Column ${idx + 1}` : name
  })

  const dataRows = rows.slice(1).map((r) => {
    const obj = {}
    header.forEach((col, idx) => {
      obj[col] = r[idx] ?? ''
    })
    return obj
  })

  return { columns: header, rows: dataRows }
}
