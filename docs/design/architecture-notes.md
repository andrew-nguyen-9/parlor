# Big-cycle 2026-07 — architecture notes (Session B)

Durable. Cross-cutting decisions + spec-drift corrections found while fanning `spec.md`.
Cycle trackers (depmap, prd, briefs, progress) live in `.orchestrator/` (die at cleaning).

## Spec-drift corrections (spec.md guessed; code says)
1. **Corner number source = `frontend/lib/games.ts` `GAMES[].rank`**, NOT `lib/collection.ts`.
   `RoomShell`→`CardFace` `RankBadge` renders it. `app/*/page.tsx` `label="room NN …"` strings are
   a SEPARATE, STALE, inverted scheme (board=01…mystery=10) that disagrees with the badge
   (mystery=1). F3 = strip the "room NN —" prefix from the 11 page labels; make `GAMES.rank`
   the single contiguous 1–11 source; RankBadge shows it. (F3 brief carries this.)
2. **`COLLECTION`/`profile.ts ROOMS` have phantom rooms** (jukebox/gallery/blitz/connections, no
   routes) and OMIT thread/seance/ladder/overture. This is pre-existing drift, **out of scope**
   (F3 is only the corner number, sourced from games.ts). Left alone deliberately.
3. **Cold-case is NOT in `collection.ts`/`profile.ts`/`weakspot.ts`** — F5 footprint is clean:
   delete 5 files (app/cold-case, WeeklyCaseGame.tsx, WeeklyCase.module.css, lib/weeklyCase.ts+.test),
   edit share.ts:106, rooms.ts:135-143, games.ts:113-123, schema.sql:85+92. No pipeline ingest.
4. **Overture has no real audio previews today** — `lib/overture.ts` derives titles from Wikipedia
   slugs; `forge_audio` emits a synth melody + year, never sets `audio_url`. G9 = add real Deezer
   preview URLs via `music_ingest.py` + `forge_audio`.
5. **Board/Codex "Deezer"** = the music-category `clue` column (Deezer facts → `forge_clues`).
   "Drop Deezer from Codex" = stop routing Deezer-sourced facts into board clues; keep music
   category via Wikipedia. `themes.ts` keys must stay in sync with `BOARD_THEME_KEYWORDS` (forge).

## Shared-surface seams (why the waves are shaped this way)
- **`queries.ts` monolith** → F6-engine-scaffold pre-adds the 4 archive loaders (see
  `engine-contracts.md`). Games never touch `queries.ts`.
- **`question_forge.py` + `selftest.py`** → single file, edited by G2 (forge_clues+themes+board),
  G6 (forge_thread), G9 (forge_audio). No clean stub seam (forge_thread consumes clues). →
  **serialize G2 → G6 → G9** (G6 also has a real data-dep on G2's clues). Pipeline units also run
  `cd pipeline && python selftest.py` in DoD.
- **`RoomShell.tsx`** → F4 (collapsible slots) then F2 (help icon). F2 dep F4.
- **`games.ts`/`rooms.ts`** → F5 (remove cold-case) then F3 (renumber remaining 11). F3 dep F5.
- **`schema.sql`** → F5 (drop cold-case enum) then F6 (add engine tables). F6 dep F5.
- **Tutorials**: F2 ships `TutorialOverlay` + RoomShell hook + `lib/tutorials/<room>.ts` STUB per
  room + registry. Each revamped game overwrites its own `lib/tutorials/<room>.ts` (disjoint).
- **Mobile**: F4 ships `CollapsiblePanel` primitive + `globals.css` mobile rules + fixes the
  NON-revamped rooms (wedges, gauntlet). Each revamped game owns its OWN 375px compliance using
  the primitive. Games must NOT edit `globals.css` (use their own module.css).

## Release policy (from orchestrator §Swap)
Foundation **F1–F6 = block-release** (a ⛔ blocks the wave; F6 added by B as shared scaffolding,
same class). Games **G1–G9 = ship-what-passes** (a ⛔ game held individually, rest land).

## Numbering after F5 (11 rooms)
mystery, board, clock, wedges, streak, map, gauntlet, thread, seance, ladder, overture.
F3 assigns contiguous rank 1–11 in `games.ts` (overture may stay `joker`). Document ordering in
the `games.ts` header comment.
