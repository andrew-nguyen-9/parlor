# e5-analysis — Fable per-game gameplay assessment (E5.4)

Obey `.orchestrator/briefs/_common.md`. **Model: Fable** (game-design judgment). **No code changes** — proposal to disk; no branch; DoD n/a.

## Scope
Every game EXCEPT Séance (E1) + Mystery (E2). Routes/components:
board (`BoardGame.tsx`), clock (`ClockGame.tsx`), cold-case (`WeeklyCaseGame.tsx`), daily, gauntlet (`GauntletGame.tsx`), ladder (`LadderGame.tsx` + `lib/ladder.ts`), map (`MapGame.tsx`, `WorldMap.tsx`), overture/jukebox (`AudioRoomGame.tsx`, `lib/overture.ts`), streak (`StreakGame.tsx`), thread (`ThreadGame.tsx`), wedges (`WedgesGame.tsx`). Check `frontend/app/page.tsx` GAMES list for the authoritative set. `docs/v2/GAMES.md` = design intent per game.

## Deliverable → `.orchestrator/proposals/e5-games.md`
Per game, one section:
- **Verdict** (2 lines): is it fun? core loop strength?
- **Weak spots**: clarity, depth, feedback, pacing, replay pull.
- **Improvements**: ranked impact × effort; each concrete enough for Opus to implement blind (file + behavior).

Close with a **"chosen set"** — the cross-game shortlist sized for ONE build unit (e5-improve): highest impact, lazy-diff-friendly. Rest = backlog section.

## Constraints
- Gameplay/UX judgment, not visual re-theming (e3 owns look; e4 owns mobile).
- Respect determinism (daily/shared setups day-seeded via `lib/rng.ts`) — flag any improvement that risks it.
- No new heavy deps; WorldMap stays offline (no tile servers).
