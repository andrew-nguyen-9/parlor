# PATTERNS

## Navigation model
One hub-and-spoke deck. Home (`app/page.tsx`) = a browsable **deck of cards**, one
card per game (`lib/games.ts` is the single source: rank + suit + character +
emblem + blurb). Enter a card → its **room**. Every room wraps in `RoomShell`
(brass doorway frame, engraved nameplate = suit glyph + name, rank badge top-right,
a persistent bottom-left "← Lobby" pill ≥44px). No deep nav tree; the lobby is
always one tap away. Suit = category; the deck runs Ace(1)→11 plus one Joker
(the Overture, no rank/suit).

## Page archetypes
| archetype | layout | used for |
|-----------|--------|----------|
| Deck / lobby | full-bleed card grid, deal-in on load, flip-to-blurb | home |
| Room | `RoomShell` chrome + `max-w-5xl` centered play area on `--body-grad` | every game |
| Play surface | room-owned board/ring/map/clock inside the shell | the game itself |
| Result / share | results card above a dimmed backdrop; share line of squares | end of a run |
| Coming-soon | `RoomShell` + minimal `*.module.css` panel | unbuilt rooms |
| Utility | RoomShell (no href → no rank badge) | profile, about, sitemap |

## Room signatures — the 11 retained rooms (after cold-case retirement)
Each room = one card (suit=accent category, one character, one emblem) + ONE
diegetic signature motion (the room's single allowed looping animation). Colors
via category tokens; never invent a per-room palette.

| room · route | card name | suit / accent | character | emblem | signature motion (the 1 loop) |
|--------------|-----------|---------------|-----------|--------|-------------------------------|
| mystery `/mystery` | Sanctum Mysterii | ♦ history | the Order | ◉ eye | `eye-glow` seal pulse; dossier investigation |
| board `/board` | Codex | ♦ history | the Host | ⌘ codex | `flip-scene` 3D cell flip to reveal |
| clock `/clock` | Chronos | ♥ music | the Clockkeeper | ⧗ clock | `clock-pendulum` swing; drag-the-year |
| wedges `/wedges` | Fractures | ♣ sports | the Ghost | ⬡ shard | shattered-mirror ring fills wedge by wedge |
| streak `/streak` | Ignite | ♠ screen | the Witch | ✦ flame | `streak-flame` candle bloom (scales with streak) + `streak-dark` cursor-glow finish |
| map `/map` | Atlas Obscura | ✦ geography | the Cartographer | ⌖ pin | `WorldMap` polygons (offline-required); pin drop, scored by km |
| gauntlet `/gauntlet` | The Gauntlet | ✧ wildcard | the Adventurer | ⧈ run | daily one-round-per-room; shareable line of squares |
| thread `/thread` | Thread of Fate | ♦ history | the Weaver | ⌇ stitch | chain links reveal one at a time |
| seance `/seance` | The Séance | ✧ wildcard | the Medium | ☍ moon | `animate-flicker` candle; clue-by-clue reveal, each costs a point |
| ladder `/ladder` | Climb of the Initiate | ♥ music | the Trickster | ☰ rungs | rung-by-rung climb; hints reveal shared attributes |
| overture `/overture` | The Overture | ♥ music (Joker 🃏) | the Maestro | ♪ note | audio room; name the track before the needle lifts |

## Interaction rules
- **Selection / answering**: instant CSS press-state (≤150ms perceived); result
  triple-encoded — color + shape/border + text/glyph — never color alone.
- **Daily / shared setups** (board, gauntlet, daily): date-seeded via `lib/rng.ts`
  so SSR and client agree — same board for everyone that day. Free `Math.random()`
  shuffles ONLY inside click handlers / effects, never in a render path.
- **Scores**: live in localStorage; the frontend never writes the DB. Reads go
  through `lib/queries.ts` (Neon → seed-bank fallback, never throws with no env).
- **Overlays / zoom** (deck zoom, results): close on Esc + backdrop click, trap
  focus, return focus to the opener on close.
- **Theme toggle** (`ThemeToggle.tsx`): system preference default + persisted
  manual override; flash-free, SSR-safe; flips one `data-theme` attribute that
  remaps every `--c-*`/`--cat-*` token — no component carries a light branch.

## Mobile — explicit (feeds F4 + G7)
- Mobile-first, pointer-enhanced: base styles ARE the phone; `lg:`/1024px adds
  density via the `--d-*` block. Nothing is desktop-only content — only garnish.
- Touch targets ≥44px (deck buttons + `.microlabel` pills hit the floor at ≤640px
  via the scoped `min-height:44px` rule; desktop proportions untouched).
- Hover is garnish, never information: anything on hover is also reachable by
  tap/focus. Tilt/lift = `@media (hover:hover)`; touch gets a pressed state instead.
- Horizontal scroll only INSIDE a component with a visible affordance — never the page.
- Rooms consume `--d-gutter`/`--d-maxw`/`--d-col-gap`; a room never sets its own gutter or max-width.

## Motion
budget: **≤1 infinite/looping animation per viewport** (the room's signature above
— flame, pendulum, eye-glow: pick one). Everything else is finite and ≤600ms. Every
animation is diegetic or feedback; decorative motion that is neither is cut.
- durations: micro/press 100–150ms · transition 200–350ms · spatial (deal/flip/zoom) 300–500ms · reduced-motion → the `globals.css` kill-list or a designed static frame
- easing (the only two, no new curves): entrances `cubic-bezier(0.22,1,0.36,1)`; flips `cubic-bezier(0.2,0.8,0.2,1)`
- one light source: `--gold-sheet` (viewport-fixed) lights all gilt; max one
  cursor-tracked element per screen state (Streak's candle glow is the sanctioned
  second). Cursor motion is decoration-layer only — opacity/transform/background-position, never moves layout or gates content; SSR/touch/reduced-motion resolve to the centered default.
- perf floor: animate only `transform`/`opacity`/`filter`; no new `backdrop-filter`
  beyond the deck zoom; no full-viewport blur >120px; imagery stays optional —
  the reduced-motion / no-JS / seed-bank frame must look complete without it.
- reduced-motion is a designed state, not an afterthought: design the static frame
  first, then animate (lusion rule); Streak flame freezes at steady mid-brightness.
