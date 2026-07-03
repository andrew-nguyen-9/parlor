shipped: .orchestrator/proposals/e2-mystery.md — full E2.7 critique + E2.2/2.3/2.5/2.6 designs, ranked, chosen set split e2-engine/e2-ui.
decided: WHEN = alive/found bracket clues (hourIndex stays 1..3); WHERE = unclaimed-room cross clue read off alibi board (invariant already holds); weapon = 6-item rack, 3+2 elimination partition; motive = elimination clue + victim-tie kind bijection, doubles as ringleader cross-confirm; scoring = per-axis partial credit (350/150/150/150/200), drop tableBonus/autoMark; prose banks on SECOND rng stream (seed ^ 0x9e3779b9).
gotchas:
- CRITICAL leak found: only culprits get victim relationship ties → dossier tap names ringleader with 0 clues (mystery.ts addRel). Fix = 2 red-herring ties, folded into motive design.
- Opening prose leaks motive today ("The reckoning is …"); clues 5+6 are static duplicates; autoMarkUsed hardcoded false; shareText() in mysteryScore.ts dead.
- Score not gated on won — fast losses outscore wins.
branch: none (analysis unit, no code changes)
