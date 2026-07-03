shipped: gameplay assessment of 11 games (all but Séance/Mystery) → .orchestrator/proposals/e5-games.md
files: .orchestrator/proposals/e5-games.md (only artifact; no code touched, no branch)
decided: chosen set = 15 S-effort items for e5-improve, two themes: replay/leaderboard-integrity + surface-withheld-feedback; H×M and archive-regen items pushed to backlog
gotchas:
- real bug: cold-case weekday labels wrong 100% (epoch day 0 = Thursday, WEEKDAY indexed from Sun) — in chosen set
- exploit family: clock restart, wedges replay, map restart, streak relight all re-record known-answer runs
- clock calendar hint prints the converted truth → degenerate strategy; fix in chosen set
- ladder: content changes need Neon ladder_puzzles regen — chosen item is UI-only (reveal rung.rule)
- wedges bonus-cap item requires wedges.test.ts update (legit expectation change, not weakening)
- verify getQuestionsByType has stable ORDER BY (overture distractor order = shared-daily risk) — backlog
branch: none (analysis unit)
