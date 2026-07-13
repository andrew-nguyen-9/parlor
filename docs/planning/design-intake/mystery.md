# Design Intake — Sanctum Mysterii (mystery)

> A daily deterministic deduction room: read the **Case File**, cycle each **suspect / scene / hour**
> pill through *potential → prime → cleared*, then accuse the one triple you have primed. No
> click-to-reveal — the answer is deduced. This questionnaire captures the decisions only YOU can make.
> For each question, tick an option, combine several, or write your own on the `Other:` line, then add
> free notes under `> USER NOTES:`. Grounded in `docs/v4/01_sanctum-mysterii.txt` +
> `frontend/components/MysteryGame.tsx`.

---

## 1. Setup

### Q1.1: What does the player see the instant a case opens?
- [ ] A) Case File already expanded on the left, evidence layers visible, board pills all blank
- [x] B) A closed folder / wax-sealed dossier the player "opens" to begin (one tap to reveal)
- [ ] C) The caseName + victim line front-and-center, Case File collapsed until tapped
- [ ] Other: __________________________________________
> USER NOTES:

### Q1.2: How are the three axes (The Suspects / The Scene / The Hour) introduced on first load?
- [ ] A) All three columns shown at once, every pill "potential"-neutral (as today)
- [ ] B) Suspects first; Scene and Hour unlock as the player tags their first pill
- [x] C) All three shown, but Hour stays dimmed until at least one timeline clue is read
- [ ] Other: __________________________________________
> USER NOTES:

### Q1.3: How much framing narrative wraps a new case?
- [ ] A) One line only (current: "The Order convenes over {caseName}. A guest lies dead…")
- [x] B) A short 2–3 sentence scene-setter (manor, weather, who found the body)
- [ ] C) No prose — just caseName + a victim tag; let the clues carry it
- [ ] Other: __________________________________________
> USER NOTES:

### Q1.4: Should the Case File open pre-filtered or fully expanded?
- [ ] A) All evidence layers expanded, filter set to "All"
- [ ] B) Only "The Timeline" layer expanded; deeper layers collapsed until opened
- [x] C) Collapsed to headers with counts; player expands each layer deliberately
- [ ] Other: __________________________________________
> USER NOTES:

### Q1.5: What seeds the daily case cast size (suspects × scenes × hours)?
- [ ] A) Fixed dimensions every day (e.g. 4×4×4)
- [x] B) Grows across the week per the Mon→Sun ramp (small Monday cast, large Sunday household)
- [ ] C) Randomized within a band, but always a unique single solution
- [ ] Other: __________________________________________
> USER NOTES:

### Q1.6: Should the daily "investigative surface" rotate (Relationship Web / Estate Map / Family Tree / Timeline)?
- [ ] A) No — keep the fixed three-axis board every day, rotate only clue flavor
- [x] B) Yes — swap in a themed surface per weekday while keeping the same deduction skill
- [x] C) Board stays, but an optional secondary tool appears when the case warrants it
- [ ] Other: __________________________________________
> USER NOTES:

---

## 2. Rules

### Q2.1: What is the pill cycle order and are all three states kept?
- [ ] A) Keep *potential → prime → cleared → (blank)* exactly as today
- [ ] B) Add a fourth "maybe/flagged" state between potential and prime
- [x] C) Collapse to two states only: *cleared* vs *prime*
- [ ] Other: __________________________________________
> USER NOTES:

### Q2.2: How does the player advance a pill vs. step it back?
- [x] A) Tap row/pill = forward; long-press or right-click = back (current)
- [ ] B) Tap = forward; a small reverse arrow on the pill = back (no long-press)
- [x] C) Tap cycles forward only; a "reset axis" button clears mistakes
- [ ] Other: __________________________________________
> USER NOTES:

### Q2.3: Should "prime" stay one-per-axis (priming a new value demotes the old to potential)?
- [ ] A) Yes — enforce exactly one prime per axis (current behavior)
- [x] B) Allow multiple primes; accusation just needs the correct one selected
- [ ] C) One prime per axis, but auto-clear the demoted pill instead of demoting to potential
- [ ] Other: __________________________________________
> USER NOTES:

### Q2.4: Should marking a pill "cleared" cross-eliminate related clues or pills?
- [ ] A) No cross-effects — clearing is a pure note, player reasons manually (current)
- [ ] B) Clearing a suspect dims clues that only concern them (visual assist only)
- [x] C) Offer an opt-in "auto-eliminate" helper that clears logically-forced pills
- [ ] Other: __________________________________________
> USER NOTES:

### Q2.5: How should the Truth & Deception layer surface (reliable vs. lying witnesses)?
- [x] A) Clue text names the reliability inline ("the butler never lies")
- [x] B) A per-witness credibility badge on movement/testimony clues
- [ ] C) Keep it purely in clue wording — no explicit markers, player infers
- [ ] Other: __________________________________________
> USER NOTES:

### Q2.6: How do clue search + filter behave (the Case File input + All/Suspects/Scene/Hour chips)?
- [ ] A) Keep free-text search + single-select axis filter (current)
- [x] B) Add multi-select filter chips (combine Suspects + Hour)
- [x] C) Add a "hide cleared" toggle so resolved evidence collapses away
- [ ] Other: __________________________________________
> USER NOTES:

---

## 3. Scoring

### Q3.1: Is there a score at all, or is it binary solved/unsolved?
- [x] A) Binary only — Case Closed vs. Cold Case (current)
- [ ] B) A star/rank based on how few wrong accusations were made
- [x] C) A detective score from accuracy + time + clues consulted
- [ ] Other: __________________________________________
> USER NOTES:

### Q3.2: How many accusation attempts does a player get?
- [ ] A) Exactly one — verdict locks for the day (current)
- [x] B) Up to three attempts, score decays with each miss
- [ ] C) Unlimited attempts, but the share card records how many it took
- [ ] Other: __________________________________________
> USER NOTES:

### Q3.3: Should partial correctness count (right culprit, wrong hour)?
- [ ] A) All-or-nothing — only a perfect triple is a win
- [x] B) Partial credit shown on the share grid (🟩/🟥 per axis, as today) but still a loss
- [ ] C) Partial credit awards a lesser "case reopened" tier
- [ ] Other: __________________________________________
> USER NOTES:

### Q3.4: What counts as a "good" result worth bragging about?
- [ ] A) Solved at all (a cold case is common)
- [ ] B) Solved on first accusation with no misses
- [x] C) Solved fast + with few clues consulted (efficiency flex)
- [ ] Other: __________________________________________
> USER NOTES:

### Q3.5: Should consulting fewer clues or reading fewer layers be rewarded?
- [ ] A) No — clue reading is free, never penalized
- [x] B) Track clues opened; a "deduced from N clues" flex on the verdict
- [ ] C) A soft efficiency badge, non-punitive
- [ ] Other: __________________________________________
> USER NOTES: There should be a calculated minimum number of clues needed (user should have no idea how many clues to ask for)

### Q3.6: Should a streak / archive persist across days?
- [ ] A) No streak — each day is standalone (current localStorage per date)
- [x] B) A solve streak counter like the other Parlor rooms
- [ ] C) A case-archive that stamps solved/cold cases with the date
- [ ] Other: __________________________________________
> USER NOTES:

---

## 4. Win / Lose

### Q4.1: What is the exact win condition?
- [x] A) Primed suspect + scene + hour all equal the solution (current)
- [ ] B) Same, plus every contradicting clue must be resolved/cleared first
- [ ] C) Same triple match, but the accusation must be "supported" by cited clues
- [ ] Other: __________________________________________
> USER NOTES:

### Q4.2: What happens on a wrong accusation (the "Cold Case ❄️" state)?
- [x] A) Reveal the true solution immediately and lock the day (current)
- [ ] B) Say "wrong" but hide the answer; let the player keep reasoning (if multi-attempt)
- [ ] C) Reveal only which axis was wrong, not the correct value
- [ ] Other: __________________________________________
> USER NOTES: Reasoning needs to be rock solid. Should also explain why the minimum number of clues had enough information to solve.

### Q4.3: On a win, how ceremonial is the reveal (Case Closed 🔓 + gold flourish + stinger)?
- [ ] A) Keep current: flourish ornament + audio stinger + verdict prose
- [x] B) Bigger moment — ink-spread animation across the board, wax seal breaks
- [ ] C) Understated — quiet gold accent, no sound
- [ ] Other: __________________________________________
> USER NOTES:

### Q4.4: After the verdict, what is the end-of-round board state?
- [ ] A) Board locked, truth pill marked ✦, wrong pick marked ✕ (current)
- [x] B) Board fades; Case File collapses to a solved summary
- [x] C) Board stays fully interactive as a read-only review of your reasoning
- [ ] Other: __________________________________________
> USER NOTES:

### Q4.5: What does the shareable result reveal vs. conceal?
- [x] A) Per-axis 🟩/🟥 + clue count, no spoilers (current)
- [ ] B) Also a spoiler-free difficulty/weekday tag
- [ ] C) Emoji grid only, no caseName (avoid spoiling friends)
- [ ] Other: __________________________________________
> USER NOTES:

---

## 5. Round / Turn Flow

### Q5.1: What is the core loop's pacing model?
- [ ] A) Untimed — read, tag, accuse at leisure (current)
- [x] B) Soft timer shown for the efficiency flex, no failure on timeout
- [ ] C) Optional "speedrun" mode toggled by the player
- [ ] Other: __________________________________________
> USER NOTES:

### Q5.2: Daily vs. free-play — what's offered?
- [x] A) One deterministic daily case only (current)
- [ ] B) Daily case + an archive of past days to replay
- [ ] C) Daily + an endless "practice manor" generator
- [ ] Other: __________________________________________
> USER NOTES:

### Q5.3: Should progress persist mid-solve if the player leaves?
- [x] A) Yes — tags + verdict restore from localStorage per date (current)
- [ ] B) Yes for tags, but never restore a locked verdict (always re-accuse)
- [ ] C) Add an explicit "clear my notes" reset button
- [ ] Other: __________________________________________
> USER NOTES:

### Q5.4: Should the evidence reveal be progressive (early facts → mid contradictions → late resolution)?
- [ ] A) All clues visible at once, grouped by layer (current)
- [x] B) Layers unlock as the player tags pills (staged reveal)
- [ ] C) All visible, but a "guided order" numbering nudges reading sequence
- [ ] Other: __________________________________________
> USER NOTES:

### Q5.5: Is there any onboarding for a first-time detective?
- [x] A) The single microlabel hint only ("tap a pill to mark…") (current)
- [x] B) A dismissible first-run tutorial overlay
- [x] C) An inline worked example on Monday's easy case
- [ ] Other: __________________________________________
> USER NOTES:

### Q5.6: How does mobile flow differ from desktop's three-column board?
- [ ] A) Same board stacked vertically (current responsive grid)
- [x] B) Swipe between Case File / Board / Accusation as bottom-sheets (per v4 mobile spec)
- [x] C) Sticky suspect summary + collapsible Case File
- [ ] Other: __________________________________________
> USER NOTES:

---

## 6. Difficulty

### Q6.1: How does difficulty scale across the week (Mon→Sun ramp in the spec)?
- [x] A) Follow the spec ramp: Mon small cast/single contradiction → Sun flagship household
- [ ] B) Flat difficulty every day, variety only in theme
- [ ] C) Player-selected difficulty independent of weekday
- [ ] Other: __________________________________________
> USER NOTES:

### Q6.2: What is the primary difficulty knob?
- [x] A) Cast size (more suspects × scenes × hours = larger grid)
- [x] B) Clue count and how many are contradictions vs. plain facts
- [x] C) Reliability noise — more lying/misremembering witnesses
- [ ] Other: __________________________________________
> USER NOTES:

### Q6.3: How should contradictions (Thursday's "evidence contradicts testimony") be tuned?
- [x] A) At most one contradiction chain early week, more later
- [x] B) Always solvable by elimination alone, contradictions optional shortcuts
- [x] C) Contradictions are load-bearing — must be resolved to reach the unique solution
- [ ] Other: __________________________________________
> USER NOTES:

### Q6.4: Should the minimum-clue-path (how tight the logic is) be guaranteed?
- [x] A) Always exactly one solution, no redundant clues
- [ ] B) One solution, with a few redundant confirming clues for reassurance
- [x] C) One solution, and never solvable by guessing before all axes are constrained
- [ ] Other: __________________________________________
> USER NOTES:

### Q6.5: Any assist / hint affordance for stuck players?
- [ ] A) None — pure deduction, no hints (current)
- [x] B) An optional "highlight a contradiction" nudge that costs score
- [ ] C) A non-scored practice-only hint, disabled on the daily
- [ ] Other: __________________________________________
> USER NOTES:

---

## 7. Visual / UX / Theme (per-game skin, E0)

### Q7.1: What is the room's dominant material palette?
- [x] A) Dark walnut + brass + candlelight (current `--c-candle`, history hex, gold accents)
- [ ] B) Cooler marble + ink + midnight blue for a colder crime feel
- [x] C) Occult tilt — deep oxblood, tarnished silver, faint arcane glow
- [ ] Other: __________________________________________
> USER NOTES: blend (occult for clues left by the dead)

### Q7.2: How much ambient motion (currently AmbientGlow + GrainFog + one dust ParticleField)?
- [ ] A) Keep exactly one animating loop (dust), bloom + grain static (current)
- [x] B) Add subtle candle-flicker on the glow
- [ ] C) Even quieter — freeze dust too, rely on stillness
- [ ] Other: __________________________________________
> USER NOTES:

### Q7.3: Should information panels become premium "objects" (folders, leather journals, wax-sealed dossiers)?
- [ ] A) Keep the current clean CollapsiblePanel rails
- [x] B) Skin panels as physical evidence folders / pinned correspondence per v4
- [ ] C) Hybrid — physical texture on the Case File only, board stays clean
- [ ] Other: __________________________________________
> USER NOTES:

### Q7.4: What microinteraction marks tagging a pill (currently a soft "place" sound)?
- [x] A) Keep the soft audio note only
- [x] B) Add a wax-seal-breaks visual on "prime", ink-spread on a correct final reveal
- [x] C) Paper-lift on hover + a subtle stamp on clear
- [ ] Other: __________________________________________
> USER NOTES:

### Q7.5: How should the evidence layers read visually (Timeline / Movements & Testimony / Alibis Cleared)?
- [x] A) Current: microlabel headers + hint text, numbered clue cards
- [x] B) Distinct visual treatment per layer (timeline rail, testimony quote-cards, struck-through alibis)
- [x] C) Layers as tabbed sections rather than a scroll
- [ ] Other: __________________________________________
> USER NOTES:

### Q7.6: What is the overall mood target?
- [x] A) Knives Out / Clue — witty, warm, cozy-luxe
- [ ] B) Dark academia — hushed, scholarly, secret-society
- [ ] C) Gothic occult — candlelit dread, subtle magic
- [ ] Other: __________________________________________
> USER NOTES:

### Q7.7: How prominent should the daily caseName + moon ornament header be?
- [x] A) Current display-serif title + gold moon ornament, understated
- [ ] B) A larger illustrated case-title plate (wax seal, date, weekday tone)
- [x] C) Minimal — small title, let the board dominate
- [ ] Other: __________________________________________
> USER NOTES:

---

## 8. Edge Cases

### Q8.1: How should the room behave under reduced-motion?
- [x] A) Freeze all atmosphere (glow/grain/dust) via each primitive's own contract (current)
- [x] B) Also suppress the win ink-spread / seal-break animations
- [x] C) Keep functional micro-feedback, drop only decorative loops
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.2: Behavior when audio is muted or blocked (ambient + sfx + stinger)?
- [x] A) Silently self-silence, game fully playable (current f1-audio contract)
- [ ] B) Show a small muted indicator so the player knows sound exists
- [x] C) Provide a visual equivalent for the win stinger
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.3: What happens when localStorage is unavailable (private mode / quota)?
- [x] A) Keep playing in-memory, no error (current try/catch)
- [x] B) Warn once that progress won't be saved
- [ ] C) Offer an export/copy of current notes as a fallback
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.4: What should the clue search show when nothing matches (empty state)?
- [x] A) Current line: "No clues match — try a different search or filter."
- [x] B) Also surface a one-tap "clear filters" affordance
- [x] C) Keep the message but grey out empty filter chips
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.5: If a daily puzzle fails to load / is malformed, what does the player see?
- [ ] A) Fall back to the seed-bank case, never a blank room
- [x] B) A themed "the archive is sealed tonight" holding screen
- [ ] C) Silently retry, then show yesterday's case as a stopgap
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.6: How to guard against accidental irreversible accusation (only one attempt)?
- [x] A) Disable "Make the accusation" until all three axes primed (current)
- [ ] B) Add a confirm step ("This locks the case — accuse?")
- [ ] C) No confirm — trust the primed-triple gate
- [ ] Other: __________________________________________
> USER NOTES:

### Q8.7: What if the player primes a triple that is logically impossible per the clues?
- [x] A) Allow it — the game only judges against the solution, not consistency (current)
- [ ] B) Warn softly that clues contradict this triple, still allow accusing
- [ ] C) Do nothing special; contradictions are the player's to catch
- [ ] Other: __________________________________________
> USER NOTES:
