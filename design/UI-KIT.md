# UI-KIT

Specs use tokens only (values live in FOUNDATIONS). Extracted from shipped code:
every existing component gets a `live` row + `code:` pointer; the 8 core reusable
shells carry full ≤10-line specs. Game-room components stay one-line `live` rows
until an Update touches them (40 full specs would blow the 250-line cap). Paths are
relative to `frontend/`.

## Inventory
| component | status | code |
|-----------|--------|------|
| Deck card (`CardFace`) | live | `components/CardFace.tsx` |
| RoomShell chrome | live | `components/RoomShell.tsx` |
| Deck / lobby grid | live | `components/Deck.tsx` |
| Button / CTA pill | live | (Tailwind pattern; no shared component yet) |
| Panel (`.gilt-frame`) | specced | `app/globals.css` |
| Nameplate / `.microlabel` | live | `app/globals.css` |
| Rank badge | live | `components/CardFace.tsx` (`RankBadge`) |
| Toast | live | `components/AchievementToast.tsx` |
| Theme toggle | live | `components/ThemeToggle.tsx` |
| Sound toggle | live | `components/SoundToggle.tsx` |
| ThreeStage (3D canvas primitive) | live | `components/ThreeStage.tsx` |
| FluidStage (full-width container) | live | `components/FluidStage.tsx` |
| Deco rule / divider | live | `app/globals.css` (`.deco-rule`) |
| Marquee | live | `components/Marquee.tsx` |
| Confetti | live | `components/Confetti.tsx` |
| Practice bar | live | `components/PracticeBar.tsx` |
| Room filters | live | `components/RoomFilters.tsx` |
| Leaderboard panel | live | `components/LeaderboardPanel.tsx` |
| Profile dashboard | live | `components/ProfileDashboard.tsx` |
| Share-card gallery | live | `components/ShareCardGallery.tsx` |
| Site footer | live | `components/SiteFooter.tsx` |
| 404 cards | live | `components/NotFoundCards.tsx` |
| WorldMap (offline polygons) | live | `components/WorldMap.tsx` |
| GoogleMap (env-gated basemap) | live | `components/GoogleMap.tsx` |
| Room: Board | live | `components/BoardGame.tsx` |
| Room: Clock | live | `components/ClockGame.tsx` |
| Room: Wedges | live | `components/WedgesGame.tsx` |
| Room: Streak | live | `components/StreakGame.tsx` |
| Room: Map | live | `components/MapGame.tsx` |
| Room: Gauntlet | live | `components/GauntletGame.tsx` |
| Room: Thread | live | `components/ThreadGame.tsx` |
| Room: Seance | live | `components/SeanceGame.tsx` |
| Room: Ladder | live | `components/LadderGame.tsx` |
| Room: Overture (audio) | live | `components/AudioRoomGame.tsx` |
| Room: Mystery (Intro/Investigate/Verdict/Status) | live | `components/Mystery*.tsx` |
| Room: Weekly case | live | `components/WeeklyCaseGame.tsx` |
| Inputs (text/select) | planned | (per-room ad hoc; no shared spec yet) |

## Specs

### Deck card (`CardFace`) — live
anatomy: French-deck frame — corner rank+suit (tl/br), corner filigree (❧/✦), pips OR one Ace/Joker central emblem in an ornate ring, cartouche (character `.microlabel` + name `.display` + zoomed blurb).
variants: front (pips/ace) · back (`.deck-back-art` Secret Order seal + `eye-glow`) · zoomed (larger emblem + blurb). Joker = no rank/suit, 🃏 corners.
theme: card faces are THEME-INVARIANT — hardcoded parchment/ink literals + `--gold-sheet` are by design, MUST NOT be varred (a parchment card is parchment in daylight).
states: default / hover (lift + `@media(hover:hover)` 3D tilt) / focus (`--c-focus` ring) / zoomed / reduced-motion (static deal, no perpetual motion).
a11y: suit is decorative (`aria-hidden`) — category conveyed by name + rank text; deck buttons ≥44px; contrast per §Floors.
content: name = proper noun; character = "the X" title; blurb ≤ ~28 words, mansion voice (VOICE).
code: `components/CardFace.tsx` · registry `lib/games.ts`

### RoomShell — live
anatomy: `<main>` + drifting category `.glow`, brass doorway top rule (category hex at low alpha), header (logo→lobby link + suit glyph + `.microlabel` nameplate + `RankBadge`), `.brass-rule`, centered `max-w-5xl` play area, fixed bottom-left "← Lobby" pill.
props: `label`, `accent` (Category), optional `href` (rank badge; omit for utility rooms), `children`.
states: static shell; the one per-room signature loop lives in `children`, not here.
a11y: logo link `aria-label` + ≥44×44px; suit glyph `aria-hidden`; lobby pill ≥44px; glow/rules `aria-hidden`.
content: `label` = room proper noun; category accent from `lib/games.ts`.
code: `components/RoomShell.tsx`

### Button / CTA plate — live (Tailwind pattern)
anatomy: `.microlabel` or text label on an engraved brass plate — `rounded-[4px] border border-brass bg-surface/80 px-4 py-2` + 1px gilt inset (inner brass shadow); leading glyph optional. NOT `rounded-full` — that radius is reserved for toggles/switches (shape language: round=switch, plate=action; challenge T2).
variants: primary (accent = `text-brass`/category ink + `hover:border-gold`) · secondary (border-line) · ghost (no border). Destructive uses `ember` + word/icon.
sizes: default plate; touch ≥44px hit area (≤640px `.microlabel` auto-min-height rule).
states: default / hover (`hover:border-brass`, garnish only) / active (instant CSS press ≤150ms) / focus (`--c-focus` ring 2px) / disabled (`smoke`, no hover).
a11y: role button/link; label = verb-first ≤3 words (VOICE); icon-only needs aria-label; contrast per §Floors.
content: verb-first, ≤3 words, no terminal punctuation.
code: Tailwind pattern (e.g. RoomShell lobby pill); no shared component yet — the planned shared `Button` extraction ships the plate form; toggles keep `rounded-full`.

### Panel (`.gilt-frame`) — specced
anatomy: `surface` ground + soft brass box-shadow + hairline; section headers use `.deco-rule`, gilt titles use `.gilt`/`.gold-text` (display-size only).
variants: flat (border `line`) · framed (`.gilt-frame`) · glow-backed (category `.glow` behind, dark bloom / light pigment).
states: static; interactive panels take focus ring on the control, not the panel.
a11y: never encode meaning by frame alone; gilt is display-size only (≥24px bold / ≥19px), never on microlabels or body in light.
content: header = `.display`; body = system sans ≥1rem.
code: `app/globals.css` (`.gilt-frame`, `.deco-rule`, `.gilt`)

### Nameplate / `.microlabel` — live
anatomy: uppercase engraved signage — `text-xs`, letter-spacing 0.22em, `text-muted`.
variants: static label · interactive pill (≤640px gets 44px min-height) · category-tinted (`text-{cat}` ink).
states: static; as a control inherits Button states.
a11y: decorative suit glyphs `aria-hidden`; tinted labels still pair glyph/label (never color alone); contrast per §Floors.
content: short signage, UPPERCASE, no sentence punctuation.
code: `app/globals.css` (`.microlabel`)

### Rank badge — live
anatomy: rank digit (`.display`) + suit glyph in category color; Joker → 🃏.
variants: card corner (`Corner`, tl/br, br rotated 180°) · standalone page badge (`RankBadge`, RoomShell top-right).
states: static, `aria-hidden` (rank conveyed by room context/name).
a11y: purely decorative — screen readers get the room name, not the pip.
content: `A` for rank 1, else the number; suit = category glyph.
code: `components/CardFace.tsx`

### Toast (`AchievementToast`) — live
anatomy: `surface` pill/card, category-tinted accent, brief in mansion voice, auto-dismiss.
variants: achievement (default) · could extend to error/info — reuse the same shell.
states: enter (finite ≤600ms, `cubic-bezier(0.22,1,0.36,1)`) / visible / auto-dismiss / reduced-motion (crossfade, no slide).
a11y: `role="status"` / polite live region; not motion-only; dismiss reachable; contrast per §Floors.
content: ≤1 short line, in character (VOICE); never blocks play.
code: `components/AchievementToast.tsx`

### ThreeStage — live
anatomy: `<canvas>` in a caller-sized container; owns `WebGLRenderer`, the shared RAF loop, `ResizeObserver` aspect sync; caller passes `setup(ctx)=>{scene,camera,radius?,dispose?}` + optional `onFrame(dt,ctx)`.
variants: static camera (Atlas) · driven camera/geometry (Chronos gears).
states: mount (setup runs once) / animating (`onFrame`) / reduced-motion (one static frame, no loop) / unmount (full dispose — geometry/material/texture/renderer, leak-free).
a11y: canvas carries no game state alone — Chronos pairs an accessible HUD, Atlas pairs a numbered DOM chip strip; both fully playable with the canvas absent.
content: n/a (render layer only; trivia/copy lives in the paired DOM).
code: `components/ThreeStage.tsx`

### FluidStage — live
anatomy: `w-full` wrapper, `overflow-x-clip`, `clamp(1rem,4vw,3rem)` inline padding; optional `maxWidth`/`padding` overrides.
variants: default (global chrome) · room-scoped (`maxWidth` clamp, e.g. Séance `74rem`).
states: static (Server Component, no client JS).
a11y: layout-only — no semantics of its own; never introduces horizontal scroll.
content: n/a.
code: `components/FluidStage.tsx`

### Theme toggle — live
anatomy: icon button toggling `data-theme` on the root; persisted; system-preference default.
variants: single control (dark ↔ light).
states: default / hover / active / focus (`--c-focus` ring) — SSR-safe, flash-free, no `Math.random()` in the render path.
a11y: `aria-label` + `aria-pressed`; ≥44px hit area; toggles ALL tokens via one attribute (no per-component light branch).
content: icon-only; label announces target theme.
code: `components/ThemeToggle.tsx`
