# e4-mobile — mobile friendliness, all routes (E4.1–E4.2)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort medium. Branch `ux/e4-mobile`.
Deps (all structural change lands first — you sweep last): `.orchestrator/e3-tokens.done.md`, `e1-polish.done.md`, `e2-ui.done.md`, `e5-nav.done.md`, `e5-improve.done.md`, `e6-ui-qa.done.md`.

## Scope
Every route in `frontend/app/`: home `/`, about, board, clock, cold-case, daily, gauntlet, ladder, map, mystery, overture, profile, seance, streak, thread, wedges (+ 404). Verify against actual `app/` dirs.

## Task
**E4.1** per route at 360–430px: no horizontal scroll, tap targets ≥44px, readable type (≥14px effective), controls usable one-handed. Use e3 tokens/breakpoint utilities; CSS-first (media queries/container queries) over JS.

**E4.2** verify with the `/ui-qa` skill (mobile mode — built by e6-ui-qa; read its .done.md for invocation) per route; playwright mobile snapshots + lighthouse mobile a11y. Fix findings; reports land in `.orchestrator/qa/`.

## Method (batch, don't 16× full-loop)
1. playwright mobile snapshot sweep all routes → triage table (route | issues).
2. Fix common causes first (shared CSS/RoomShell/tokens), then per-route stragglers.
3. `/ui-qa` mobile verify pass; lighthouse mobile a11y on worst 3 + home.

## Constraints
- Séance grid + Mystery full-screen layout just changed (e1-polish/e2-ui) — verify their claims at mobile widths, fix gaps (their .done.md gotchas first).
- Game playability > pixel perfection; aesthetics polish belongs to qa-sweep.
- No horizontal-scroll suppression hacks (`overflow-x:hidden` on body = last resort, log it).
