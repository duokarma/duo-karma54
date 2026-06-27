# DuoKarrma Business Hub

A premium, frontend-only admin panel template. No backend, auth, or database
is wired up — everything runs on static mock data so the UI can be reviewed
and approved before any business logic is added.

## Stack

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme` config — see `src/index.css`)
- Radix UI primitives, wrapped in `src/components/ui/`
- Framer Motion for transitions and micro-interactions
- React Three Fiber + Drei for the floating crystal scene
- Recharts for all data visualizations
- React Router v7

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
```

## Project structure

```
src/
  components/
    ui/         # Radix-based primitives (Button, Card, Dialog, Table, etc.)
    layout/     # Sidebar, Topbar, command palette, notifications
    shared/     # Cross-page composites (KPICard, DataTable, Avatar, StatusBadge)
    charts/     # Recharts wrappers, themed to match the design tokens
    three/      # The crystal scene (signature visual element)
  pages/        # One file per route, matches the brief's page list
  layouts/      # AppLayout — sidebar + topbar + animated outlet
  hooks/        # Theme, sidebar collapse, command palette state
  data/         # Static mock data (clients, leads, projects, invoices, etc.)
  types/        # Shared domain types
  lib/          # cn() helper, formatters, nav config
```

## Design system

- **Palette**: void/graphite/charcoal dark surfaces; electric blue, indigo,
  violet brand gradient; cyan, amber, emerald, rose for status/accent colors.
  All defined as CSS custom properties in `src/index.css`'s `@theme` block.
- **Light mode**: token values are re-pointed under `html.light`, so every
  component automatically themes correctly with no per-component logic.
- **Type**: Geist (display/headings) + Inter (body) + Geist Mono (numeric/
  tabular data). Falls back to system fonts if the CDN is unreachable.
- **Glass panels**: `.glass-panel` / `.glass-panel-strong` utility classes,
  combining backdrop-blur, a low-opacity surface, and a hairline border.

## Notes for backend integration

- Replace the contents of `src/data/*.ts` with real API calls or a data
  layer of your choice. Component props and shapes are already typed in
  `src/types/index.ts`, so swapping the source shouldn't require touching
  the UI.
- Forms (Add Client, Create Invoice, etc.) are UI-only and call
  `preventDefault` on submit. Wire up real mutations where indicated.
- `src/pages/login.tsx` has no real auth; the "Sign in" button just
  navigates to `/`.
- Heavy dependencies (three.js, recharts) are route-split via `React.lazy`
  in `App.tsx`. Keep new heavy pages lazy-loaded to preserve initial load
  performance.
