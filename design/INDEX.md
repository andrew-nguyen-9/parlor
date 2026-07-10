# Design North Star — PARLOR

v1 — 2026-07-06. Read this file first; then load per §Load map. Full system:
FOUNDATIONS, UI-KIT, VOICE, PATTERNS, DECISIONS. Never bulk-load the folder.
Extracted (codified, not invented) from shipped code: `docs/v2/DESIGN_SYSTEM.md`,
`frontend/app/globals.css`, `frontend/lib/types.ts`, `frontend/tailwind.config.ts`,
`components/RoomShell.tsx` + `CardFace.tsx`. Tokens are frozen (`frontend/STYLING.md`):
consume them, do not re-declare.

v1.1 — 2026-07-09: folded the 3D/animation/space cycle (`docs/design/cycle-2026-07-09-3d.md`)
+ E12's QA backlog (`.orchestrator/qa/backlog.md`). New: Chronos gear-train (`/clock`),
Atlas starfield constellation puzzle (`/map`), Ignite Phaser render layer (`/streak`),
Séance fluid full-width layout (`/seance`) — shared primitives `ThreeStage`/`FluidStage`
(FOUNDATIONS §3D/Stage, UI-KIT). See DECISIONS for the backlog items folded in.

## Brief
product: a nightly-forged trivia web app — themed game rooms over one Wikipedia/Deezer/TMDB/etc. question bank.
users: casual + returning trivia players, daily/weekly; mobile-first, pointer-enhanced on desktop.
platforms: web (Next.js 14 App Router) now / web same at 12mo (Databricks is a Phase-2 lab, never the serving path).
feels-like: mysterious, luxe, ritual — never nightlife, templated, stock-photo.
anchor: a haunted, wealthy, well-travelled Victorian mansion, read as a deck of engraved playing cards.
not-like: generic quiz apps, casino/neon nightlife, flat SaaS dashboards.
sliders: serious 3/5 · calm 3/5 · dense 3/5 · classic 4/5
density: comfortable→dense (phone base; `lg:`/1024px adds density)   motion: purposeful
ambition: 4   sacred: Q&A legibility over any effect · the zero-JS/seed-bank/reduced-motion render IS the design · ≤1 looping animation per viewport · one light source · category never color-alone

## Floors — never regress, any mode, any challenge
- contrast: body ≥4.5:1, large(≥24px)/bold(≥18.7px) ≥3:1, UI parts ≥3:1 — every text token computed AA both themes (FOUNDATIONS); decorative pairs (goldlite/candle/line-shine, disabled smoke) exempt
- targets: ≥44×44px touch (deck buttons + `.microlabel` pills are the bar) — the floor covers
  EVERY interactive unit, including in-game grid/board cells and chips, not deck chrome only;
  ≥24×24px pointer
- 3D / WebGL rooms: renderer creation is guarded (try/catch); no-WebGL, WebGL error, or
  reduced-motion never white-screens the route — degrade to an accessible static frame or
  DOM-HUD control surface (Streak's Phaser-degrade is the template)
- every room renders exactly one page `<h1>` (via `RoomShell`'s title prop) for outline/SEO/SR
- motion: every named animation has a reduced-motion variant (kill-list in `globals.css`); ≤1 infinite/looping animation per viewport; everything else finite ≤600ms
- focus: one global `--c-focus` ring, 2px + 2px offset, on every interactive element; components may thicken, never re-color
- Q&A text ≥1rem, line-height ≥1.5, NEVER inside a gilt/gradient/flame treatment (legibility overrides every effect)
- completeness: the seed-bank / no-network / no-JS / reduced-motion frame must render complete on its own; effects and imagery are optional garnish
- category is triple-encoded: color + suit glyph (`CATEGORY_GLYPH`) + label (`CATEGORY_LABEL`) — never color alone
- SSR safety: no `Math.random()` in render paths (use `lib/rng.ts`); theme toggle is flash-free; frontend never writes the DB

## Load map
| doing | load |
|-------|------|
| building UI | INDEX + FOUNDATIONS + UI-KIT |
| UX / flows / a room | INDEX + PATTERNS |
| copy | INDEX + VOICE |
| data viz / map / charts | INDEX + FOUNDATIONS |
| 3D / WebGL room | INDEX + FOUNDATIONS (§3D/Stage) + UI-KIT (ThreeStage/FluidStage) |
| review / pre-ship | INDEX (+ corpus CHECKLISTS) |
| challenge | INDEX + DECISIONS |

Mobile + light-mode rules (feed F4, G7): FOUNDATIONS §Color (light column) + §Breakpoints; PATTERNS §Mobile and §Motion.

## Cadence
challenge: each release   last-challenged: 2026-07-10
