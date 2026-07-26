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
2. **Read the story** — Storygram inspects the shape of your data and writes a
   handful of sentences: the big picture, a closer look at one slice, a head-to-head
   comparison, a leaderboard, and a trend over time.
3. **Explore by editing** — the underlined words are interactive. Click one to
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
- `src/story/blocks.jsx` — the narrative "blocks", each an editable sentence
  built from `Chip` dropdowns and computed values.
- `src/components/` — the data loader, sidebar schema view, and the chip control.

Adding a new kind of sentence is just adding a block component and registering
it in `src/story/catalogue.js`.

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
