# Engine contracts — new archive puzzle engines (big-cycle 2026-07)

Durable. Path-ref'd by **F6-engine-scaffold** (implements the shared surface) and by
**G1/G3/G4/G5** (fill the generators). Mirrors the existing Séance/Ladder template.

## The template (Pattern A — archived engine)

An archive engine is **self-contained** except for ONE shared file (`queries.ts`). Parts:

| Part | File | Owner |
|---|---|---|
| Payload type + pure generator | `frontend/lib/<engine>Puzzle.ts` — `export interface <X>Puzzle`, `export function generate<X>(dayIndex:number, date:Date): <X>Puzzle` | F6 stubs → game fills |
| Neon table | `db/schema.sql` `<engine>_puzzles` + `db/migrations/<ts>_<engine>_archive.sql` | F6 |
| Loader | `frontend/lib/queries.ts` `get<X>Puzzle(date?)` + `cached<X>` (DB→payload jsonb; **offline → `generate<X>(dayIndexOf(day),day)` inline**) | F6 |
| Generate script | `frontend/scripts/generate-<engine>.ts` + `package.json` npm script | F6 stubs → game fills |
| Render | `frontend/components/<X>Game.tsx` + module.css | game |

Table shape mirrors `seance_puzzles` (schema.sql:133): `play_date date PK, weekday int,
<flavor> text, seed bigint, payload jsonb, created_at`. RLS public-read.

**Why F6 owns `queries.ts`**: it is a monolith; 4 engines each adding a `get<X>Puzzle`
export would 4-way collide in one wave. F6 pre-adds all 4 loaders + stub generators (returning
a trivial VALID puzzle so build/test stay green). Games then replace only their own
`lib/<engine>Puzzle.ts` body + build the component + fill the generate script. `queries.ts`
never re-touched → all 4 engine games run one parallel wave.

**qtype**: archive engines do NOT need a `types.ts` QType token or `schema.sql` qtype enum
(vestigial for seance/ladder — no route reads `getQuestionsByType("seance")`). Skip them.
`scores.room` already lists mystery/clock/streak/map (existing rooms) — no scores edit.

**Offline/zero-env**: no seed-JSON. The inline `generate<X>` fallback makes the room playable
with zero DB (same as Séance). Generator is pure + date-seeded (`lib/rng.ts` `daySeed`); solution
baked into payload; NO solve-time RNG.

## The four engines

Each game designs its own payload internals; F6 only needs the **type name + generate
signature + table name + flavor column** below to stub the shared surface. Game expands the
interface in its own file (queries loader imports by name — stable).

### G1 · mystery · `mysteryPuzzle.ts` → `mystery_puzzles`  (flavor `case_name`)
Deduction grid: suspects × locations × times. Elimination clues (not click-to-reveal).
`MysteryPuzzle { caseName, suspects[], locations[], times[], clues: MysteryClue[], solution: {suspect,location,time} }`.
Clue types must let a player systematically narrow the triple (positive/negative/relational).
Séance-level. Status pills (Potential/Prime/Cleared) render in their own aligned column.

### G3 · clock · `chronosPuzzle.ts` → `chronos_puzzles`  (flavor `mechanism`)
Clockwork/gear logic box. Solvable by pure reasoning; trivia = shortcut only.
`ChronosPuzzle { mechanism, gears[]/constraints[], solution, calendarSkin }`.
Ancient calendars (Mayan long count, Egyptian, Julian…) as skins/content. Steampunk aesthetic.
Verifiable by a solver that ignores trivia.

### G4 · streak · `ignitePuzzle.ts` → `ignite_puzzles`  (flavor `rune_set`)
Rune substitution/cipher logic. Candle flame = centerpiece.
`IgnitePuzzle { runeSet, glyphs[], clues[], solution: substitution-map }`.
Rune sets: Elder Futhark, Futhorc, Younger Futhark, Egyptian Hieroglyphs, Ogham, Phoenician,
etc. Unicode-renderable sets preferred; SVG glyphs where Unicode absent (G4 researches which).
Séance-level. Respect reduced-motion.

### G5 · map · `atlasPuzzle.ts` → `atlas_puzzles`  (flavor `sky_region`)
Constellation/asterism logic (replaces GeoGuessr). Space knowledge NOT required.
`AtlasPuzzle { skyRegion, stars[], lines[], clues[], solution }`.
**Star/constellation catalog = committed JSON** (HYG / IAU lines, license OK per blockers.md) at
`frontend/public/<star-catalog>.json` (offline, like world-atlas). This is separate from the
per-day puzzle payload. Dynamic star UI (twinkle/parallax/nebula). Séance-level.

## Cross-cutting (all four)
- Pure generator, date-seeded, solution in payload, offline inline fallback.
- vitest test `lib/<engine>Puzzle.test.ts` (unique-solution / solvable-by-clues assertion).
- Room 375px-clean using F4's `CollapsiblePanel`.
- Tutorial content in `lib/tutorials/<room>.ts` (F2 stub → game fills).
- Inherit `design/INDEX.md` (F1).
