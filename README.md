# EVMapFinder ⚡

A production-ready EV charging station finder built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🔍 Client-side search with 250ms debounce
- 📍 "Find near me" — Haversine distance + auto-sort
- 📄 Pagination (12 per page)
- ⚡ 30 demo stations out of the box
- 🔌 Optional external API with graceful fallback
- 🛡️ Geo denial handled gracefully — site never crashes
- 🚀 Zero-config Vercel deployment

---

## Getting started locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure environment
cp .env.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Or just connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new). No extra configuration needed for demo mode.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `STATIONS_PROVIDER` | `demo` | `demo` or `external` |
| `EXTERNAL_STATIONS_API_URL` | — | URL of external stations API |
| `EXTERNAL_STATIONS_API_KEY` | — | Optional Bearer token for external API |

Set these in **Vercel → Project → Settings → Environment Variables**.

---

## Project structure

```
app/
  layout.tsx          — Root layout + SEO metadata
  page.tsx            — Main page (client component)
  globals.css         — Tailwind base styles
  api/
    stations/
      route.ts        — GET /api/stations

components/
  StationCard.tsx
  Pagination.tsx
  SearchBar.tsx
  StatusBar.tsx

lib/
  types.ts            — Station type
  haversine.ts        — Distance calculation
  demoStations.ts     — 30 built-in demo stations
```
