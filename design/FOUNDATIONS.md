# FOUNDATIONS

Tokens are the ONLY source — components reference tokens, never raw values.
All defined in `frontend/app/globals.css` as RGB-channel vars (so Tailwind
`/<alpha>` works); Tailwind keys in `tailwind.config.ts`. Role-based naming.
Frozen after §3.0: a NEW token is a `globals.css` change, out of segment scope.

## Color — dark ("candlelight") is default; light ("daylit tour") is a role remap
Mood: brass, velvet, parchment, candle-glow, antiquarian maps. Light = the same
house with curtains drawn — nothing repainted, roles reassigned.

| token | tailwind / css var | dark | light | role · contrast |
|-------|--------------------|------|-------|-----------------|
| bg | `bg-bg` / `--c-bg` | #210c14 | #ede4cb | surface-base |
| surface | `bg-surface` / `--c-surface` | #301622 | #faf4e3 | raised panel (light lifts by line+shadow, no hue shift) |
| line | `border-line` / `--c-line` | #4a2233 | #ceb88e | hairline / engraving — DECORATIVE only |
| ink | `text-ink` / `--c-ink` | #f0e6cf | #3a1a20 | primary text ≥4.5:1 |
| muted | `text-muted` / `--c-muted` | #9a7a78 | #7a5c50 | secondary text ≥4.5:1 |
| brass | `text-brass` / `--c-brass` | #a87a2e | #7d5c20 | accent text + interactive border (3:1 both) |
| gold | `text-gold` / `--c-gold` | #c9a24a | #94722a | highlight; light = large-text/border only (3.52:1) |
| goldlite | `--c-goldlite` | #e6c878 | #b8903c | shine — decorative, no text in light |
| candle | `--c-candle` | #f5c542 | #d69628 | flame/glow — dark: light, light: pigment, no bloom |
| smoke | `--c-smoke` | #5a4452 | #96846c | disabled — decorative, rule-exempt |
| ember | `text-ember` / `--c-ember` | #d4431e | #b43214 | THE one danger; at small size pair icon/word |
| burgundy | `text-burgundy` / `--c-burgundy` | #6e1f2b | #6e1f2b | hero/eye glow (dark); strongest ink accent + focus (light) |
| parchment | `--c-parchment` | #efe8c0 | #efe8c0 | light surface literal (theme-invariant) |
| focus | `--c-focus` | #e6c878 (12.25:1) | #6e1f2b (8.74:1) | the one global ring |

Derivation: seeded from the brand seal (`.logo/Logo V10 — Secret Order`); light
values are darkened bronzes computed to hold WCAG AA on the parchment ground.

### Category jewels — two-tier, single source `lib/types.ts`
| category | glyph | FILL `CATEGORY_HEX` (theme-invariant) | INK `--cat-*` dark | INK light |
|----------|-------|---------------------------------------|--------------------|-----------|
| history | ♦ | #c8852a | #c8852a | #8a5710 |
| music | ♥ | #b83468 | #d25585 | #a82c5c |
| sports | ♣ | #2d9155 | #2d9155 | #1f7040 |
| screen | ♠ | #2b6ab5 | #4a85cc | #245a9c |
| geography | ✦ | #178b99 | #1e97a6 | #0f6e7a |
| wildcard | ✧ | #7040a8 | #9b70d4 | #7040a8 |

- **FILL** (`CATEGORY_HEX`, `style={{fill/color}}`): SVG fills, wedge fills, map
  pins, glows, chart marks — always paired with glyph+label, never color alone.
- **INK** (`text-{cat}` class · `CATEGORY_INK` · `--cat-*`): any colored TEXT —
  text-safe ≥4.5:1 both themes. Text via `CATEGORY_HEX` is wrong; use INK.
- Colors composed dynamically → `tailwind.config.ts` safelist covers `text-/bg-/border-{cat}`.

### Color-role law (checkable, no judgment)
1. Text carries only text-safe tokens: ink, muted, brass, ember, burgundy, `--cat-*` ink. Dark also allows gold/goldlite/candle (>8:1); light: gold large-only, goldlite/candle never text.
2. `line` is decorative — a border that is the ONLY affordance uses `brass` (3:1), never `line`.
3. One danger color: `ember`; pair icon/word at small size.
4. Focus is `--c-focus` — one global `:focus-visible` ring; thicken, never recolor.
5. No new hex literals in components. Exemptions (theme-invariant, MUST stay literal): deck card faces (`.deck-front` #fbf6e4/#efe3c0, `.deck-back-art`) + share-card renders + `--gold-sheet`.

## Type
faces: **Fraunces** (`--font-display`, variable old-style serif — opsz + WONK/SOFT
axes give a hand-cut engraving character, wired via `next/font`) for display/nameplates;
**system sans stack** (ui-sans-serif → system-ui → …) for body and all Q&A. Pairing:
engraved period display over a neutral, maximally-legible body — the Victorian voice
never taxes reading. (Fraunces replaced Cinzel 2026-07-10, challenge T1 — DECISIONS.)
- `.display`: Fraunces 700 (opsz display, WONK low), UPPERCASE, letter-spacing 0.04em, line-height 0.92 — nameplates/headers only, display-only ≥18px (never body).
- `.microlabel`: 0.75rem, uppercase, letter-spacing 0.22em, `text-muted` — signage.
- body / Q&A: system sans, ≥1rem, line-height ≥1.5, measure 45–75ch. Never inside gilt/gradient.

## Space
base 4px · scale 4/8/12/16/24/32/48/64 · vertical rhythm between blocks = `--d-stack`;
within a block, multiples of 0.25rem. Density: comfortable→dense.

### Layout-density tokens (`--d-*`, the shared grid — rooms never invent their own)
| token | mobile | ≥1024px | use |
|-------|--------|---------|-----|
| `--d-gutter` | 1.25rem | 2.5rem | page side padding |
| `--d-maxw` | 64rem | 80rem | room content max width |
| `--d-col-gap` | 1rem | 1.5rem | grid/flex gap |
| `--d-card-min` | 15rem | 17rem | auto-fill card track |
| `--d-stack` | 1.25rem | 1.75rem | stacked-block rhythm |
`.density-grid` = `repeat(auto-fill, minmax(--d-card-min, 1fr))` at `--d-col-gap`. One per room for card collections.

## Shape & elevation
radius: cards/panels use the deck frame; **CTAs = engraved plate radius 4** (brass
hairline + gilt inset); **toggles/switches rounded-full** (physical switch) —
shape language: round=switch, plate=action (challenge T2 2026-07-10); focus ring
radius 4px. Depth language (≤3 levels): (1) hairline `line`/`brass` border, (2)
`.gilt-frame` soft brass box-shadow on `surface`, (3) drop-shadow bloom (dark
candle bloom; light = soft UMBER `rgba(58,26,32,…)`, never black). One light
source: `--gold-sheet` (viewport-fixed) lights every `.gilt`/`.gold-text` from
one static specular spot — no second light except Streak's diegetic candle glow.
material (TRIAL, challenge T3 2026-07-10): `--tex-grain` — a FROZEN inline-SVG
`feTurbulence` grain (never per-render random), ≤3% opacity over `bg` ONLY — never
behind Q&A text or panels; static, zero-network. Kills sterile-vector banding,
strengthens the parchment anchor. Re-judged next release (DECISIONS).

## 3D / Stage (2026-07-09 cycle — Chronos/Atlas/Ignite)
Shared primitives (F1), never re-derived per room: `ThreeStage` (Three.js canvas
wrapper — clock, map) and `FluidStage` (full-width fluid container — séance, and
global chrome). Rules every 3D/animated room inherits:
- kinematic only, no physics engine: the logic core is deterministic + date-seeded
  (`lib/rng.ts`); 3D/canvas is presentation on top of an already-solved/solving
  state, never the source of truth.
- DPR capped ≤2, one shared `requestAnimationFrame` loop, portrait-first camera
  framing, full geometry/material/texture/renderer disposal on unmount.
- one light source still holds in 3D: a single directional/ambient light matching
  the candle/brass mood — no second scene light.
- `prefers-reduced-motion` → a designed static frame (not a paused loop): Atlas
  and Chronos render one still frame; Ignite's Phaser layer skips camera-shake
  and is static-safe by construction.
- WebGL-less / renderer-error fallback is a floor (see INDEX §Floors), not
  optional: an accessible static frame or DOM-HUD control surface, never a
  full-page crash. Streak's Phaser degrade is the shipped template.
- `FluidStage`: `w-full`, `overflow-x-clip`, `clamp()` inline padding — no dead
  L/R gutters, no fixed narrow column, never an x-scroll. Wide/dense boards that
  must fit portrait (Séance's rotated matrix) measure their own footprint via
  `ResizeObserver` rather than fighting the container.

## Breakpoints
Mobile-first single set: base = phone; `sm:` 640px (tap-target pill floor);
`lg:` 1024px (the `--d-*` density block — gutter/maxw/gap/track/stack all step up).
Nothing is desktop-only *content* — only desktop-only *garnish*.
