# e5-nav — games meta: nav + card ranks + Joker (E5.1–E5.3)

Obey `.orchestrator/briefs/_common.md`. Model: Sonnet, effort low. Branch `ux/e5-nav`.
Deps: `.orchestrator/e3-tokens.done.md` (tokens).

## Files
`frontend/components/RoomShell.tsx` (2.1K — shared game-page chrome), `Deck.tsx`, `CardFace.tsx`, `frontend/app/page.tsx` (GAMES list, `rank:` fields 1–8 at lines ~29–99), game `app/*/page.tsx` wrappers.

## Tasks
1. **E5.1** Logo top-left on every game page = link home (`/`). Natural affordance (cursor pointer, subtle hover). RoomShell = the one place (all games wrap in it — verify; any game not using RoomShell, fix there too).
2. **E5.2** Playing-card rank top-right on each game page: Mystery=Ace(1), Codex=2, … per `page.tsx` GAMES ranks. Reuse `CardFace`/`Deck` rank rendering vocabulary — don't invent a second rank style. **Verify/renumber consistency**: page.tsx shows ranks 1–8 but more game routes exist (13) — reconcile, make ranks authoritative in ONE place (GAMES list), renumber if drifted.
3. **E5.3** Jukebox (overture / `AudioRoomGame`) renders as **the Joker** in its top-right slot (home deck card + its game page badge).

## Constraints
- Shortest diff: RoomShell prop or GAMES-lookup, not per-game copy-paste.
- a11y: logo link labelled ("PARLOR — home"); rank badge `aria-hidden` if decorative.
- .done.md: where rank authority lives, final game→rank table (e4/qa-sweep verify against it).
