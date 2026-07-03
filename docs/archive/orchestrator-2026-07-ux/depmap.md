# depmap.md — dependency map + wave plan (C reads this cold; do not open spec.md)

13 units. E3 = foundation (all visual units inherit e3-tokens). Coupled clusters collapsed
(mystery engine = one sequential unit; séance engine features = one unit). Fable infused on
every judgment unit (limited-release model — maximize use): 3 proposals + QA-skill authoring
+ final sweep; Opus builds; Sonnet mechanical.

## Map — unit → upstream `.done.md` to inject (paths relative `.orchestrator/`)

| Unit | Model | Inject (besides its brief + briefs/_common.md) |
|---|---|---|
| e3-proposal | fable | — |
| e2-analysis | fable | — |
| e5-analysis | fable | — |
| e6-ui-qa    | fable | — |
| e1-core     | opus  | — |
| e3-tokens   | opus  | e3-proposal.done.md + proposals/e3-design.md |
| e2-engine   | opus  | e2-analysis.done.md + proposals/e2-mystery.md |
| e1-polish   | opus  | e3-tokens.done.md, e1-core.done.md |
| e2-ui       | opus  | e2-engine.done.md, e3-tokens.done.md + proposals/e2-mystery.md |
| e5-nav      | sonnet| e3-tokens.done.md |
| e5-improve  | opus  | e5-analysis.done.md, e3-tokens.done.md + proposals/e5-games.md |
| e4-mobile   | opus  | e3-tokens, e1-polish, e2-ui, e5-nav, e5-improve, e6-ui-qa .done.md (6) |
| qa-sweep    | fable | e4-mobile.done.md, e6-ui-qa.done.md |

## Waves

- **W1 (no deps, all parallel):** e3-proposal(F), e2-analysis(F), e5-analysis(F), e6-ui-qa(F), e1-core(O)
- **⛔ GATE after W1:** user must approve `proposals/e3-design.md` (blocker A5). C STOPS and asks.
  W2's e2-engine may dispatch while waiting (ungated).
- **W2:** e3-tokens(O, gated), e2-engine(O)
- **W3 (all parallel):** e1-polish(O), e2-ui(O), e5-nav(S), e5-improve(O)
- **W4:** e4-mobile(O)
- **W5:** qa-sweep(F)

## Rules for C
- **Setup (B couldn't run git — do first):** `git branch integration main` if missing; sanity-parse prd.json (`python3 -c "import json;json.load(open('.orchestrator/prd.json'))"`).
- Analysis units (e3-proposal, e2-analysis, e5-analysis) = no code, no branch, no DoD — return + proposal file + .done.md only.
- Each code unit branches `ux/<unit>` off CURRENT `integration`; integration subagent merges per wave in dep order, full regression there (see orchestrator §Integration gate).
- Per-epic merge to `main` (A1): after a game's units are integration-green AND reviewed, `integration` content for that epic may ship; simplest safe interpretation = ff `main` from green `integration` after W3, W4, W5 checkpoints — D does final.
- Known gap: original 10-link reference list (wishlist item 3) lost at intake; e3-proposal brief compensates (7 known refs + Fable picks ~3). No other blockers — blockers.md all ✅.
