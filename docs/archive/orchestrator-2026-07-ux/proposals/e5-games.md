# e5-games — per-game gameplay assessment (E5.4)

Scope: all games except Séance + Mystery. Judged vs `docs/v2/GAMES.md` intent. Impact×effort per item; each concrete enough to build blind. `/daily` = 3-line `redirect("/gauntlet")` stub — nothing to assess.

Cross-game pattern found everywhere: **replay/leaderboard integrity leaks** (day-seeded content + free restarts + no persistence = memorization farming) and **withheld feedback** (near-miss margins, rules, recaps computed but never shown). The chosen set leans on these two levers.

---

## /board — Codex

**Verdict**: Solid Jeopardy loop; 2.3 mostly shipped (theme reskin, host, settings, card-flip). Fun but flat — no risk/reward texture beyond the daily double; the easy/hard toggle is decorative, so a 25-cell clear drags.

**Weak spots**
- Hard mode has no payoff: `judge()` (`BoardGame.tsx:167`) stakes `cellValue(r)` identically in both modes; toggle is global + live mid-game → rational player flips easy on high-value cells.
- Forge choices unshuffled: `setChoices(cell.choices)` (`BoardGame.tsx:149`) verbatim — stable-slot leakage; fallback distractors use `Math.random` (per-player options on a "same board for everyone" game).
- Theme cosmetic only: `themedLabel` relabels columns; 2.3 "columns drawn to fit the theme" unimplemented.
- No end-of-board recap: missed clues vanish at the cleared screen.
- Daily double uniform over rows (`app/board/page.tsx:19`) — lands on $200 a fifth of the time.

**Improvements**
1. `[H×S]` Hard mode pays 2× — `BoardGame.tsx`: capture mode at `openCell` (per-cell, no post-open cheating); stake `cellValue(r) * (cellMode === "hard" ? 2 : 1)` in `judge()` (DD wager unmultiplied); "×2" in clue header; hard-cell count in share text.
2. `[H×S]` Deterministic choice shuffle — `BoardGame.tsx:148`: `shuffled(cell.choices, mulberry32(hashKey(cell.prompt)))` from `lib/rng` (wedges `dailyChoices` pattern). No determinism risk — hash-keyed.
3. `[M×M]` Missed-clues recap on clear — cleared block (~`BoardGame.tsx:686`): list `states[key]==="wrong"` cells as "category · $value — prompt → answer" (data already in `columns`+`states`).
4. `[M×S]` Weight DD to rows 3–5 — `app/board/page.tsx:19`: `2 + Math.floor(rand()*3)`. Same `rand()` call count → column pick unchanged; still day-seeded.

## /clock — Chronos

**Verdict**: Prettiest loop in the house; 2.4 parts all exist — but the calendar hint prints the answer and the game deduces the window for you, so "logic layer" collapses into slider-within-a-precomputed-window.

**Weak spots**
- Hint reveals the answer: `labelFor(calendar.key, truth)` (`ClockGame.tsx:392`) — Holocene/French-Republican/century are trivially invertible; dominant strategy = pay 20 pts, read answer, score 80×5.
- Game deduces for you: "deduced window" printed (`ClockGame.tsx:378`) and slider bounded to it + starts at center; parity/divisibility clues (`clockLogic.ts:47-69`) never affect the window — flavor text.
- Restart exploit: `restart()` (`ClockGame.tsx:208`) resets `recorded.current`, replays same five rounds → second `record()` + poisoned leaderboard. `pool` prop passed and never used.
- Replay pull thin: calendar twist changes chrome, not what you do.

**Improvements**
1. `[H×S]` Un-break the hint — `ClockGame.tsx:383-396`: window-narrowing hint `labelFor(key, decadeLo)`–`labelFor(key, decadeHi)` (`decadeLo = truth - truth % 10`); keep 80-pt cap. Deterministic (pure fn of truth).
2. `[H×M]` Make clues load-bearing — slider range = coarse half-century band (`clues[0].min/max`), delete the "deduced window" printout, start hands at band center. Scoring untouched; deterministic.
3. `[M×S]` Restart = practice — `restart()`: draw 5 fresh rounds from unused `pool` (`Math.random` fine, click handler); keep `recorded.current = true` so replays never re-record.
4. `[L×S]` Streak stake pre-lock — `ClockGame.tsx:411`: append "· next close +{streakBonus(streak+1)}".

## /wedges — Fractures

**Verdict**: Tightest quickfire loop on the site — 2.5 fully shipped (shared order, lockout, ghost, daily shatter, bonus round). One pacing landmine (unbounded bonus) and a mushy scoreboard keep it from great.

**Weak spots**
- Bonus round unbounded: `buildDailyWedges` (`lib/wedges.ts:55`) flattens the whole unserved MC pool into `bonus` — endless slog; share/leaderboard moment buried.
- Score ranked 0–6: `record({score: earned.size})` (`WedgesGame.tsx:284,415`) — the speed-bonus `points` system is computed then discarded; six-way ties everywhere.
- Bonus purpose unstated: it *is* a second chance at missed wedges but copy doesn't say so.
- Home blurb says "twenty questions"; actual max 18 (`PER_CATEGORY_MAIN=3`×6).
- "Play again" resets `recorded.current` on the same daily set.

**Improvements**
1. `[H×S]` Cap the bonus pool — `lib/wedges.ts:55`: `ordered.slice(PER_CATEGORY_MAIN, PER_CATEGORY_MAIN + 2)` → ≤12 bonus, still day-deterministic; update `wedges.test.ts`.
2. `[M×S]` Rank by points — `WedgesGame.tsx:284,415`: `record`/`LeaderboardPanel` use `points`; keep `earned.size` in share tiers. Guard replay: skip `record` on repeat `start()`.
3. `[M×S]` Sell the bonus — interlude (~`WedgesGame.tsx:333`): `!wonRing` → "N wedge(s) still dark — your second chance"; else "victory lap — pure points".
4. `[L×S]` Fix home blurb — `app/page.tsx`: "eighteen questions" or drop the count.

## /streak — Ignite

**Verdict**: 2.6 shipped in full (flame curve, accelerating timer, darkness finish); tension is real. Two leaks: reveal screen defuses the timer between every question, and relight replays the identical deck.

**Weak spots**
- Timer only runs in `"guessing"`; `reveal-win` waits indefinitely on a click — acceleration resets to zero each question.
- `start()` → `buildStreakDeck(pool)` identical all day; "relight" = memorization farming of best-streak + leaderboard.
- Reveal says "Brighter ✓" only — 2% gap and 40× gap read identically.
- Milestones (5/10/15) pass silently.

**Improvements**
1. `[H×S]` Auto-advance on correct — `StreakGame.tsx` `reveal-win`: `setTimeout(next, ~1200ms)`, click still skips; manual under `useReducedMotion`.
2. `[H×S]` Shuffle on relight — `start()`: first run of day keeps deterministic deck; subsequent runs shuffle with `Math.random` (click handler — legal). First-run determinism preserved.
3. `[M×S]` Show the gap on reveal — "≈2.3× higher" / "only 4% apart" from `value_a/value_b`.
4. `[M×S]` Milestone flares every 5th — flame bloom 800ms + `sfx.combo(8)` + microlabel; behind reduced-motion.

## /map — Atlas Obscura

**Verdict**: Pin-drop loop genuinely fun (dashed line, km readout, band label). But it carries a 7-day content loop — civ layer repeats verbatim within a week — and the map contributes least to the score in its own room.

**Weak spots**
- `civilizations.ts`: 7 civs × 2 hardcoded questions; `pickCivilization` random-picks → repeats within days, tangents memorized in a week.
- No persistence: `restart()` replays identical day-seeded rounds → leaderboard replay exploit (Gauntlet solved this; Map didn't).
- Scoring imbalance: MC tangents flat 0/100; pin rounds decay (~72 pts at 500 km) — the quiz outscores the map.
- Only 1 of 5 rounds guaranteed a pin; mostly a quiz.

**Improvements**
1. `[H×S]` Persist the daily run — `MapGame.tsx`: on `done`, save `{score, results, date}` to localStorage keyed `daySeed()` (Gauntlet `Saved` pattern); on load show finish screen; "new expedition" only under `practiceMode`.
2. `[H×M]` Widen civ pool — `civilizations.ts`: ~12 civs, 4–6 questions each; `civRounds` picks 2/day via `pickRotating` (day-seeded — safe).
3. `[M×S]` Cycle, don't roll — `pickCivilization`: `CIVILIZATIONS[dayIndex % length]`; deterministic, no repeats until full cycle.
4. `[M×S]` More pins — `app/map/page.tsx`: `pickRotating(pool, 3)`, cap MC tangents at 1/day (with #2).
5. `[L×S]` MC cap 80 pts — `choose()`: perfect pin outranks perfect trivia.

## /thread — Thread of Fate

**Verdict**: Rail UI, link explanations, hint economy — elegant. But one wrong free-text guess permanently kills a link (harshest fail on the loosest input), and the signature letter-chain mechanic is invisible.

**Weak spots**
- `handleGuess`: one wrong guess → instant `resolve("miss")` + answer revealed. No second attempt; typo = death.
- `isMatch` leaky AND strict: any 2+ char substring matches ("an" → "Antarctica"); article/plural on a correct answer can miss. `lib/fuzzy.ts` unused here.
- Letter chain (2.8's core hook) never surfaces in `ThreadGame.tsx` — shipped but mute.
- No persistence: refresh + replay with known answers; no come-back-tomorrow state.
- Theme finale = 4-choice MC with no cost tied to botched links; `fallbackThread` is a fake-link placeholder — what DB-less players see.

**Improvements**
1. `[H×S]` Two attempts per link — `attempts` counter; first wrong → shake, clear input, "not quite — one more stitch"; second wrong → current miss.
2. `[H×S]` Surface the letter chain — chip on the active link: `begins with "<last letter of prev answer>"` — guarded: only when `chain[i-1].answer` last char actually equals `chain[i].answer[0]`.
3. `[M×S]` Fix `isMatch` — require length ≥3 for substring, drop the first-word `includes` rule, route through `lib/fuzzy.ts`.
4. `[M×S]` Persist daily solve — localStorage keyed `daySeed()`, render `done` card on revisit (Gauntlet pattern).

## /gauntlet — The Gauntlet

**Verdict**: Best-structured daily on the site — continuous clock, hint-buys-time, traps, day lock; 2.12 essentially shipped. Gaps are integration (no profile/leaderboard) and a clock that times reading, not answering.

**Weak spots**
- Clock runs through `reveal` phases; time score partly measures click-through speed on non-game screens.
- Only room touching neither `useProfile().record()` nor `LeaderboardPanel`.
- `TRIAL` defines the Riddle Door (`clue`) but `app/gauntlet/page.tsx` never fetches `clue` questions — dead trial type.
- Binary gate results; miss-by-5 reads like miss-by-50 — best stories untold.

**Improvements**
1. `[H×S]` Wire profile + leaderboard — `GauntletGame.tsx`: on save, `record({room:"gauntlet", score: max(0, 600 − totalMs/1000), xp})`; add `<LeaderboardPanel room="gauntlet">` to `Results`.
2. `[H×S]` Pause clock during reveals — accumulate elapsed at `resolve()` into a ref; reset `segmentStart` in `next()`; show frozen total during reveal.
3. `[M×S]` Open the Riddle Door — page fetches `getQuestionsByType("clue")`, 6th trial via `pickRotating(cl,1,day+505)`; free-text branch with `lib/fuzzy.ts`, hint = first letter. Day-seeded — safe.
4. `[M×S]` Near-miss text in reveal — "missed by 7 years" / "412 km short".
5. `[L×S]` Best-escape line — `parlor:gauntlet:best` in localStorage.

## /ladder — Climb of the Initiate

**Verdict**: Grid (Queens) rungs genuinely good — tight deduction, satisfying Lock. But doors are read-a-visible-number trivial, the sequence `rule` is never revealed, resonance is decorative — the "cumulative ascent" fantasy doesn't cash out.

**Weak spots**
- Doors near-zero challenge: `makeDoor` predicates about a resonance value displayed in the HUD (`LadderGame.tsx:215`).
- Grid rungs can never collapse (complete + conflict-free = solution), so all collapse tension sits on sequence/door — door trivial, sequence a cheap 33% gamble.
- `rung.rule` (`ladder.ts:43`) exists, never shown — biggest missing feedback beat.
- No mid-climb persistence; refresh wipes a 7-rung Sunday climb.
- Whisper `truncate`d to one unreadable line (`LadderGame.tsx:218`).

**Improvements** (⚠ anything touching `generateLadder`/`make*` changes puzzle content → Neon `ladder_puzzles` archive regen + `ladder.test.ts` green; UI-only is safe)
1. `[H×S]` Reveal the rule — after correct sequence Lock flash "the Trickster's rule: {rung.rule}"; list all at Summit. Pure UI.
2. `[H×S]` Persist in-progress climb — localStorage `parlor.ladder.run.<date>` `{date, idx, elapsed, penalty, collapses, clean}`; hydrate on mount; timer resumes from saved elapsed.
3. `[M×S]` Hide resonance until earned — UI-only: pill shows "⟨?⟩" on door rungs; "recall" reveals after 10s hold or +15s penalty.
4. `[M×M]` ⚠regen Harden doors — predicates over carried resonances requiring arithmetic; keep exactly-one-true; extend tests.
5. `[L×S]` ⚠regen 4–5 sequence options. 6. `[L×S]` Un-truncate the whisper.

## /overture — The Overture

**Verdict**: Clever salvage of thin data; Heardle-shaped daily is right. But the daily is unlosable (6 tries × 6 choices = forced win) and solving never plays the full melody — the loop ends flat.

**Weak spots**
- `CFG.daily` `tries:6, choices:6` (`AudioRoomGame.tsx:37`) → elimination guarantees ≥20 pts; no stakes.
- No payoff playback on solve/fail — the melody you strained to identify is never heard whole.
- Not in `app/page.tsx` GAMES deck/ledger (nor `/cold-case`) — no discoverability, no replay pull.
- Set-mode `shuffled(titled).slice(0,5)` repeats tracks across runs.
- Verify `getQuestionsByType` has stable ORDER BY — distractor order depends on fetch order (shared-daily risk).

**Improvements**
1. `[H×S]` Victory playback — on `solved || failed`, auto-play full melody once (reuse `play()` with `reveal = cfg.tries`, skip clock).
2. `[H×S]` Daily losable — `CFG.daily` `tries: 4` (choices 6). Config, not seed — deterministic-safe.
3. `[M×S]` Set-mode rotation — localStorage ring of recent titles filtered before shuffle (`Math.random` in click-driven `start` is legal).
4. `[M×S]` Discoverability — Overture + Cold Case rows in the home ledger or a "side rooms" strip; deck stays 10.

## /cold-case — The Cold Case (weekly)

**Verdict**: Charming week-long meta-loop, provably solvable — but every clue eliminates exactly one named suspect, so it's cross-names-off-a-list. A calendar, not a case.

**Weak spots**
- Zero inference depth: `buildWeeklyCase` (`lib/weeklyCase.ts:157-166`) emits one "NOT {value}" per non-culprit; days 6–7 confirm what day 5 proved.
- ~10 s/day engagement: one sentence + one tap.
- Weekday-label bug: `WeeklyCaseGame.tsx:125,148` — epoch day 0 is a Thursday but `WEEKDAY` indexes from Sun; "opens Sun" labels wrong 100% of the time.
- No accusation risk/reward: day-2 gamble vs day-5 certainty differ only in share headline.
- Wrong accusation reveals culprit but not which clue you misapplied.

**Improvements** (⚠ clue-gen changes must keep `weeklyCase.test.ts` single-survivor-by-day-5; seeding stays `mulberry32(weekSeed…)`)
1. `[H×S]` Fix weekday labels — `WeeklyCaseGame.tsx:148`: `WEEKDAY[(weekStartDay + clue.day - 1 + 4) % 7]` (epoch Thursday = index 4).
2. `[H×M]` ⚠tests Real deduction — replace 2–3 elimination clues with relational forms eliminating multiple suspects; candidate pool → subtraction-method keep; extend `satisfies()` + uniqueness tests.
3. `[M×S]` Survivor counter + consistency tint — show "N suspects still fit" from exported `survivors()`; tint a struck-but-consistent suspect red.
4. `[M×S]` Early-bird stakes — verdict/share graded by `survivors` at accusation day: "cracked on day 2 against 4-to-1 odds".

## /daily — legacy stub

3-line `redirect("/gauntlet")` for old links (per 2.12). No action.

---

# Chosen set — ONE build unit (e5-improve)

All S-effort, no archive regen, no forge/dbt touch, determinism preserved (flags inline above). Two themes: **integrity** (kill replay farming) + **feedback** (show what's already computed). Update `wedges.test.ts` for item 5; run full DoD gate.

1. **board** — hard mode ×2 stake, captured at `openCell` (`BoardGame.tsx`)
2. **board** — deterministic choice shuffle via `hashKey(cell.prompt)` (`BoardGame.tsx:148`)
3. **clock** — hint becomes decade band, not the truth (`ClockGame.tsx:383-396`)
4. **clock** — restart = fresh practice from `pool`, never re-`record` (`ClockGame.tsx:208`)
5. **wedges** — cap bonus pool to +2/category (`lib/wedges.ts:55` + test)
6. **wedges** — rank leaderboard by `points`, guard repeat-`record` (`WedgesGame.tsx:284,415`)
7. **streak** — auto-advance reveal ~1200 ms (`StreakGame.tsx`)
8. **streak** — shuffle deck on relight, first run stays day-seeded (`StreakGame.tsx`)
9. **map** — persist daily run to localStorage, Gauntlet pattern (`MapGame.tsx`)
10. **thread** — two attempts per link (`ThreadGame.tsx`)
11. **thread** — letter-chain chip, guarded by actual chain check (`ThreadGame.tsx`)
12. **gauntlet** — wire `record()` + `LeaderboardPanel` (`GauntletGame.tsx`)
13. **ladder** — reveal `rung.rule` after sequence Lock + at Summit, UI-only (`LadderGame.tsx`)
14. **overture** — victory playback + `tries: 4` (`AudioRoomGame.tsx`)
15. **cold-case** — weekday label off-by-Thursday fix (`WeeklyCaseGame.tsx:148`)

# Backlog (next units)

- clock: load-bearing clues / half-century slider band `[H×M]`
- board: missed-clues recap `[M×M]`; DD row weighting `[M×S]`; blurb fix `[L×S]`
- map: 12-civ pool `[H×M]`; cycle civ `[M×S]`; 3 pins/day `[M×S]`; MC 80-pt cap `[L×S]`
- streak: gap-on-reveal `[M×S]`; milestone flares `[M×S]`
- thread: `isMatch` via fuzzy `[M×S]`; persist daily solve `[M×S]`
- gauntlet: pause clock in reveals `[H×S]` (deferred: needs care vs saved `totalMs` semantics); Riddle Door 6th trial `[M×S]`; near-miss text `[M×S]`
- ladder: persist climb `[H×S]` (deferred: timer-resume semantics); hide-resonance recall `[M×S]`; ⚠regen door hardening + 5th sequence option
- overture: set-mode rotation `[M×S]`; home ledger discoverability for overture + cold-case `[M×S]`; verify stable ORDER BY in `getQuestionsByType` distractor fetch
- cold-case: relational deduction clues `[H×M]` ⚠tests; survivor counter `[M×S]`; early-bird stakes `[M×S]`
