# 2026-07-09 — Wishlist build (deepening pass on the 2026-07-07 rooms)

Orchestrator cycle, 15 units (F1 + E1–E13, E11 split a/b) + a D fix-wave unit (E7fix).
Landed `main` @ `c9ab646`. All 13 epics met. Build 21 routes · 136 tests · lint 0 · pipeline
selftest · design/validate green. Harvested from `.orchestrator/` at cleaning.

## Decisions (decided:)

- **3D stack**: Three.js for visuals; puzzle logic cores stay deterministic/kinematic (NO physics
  engine) — win is a logic gate, guarantees unique-solve + mobile perf. Shared `ThreeStage` (F1)
  wraps renderer: DPR≤2, one shared RAF, ResizeObserver, full dispose, `framePortrait` camera helper,
  reduced-motion → one still frame. `FluidStage` (F1) = full-width container, `clamp()` padding.
- **E2 Chronos** (`/clock`): retired the permutation-CSP; new mechanic = serial gear TRAIN, each
  wheel's tooth-count steps a running index (mod dialTeeth), notches must align. Uniqueness proved by
  EXACT integer math + brute-force `solveChronos` (≤120 perms), test asserts exactly 1 across 120 days.
  ThreeStage scene keyed on arrangement+correctness sig (re-inits per placement).
- **E3 Atlas** (`/map`): fixed-camera 3D deep-space starfield (~1400 drifting stars) over the EXISTING
  `atlasPuzzle.ts` constellation solver (not modified — 3D reads x/y/mag+lines). `camera.far=200` set
  AFTER `framePortrait` (don't return `radius` from setup) else the backdrop shell clips on resize.
- **E4 Ignite** (`/streak`): Phaser is presentation only; React (RuneBoard) stays sole game state →
  stateless `drawBoard(scene, vm)`. Harder = WEEKDAY_K floor 4→5, REMOVE_ORDER drops anchors +
  vowel/consonant marks first (minimal set relational). Uniqueness still gated by `countSolutions`.
- **E5 Climb** (`/ladder`): `queens` added to `PuzzleKind` in `lib/ladder.ts` (NOT `lib/types.ts` —
  it has no puzzle-kind enum). Exhaustive backtracking count (cap 2) proves single solution. Easier =
  max 3 rungs (was 4), 5×5–6×6 grids (was ≤8×8). Full keyboard entry.
- **E7 Overture** (`/overture`): root-cause no-play = one shared guard in `play()` — Deezer preview
  fail (`.catch` + `el.onerror`, once-guarded) AND the no-audio/no-melody else-branch both fall back
  to `playBank()` → committed synth bank (`public/overture-melodies.json` + `lib/synthBank.ts`,
  native Web Audio, no dep). `pickBankMelody(daySeed+i)` deterministic. **(NOTE: the original E7 unit
  shipped the bank + import but never wired the call — D's blind-judge caught it; fixed in E7fix.)**
- **E8 Tutorials**: `Tutorial.steps?` (icon+phrase) added alongside legacy `rules?`; overlay renders
  animated steps (Framer stagger, post-mount `entered` flag → SSR-safe) or falls back to `rules`.
  `thread.ts` left on `rules` (E10-owned).
- **E11a Sports**: removed Sleeper/ESPN ingest (`sports_ingest.py` + its ETL step); new
  `wiki_sports_ingest.py` = 26 well-known franchises/champions/athletes, facts-only w/ `source_url`,
  `source=wikipedia` (already in dbt accepted_values → no schema change). Forge stays sole Q-maker.
- **E11b Theming**: Board/Fractures reskin via a `--accent` CSS var (per-day) + token-driven mirror
  (`rgb(var(--c-*))`); `themes.ts` keys stay in lockstep with forge `BOARD_THEME_KEYWORDS`
  (selftest.py cross-file check gates it). `CATEGORY_HEX` consumed, never redefined.
- **E9 Global UI**: `RoomShell` composes `FluidStage` (adaptive gutters, `--d-maxw` 80rem); opt-in
  sr-only `<h1>` via `title` prop on thin page shells (avoids double-h1). Added `app/error.tsx`
  route boundary + `ThreeStage` WebGL guard (try/catch renderer creation → accessible DOM fallback).
  `design/PROMPTS.md` = 6 per-surface Claude Design animation briefs (outsourced work, not built).
- **E13**: design North Star folded 3D/space direction; fixed real drift — `/map` is the constellation
  puzzle, pin-drop lives in `/gauntlet` (PATTERNS said otherwise).

## Gotchas (this cycle)

- ThreeStage.setup runs ONCE — key the scene on state sig to re-init; reduced-motion renders one still
  frame so live 3D material updates don't show → DOM controls must carry live state (E2/E3).
- `@typescript-eslint/no-explicit-any` NOT loaded by `next/core-web-vitals` → a disable-comment for it
  is itself a lint ERROR; use bare `any` (E4).
- Phaser canvas is not SR-playable (role=application + label; clues stay DOM) — inherent to the
  "render in Phaser" mandate (E4). Import phaser DYNAMICALLY inside the mount effect (never module
  scope) → SSR-safe, lazy chunk.
- E10 Thread: `useMemo`/`useLayoutEffect` must sit ABOVE the early return (rules-of-hooks); weave amp
  ≤7px, no x-overflow; reduced-motion → sheen off + segments fully drawn.
- Builder worktrees lack `node_modules` + Write is worktree-sandboxed → cross-worktree `.done.md`
  writes fail (E12, E7fix used the return note instead); stale `node_modules` (pre-F1) fails build
  with "Can't resolve 'three'" → `npm ci` after any dep-adding cycle before trusting a build.
- **Land data-merge trap**: origin/main nightly bank-refresh was forged by the OLD sleeper pipeline;
  a plain merge into integration silently re-adds 791 sleeper rows to `data/raw/sports.jsonl`
  (delete-vs-modify auto-blend). At land, KEEP integration's wiki-only `sports.jsonl`.

## Surviving traps from the unharvested 2026-06-30 run (never landed a decisions file)

- **Wedges advancement** (`WedgesGame.tsx`): do NOT make `q` derive reactively from `locked` — an old
  `visibleIdx` useMemo swapped the question out from under the player mid-answer. Use direct `idx` +
  skip-only-on-advance (`skipLocked()` from `next()`/`toBonus()`).
- **Thread chain build** (pipeline): keyword-derived naming leaks the theme (matched clustering
  keyword is by definition in clue text) — chain build is a backtracking DFS (`_walk_chain`, depth ≤7)
  to avoid greedy dead-ends; hint shows the answer's LAST letter (`passingLetter()`), not first.
- **GoldSheen was DELETED** — do NOT re-mount it or set `--mx/--my`; `gold-shimmer` keyframe +
  `animate-gold-shimmer` tailwind anim removed repo-wide.
- **Map**: `GoogleMap.tsx` is the paid/key-gated path (`USE_GOOGLE` env flag); the keyless hybrid
  raster is WorldMap-only (the free default). `selftest.py` is fully offline — never exercises any
  ingest network path (py_compile-verified only).

## Deferred / next-cycle (ship-green — not blocking this land)

- 🟠 In-game mobile tap-targets <40px: seance / ladder / mystery grid+chip cells (room components,
  out of E9's shell scope). From E12 QA backlog #4.
- E11a orphaned "fantasy adds" dead config: `HL_UNIT_WEIGHT["fantasy adds (24h)"]` in
  `question_forge.py` + a relabeled fantasy fixture in `selftest.py:130` + stale `sleeper`/`espn` in
  `transform/models/staging/schema.yml` accepted_values (harmless, no schema break) — remove.
- E1 Séance: first-frame rotation flash on mobile (CSS var `auto` until JS paints) — cosmetic.
- E13 doc tension: DECISIONS marks ThreeStage WebGL guard "open" while INDEX states it as a settled
  Floor — reconcile.
- 🟡 `/daily` == `/gauntlet` byte-identical (E12 backlog #5) — alias→redirect or wire the Wordle-loop.
- **Design North Star overdue**: `design/INDEX.md last-challenged: 2026-07-06`, cadence `each release`
  → run a `~/.claude/design-system-creator/` challenge.

---
cost: guard INACTIVE (ccusage off PATH, no token limit); wave-pace 1 wave/window; no wave-1 cost line recorded.
process: unit-builders + blind-judges systematically hit ~15–40-tool maxTurns just before commit/verdict → recover via SendMessage-by-agentId (context intact, ~0 extra tools), NOT a defect. Blind-judge false-negative (couldn't grep a symbol → "unmet") correctly overridden by the green deterministic selftest — green test beats unverified judge-unmet.
