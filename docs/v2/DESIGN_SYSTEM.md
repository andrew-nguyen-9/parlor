# PARLOR v2 — Design System

The visual language of v2, derived from the brand seal. Owns Phase 2.2 and
constrains every visual phase after it. Pairs with `PLATFORM.md` §2.14 (a11y) and
§2.15 (light/dark).

## The seal (`.logo/Logo V10 - Secret Order`)

Decode the logo into a reusable language:

- **Spade** — the playing-card core. Every game is a card; the deck is the home.
- **All-seeing eye** — the watcher. The Mystery's emblem; the sense of being
  observed in a wealthy, slightly haunted house.
- **Candle flame** — warmth and ritual. Literally the Streak mechanic (2.6); the
  recurring light source in the dark theme.
- **Question-mark tail** — trivia itself.
- **Occult glyph ring** — arcane knowledge, travel, antiquity. The Map's
  civilization ring (2.7); decorative borders.
- **Engraving / cross-hatch** — Victorian banknote etching. The line treatment for
  borders, dividers, card frames.

Mood: **a haunted, wealthy, well-travelled Victorian mansion** — brass, velvet,
parchment, candle-glow, antiquarian maps, curiosity cabinets. Mysterious and
intriguing, never "nightlife."

## Palette

The existing Tailwind tokens (`frontend/tailwind.config.ts`) already match the seal.
v2 keeps them and assigns **semantic roles** so light/dark can remap cleanly.

| Token | Hex | Semantic role |
|---|---|---|
| `bg` | `#150409` | surface-base (dark) |
| `surface` | `#24101a` | raised panel |
| `line` | `#4a2233` | hairline / engraving |
| `ink` | `#f0e6cf` | primary text |
| `muted` | `#9a7a78` | secondary text |
| `brass` | `#a87a2e` | accent / ornament |
| `gold` | `#c9a24a` | primary highlight |
| `goldlite` | `#e6c878` | shine |
| `candle` | `#f5c542` | flame / focus glow |
| `ember` | `#d4431e` | danger / heat |
| `burgundy` | `#6e1f2b` | the eye / hero glow |
| `parchment` | `#efe8c0` | light surface |

**Category jewels** (keep, single source in `lib/types.ts` `CATEGORY_HEX`): history
`#c8852a`, music `#b83468`, sports `#2d9155`, screen `#2b6ab5`, geography `#178b99`,
wildcard `#7040a8`. **a11y rule (2.14): never encode category by color alone** —
pair with a suit/glyph/label.

## Typography

Cinzel (display, already wired via `next/font`) for headings + nameplates; a
readable serif/text companion for body and questions. Type scale and contrast take
cues from the reference sites (below) — large confident display, generous line
height for questions. Legibility of questions/answers is non-negotiable and overrides
any effect (esp. the Streak flame, 2.6).

## The card-deck system (Phase 2.2 home)

The home page becomes **a deck of cards** — one **unique card per game**:

- **Card face** — each game gets bespoke face art built from the seal's motif
  vocabulary (its suit + a Secret Order character + the game's icon), in the
  engraving style. A shared frame, unique interior.
- **Card-trick motion vocabulary** (reused by the 404, 2.19):
  - *Deal-in* on load (cards fly to the grid).
  - *Hover* lift + slight 3D tilt; *flip* to reveal the blurb (the existing
    `flip-scene`/`flip-inner` CSS is the seed).
  - *Fan / spread*, *shuffle*, *riffle* as idle/interaction flourishes.
  - *Magical shapes* — on specific actions, cards arrange into shapes (spade,
    constellation) before settling.
- **Contract** — a `Card` component: `{ game, suit, character, faceArt, blurb }`;
  motion driven by Framer Motion with a **reduced-motion path** (static deal, no
  perpetual animation) per 2.14.

## "Haunted Victorian mansion" mood + imagery

- **Textures**: parchment, brass plate, oxblood velvet, candle bloom, antique map
  paper, etched glass (the Wedges mirror, 2.5).
- **Unsplash (req #11)**: source atmospheric imagery (mansion interiors, antique
  maps, candlelight, curiosities, ancient sites for the Map) via Unsplash. Add the
  Unsplash CDN to `next.config.mjs` `remotePatterns`; always lazy-load, size
  explicitly (`next/image`), prefer duotone/treated stills so photos read as
  engravings, not stock. Keep counts low (perf, 2.16).

## Reference-site learnings (req #10)

Distill, don't clone. What to take from each:

| Site | Take |
|---|---|
| trionn.com | Confident motion choreography; restrained, premium feel |
| everswap.com | Crisp depth + spatial layering on dark surfaces |
| aorum.io | Luxe minimalism; gold-on-dark restraint; type scale |
| fanalis.in | Editorial layout rhythm; whitespace as luxury |
| andreigorskikh.digital | Bold display type + cursor-reactive motion (feeds Streak's cursor glow, 2.6) |
| coveomusic.com | Audio-reactive / atmospheric texture ideas |
| wearedaima.framer.website | Playful card/section transitions; section choreography |
| lusion.co | Richness is *capability-gated*: heavy effects load progressively and degrade to a complete static composition. PARLOR: the seed-bank/no-JS/reduced-motion render is the *design*; effects are garnish — design the static frame first, then animate it. |
| poolsuite.net | Total commitment to a period metaphor — chrome, microcopy, cursor, loading states all in character, from cheap flat assets (no photography/WebGL). PARLOR: the mansion voice extends to *every* surface (empty states, errors, toasts, 404); commitment beats fidelity — engraving vectors over textures over photos. |
| obys.agency | Editorial typography as the interface: oversized display type, strict grid, generous whitespace; motion is mostly type/scroll choreography. PARLOR: Cinzel at scale + whitespace *is* the luxury cue — when a room feels flat, fix type scale + rhythm before adding ornament or motion. |

Common thread: **restraint + intentional motion**. v2 must not read templated. Every
animation earns its place; nothing loops for the sake of looping (also a perf win).

## Light / Dark (req #12, formalized in PLATFORM §2.15) — E3.1–E3.5 canonical

Today's default is dark; v2 ships both. **Dark** = "the mansion by candlelight";
**light** = "a daylit tour". Light is the same house with the curtains drawn back —
nothing is repainted: the parchment that was the *cards* becomes the *walls*, the
gold that was the *light* becomes the *hardware*. System preference by default + a
manual toggle (`ThemeToggle.tsx`), persisted, **SSR-safe** (no flash; obey
`lib/rng.ts` — no `Math.random()` in render paths).

**Opt-in contract (how a component themes).** Consume the semantic tokens, never
hardcode: Tailwind classes (`bg-bg`, `text-ink`, `text-brass`, `border-line`,
`text-{category}`, …) or `rgb(var(--c-*))` / `var(--cat-*)` in CSS. Every token is a
`--c-*` / `--cat-*` RGB-channel var in `globals.css` under `:root` (dark) and
`[data-theme="light"]`; switching one `data-theme` attribute remaps all of them. No
component needs a light branch unless it hardcoded a literal (don't).

### Semantic-role remap (not a brand swap)

| Role | Dark ("candlelight") | Light ("daylit tour") |
|---|---|---|
| surface-base | near-black oxblood `bg` | aged parchment `bg` |
| raised panel | lifted oxblood `surface` | brighter parchment `surface` (paper on paper, lifted by `line` + soft shadow, never a hue shift) |
| hairline / engraving | oxblood `line` | brass-tinted `line` (decorative only) |
| primary text | parchment `ink` | deep burgundy-brown `ink` |
| secondary text | rose-ash `muted` | umber `muted` |
| accent text (small) | `gold`/`brass` | `brass` (darkened bronze); gold is never small text in light |
| primary highlight | `gold` (luminous) | `gold` (bronze; large text + borders only) |
| flame / glow | `candle` blooms outward | `candle` is pigment, not light: warm accents, no bloom radii |
| hero accent / focus | `burgundy` glow | `burgundy` = strongest ink accent (8.7:1) + focus ring |
| danger | `ember` | `ember` |
| focus ring | `--c-focus` = goldlite | `--c-focus` = burgundy |

**Atmosphere in light.** `--body-grad` stays theme-aware; component glows
(`.glow`, `.candle-pool`, drop-shadow blooms) drop to pigment-level under
`[data-theme="light"]` (already scoped in `globals.css`). Shadows carry depth —
soft umber (`rgba(58,26,32,…)`), never black.

**Deck card faces are theme-invariant.** `.deck-front`/`.deck-back-art` render a
physical object (a parchment card is parchment in daylight too). Their hardcoded
literals + `--gold-sheet` are *by design* and MUST NOT be varred. Same for
share-card renders.

**Gilt in light.** `.gilt`/`.gold-text` resolve to theme-scoped darker bronze
stops (`globals.css`) and are **display-size only** (≥24px bold / ≥19px). Never
gilt a microlabel or body copy in light — use solid `brass`.

### Token table (machine contract)

Values not listed are unchanged across the E3 work. New CSS vars use RGB channels
like the existing tokens. Jewel-ink vars are new in *both* themes.

| name | tailwind key | css var | dark | light |
|---|---|---|---|---|
| brass | `brass` | `--c-brass` | `#a87a2e` | **`#7d5c20`** (was `#966e28`) |
| gold | `gold` | `--c-gold` | `#c9a24a` | **`#94722a`** (was `#a07c2e`; large-text/border only) |
| focus | — | `--c-focus` **new** | `#e6c878` | `#6e1f2b` |
| cat-history | `history` | `--cat-history` **new** | `#c8852a` | `#8a5710` |
| cat-music | `music` | `--cat-music` **new** | `#d25585` | `#a82c5c` |
| cat-sports | `sports` | `--cat-sports` **new** | `#2d9155` | `#1f7040` |
| cat-screen | `screen` | `--cat-screen` **new** | `#4a85cc` | `#245a9c` |
| cat-geography | `geography` | `--cat-geography` **new** | `#1e97a6` | `#0f6e7a` |
| cat-wildcard | `wildcard` | `--cat-wildcard` **new** | `#9b70d4` | `#7040a8` |

All other tokens (`bg`, `surface`, `line`, `ink`, `muted`, `goldlite`, `candle`,
`smoke`, `ember`, `burgundy`, `parchment`) keep their existing per-theme values.
Every text pair ≥4.5:1, every UI-boundary pair ≥3:1 (WCAG 2.1 computed);
decorative pairs (goldlite/candle/line shine, disabled `smoke`) are rule-exempt.

### Jewels are two-tier

- **Fill** = `CATEGORY_HEX` (`lib/types.ts`, canonical, theme-invariant): SVG
  fills, wedge fills, map pins, glows, chart marks — always paired with
  `CATEGORY_GLYPH`/`CATEGORY_LABEL` (a11y 2.14, never colour alone).
- **Ink** = `var(--cat-*)` / Tailwind `text-{category}` / `CATEGORY_INK`
  (`lib/types.ts`): any colored *text* (microlabels, headers, scores). Text-safe
  ≥4.5:1 both themes. New code setting `style={{color: CATEGORY_HEX[…]}}` on text
  is wrong — use `CATEGORY_INK` (inline) or `text-{category}` (class).

## Color-role law + guidelines (E3.2)

Every rule is checkable without judgment calls.

1. **Text carries only text-safe tokens**: `ink`, `muted`, `brass`, `ember`,
   `burgundy`, `--cat-*` jewel-ink. In dark, `gold`/`goldlite`/`candle` also
   qualify (>8:1). In light, `gold` is large-text-only; `goldlite`/`candle` never
   carry text.
2. **`line` is decorative.** If a border is the *only* affordance of an
   interactive element/state, use `brass` (3:1+ both themes), not `line`.
3. **One danger color** — `ember`; at small sizes pair with an icon or word.
4. **Focus is `--c-focus`**, one global ring (`:focus-visible` in `globals.css`).
   Components may thicken it, never re-color it.
5. **No new hex literals in components.** Tokens or `var(--cat-*)` only.
   Exemptions: deck card faces + share-card renders (theme-invariant, above).

### Layout grid + rhythm

- The `--d-*` tokens (`globals.css`) are the grid: gutter, max-width, gap,
  card-min, stack. Rooms consume them; no room invents its own gutter/max-width.
- Vertical rhythm: blocks separate by `--d-stack`; within a block, multiples of
  0.25rem. Section headers use `.deco-rule`; panels use `.gilt-frame` on
  `surface`. One `.density-grid` per room for card collections.
- Type scale: `.display` (Cinzel) for nameplates/headers, `.microlabel` for
  signage, system stack for body. Question/answer text ≥1rem, line-height ≥1.5,
  **never** inside a gilt/gradient treatment (legibility overrides any effect).

### Mobile vs desktop

- Mobile-first, pointer-enhanced: base styles are the phone; `lg:`/1024px adds
  density (the `--d-*` media block models this). Nothing is desktop-only
  *content* — only desktop-only *garnish*.
- Touch targets ≥44px (deck buttons are the bar). Horizontal scroll only inside a
  component with a visible affordance, never the page.
- Hover is garnish, never information: anything on hover is also reachable by
  tap/focus. Tilt/lift = `@media (hover:hover)`; touch gets a pressed state.

### Cursor treatments + motion budget

- **One light source.** `--gold-sheet` (viewport-fixed) lights all gilt from one
  static specular spot. Any new cursor-reactive effect joins this system — no
  second light. The Streak darkness `--gx/--gy` glow is the one sanctioned second
  (diegetic candle). Max one cursor-tracked element per screen state. Cursor
  motion is decoration-layer only (opacity/transform/background-position; never
  moves layout or gates content). SSR/reduced-motion/touch resolve to the
  centered default.
- **Ambient budget: ≤1 infinite/looping animation per viewport** (the room's
  signature: flame, pendulum, eye-glow — pick one). Everything else is finite and
  ≤600ms. Every animation must be *diegetic* or *feedback*; decorative motion that
  is neither is cut.
- **Curve vocabulary**: entrances `cubic-bezier(0.22,1,0.36,1)`, flips
  `cubic-bezier(0.2,0.8,0.2,1)` — the two existing curves, no new easings.
- **Reduced-motion path for every new named animation** (kill-list in
  `globals.css` or a designed static frame; Streak flame mid-brightness = model).
- **Perf floor (lighthouse-ci gate)**: animate only `transform`/`opacity`/
  `filter`; no new `backdrop-filter` beyond the deck zoom; no full-viewport blur
  >120px; imagery stays optional-enhancement (seed-bank render looks complete
  without it).
- **States are triple-encoded**: color + shape/border + text/glyph. Feedback
  ≤150ms perceived (press is instant CSS). Every overlay/zoom closes on Esc +
  backdrop click, traps focus, returns focus on close.

## Claude Design tooling (the visual loop)

Every visual phase runs the same loop:

1. **Draft** — `import-claude-design-from-url` (Vercel Claude Design) or the Figma
   `figma-generate-design` skill to draft card faces / room layouts from the seal +
   reference-site cues. `DesignSync` to pull a design into code.
2. **Build** — the `frontend-design` / `ce-frontend-design` skills for
   implementation that isn't AI-slop.
3. **Verify** — `chrome-devtools` `lighthouse_audit` (perf + a11y scores) and
   `performance_*` traces; `playwright` for cross-browser + mobile snapshots.
   Screenshot-diff before declaring a visual phase done.
