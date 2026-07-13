# PARLOR v3 — Run Prompts (all batches)

Every segment as a **self-contained, paste-ready** session prompt (preamble +
block baked in). Run three at a time per the [`ROADMAP.md`](ROADMAP.md) schedule.
Order rules: **v3.0 runs alone first** (hard gate, merge before anything);
**3.7 + 3.8 only after 3.11 merges**; **≤1 pipeline segment per batch**.

Each session branches off the latest `v3` and PRs back into `v3`. Bump
`frontend/package.json` to the segment version on the PR.

---

## ▶ GATE — run alone, merge before the swarm

### v3.0 — Foundation Freeze
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.0-foundation-freeze; PR into `v3` only — never
touch `main`. Keep caveman + ponytail on; use rtk for git/file ops. Locate code
with the Explore agent / cavecrew-investigator (serena is NOT installed). Run
superpowers:verification-before-completion before claiming done.

Execute PLATFORM.md §3.0. This is the ONLY segment allowed to edit shared files.
Land in one PR: (1) any new QType members in lib/types.ts + matching db/schema.sql
qtype enum + a db/migrations/<ts>_v3.sql; (2) RETIRE the legacy rooms — remove
Jukebox/Gallery/Blitz/Connections/Lobby from lib/rooms.ts GAME_ROOMS + app/page.tsx
GAMES[] + delete their app/<room>/ routes (fold Jukebox audio note into the 3.22
plan, no code); (3) shared desktop-density tokens in app/globals.css + adopt a
*.module.css convention (document it) so no later segment touches globals.css;
(4) lib/share.ts — a Wordle-style emoji-grid builder + a GameResult interface every
game plugs into; (5) app/api/og/[room]/route.tsx — a parameterized @vercel/og
share-card endpoint; (6) register the 3.22 audio room route + qtype now so 3.22
owns no shared files. Self-check: pipeline/selftest.py green; next build green.
END STATE: all shared-file changes for v3 are in; legacy rooms gone from deck +
sitemap; lib/share.ts + OG endpoint exist + are documented; a sample game can
import lib/share.ts without touching any shared file.
TOOLING: context7 (@vercel/og, Next route handlers); cavecrew-investigator to map
every shared-file consumer before editing; frontend-design for the share-card art.
STOP: foundation only. Do NOT improve any individual game.
```

---

## ▶ Batch 1 — 3.11 · 3.1 · 3.2

### v3.11 — Transform Fix
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.11-transform-fix; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.11. superpowers:systematic-debugging FIRST — do not guess.
The nightly fails at the dbt transform step (transform/), gating publish, so Séance
+ Ladder (server-generated, no seed fallback) go dark. FILES I OWN: transform/**,
and pipeline/*.py ONLY as needed to fix the bronze→staging contract the dbt models
read. Reproduce locally (dbt build --profiles-dir . from inside transform/), find
the failing model/test, root-cause, fix, and add a guard so it fails loudly next
time. END STATE: dbt build green locally; selftest green; a documented root cause +
fix written into PIPELINE.md §3.11; Séance + Ladder get data. TOOLING:
systematic-debugging; cavecrew-investigator to map the dbt DAG; context7 for
dbt/DuckDB. STOP: transform + its upstream contract only. No frontend, no game work.
```

### v3.1 — Board
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.1-board; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.1. FILES I OWN: frontend/components/BoardGame.tsx,
frontend/components/BoardGame.module.css (new). Improve play (daily-double wager,
running score, keyboard nav); fit the 5×5 grid + clue + score on one desktop
screen with no scroll; emit a share result (which clues hit/missed + score) via
lib/share.ts. Verify one-screen with chrome-devtools resize_page at 1280×800 and
1920×1080. END STATE: board plays one-screen on desktop, no scroll; share card
renders; selftest + build green. TOOLING: brainstorming if reworking scoring;
frontend-design; chrome-devtools resize_page + lighthouse_audit; playwright.
STOP: Board only.
```

### v3.2 — Clock
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.2-clock; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.2. FILES I OWN: frontend/components/ClockGame.tsx,
frontend/components/ClockGame.module.css (new). Improve play (proximity streak
bonus, harder calendar twists); fit the clock face + year slider + per-round
feedback on one desktop screen, no scroll; share the 5-round proximity line via
lib/share.ts. Verify one-screen with chrome-devtools resize_page at 1280×800 and
1920×1080. END STATE: one-screen on desktop, share card renders, build green.
TOOLING: frontend-design; chrome-devtools resize_page; playwright. STOP: Clock only.
```

---

## ▶ Batch 2 — 3.12 · 3.3 · 3.24

### v3.12 — Distractor Overhaul
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.12-distractors; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.12. FILES I OWN: pipeline/question_forge.py (distractor
functions: _clue_distractors + the meta.answer_field path ~L182–326), pipeline/
selftest.py (add the closeness check), plus a new pipeline/distractor_quality.py if
needed. Problem: wrong answers are too obviously wrong. Make distractors sit close
to the real answer — same category, same era/decade for dates, same order of
magnitude for numbers, same type for entities. Add a selftest assertion that flags
trivially-distinguishable distractor sets. Regenerate the seed bank from bronze and
spot-check. END STATE: distractors measurably closer (documented heuristic); selftest
gate added + green; seed bank regenerated. TOOLING: systematic-debugging if a recipe
misbehaves; ponytail (heuristic over ML unless it falls short). STOP: forge distractor
logic + its test only.
```

### v3.3 — Wedges
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.3-wedges; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.3. FILES I OWN: frontend/components/WedgesGame.tsx,
WedgesGame.module.css (new). Improve play (speed bonus, clearer lockout feedback);
fit the six-wedge ring + question + timer one-screen on desktop, no scroll; share
the filled-ring emoji via lib/share.ts. Verify one-screen with chrome-devtools
resize_page at 1280×800 and 1920×1080. END STATE: one-screen, share card, build
green. TOOLING: frontend-design; chrome-devtools resize_page; playwright.
STOP: Wedges only.
```

### v3.24 — Preview deploy + QA gates
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.24-preview-qa; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.24. FILES I OWN: .github/workflows/*, vercel config, docs.
Stand up a preview deploy; run the four deferred v2 gates against it (Lighthouse
before/after, playwright mobile sweep, playwright multi-engine, axe a11y) (debt #2).
END STATE: preview URL live; four gates run + evidence recorded. TOOLING: vercel:deploy,
vercel:env; chrome-devtools lighthouse_audit; playwright. STOP: deploy + gates only.
```

---

## ▶ Batch 3 — 3.13 · 3.4 · 3.5

### v3.13 — Deezer + Music Depth
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.13-music; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.13. FILES I OWN: pipeline/music_ingest.py, the music recipes
in pipeline/question_forge.py, pipeline/selftest.py. Problem: Deezer image_guess
clues leak the answer in the album art. Fix: stop using answer-revealing album covers
— prefer audio-only (30s preview) or art-stripped clues, or crop/obscure. THEN
broaden music trivia: brainstorm + add new music qtypes (e.g. year-of-release,
label, featured artist, lyric snippet, sampled-by, BPM/genre) sourced keylessly.
Use superpowers:brainstorming to pick which new types are worth building.
END STATE: no music clue shows the answer in its image; >=2 new music qtypes forged
+ selftest-covered; seed bank regenerated. TOOLING: brainstorming; context7 for the
Deezer API; ponytail. STOP: music ingest + music recipes + their tests only.
```

### v3.4 — Streak
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.4-streak; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.4. FILES I OWN: frontend/components/StreakGame.tsx,
StreakGame.module.css (new). Improve play (more categories, clean accelerating
timer); two-card + flame one-screen on desktop, no scroll; share the streak length
via lib/share.ts. HARD CONSTRAINT: flame/darkness never reduces legibility;
reduced-motion freezes it. Verify one-screen with chrome-devtools resize_page at
1280×800 and 1920×1080. END STATE: one-screen, share card, legibility verified,
build green. TOOLING: frontend-design; chrome-devtools resize_page; playwright.
STOP: Streak only.
```

### v3.5 — Map
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.5-map; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.5. FILES I OWN: frontend/components/MapGame.tsx,
frontend/components/WorldMap.tsx, MapGame.module.css (new). Improve play (round
scoring clarity, civ rotation); map + result distance one-screen on desktop, no
scroll; share the per-round distance line via lib/share.ts. Keep offline (no tile
servers). Verify one-screen with chrome-devtools resize_page at 1280×800 and
1920×1080. END STATE: one-screen, no stray map lines, share card, build green.
TOOLING: frontend-design; chrome-devtools resize_page; playwright. STOP: Map only.
```

---

## ▶ Batch 4 — 3.16 · 3.6 · 3.9

### v3.16 — Screen starvation fix
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.16-screen; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.16. FILES I OWN: pipeline/screen_ingest.py. Replace the
TMDB-key gate with a keyless film/TV source (Wikidata SPARQL or OMDb-free) so the
screen category stops starving (debt #1). END STATE: screen category populated
without a key; selftest green. TOOLING: systematic-debugging; context7. STOP:
screen ingest only.
```

### v3.6 — Thread
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.6-thread; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.6. FILES I OWN: frontend/components/ThreadGame.tsx,
ThreadGame.module.css (new). Improve play (hint cost, clearer chain viz); chain +
input + reveals one-screen on desktop, no scroll; share the solved-% chain via
lib/share.ts. Verify one-screen with chrome-devtools resize_page at 1280×800 and
1920×1080. END STATE: one-screen, share card, build green. TOOLING: frontend-design;
chrome-devtools resize_page; playwright. STOP: Thread only.
```

### v3.9 — Mystery
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.9-mystery; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.9. FILES I OWN: frontend/components/Mystery*.tsx (MysteryGame,
MysteryIntro, MysteryInvestigate, MysteryAccusationForm, MysteryVerdict,
MysteryStatusPill) + Mystery.module.css (new). Harder logic / weaker hints; collapse
the flow so the active step fits one desktop screen; share the verdict (solved/failed
+ deductions used) via lib/share.ts. Keep the daily case solvable (vitest green).
Verify one-screen with chrome-devtools resize_page at 1280×800 and 1920×1080.
END STATE: one-screen per step, solvable, share card, tests + build green.
TOOLING: brainstorming for case logic; frontend-design; chrome-devtools resize_page;
playwright; vitest. STOP: Mystery only.
```

---

## ▶ Batch 5 — 3.15 · 3.7 · 3.8  (3.7/3.8 require 3.11 merged)

### v3.15 — Wikidata source
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.15-wikidata; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.15. FILES I OWN: pipeline/wikidata_ingest.py (new),
pipeline/selftest.py, data/raw/wikidata.jsonl (bronze). Keyless SPARQL source
broadening every category. Append-only ingest; never edit other ingests.
END STATE: wikidata facts in bronze + forged; selftest green. TOOLING: context7
(Wikidata SPARQL); ponytail. STOP: new source only.
```

### v3.7 — Séance  (data depends on 3.11)
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.7-seance; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.7. FILES I OWN: frontend/components/SeanceGame.tsx,
SeanceGame.module.css (new). Improve play + fit the puzzle board one-screen on
desktop; share solve time/grid via lib/share.ts. NOTE: live data needs 3.11's
transform fix — develop against an archived/sample puzzle; END STATE verifies fully
once 3.11 lands. Verify one-screen with chrome-devtools resize_page at 1280×800 and
1920×1080. END STATE: one-screen, share card, build green; plays on a sample
puzzle. TOOLING: brainstorming if reworking the puzzle UX; frontend-design;
chrome-devtools resize_page; playwright. STOP: Séance only.
```

### v3.8 — Ladder (The Climb of the Initiate)  (data depends on 3.11)
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.8-ladder; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.8. FILES I OWN: frontend/components/LadderGame.tsx,
LadderGame.module.css (new). Improve the math/logic play + fit one-screen; share
the result via lib/share.ts. NOTE: live data needs 3.11 — develop against a sample;
END STATE verifies fully once 3.11 lands. Verify one-screen with chrome-devtools
resize_page at 1280×800 and 1920×1080. END STATE: one-screen, share card, build
green; plays on a sample. TOOLING: brainstorming for puzzle tuning; frontend-design;
chrome-devtools resize_page; playwright. STOP: Ladder only.
```

---

## ▶ Batch 6 — 3.17 · 3.10 · 3.14

### v3.17 — Per-source health floor
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.17-health-floor; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.17. FILES I OWN: pipeline/common.py (health-gate helper),
the nightly gate in pipeline/export_seed.py or selftest.py. Add a per-(source/
category) floor so one dead source pages someone instead of rotting silently
(debt #3). END STATE: a starved source fails the gate in a test. TOOLING:
ponytail. STOP: health gate only.
```

### v3.10 — Gauntlet
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.10-gauntlet; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.10. FILES I OWN: frontend/components/GauntletGame.tsx,
GauntletGame.module.css (new). Improve the speed run (hint-time penalties, clearer
stage transitions); each stage fits one screen; ship the teased Wordle-style line
of squares as the share result via lib/share.ts. Verify one-screen with
chrome-devtools resize_page at 1280×800 and 1920×1080. END STATE: one-screen stages,
emoji-grid share card, build green. TOOLING: frontend-design; chrome-devtools
resize_page; playwright. STOP: Gauntlet only.
```

### v3.14 — Share-card polish
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.14-share-cards; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.14. FILES I OWN: app/api/og/** (extend the 3.0 endpoint),
frontend/components/ShareCard*.tsx (new), frontend/lib/share.ts ONLY by appending
(coordinate: if it needs a shared-type change, that's a 3.0 follow-up). Build the
result-card gallery + per-room OG art. END STATE: every game's share link previews
its actual run. TOOLING: frontend-design; context7 (@vercel/og); chrome-devtools.
STOP: share UI only.
```

---

## ▶ Batch 7 — 3.18 · 3.19 · 3.20

### v3.18 — Quality scoring
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.18-quality; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute PIPELINE.md §3.18. FILES I OWN: pipeline/question_forge.py (ranking step
only) or a new pipeline/quality_score.py, pipeline/selftest.py. Add an ambiguity/
quality score so the board picks good clues. Heuristic first (ponytail); LLM-judge
only if it measurably wins. END STATE: questions carry a quality score the board can
sort on; selftest green. TOOLING: brainstorming; ponytail. STOP: scoring only.
```

### v3.19 — Weak-spot practice
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.19-practice; PR into `v3` only — never touch `main`.
Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT FIREWALL: edit
ONLY the files in FILES I OWN; if you need a shared file, STOP and report it as a
v3.0 gap. Locate code with Explore / cavecrew-investigator (serena NOT installed).
Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.19. FILES I OWN: frontend/components/PracticeBar.tsx,
frontend/components/ProfileDashboard.tsx, a new frontend/lib/weakspot.ts. Surface
the player's weakest category from localStorage and route practice there.
END STATE: practice routes to the weakest category. TOOLING: frontend-design.
STOP: practice routing only.
```

### v3.20 — Return loop
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.20-return-loop; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.20. FILES I OWN: a new frontend/lib/collection.ts (generalize
lib/grimoire.ts), frontend/components/ProfileDashboard.tsx. A completed-days calendar
+ a grimoire-style collection that fills across rooms. END STATE: a return habit loop
visible on the profile. TOOLING: frontend-design. STOP: return loop only.
```

> Note: 3.19 and 3.20 both touch `ProfileDashboard.tsx`. If running both in the same
> batch, have one own ProfileDashboard and the other defer its dashboard wiring to a
> tiny follow-up — or run them in different batches. Safer split: move 3.20 to Batch 8.

---

## ▶ Batch 8 — 3.21 · 3.22 · 3.23

### v3.21 — Themed daily sets
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.21-themed-days; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.21. FILES I OWN: frontend/lib/themes.ts (extend), a new
frontend/lib/dailyMotif.ts. A cross-room motif day where every room pulls one theme.
END STATE: a dated motif reskins/feeds all rooms consistently. TOOLING: frontend-design.
STOP: themed days only.
```

### v3.22 — Audio room
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.22-audio-room; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.22. Route + qtype were registered in 3.0, so FILES I OWN:
frontend/app/<audio-room>/page.tsx (new), frontend/components/AudioRoomGame.tsx
(new), AudioRoom.module.css (new). "Name the intro" from Deezer 30s previews
(absorbs the retired Jukebox mechanic). One-screen + shareable. Verify one-screen
with chrome-devtools resize_page at 1280×800 and 1920×1080. END STATE: audio room
plays one-screen with share card; build green. TOOLING: brainstorming; frontend-design;
chrome-devtools; playwright. STOP: audio room only.
```

### v3.23 — Hard-mode Mystery
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.23-hard-mystery; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute GAMES.md §3.23. FILES I OWN: a new frontend/components/WeeklyCaseGame.tsx +
its route (registered in 3.0), WeeklyCase.module.css. A weekly multi-day cross-room
case. Keep solvable (vitest). END STATE: weekly case spans days + rooms, solvable,
build + tests green. TOOLING: brainstorming; frontend-design; vitest. STOP: weekly
case only.
```

---

## ▶ Batch 9 — 3.25 · 3.26

### v3.25 — Edge-cache daily reads
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.25-edge-cache; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: this segment touches the SHARED file lib/queries.ts — keep the change to
a thin per-day cache wrapper on the Séance/Ladder read paths ONLY; anything deeper
is a v3.0 follow-up, STOP and report it. Locate code with Explore /
cavecrew-investigator (serena NOT installed). Run
superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.25. FILES I OWN: frontend/lib/queries.ts (Séance/Ladder read
paths ONLY), the relevant route segment config. Per-day cache key so each daily
puzzle reads Neon once/day. END STATE: a repeat same-day read is cached. TOOLING:
context7 (Next caching); vercel:runtime-cache. STOP: caching only.
```

### v3.26 — Lighthouse CI gate
```
PARLOR (trivia-generator). Source of truth: docs/ (ROADMAP, GAMES, PIPELINE,
PLATFORM) + PHASE_PROMPTS.md. Read the relevant doc section first. Git: branch
off the latest `v3` as phase/3.26-lighthouse-ci; PR into `v3` only — never touch
`main`. Keep caveman + ponytail on; use rtk for git/file ops. THE CONFLICT
FIREWALL: edit ONLY the files in FILES I OWN; if you need a shared file, STOP and
report it as a v3.0 gap. Locate code with Explore / cavecrew-investigator (serena
NOT installed). Run superpowers:verification-before-completion before done.

Execute PLATFORM.md §3.26. FILES I OWN: .github/workflows/lighthouse.yml (new), docs.
A Lighthouse budget gate on PRs. END STATE: a regressing PR fails the budget.
TOOLING: vercel; chrome-devtools. STOP: CI gate only.
```
