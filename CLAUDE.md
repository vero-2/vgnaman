# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — run ESLint over the repo

No test runner is configured.

## Architecture

This is a single-page React 19 + Vite app whose entire purpose is to render one interactive flowchart of an ATS recruiting pipeline using `@xyflow/react` (ReactFlow v12). Entry point is `src/main.jsx` → `App.jsx` → `ATSWorkflowMapper.jsx`.

### The flowchart is data, not layout code

`src/ATSWorkflowMapper.jsx` defines two top-level arrays that drive everything:

- `initialNodes` — each node has an `id`, a `type` (`stage` | `decision` | `automation` | `manual`), a hand-tuned absolute `position: { x, y }`, and a `data: { label, icon, description }` payload. Positions are not auto-laid-out; adding/moving nodes means editing coordinates by hand.
- `initialEdges` — connections between nodes. Edges from `decision` nodes MUST set `sourceHandle: 'yes'` or `sourceHandle: 'no'` because `DecisionNode` exposes two source handles (see below). Yes/pass edges are styled green (`#10b981`), no/fail edges red (`#ef4444`).

To change the pipeline, edit these arrays — do not introduce a layout engine unless asked.

### Custom node types

`src/CustomNodes.jsx` exports four components registered into a `nodeTypes` map in `ATSWorkflowMapper.jsx`. Three of them (`StageNode`, `AutomationNode`, `ManualHandoffNode`) have a single left target handle and a single right source handle. **`DecisionNode` is different**: it has one target handle (left) and TWO source handles — `id="yes"` on the right and `id="no"` on the bottom. Any new edge originating from a decision node must specify which handle via `sourceHandle`, or the edge will not render.

When adding a new node type: create the component in `CustomNodes.jsx`, add a matching entry to `nodeTypes` in `ATSWorkflowMapper.jsx`, add the color branch to the `MiniMap` `nodeColor` switch, and add styling in `CustomNodes.css`.

### Styling

Plain CSS modules imported per-component (`ATSWorkflowMapper.css`, `CustomNodes.css`, `App.css`, `index.css`). The `@xyflow/react/dist/style.css` import in `ATSWorkflowMapper.jsx` is required for ReactFlow's own UI (controls, minimap, edges) to render.

## ESLint convention

`eslint.config.js` configures `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` — unused identifiers starting with an uppercase letter or underscore are allowed (e.g. imported components kept for future use, constants).
