---
name: ui-qa
description: Visual + functional QA loop for a PARLOR route. Use when asked to "QA a route", "ui-qa", "check a page", "review the UI of", "audit a room", or after shipping/changing any frontend page or game room. Invoked as /ui-qa <route> (e.g. /ui-qa /seance), optional "mobile" flag to prioritize the mobile pass. Snapshots desktop + mobile, runs Lighthouse (perf + a11y), applies the PARLOR design rubric, writes a severity-tagged report to .orchestrator/qa/.
---

# /ui-qa — PARLOR route QA loop

Wraps existing tooling — do NOT build scripts. Order of preference per step:
gstack `browse` skill or playwright MCP for snapshots; `chrome-devtools`
`lighthouse_audit` for scores; gstack `design-review` lens (or `qa-only` for
report-only mode) for the critique pass.

## Usage

```
/ui-qa <route> [mobile]
```

- `<route>` — app route path, e.g. `/`, `/seance`, `/board`. Required.
- `mobile` — optional; run the mobile pass first and weight mobile findings up
  one severity.

## The loop

1. **Server** — if `http://localhost:3000` doesn't respond (`curl -sf -o
   /dev/null http://localhost:3000`), start it: `cd frontend && npm run dev`
   (background), wait for ready.
2. **Desktop snapshot** — navigate to `http://localhost:3000<route>` at
   1280×800. Take an a11y snapshot (cheap) first; screenshot only what the
   snapshot can't answer (visual texture, contrast, art). Interact minimally:
   click the primary CTA / reveal one answer / flip one card — confirm the room
   is playable, note console errors.
3. **Mobile snapshot** — resize to 390×844 (spot-check 360×800: `document.
   documentElement.scrollWidth <= 360` must hold). Re-snapshot. Check tap
   targets, overflow, type size.
4. **Lighthouse** — `lighthouse_audit` on the route, mobile emulation,
   categories performance + accessibility. Record scores + top 3 audits.
5. **Design-review lens** — apply the gstack `design-review` eye plus the
   rubric below to both snapshots.
6. **Report** — write `.orchestrator/qa/<route-slug>.md` (`mkdir -p` the dir —
   it's gitignored scratch, recreated per run; promote reports worth keeping to
   `docs/archive/`). Slug: strip leading `/`, replace remaining `/` with `-`;
   `/` itself → `home`. Format below.

## Report format

Sections, in order: **functionality / aesthetics / mobile / a11y /
creativity**. Every finding is one line:

```
- 🔴|🟡|🟢 <what/where> — `<file>:<line>` (guess ok) — fix: <one line>
```

🔴 broken/blocking (unplayable, AA fail, horizontal scroll, console error) ·
🟡 degrades quality (slop pattern, weak hierarchy, <44px target) ·
🟢 polish/opportunity. Head the report with route, date, viewport sizes,
Lighthouse perf/a11y scores. End with a 1-line verdict: ship / fix-🔴-first /
needs-design-pass.

File:line guesses: route page lives at `frontend/app/<route>/page.tsx`, client
game at `frontend/components/<Room>Game.tsx`, tokens at
`frontend/tailwind.config.ts` + `frontend/lib/types.ts`.

## Rubric (PARLOR brand — read `docs/v2/DESIGN_SYSTEM.md` when in doubt)

**Brand = haunted, wealthy, well-travelled Victorian mansion.** Brass, velvet,
parchment, candle-glow, engraving line-work. Mysterious, never "nightlife".

**"Highly-designed" here means:**
- Restraint: gold-on-dark used sparingly (aorum-style); whitespace reads as
  luxury; nothing looks templated or bootstrap-default.
- Cinzel display type, large and confident; body/questions in the readable
  companion serif with generous line-height. Question/answer legibility
  overrides ANY effect.
- Palette stays on token (`bg/surface/line/ink/muted/brass/gold/candle/ember/
  burgundy/parchment` from `tailwind.config.ts`) — flag raw hexes and
  off-brand hues (neon, pure #000/#fff surfaces).
- Depth via layering + engraving hairlines (`line` token), not drop-shadow
  soup.

**AI-slop tells (flag as 🟡 aesthetics):**
- Centered-everything hero + three equal feature cards; uniform border-radius
  + identical padding on every box; gradient-on-gradient.
- Generic emoji as icons where the seal's motif vocabulary (spade, eye, flame,
  glyph ring) should be; stock-photo look instead of duotone/engraved
  treatment.
- Purple-to-blue gradients, glassmorphism blur everywhere, default Tailwind
  gray scale, `shadow-xl` on everything.
- Copy slop: "Unleash", "Elevate", "seamless", exclamation-mark enthusiasm.
  PARLOR's voice is a wry Victorian host.

**Hard checks (each miss is a finding):**
- Tap targets ≥44×44px on mobile (buttons, cells, board tiles).
- No horizontal scroll at 360px wide.
- Text contrast AA (4.5:1 body, 3:1 large) — especially `muted` on `surface`
  and anything over imagery/candle-glow.
- Category NEVER encoded by color alone — must pair jewel color with
  suit/glyph/label (`CATEGORY_HEX` in `lib/types.ts`).
- Motion earns its place: no perpetual loops without purpose; every animation
  has a `prefers-reduced-motion` path (static deal, no auto-play). Framer
  Motion entrances OK; idle wobble is not.
- SSR-safe randomness: any shuffle/pick visible on first paint must use
  `lib/rng.ts` (date-seeded), never `Math.random()` in render.
- Offline/seed-bank mode still renders (no env vars ⇒ page must not throw).

**Creativity section:** one or two concrete "make it more PARLOR" ideas per
route — a seal motif not yet used, a card-trick motion from the deck
vocabulary, an engraving texture — each with the restraint caveat.
