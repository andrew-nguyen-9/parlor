# map (Atlas / "Atlas Obscura") — design-intake questionnaire

> **For the USER to fill in.** This is NOT trivia and NOT the engine build. It captures the product
> decisions that will drive the Atlas engine rebuild. Atlas today is a **constellation LOGIC puzzle**:
> six star-and-line figures drift in a 3D starfield; a short list of purely-structural **omens** (star
> count, parity, line count, closed loop, hub star, connected pieces, brightest-star position) is
> satisfied by exactly one figure — the player reads the omens, rules out the rest, and *names the
> pattern*. No astronomy knowledge is used or rewarded. Answer inline; each `USER NOTES:` is yours.
>
> How to answer: tick one option, combine several, or write your own on the `Other:` line. Every
> question ends with `Other: ____`. Leave `USER NOTES:` blank if the ticked option says it all.

---

## Setup — how a round is seeded and what the player sees first

### Q1: What greets the player on the first frame, before they touch anything?
- [ ] A) All six constellations already drifting in the 3D starfield, omens panel open beside them
- [ ] B) Omens revealed one at a time with a beat of pause, then the six figures fade in
- [ ] C) A single "tonight's sky" title card (the `skyRegion` flavor) that dissolves into the field
- [ ] Other: __________________________________________
> USER NOTES:

### Q2: How many candidate constellations should a round show?
- [ ] A) Keep six (current 2-column grid of figures)
- [ ] B) Fewer early-week (4), scaling up to six by the weekend
- [ ] C) Always eight for more deduction surface
- [ ] Other: __________________________________________
> USER NOTES:

### Q3: How are the six figures arranged in space?
- [ ] A) Fixed 2×3 grid, each figure gently bobbing in place (current)
- [ ] B) Loose scattered cluster at varied depths, no grid
- [ ] C) Ring / arc the player's eye sweeps across
- [ ] Other: __________________________________________
> USER NOTES:

### Q4: How many omens seed a typical round?
- [ ] A) 3–4 (fast, forgiving)
- [ ] B) 4–6 (current feel — enough to force real elimination)
- [ ] C) Exactly as many as needed for a unique answer, no more
- [ ] Other: __________________________________________
> USER NOTES:

### Q5: Should the `skyRegion` line ("A Winter Sky", etc.) carry meaning or stay pure flavor?
- [ ] A) Pure flavor / mood only (current)
- [ ] B) Hints the theme of the figures shown that night
- [ ] C) Drop it entirely — less chrome
- [ ] Other: __________________________________________
> USER NOTES:

### Q6: What should the daily seed guarantee across all players?
- [ ] A) Identical figures, omens, and layout worldwide (fully deterministic — current intent)
- [ ] B) Same puzzle logic but per-player shuffled figure positions
- [ ] C) Same answer, but omen wording varies to deter answer-sharing
- [ ] Other: __________________________________________
> USER NOTES:

---

## Rules — the core interaction and allowed moves

### Q7: What is the primary way a player focuses a constellation?
- [ ] A) Tap the figure in the 3D scene (raycast) OR its numbered chip — both, mirrored (current)
- [ ] B) Numbered chips only; the 3D field is decorative
- [ ] C) Drag-to-orbit the whole field, then tap
- [ ] Other: __________________________________________
> USER NOTES:

### Q8: How central is the "rule out this one" elimination move?
- [ ] A) Core loop — encourage ruling out until one survives (current)
- [ ] B) Optional aid; a confident player can name immediately
- [ ] C) Auto rule-out: tapping an omen greys every figure it forbids
- [ ] Other: __________________________________________
> USER NOTES:

### Q9: When a player rules a figure out, what confirms it?
- [ ] A) Figure dims in 3D + chip greys (current)
- [ ] B) Above, plus a soft "cross-out" mark on the chip
- [ ] C) It drifts to the back of the field, out of the way
- [ ] Other: __________________________________________
> USER NOTES:

### Q10: Can a ruled-out figure be restored?
- [ ] A) Yes, freely, via "restore this one" (current)
- [ ] B) Yes, but each restore costs points
- [ ] C) No — ruling out is a committed decision
- [ ] Other: __________________________________________
> USER NOTES:

### Q11: Which structural omen KINDS should stay in the rotation?
- [ ] A) All current kinds: count, parity, line count, closed loop, hub star, connected pieces, brightest-star position
- [ ] B) Trim to the most intuitive (count, loop, brightest-star) for accessibility
- [ ] C) Add new structural kinds (symmetry, longest single line, star nearest center) — specify below
- [ ] Other: __________________________________________
> USER NOTES:

### Q12: How should an omen be phrased to the player?
- [ ] A) Plain imperative fact ("The pattern has an odd number of stars.") — current
- [ ] B) Riddle / omen voice ("An even hand traced this sky.")
- [ ] C) Toggle in settings between plain and flavor voice
- [ ] Other: __________________________________________
> USER NOTES:

### Q13: Should tapping an omen ever highlight which figures it eliminates?
- [ ] A) Never — deduction is the whole game (current)
- [ ] B) Only after a wrong guess, as a nudge
- [ ] C) Optional "assist mode" the player opts into
- [ ] Other: __________________________________________
> USER NOTES:

---

## Scoring — points, streaks, penalties

### Q14: What should the scoring formula reward?
- [ ] A) Keep `max(10, 100 − 25×wrong)` — clean, guess-count driven (current)
- [ ] B) Fewer, gentler penalties (−15 per wrong) so a slip isn't near-fatal
- [ ] C) Flat: solved-first-try vs not, no partial score
- [ ] Other: __________________________________________
> USER NOTES:

### Q15: Is a wrong guess penalized twice (points AND auto rule-out)?
- [ ] A) Yes — wrong guess costs points and rules that figure out (current)
- [ ] B) Points only; the figure stays selectable
- [ ] C) Rule-out only; no numeric penalty at all
- [ ] Other: __________________________________________
> USER NOTES:

### Q16: What counts as a "good" score worth celebrating?
- [ ] A) 100 = first-guess solve; the share mark 🟩 already reflects zero-wrong
- [ ] B) Any solve under 3 guesses (🟨 band)
- [ ] C) Introduce named tiers (e.g. "Clear Sky" / "Overcast")
- [ ] Other: __________________________________________
> USER NOTES:

### Q17: Should time-to-solve factor into scoring?
- [ ] A) No — Atlas is calm, untimed by design (spec pillar)
- [ ] B) Track time for stats only, never for score
- [ ] C) Optional speed bonus for players who want it
- [ ] Other: __________________________________________
> USER NOTES:

### Q18: How should a daily streak be defined?
- [ ] A) Solved today (at any score) extends the streak
- [ ] B) Only a first-guess (🟩) solve extends it
- [ ] C) Solve within the day's allotted guesses (see win/lose)
- [ ] Other: __________________________________________
> USER NOTES:

---

## Win / lose — win condition, fail condition, end state

### Q19: What is the win condition?
- [ ] A) Name the one figure satisfying every omen (current)
- [ ] B) Above, but must also have ruled out all five others first
- [ ] C) Name it AND correctly identify one omen that eliminates a decoy
- [ ] Other: __________________________________________
> USER NOTES:

### Q20: Is there a lose condition at all?
- [ ] A) No hard fail — keep guessing until solved, score just erodes (current)
- [ ] B) Capped guesses (e.g. 3); running out ends the round unsolved
- [ ] C) Soft fail: after N wrong, the answer is revealed but streak breaks
- [ ] Other: __________________________________________
> USER NOTES:

### Q21: What does the winning reveal look like?
- [ ] A) Figure name banner + confetti + calm stinger swell (current)
- [ ] B) Solution figure brightens, its lines re-trace, THEN the name — earned reveal (spec)
- [ ] C) Above, plus the other five dim to near-black
- [ ] Other: __________________________________________
> USER NOTES:

### Q22: After solving, should the puzzle stay interactive?
- [ ] A) Locked win screen with the name + score + share (current)
- [ ] B) Free-look: player can orbit the solved figure before sharing
- [ ] C) Auto-advance to an educational card about the real constellation
- [ ] Other: __________________________________________
> USER NOTES:

### Q23: What should the shared result string convey?
- [ ] A) Date, 🟩/🟨/⬛ mark, guesses, score, pattern name (current)
- [ ] B) Above minus the pattern name (avoid spoiling the day's answer)
- [ ] C) Emoji-only grid, no words, Wordle-style
- [ ] Other: __________________________________________
> USER NOTES:

---

## Round / turn flow — pacing, retries, daily vs freeplay

### Q24: What is the turn rhythm?
- [ ] A) Focus → (rule out) → name, repeat freely until solved (current)
- [ ] B) One "commit" per omen: work omen-by-omen, eliminating as you go
- [ ] C) Untimed free exploration, single final "name it" commit
- [ ] Other: __________________________________________
> USER NOTES:

### Q25: Should Atlas offer freeplay beyond the daily puzzle?
- [ ] A) Daily only, plus an archive of past days (spec: Daily + Archive)
- [ ] B) Daily + an endless "practice" generator
- [ ] C) Daily + difficulty-picker freeplay (Mon-easy … Sun-hard on demand)
- [ ] Other: __________________________________________
> USER NOTES:

### Q26: How should the archive of past puzzles behave?
- [ ] A) Replayable, but archived solves don't touch today's streak/stats
- [ ] B) Read-only gallery of solved patterns (collection, spec §Progression)
- [ ] C) Both: replay for fun + a permanent solved-constellation collection
- [ ] Other: __________________________________________
> USER NOTES:

### Q27: Should there be any hint system, and how restrained?
- [ ] A) None — pure deduction (current build has no hints)
- [ ] B) One late, opt-in hint: dim one clearly-wrong figure (costs points)
- [ ] C) Progressive: shimmer → highlight an omen → mark a decoy (spec §Hints)
- [ ] Other: __________________________________________
> USER NOTES:

### Q28: When the day rolls over, what happens to an unfinished round?
- [ ] A) It's replaced by the new day's puzzle; yesterday moves to archive
- [ ] B) Yesterday stays resumable until solved, streak-neutral
- [ ] C) Auto-marked unsolved (breaks streak) and archived
- [ ] Other: __________________________________________
> USER NOTES:

### Q29: Should progress persist if the player leaves mid-round?
- [ ] A) Yes — restore selection + ruled-out set from localStorage
- [ ] B) Restore only the win/score outcome, not in-progress state
- [ ] C) No persistence; refresh restarts the round (still same daily puzzle)
- [ ] Other: __________________________________________
> USER NOTES:

---

## Difficulty — how hard, how it scales, the knobs

### Q30: How should difficulty scale across the week?
- [ ] A) Monday easy → Sunday master, per Parlor cadence (spec)
- [ ] B) Flat difficulty every day; only the figures change
- [ ] C) Player-chosen difficulty; ignore the weekday
- [ ] Other: __________________________________________
> USER NOTES:

### Q31: Which knob most controls difficulty?
- [ ] A) Number of omens needed to isolate the answer
- [ ] B) How similar the six figures are (near-identical star counts / shapes)
- [ ] C) Subtlety of the discriminating omen (e.g. brightest-star position vs raw count)
- [ ] Other: __________________________________________
> USER NOTES:

### Q32: How "close" should the decoy figures be to the answer?
- [ ] A) Each decoy fails exactly one omen — tight, every omen matters
- [ ] B) Some decoys fail obviously; one is a near-twin of the answer
- [ ] C) Mixed by weekday: loose early, near-twins on the weekend
- [ ] Other: __________________________________________
> USER NOTES:

### Q33: Should harder days use harder-to-read omen KINDS?
- [ ] A) Yes — early week leans count/loop; weekend leans hub/components/brightest
- [ ] B) All kinds available any day; difficulty comes from figure similarity
- [ ] C) Restrict weekend to only the two subtlest kinds
- [ ] Other: __________________________________________
> USER NOTES:

### Q34: Should figure complexity (star/line count) grow with difficulty?
- [ ] A) Yes — denser figures with more lines on harder days (spec: dense fields)
- [ ] B) Cap complexity for legibility; difficulty from omens only
- [ ] C) Grow star count but keep lines sparse so figures stay readable
- [ ] Other: __________________________________________
> USER NOTES:

### Q35: Should the generator guarantee a UNIQUE answer every day?
- [ ] A) Yes, always — validate that exactly one figure survives all omens (non-negotiable)
- [ ] B) Yes, and also guarantee at least one decoy is a near-twin
- [ ] C) Allow rare double-answer days where either counts
- [ ] Other: __________________________________________
> USER NOTES:

---

## Visual / UX / theme — Atlas's per-game skin (E0)

### Q36: What is Atlas's core mood?
- [ ] A) Calm luxury planetarium — deep space, glass panels, quiet motion (spec)
- [ ] B) Cold, precise star-chart / cartographer's table
- [ ] C) Warm, mythic almanac — parchment omens over a night sky
- [ ] Other: __________________________________________
> USER NOTES:

### Q37: How should the accent color (`#178b99`, geography teal) be used?
- [ ] A) Keep teal — omen numbers, selection ring, confirm button (current)
- [ ] B) Shift to a cooler star-blue for a colder sky
- [ ] C) Keep teal for UI but let solved figures glow warm gold
- [ ] Other: __________________________________________
> USER NOTES:

### Q38: How much should the constellations move before they're solved?
- [ ] A) Gentle bob + micro-rotation, whole-sky twinkle (current)
- [ ] B) Nearly still — motion only on selection/reveal
- [ ] C) Slow drift with parallax depth between near/far figures
- [ ] Other: __________________________________________
> USER NOTES:

### Q39: How should a focused (selected) figure read against the rest?
- [ ] A) Selected brightens to blue-white + aura; others stay normal (current)
- [ ] B) Selected stays lit, all others dim — spotlight
- [ ] C) Selected lifts forward in depth
- [ ] Other: __________________________________________
> USER NOTES:

### Q40: Where should omens and controls sit on screen?
- [ ] A) Omens in a left collapsible panel, chips + action bar below the field (current)
- [ ] B) Omens as a bottom sheet, field full-bleed above
- [ ] C) Omens overlaid as floating glass cards in the scene
- [ ] Other: __________________________________________
> USER NOTES:

### Q41: What should the background starfield contribute?
- [ ] A) Subtle far stars + slow rotation, understated so figures dominate (current)
- [ ] B) Layered nebula / dust depth for richness (spec §Background)
- [ ] C) Near-black void; figures float with almost no backdrop
- [ ] Other: __________________________________________
> USER NOTES:

### Q42: How loud should audio be?
- [ ] A) Minimal: ambient bed, tiny focus cues, restrained solve stinger (current)
- [ ] B) Ambient bed only, no interaction SFX
- [ ] C) Fully silent by default, opt-in sound
- [ ] Other: __________________________________________
> USER NOTES:

---

## Edge cases — offline, reduced motion, WebGL-degrade, empty / error states

### Q43: With WebGL unavailable or raycast failing, what's the fallback?
- [ ] A) Numbered chips + omens fully play the puzzle in the DOM (current guarantee)
- [ ] B) Above, plus a flat 2D SVG rendering of the six figures
- [ ] C) A message telling the player to enable WebGL
- [ ] Other: __________________________________________
> USER NOTES:

### Q44: Under `prefers-reduced-motion`, how should the scene behave?
- [ ] A) Designed still — no bob/twinkle/confetti; chips carry live state (current)
- [ ] B) Still scene but keep a single gentle solve fade
- [ ] C) Skip the 3D entirely; render the 2D fallback
- [ ] Other: __________________________________________
> USER NOTES:

### Q45: When an archived date has no puzzle row (DB connected, empty), what shows?
- [ ] A) "No star chart survives for that night" flavor empty-state (current)
- [ ] B) Offer the nearest available archived date instead
- [ ] C) Generate one inline on the fly from the committed catalog
- [ ] Other: __________________________________________
> USER NOTES:

### Q46: With zero env vars / no network, what must always hold?
- [ ] A) Full playable puzzle from the committed `star-catalog.json`, deterministic (CLAUDE.md rule)
- [ ] B) Above, and identical to what an online player sees that day
- [ ] C) A reduced "practice" puzzle only
- [ ] Other: __________________________________________
> USER NOTES:

### Q47: What if the player rules out all six figures (including the answer)?
- [ ] A) Confirm is disabled; a nudge invites restoring one (deduction slipped)
- [ ] B) Auto-restore the last one so a valid guess is always possible
- [ ] C) Allow it — they simply can't win until they restore
- [ ] Other: __________________________________________
> USER NOTES:

### Q48: On a tiny mobile screen, what's the layout priority?
- [ ] A) Field compact on top, omens collapsed, chips + actions thumb-reachable (current)
- [ ] B) Omens first (scroll), field second — reasoning over spectacle
- [ ] C) Tabbed: swap between "sky" and "omens" views
- [ ] Other: __________________________________________
> USER NOTES:
