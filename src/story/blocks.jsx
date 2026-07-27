import { useMemo, useState } from 'react'
import Chip from '../components/Chip.jsx'
import { formatValue, formatPercentChange, describeChange, rankBy, seriesByTime } from '../lib/stats.js'
import {
  COUNT,
  ALL,
  buildMeasureOptions,
  buildAggOptions,
  measureLabel,
  measureFormat,
  computeMetric,
  dimColumnOptions,
  dimValueOptions,
  defaultMeasure,
  defaultDimension,
  defaultAgg,
} from './helpers.js'

// Shared initial metric state so every block opens on a sensible
// measure + aggregation for the dataset (e.g. "total Salary", "average Age").
function useMetricDefaults(schema) {
  const measure = defaultMeasure(schema)
  return { measure, agg: defaultAgg(schema, measure) }
}

// Bold, read-only computed number.
function V({ children }) {
  return <strong className="value">{children}</strong>
}

// A measure + aggregation pair rendered as two chips, e.g. "total revenue".
function MetricChips({ schema, measure, setMeasure, agg, setAgg }) {
  const measureOptions = buildMeasureOptions(schema)
  const aggOptions = buildAggOptions()
  return (
    <>
      {measure !== COUNT && (
        <>
          <Chip kind="agg" value={agg} options={aggOptions} onChange={setAgg} title="Change how it's summarised" />{' '}
        </>
      )}
      {measure === COUNT ? 'number of ' : ''}
      <Chip kind="measure" value={measure} options={measureOptions} onChange={setMeasure} title="Change the metric" />
    </>
  )
}

// ---------------------------------------------------------------------------
// 1. Overview — the whole dataset in one line.
// ---------------------------------------------------------------------------
export function OverviewBlock({ rows, schema }) {
  const md = useMetricDefaults(schema)
  const [measure, setMeasure] = useState(md.measure)
  const [agg, setAgg] = useState(md.agg)

  const value = computeMetric(rows, { measure, agg })
  const fmt = measureFormat(schema, measure)

  return (
    <p className="sentence">
      Across all <V>{rows.length.toLocaleString()}</V> records, the{' '}
      <MetricChips schema={schema} measure={measure} setMeasure={setMeasure} agg={agg} setAgg={setAgg} /> comes to{' '}
      <V>{formatValue(value, fmt)}</V>.
    </p>
  )
}

// ---------------------------------------------------------------------------
// 2. Segment focus — one slice of a dimension vs the whole.
// ---------------------------------------------------------------------------
export function SegmentBlock({ rows, schema }) {
  const dimCols = dimColumnOptions(schema)
  const [dimCol, setDimCol] = useState(defaultDimension(schema))
  const valueOptions = useMemo(() => dimValueOptions(schema, dimCol), [schema, dimCol])
  const [dimValue, setDimValue] = useState(valueOptions[0]?.value)
  const md = useMetricDefaults(schema)
  const [measure, setMeasure] = useState(md.measure)
  const [agg, setAgg] = useState(md.agg)

  // Keep the selected value valid when the column changes.
  const activeValue = valueOptions.some((o) => o.value === dimValue)
    ? dimValue
    : valueOptions[0]?.value
  if (activeValue !== dimValue) setDimValue(activeValue)

  const filters = [{ column: dimCol, value: activeValue }]
  const value = computeMetric(rows, { measure, agg, filters })
  const total = computeMetric(rows, { measure, agg })
  const fmt = measureFormat(schema, measure)

  const shareable = agg === 'sum' || measure === COUNT
  const share = shareable && total ? (value / total) * 100 : null

  return (
    <p className="sentence">
      When <Chip value={dimCol} options={dimCols} onChange={setDimCol} title="Change the grouping" /> is{' '}
      <Chip value={activeValue} options={valueOptions} onChange={setDimValue} title="Pick a value" />, the{' '}
      <MetricChips schema={schema} measure={measure} setMeasure={setMeasure} agg={agg} setAgg={setAgg} /> is{' '}
      <V>{formatValue(value, fmt)}</V>
      {share != null ? (
        <>
          {' '}— that's <V>{formatValue(share, 'percent')}</V> of the overall {measureLabel(schema, measure)}.
        </>
      ) : (
        '.'
      )}
    </p>
  )
}

// ---------------------------------------------------------------------------
// 3. Comparison — two slices of the same dimension head to head.
// ---------------------------------------------------------------------------
export function CompareBlock({ rows, schema }) {
  const dimCols = dimColumnOptions(schema)
  const [dimCol, setDimCol] = useState(defaultDimension(schema))
  const valueOptions = useMemo(() => dimValueOptions(schema, dimCol), [schema, dimCol])
  const md = useMetricDefaults(schema)
  const [measure, setMeasure] = useState(md.measure)
  const [agg, setAgg] = useState(md.agg)
  const [a, setA] = useState(valueOptions[0]?.value)
  const [b, setB] = useState(valueOptions[1]?.value ?? valueOptions[0]?.value)

  const safeA = valueOptions.some((o) => o.value === a) ? a : valueOptions[0]?.value
  const safeB = valueOptions.some((o) => o.value === b) ? b : valueOptions[1]?.value ?? valueOptions[0]?.value
  if (safeA !== a) setA(safeA)
  if (safeB !== b) setB(safeB)

  const fmt = measureFormat(schema, measure)
  const valA = computeMetric(rows, { measure, agg, filters: [{ column: dimCol, value: safeA }] })
  const valB = computeMetric(rows, { measure, agg, filters: [{ column: dimCol, value: safeB }] })
  const change = describeChange(valB, valA)
  const diff = valA != null && valB != null ? Math.abs(valA - valB) : null

  return (
    <p className="sentence">
      <Chip kind="dimension" value={safeA} options={valueOptions} onChange={setA} title="First value" /> recorded a{' '}
      <MetricChips schema={schema} measure={measure} setMeasure={setMeasure} agg={agg} setAgg={setAgg} /> of{' '}
      <V>{formatValue(valA, fmt)}</V>, {change.compareWord}{' '}
      <Chip kind="dimensionB" value={safeB} options={valueOptions} onChange={setB} title="Second value" /> at{' '}
      <V>{formatValue(valB, fmt)}</V>
      {diff != null && diff > 0 && (
        <>
          {' '}— a gap of <V>{formatValue(diff, fmt)}</V> (<V>{formatPercentChange(change.pct)}</V>)
        </>
      )}
      . <span className="sentence-note">Grouped by <Chip value={dimCol} options={dimCols} onChange={setDimCol} title="Change the grouping" />.</span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// 4. Ranking — the leaderboard of a dimension.
// ---------------------------------------------------------------------------
export function RankBlock({ rows, schema }) {
  const dimCols = dimColumnOptions(schema)
  const [dimCol, setDimCol] = useState(defaultDimension(schema))
  const md = useMetricDefaults(schema)
  const [measure, setMeasure] = useState(md.measure)
  const [agg, setAgg] = useState(md.agg)

  const fmt = measureFormat(schema, measure)
  const ranked = rankBy(rows, {
    dimension: dimCol,
    measure: measure === COUNT ? undefined : measure,
    agg: measure === COUNT ? 'count' : agg,
  })
  const [first, second, third] = ranked

  return (
    <p className="sentence">
      Ranked by <MetricChips schema={schema} measure={measure} setMeasure={setMeasure} agg={agg} setAgg={setAgg} />,{' '}
      <Chip value={dimCol} options={dimCols} onChange={setDimCol} title="Change the grouping" /> is led by{' '}
      {first ? (
        <>
          <span className="lead">{first.key}</span> at <V>{formatValue(first.value, fmt)}</V>
        </>
      ) : (
        'no data'
      )}
      {second && (
        <>
          , ahead of {second.key} (<V>{formatValue(second.value, fmt)}</V>)
        </>
      )}
      {third && (
        <>
          {' '}and {third.key} (<V>{formatValue(third.value, fmt)}</V>)
        </>
      )}
      .
    </p>
  )
}

// ---------------------------------------------------------------------------
// 5. Trend — change over time, optionally filtered to one slice.
// ---------------------------------------------------------------------------
export function TrendBlock({ rows, schema }) {
  const timeCol = schema.times[0]?.name
  const dimCols = dimColumnOptions(schema)
  const [dimCol, setDimCol] = useState(defaultDimension(schema))
  const filterOptions = useMemo(
    () => (dimCol ? dimValueOptions(schema, dimCol, { includeAll: true }) : []),
    [schema, dimCol],
  )
  const [filterVal, setFilterVal] = useState(ALL)
  const md = useMetricDefaults(schema)
  const [measure, setMeasure] = useState(md.measure)
  const [agg, setAgg] = useState(md.agg)

  const safeFilter = filterOptions.some((o) => o.value === filterVal) ? filterVal : ALL
  if (safeFilter !== filterVal) setFilterVal(safeFilter)

  const series = useMemo(() => {
    const filters = dimCol && safeFilter !== ALL ? [{ column: dimCol, value: safeFilter }] : []
    return seriesByTime(rows, {
      timeColumn: timeCol,
      measure: measure === COUNT ? undefined : measure,
      agg: measure === COUNT ? 'count' : agg,
      filters,
    })
  }, [rows, timeCol, measure, agg, safeFilter, dimCol])

  const periodOptions = series.map((p) => ({ value: p.label, label: p.label }))
  const [startP, setStartP] = useState(periodOptions[0]?.value)
  const [endP, setEndP] = useState(periodOptions[periodOptions.length - 1]?.value)

  const safeStart = periodOptions.some((o) => o.value === startP) ? startP : periodOptions[0]?.value
  const safeEnd = periodOptions.some((o) => o.value === endP)
    ? endP
    : periodOptions[periodOptions.length - 1]?.value
  if (safeStart !== startP) setStartP(safeStart)
  if (safeEnd !== endP) setEndP(safeEnd)

  const fmt = measureFormat(schema, measure)
  const startVal = series.find((p) => p.label === safeStart)?.value
  const endVal = series.find((p) => p.label === safeEnd)?.value
  const change = describeChange(startVal, endVal)

  return (
    <p className="sentence">
      Between <Chip value={safeStart} options={periodOptions} onChange={setStartP} title="Start period" /> and{' '}
      <Chip value={safeEnd} options={periodOptions} onChange={setEndP} title="End period" />, the{' '}
      <MetricChips schema={schema} measure={measure} setMeasure={setMeasure} agg={agg} setAgg={setAgg} />{' '}
      <span className={`trend-word trend-${change.direction}`}>{change.word}</span> from <V>{formatValue(startVal, fmt)}</V> to{' '}
      <V>{formatValue(endVal, fmt)}</V>
      {change.pct != null && change.direction !== 'flat' && (
        <>
          {' '}(<V>{formatPercentChange(change.pct)}</V>)
        </>
      )}
      .
      {dimCol && (
        <>
          {' '}
          <span className="sentence-note">
            Showing <Chip value={dimCol} options={dimCols} onChange={setDimCol} title="Filter dimension" />{' '}
            <Chip kind="dimensionB" value={safeFilter} options={filterOptions} onChange={setFilterVal} title="Filter value" />.
          </span>
        </>
      )}
    </p>
  )
}
