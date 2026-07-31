// Heuristics that let the story sections adapt to the dataset: whether it
// looks like people/HR data, whether there's an attrition-style flag to talk
// about, and which columns best play the "hire date" and "team" roles.

const DEPARTURE = ['left', 'churned', 'terminated', 'resigned', 'attrited', 'exited', 'departed', 'inactive', 'former']
const STAY = ['stayed', 'active', 'retained', 'current', 'employed', 'present']
const TRUEY = ['yes', 'y', 'true', '1']
const FALSEY = ['no', 'n', 'false', '0']

const NAME_HINT = /attrition|left|leav|churn|status|active|terminat|resign|exit|depart|separat|turnover/i
const PEOPLE_HINT = /employee|staff|headcount|department|gender|hire|tenure|salary|payroll|attrition|manager|job\s*level|job\s*title|ethnicit|workforce|seniority|worker|compensation|recruit/i
const HIRE_HINT = /hire|join|start|onboard/i
const TEAM_HINT = /depart|division|function|team|unit|org|business\s*unit|squad/i

// Find a two-value dimension that reads like a "left / stayed" outcome.
// Returns { column, positive, negative, verb } or null. Deliberately
// conservative so a generic Yes/No column (e.g. "People Manager") is ignored
// unless its name or values signal departure.
export function detectFlag(schema) {
  for (const c of schema.dimensions) {
    if (c.distinct.length !== 2) continue
    const vals = c.distinct
    const lower = vals.map((v) => String(v).trim().toLowerCase())
    const nameHints = NAME_HINT.test(c.name)

    let posIdx = lower.findIndex((v) => DEPARTURE.includes(v))
    if (posIdx === -1) {
      const stayIdx = lower.findIndex((v) => STAY.includes(v))
      if (stayIdx !== -1) posIdx = stayIdx === 0 ? 1 : 0
    }
    // Yes/No pairs only count when the column name signals departure.
    if (posIdx === -1 && nameHints) {
      const t = lower.findIndex((v) => TRUEY.includes(v))
      const f = lower.findIndex((v) => FALSEY.includes(v))
      if (t !== -1 && f !== -1) posIdx = t
    }
    if (posIdx === -1) continue

    const verb = nameHints || DEPARTURE.includes(lower[posIdx]) ? 'left' : null
    return {
      column: c.name,
      positive: vals[posIdx],
      negative: vals[1 - posIdx],
      verb, // 'left' when we're confident it's departure; else null
    }
  }
  return null
}

export function isPeopleData(schema) {
  const hits = schema.columns.filter((c) => PEOPLE_HINT.test(c.name)).length
  return hits >= 2
}

export function rowNoun(schema) {
  return isPeopleData(schema) ? 'people' : 'records'
}

// Prefer a hire/join-style time column for the Hiring section; else the first.
export function hireTimeColumn(schema) {
  const hinted = schema.times.find((t) => HIRE_HINT.test(t.name))
  return (hinted || schema.times[0])?.name
}

// Prefer a department/team-style dimension when breaking hires or attrition
// down; else fall back to the most entity-like dimension.
export function teamDimension(schema, fallback) {
  const hinted = schema.dimensions.find((d) => TEAM_HINT.test(d.name))
  return hinted ? hinted.name : fallback
}

export function buildContext(schema) {
  return {
    people: isPeopleData(schema),
    flag: detectFlag(schema),
    noun: rowNoun(schema),
    hireTime: hireTimeColumn(schema),
  }
}
