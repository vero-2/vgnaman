# Storygram

**Read your data like a story.** Storygram turns a spreadsheet into plain
English sentences instead of a numerical dashboard. Every sentence has
editable words — a team, a date, a region, a metric — and when you swap one,
the numbers rewrite themselves.

The goal: get away from charts and pivot tables, and give anyone a simple
narrative they can read and explore.

## How it works

1. **Load data** — drop in a CSV (or pick a built-in sample). Everything stays
   in your browser; nothing is uploaded to a server.
2. **Pick a topic** — the left rail holds navigable sections. Storygram always
   opens on an **Overview**, then offers deep dives based on the data's shape.
   For people/HR data that's **Headcount**, **Hiring** and **Attrition**; other
   datasets get generic equivalents (Breakdown, Over time, Churn), and each
   section only appears when the data supports it.
3. **Read the story** — every section is a few plain sentences with a small
   inline icon, not a chart.
4. **Explore by editing** — the underlined words are interactive. Click one to
   change the team, the date range, the metric, or how it's summarised, and the
   bold numbers recompute instantly.

## Under the hood

Storygram is a client-side React app with no backend and no data
dependencies:

- `src/lib/csv.js` — a small, dependency-free CSV parser (quotes, escapes, BOM).
- `src/lib/schema.js` — infers each column's role: **metric** (number),
  **time** (date/year/quarter/month), or **category**, and detects currency /
  percent / number formatting.
- `src/lib/stats.js` — filtering, aggregation (sum, average, min, max, median,
  count), ranking, time series, and human-friendly value formatting.
- `src/story/blocks.jsx` — the general narrative "blocks" (overview, segment,
  compare, rank), each an editable sentence of `Chip` dropdowns and computed
  values.
- `src/story/sections.jsx` — the topic deep-dive blocks (headcount, hiring,
  attrition), plus `detect.js` (is-this-people-data, attrition-flag detection)
  and `analytics.js` (rate calculations).
- `src/story/sectionRegistry.js` — which blocks make up each section and when
  each section applies.
- `src/components/` — the data loader, the section-nav sidebar, the section
  view, the inline `Icon` set, and the `Chip` control.

Adding a new sentence is a block component; adding a new topic is one entry in
`sectionRegistry.js`.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # eslint
```

## Sample datasets

Three are bundled so the app is useful the moment it loads: Premier League
seasons (teams), world population (countries and years), and SaaS sales
(regions, plans and months).
