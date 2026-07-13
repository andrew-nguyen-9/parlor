# Delivery Optimization — 2026-07-13 (unit e5-delivery)

Audit of PARLOR against the Vercel meters, with SAFE, config-level reductions applied.
Policy source: `docs/planning/design-intake/_core.md` §C4 (Performance & Delivery) — the
`[x]` picks. Scope: `frontend/next.config.mjs` + route-segment config only. No component,
`RoomShell`, `SeanceGame*`, `lib/*`, or style edits (those are e0/e2). **Nothing added to
image-opt or function usage.**

## Meter posture (spec §Reference)

| Meter | Reading | Headroom |
|---|---|---|
| image-opt | 4,000 / 5,000 transforms | 80% consumed — the binding constraint |
| Fluid CPU | 1h17m / 4h | 32% |
| edge requests | 120K / 1M | 12% |
| fast-origin | 1.16 GB / 10 GB | 12% |
| functions | 103K / 1M | 10% |
| ISR reads | 38K / 1M | 4% |
| prov-mem | 6.9 / 360 GB-hr | 2% |

Every meter is under limit; image-opt is the only near-ceiling risk. The doctrine is
"keep functions cold, premium via craft not spend." The frontend already serves the
question surface from the committed seed bank (`lib/queries.ts` → `seed-questions.json`,
no Neon read), and the puzzle rooms wrap Neon in `unstable_cache({ revalidate: 86400 })`
— one DB read per (room × day). This unit hardens the delivery config around that design.

## Render-mode inventory (from `next build`, route table)

Static `○` = prerendered, zero runtime function. ISR = static + revalidate window.
Dynamic `ƒ` = server-rendered per request (a function invocation + Fluid CPU each hit).

| Route | Data source | Before | After |
|---|---|---|---|
| `/`, `/about`, `/profile`, `/daily`, `/sitemap`, `/_not-found`, `/robots.txt`, `/sitemap.xml` | none / static | ○ static | ○ static (unchanged) |
| `/board` | seed bank (`getQuestionsByType`) | ○ ISR **1h** | ○ ISR **1d** |
| `/gauntlet` | seed bank | ○ ISR **1h** | ○ ISR **1d** |
| `/wedges` | seed bank | ○ ISR **1h** | ○ ISR **1d** |
| `/mystery` | Neon `cachedMystery` (86400) | ○ ISR 1d | ○ ISR 1d (unchanged) |
| `/overture` | seed bank | ○ ISR 1d | ○ ISR 1d (unchanged) |
| `/thread` | seed bank | ○ ISR 1d | ○ ISR 1d (unchanged) |
| `/seance` | Neon `cachedSeance` (86400) + `searchParams` | ƒ dynamic | ƒ dynamic (see Deferred) |
| `/ladder` | Neon `cachedLadder` + `searchParams` | ƒ dynamic | ƒ dynamic (see Deferred) |
| `/map` | Neon `cachedAtlas` + `searchParams` | ƒ dynamic | ƒ dynamic (see Deferred) |
| `/clock` | Neon `cachedChronos` + `searchParams` | ƒ dynamic | ƒ dynamic (see Deferred) |
| `/streak` | Neon `cachedIgnite` + `searchParams` | ƒ dynamic | ƒ dynamic (see Deferred) |
| `/api/og/[room]` | OG image gen | ƒ dynamic | ƒ dynamic (out of page scope) |

First-load JS is unchanged for every route (no import touched); the shared 103 KB baseline
and each route's KB are byte-identical before/after — the seed bank stays server-side
(`lib/board.ts` split keeps the 232 KB bank out of client bundles).

## Applied optimizations

1. **`images.unoptimized: true`** (`next.config.mjs`). The codebase already ships plain
   `<img>` (no `next/image` optimizer usage — confirmed by lint `no-img-element` warnings,
   zero `next/image` imports), so image-opt takes **zero** new transforms from the app
   today. This flag makes that permanent: any future `next/image` serves the committed /
   remote asset straight from the CDN and can never silently re-arm the optimizer near its
   ceiling. Spec §C4 image policy (unoptimized loader) + meter discipline (add ZERO transforms).

2. **Static response headers via `next.config.mjs` `headers()`** — NOT middleware. Applied
   at the CDN edge with no edge-function invocation (so no edge-meter cost, unlike
   middleware): site-wide security headers (`X-Content-Type-Options`, `X-Frame-Options`,
   `Referrer-Policy`) plus long-lived caching for committed media (`/audio/*` →
   `max-age=31536000, immutable`; images/fonts/json → `max-age=86400,
   stale-while-revalidate=604800`). Cuts fast-origin bandwidth on repeat/CDN loads. Next's
   own `/_next/static/*` is already fingerprinted-immutable; this covers `public/`.

3. **ISR window normalization 1h → 24h** on the three seed-bank rooms `board`, `gauntlet`,
   `wedges` (route-segment `export const revalidate`). Their content rolls once per UTC day
   via `daySeed`, so an hourly window regenerated (a function run + ISR read + Fluid CPU)
   up to ~24×/day for zero content change. 24h matches the daily cadence and the already-
   correct `mystery`/`overture`/`thread` rooms. Spec §C4 ISR: "sub-hour windows would
   multiply reads for zero content change." **Tradeoff:** the daily roll can now lag the UTC
   midnight boundary by up to the revalidate window instead of ≤1h; this is the spec's
   explicitly chosen freshness for daily content and matches the other daily rooms.

## Before/after projection per meter

Meter deltas below are keyed to the changes above. ISR/function/CPU figures are per-month
projections modeling the three normalized rooms; "±0 / locked" means the change cannot
increase the meter (worsens none — the acceptance bar).

| Meter | Before | After | Delta | Basis |
|---|---|---|---|---|
| image-opt | 4,000 / 5,000, unbounded growth risk if any `next/image` is added | 4,000 / 5,000, growth **structurally impossible** | 0 new transforms (locked) | `unoptimized: true` |
| ISR reads | ~2,160 / mo from the 3 rooms (3 × ~24 regens/day) | ~90 / mo (3 × 1 regen/day) | **−~2,070 / mo** (~24×) | 1h→24h window |
| functions | each of those ISR regens = 1 invocation → ~2,160/mo from these rooms | ~90 / mo | **−~2,070 / mo** | 1h→24h window |
| Fluid CPU | seed-filter + arrange CPU per regen, ~24×/day/room | ~1×/day/room | **−~24×** on those rooms | 1h→24h window |
| fast-origin | public media re-fetched on repeat/edge loads | immutable/long-TTL cached → served from browser+CDN | **↓** (repeat loads free) | cache headers |
| edge requests | 120K / 1M (no middleware) | 120K / 1M (headers via config, no edge fn) | ±0 | no middleware added |
| prov-mem | 6.9 / 360 GB-hr | 6.9 / 360 GB-hr | ±0 | untouched |

Net: image-opt is permanently fenced; ISR/functions/Fluid-CPU drop ~24× on the three
normalized rooms; fast-origin trends down via caching; no meter increases. Zero-env build
stays green (seed-bank path intact — `unstable_cache` throws (not caches) on a real DB
miss, so offline still generates puzzles inline).

## Deferred (needs component/route surgery — recommend a later unit, NOT done here)

The five puzzle rooms (`seance`, `ladder`, `map`, `clock`, `streak`) render **dynamic (ƒ)**
because each page reads `searchParams` (`?date=YYYY-MM-DD` archive-play), which opts the
whole route into per-request SSR — a function invocation + Fluid CPU **per pageview**, even
though the Neon read underneath is already collapsed to 1/day by `unstable_cache`. This is
the single largest remaining function/CPU driver.

- **Recommendation (spec §C4: on-demand ISR for archive dates):** move the date from a
  query param to a route segment — `app/{room}/[[...date]]/page.tsx` — and drop
  `searchParams`. Today (no param) then renders **static/ISR** (function cold, cache-served)
  and each past date caches on first hit (one read per date ever, not per request). This
  flips 5 routes from ƒ → ○/ISR — a large functions + Fluid-CPU reduction — but it is a
  route-file restructure touching page signatures and the components' `date` prop plumbing,
  which collides with e0/e2's ownership of those rooms. Ship as its own unit.
- **`/api/og/[room]`** OG-image generation is dynamic by nature; low-traffic (crawler/share
  only) and out of the page-route scope of this unit. Consider caching its responses
  (`Cache-Control: immutable`, keyed by room) in a later API-owning unit if the functions
  meter ever tightens.

## Verification (re-runnable)

- `cd frontend && npm run build` → route table shows `/board`, `/gauntlet`, `/wedges` at
  Revalidate **1d** (were 1h); all other render modes unchanged; first-load JS unchanged.
- `cd frontend && npm run test` → 150 passed (18 files).
- `cd frontend && npm run lint` → exit 0 (only pre-existing `no-img-element` /
  `exhaustive-deps` warnings, unchanged from baseline).
- Zero-env: the build above runs with no `DATABASE_URL` (seed-bank fallback).
</content>
</invoke>
