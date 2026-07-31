import { useMemo, useState } from 'react'
import Chip from '../components/Chip.jsx'
import Icon from '../components/Icon.jsx'
import { rankBy, seriesByTime, describeChange, formatValue } from '../lib/stats.js'
import { dimColumnOptions, dimValueOptions, defaultDimension } from './helpers.js'
import { teamDimension } from './detect.js'
import { overallRate, rateByDimension } from './analytics.js'

// ---- shared bits ----------------------------------------------------------

function V({ children }) {
  return <strong className="value">{children}</strong>
}
function Lead({ children }) {
  return <span className="lead">{children}</span>
}
const count = (n) => (n == null ? '—' : formatValue(n, 'number'))
const rate = (r) => (r == null ? '—' : `${Math.round(r * 10) / 10}%`)

function countWhere(rows, col, val) {
  return rows.reduce((n, r) => (String(r[col]) === String(val) ? n + 1 : n), 0)
}

// A dropdown for choosing which dimension a block groups by. `exclude` drops
// columns that don't make sense here (e.g. grouping attrition by the
// attrition flag itself, which would trivially read 100% / 0%).
function DimChip({ schema, value, onChange, exclude = [] }) {
  const options = dimColumnOptions(schema).filter((o) => !exclude.includes(o.value))
  return <Chip value={value} options={options} onChange={onChange} title="Change the grouping" />
}

// ===========================================================================
// HEADCOUNT
// ===========================================================================

export function HeadcountShapeBlock({ rows, schema, ctx }) {
  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const ranked = useMemo(() => rankBy(rows, { dimension: dimCol, agg: 'count' }), [rows, dimCol])
  const total = rows.length
  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]
  const share = top ? (top.value / total) * 100 : null

  return (
    <p className="sentence">
      <Icon name="users" className="icon-lead" />
      There are <V>{count(total)}</V> {ctx.noun} in total. Split by <DimChip schema={schema} value={dimCol} onChange={setDimCol} />,
      that&apos;s <V>{ranked.length}</V> groups — the largest is <Lead>{top?.key ?? '—'}</Lead> with <V>{count(top?.value)}</V>{' '}
      {ctx.noun} (<V>{rate(share)}</V>), and the smallest is {bottom?.key ?? '—'} with <V>{count(bottom?.value)}</V>.
    </p>
  )
}

export function HeadcountConcentrationBlock({ rows, schema, ctx }) {
  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const ranked = useMemo(() => rankBy(rows, { dimension: dimCol, agg: 'count' }), [rows, dimCol])
  const total = rows.length
  const topThree = ranked.slice(0, 3)
  const sum = topThree.reduce((a, b) => a + b.value, 0)
  const share = total ? (sum / total) * 100 : null
  const names = topThree.map((t) => t.key)
  const nameStr =
    names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

  return (
    <p className="sentence">
      <Icon name="layers" className="icon-lead" />
      The three biggest <DimChip schema={schema} value={dimCol} onChange={setDimCol} /> groups — {nameStr || '—'} — together hold{' '}
      <V>{rate(share)}</V> of all {ctx.noun}, <V>{count(sum)}</V> of <V>{count(total)}</V>.
    </p>
  )
}

export function HeadcountCompareBlock({ rows, schema, ctx }) {
  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const valueOptions = useMemo(() => dimValueOptions(schema, dimCol), [schema, dimCol])
  const [a, setA] = useState(valueOptions[0]?.value)
  const [b, setB] = useState(valueOptions[1]?.value ?? valueOptions[0]?.value)
  const safeA = valueOptions.some((o) => o.value === a) ? a : valueOptions[0]?.value
  const safeB = valueOptions.some((o) => o.value === b) ? b : valueOptions[1]?.value ?? valueOptions[0]?.value
  if (safeA !== a) setA(safeA)
  if (safeB !== b) setB(safeB)

  const countA = countWhere(rows, dimCol, safeA)
  const countB = countWhere(rows, dimCol, safeB)
  const change = describeChange(countB, countA)
  const diff = Math.abs(countA - countB)

  return (
    <p className="sentence">
      <Icon name="building" className="icon-lead" />
      <Chip kind="dimension" value={safeA} options={valueOptions} onChange={setA} title="First group" /> has <V>{count(countA)}</V>{' '}
      {ctx.noun}, {change.compareWord}{' '}
      <Chip kind="dimensionB" value={safeB} options={valueOptions} onChange={setB} title="Second group" /> with <V>{count(countB)}</V>
      {diff > 0 && (
        <>
          {' '}— a difference of <V>{count(diff)}</V>
        </>
      )}
      . <span className="sentence-note">Grouped by <DimChip schema={schema} value={dimCol} onChange={setDimCol} />.</span>
    </p>
  )
}

// ===========================================================================
// HIRING  (needs a time column, ctx.hireTime)
// ===========================================================================

function useHiringSeries(rows, ctx, filters) {
  return useMemo(
    () => seriesByTime(rows, { timeColumn: ctx.hireTime, agg: 'count', filters }),
    [rows, ctx.hireTime, filters],
  )
}

export function HiringSpanBlock({ rows, ctx }) {
  const series = useHiringSeries(rows, ctx)
  const total = series.reduce((a, b) => a + b.value, 0)
  const peak = series.reduce((m, p) => (p.value > (m?.value ?? -1) ? p : m), null)
  const low = series.reduce((m, p) => (p.value < (m?.value ?? Infinity) ? p : m), null)

  return (
    <p className="sentence">
      <Icon name="calendar" className="icon-lead" />
      Over <V>{series.length}</V> years, <V>{count(total)}</V> {ctx.noun} joined. Hiring peaked in <Lead>{peak?.label ?? '—'}</Lead>{' '}
      with <V>{count(peak?.value)}</V> new joiners, and was quietest in {low?.label ?? '—'} with <V>{count(low?.value)}</V>.
    </p>
  )
}

export function HiringYearBlock({ rows, schema, ctx }) {
  const series = useHiringSeries(rows, ctx)
  const yearOptions = series.map((p) => ({ value: p.label, label: p.label }))
  const [year, setYear] = useState(yearOptions[yearOptions.length - 1]?.value)
  const safeYear = yearOptions.some((o) => o.value === year) ? year : yearOptions[yearOptions.length - 1]?.value
  if (safeYear !== year) setYear(safeYear)

  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const yearRows = useMemo(() => rows.filter((r) => String(r[ctx.hireTime]) === String(safeYear)), [rows, ctx.hireTime, safeYear])
  const topGroup = useMemo(() => rankBy(yearRows, { dimension: dimCol, agg: 'count' })[0], [yearRows, dimCol])

  return (
    <p className="sentence">
      <Icon name="userPlus" className="icon-lead" />
      In <Chip value={safeYear} options={yearOptions} onChange={setYear} title="Pick a year" />, <V>{count(yearRows.length)}</V>{' '}
      {ctx.noun} joined — most into <Lead>{topGroup?.key ?? '—'}</Lead> (<V>{count(topGroup?.value)}</V>).{' '}
      <span className="sentence-note">Broken down by <DimChip schema={schema} value={dimCol} onChange={setDimCol} />.</span>
    </p>
  )
}

export function HiringGrowthBlock({ rows, ctx }) {
  const series = useHiringSeries(rows, ctx)
  const opts = series.map((p) => ({ value: p.label, label: p.label }))
  const [start, setStart] = useState(opts[0]?.value)
  const [end, setEnd] = useState(opts[opts.length - 1]?.value)
  const safeStart = opts.some((o) => o.value === start) ? start : opts[0]?.value
  const safeEnd = opts.some((o) => o.value === end) ? end : opts[opts.length - 1]?.value
  if (safeStart !== start) setStart(safeStart)
  if (safeEnd !== end) setEnd(safeEnd)

  const startVal = series.find((p) => p.label === safeStart)?.value
  const endVal = series.find((p) => p.label === safeEnd)?.value
  const change = describeChange(startVal, endVal)
  const dirIcon = change.direction === 'down' ? 'arrowDown' : change.direction === 'up' ? 'arrowUp' : 'arrowRight'

  return (
    <p className="sentence">
      <Icon name={dirIcon} className={`icon-lead icon-${change.direction}`} />
      Between <Chip value={safeStart} options={opts} onChange={setStart} title="Start year" /> and{' '}
      <Chip value={safeEnd} options={opts} onChange={setEnd} title="End year" />, annual hiring{' '}
      <span className={`trend-word trend-${change.direction}`}>{change.word}</span> from <V>{count(startVal)}</V> to{' '}
      <V>{count(endVal)}</V> {ctx.noun} a year
      {change.pct != null && change.direction !== 'flat' && (
        <>
          {' '}(<V>{formatValue(change.pct, 'percent')}</V>)
        </>
      )}
      .
    </p>
  )
}

// ===========================================================================
// ATTRITION  (needs ctx.flag)
// ===========================================================================

export function AttritionRateBlock({ rows, ctx }) {
  const { total, hit, rate: r } = overallRate(rows, ctx.flag)
  const verb = ctx.flag.verb === 'left' ? 'have left' : `are marked “${ctx.flag.positive}”`
  return (
    <p className="sentence">
      <Icon name="logout" className="icon-lead" />
      <V>{count(hit)}</V> of <V>{count(total)}</V> {ctx.noun} {verb} — an overall{' '}
      {ctx.people ? 'attrition' : ''} rate of <V>{rate(r)}</V>.
    </p>
  )
}

export function AttritionByBlock({ rows, schema, ctx }) {
  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const ranked = useMemo(
    () => rateByDimension(rows, { dimension: dimCol, ...ctx.flag }),
    [rows, dimCol, ctx.flag],
  )
  const worst = ranked[0]
  const best = ranked[ranked.length - 1]

  return (
    <p className="sentence">
      <Icon name="percent" className="icon-lead" />
      By <DimChip schema={schema} value={dimCol} onChange={setDimCol} exclude={[ctx.flag.column]} />, it runs highest in{' '}
      <Lead>{worst?.key ?? '—'}</Lead> at{' '}
      <V>{rate(worst?.rate)}</V> (<V>{count(worst?.hit)}</V> of <V>{count(worst?.total)}</V>), and lowest in {best?.key ?? '—'} at{' '}
      <V>{rate(best?.rate)}</V>.
    </p>
  )
}

export function AttritionGroupBlock({ rows, schema, ctx }) {
  const [dimCol, setDimCol] = useState(teamDimension(schema, defaultDimension(schema)))
  const valueOptions = useMemo(() => dimValueOptions(schema, dimCol), [schema, dimCol])
  const [group, setGroup] = useState(valueOptions[0]?.value)
  const safeGroup = valueOptions.some((o) => o.value === group) ? group : valueOptions[0]?.value
  if (safeGroup !== group) setGroup(safeGroup)

  const groupRows = useMemo(() => rows.filter((r) => String(r[dimCol]) === String(safeGroup)), [rows, dimCol, safeGroup])
  const groupRate = overallRate(groupRows, ctx.flag).rate
  const companyRate = overallRate(rows, ctx.flag).rate
  const change = describeChange(companyRate, groupRate)
  const delta =
    change.direction === 'flat'
      ? 'in line with'
      : change.direction === 'up'
        ? 'above'
        : 'below'
  const dirIcon = change.direction === 'down' ? 'arrowDown' : change.direction === 'up' ? 'arrowUp' : 'arrowRight'

  return (
    <p className="sentence">
      <Icon name={dirIcon} className={`icon-lead icon-${change.direction}`} />
      Among <DimChip schema={schema} value={dimCol} onChange={setDimCol} exclude={[ctx.flag.column]} /> ={' '}
      <Chip kind="dimensionB" value={safeGroup} options={valueOptions} onChange={setGroup} title="Pick a group" />,{' '}
      <V>{rate(groupRate)}</V> {ctx.flag.verb === 'left' ? 'have left' : 'are flagged'} — <strong className="value">{delta}</strong>{' '}
      the <V>{rate(companyRate)}</V> company average.
    </p>
  )
}

// ===========================================================================
// THE DATA
// ===========================================================================

const ROLE_META = {
  measure: { label: 'metric', className: 'role-measure' },
  time: { label: 'time', className: 'role-time' },
  dimension: { label: 'category', className: 'role-dimension' },
}

export function SchemaBlock({ schema }) {
  return (
    <div className="schema-block">
      <p className="sentence sentence--calm">
        Storygram read <V>{schema.columns.length}</V> columns: <V>{schema.measures.length}</V> metrics,{' '}
        <V>{schema.dimensions.length}</V> categories and <V>{schema.times.length}</V> time columns across{' '}
        <V>{count(schema.rowCount)}</V> rows.
      </p>
      <ul className="schema-grid">
        {schema.columns.map((c) => {
          const meta = ROLE_META[c.role] || ROLE_META.dimension
          return (
            <li key={c.name} className="schema-item">
              <span className="schema-name">{c.name}</span>
              <span className={`col-role ${meta.className}`}>{meta.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

