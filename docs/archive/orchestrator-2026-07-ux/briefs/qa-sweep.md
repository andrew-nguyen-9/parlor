# qa-sweep — final UI/UX QA pass, all games (E1.8, E5.5, E3.5 check, E6.3)

Obey `.orchestrator/briefs/_common.md`. **Model: Fable** (critique judgment; fixes stay small). Branch `ux/qa-sweep`.
Deps: `.orchestrator/e4-mobile.done.md` (last builder) + `.orchestrator/e6-ui-qa.done.md` (the tool).

## Task
Dogfood `/ui-qa` (E6.3) on home + EVERY game route: seance (=E1.8), board, clock, cold-case, daily, gauntlet, ladder, map, mystery, overture, streak, thread, wedges (=E5.5 each). Lenses: functionality, aesthetics, creativity, web design, mobile, a11y.

## Triage per finding
- **Small** (copy, spacing, token misuse, missing hover/focus state, a11y label): fix directly, laziest diff.
- **Big** (rework, new feature, layout rebuild): do NOT build — log to `.orchestrator/qa/backlog.md` (route | finding | suggested fix | effort).

## E3.5 check (explicit)
Site reads highly-designed, no AI-slop, in BOTH light + dark mode. Judge against `docs/v2/DESIGN_SYSTEM.md` guidelines. Failures = findings (triage as above).

## Constraints
- Lighthouse-ci gate stays green (perf regressions from fixes = your bug).
- Determinism/solvability tests untouched.
- Reports stay in `.orchestrator/qa/` (disk, not chat). Your return = JSON + counts only.
- .done.md: routes swept, fixed count, backlog count, any 🔴 left open (D reads this).
