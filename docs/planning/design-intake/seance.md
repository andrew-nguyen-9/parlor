# Séance — Design Intake Questionnaire

> **For the USER to fill in.** Séance (codename *Sanctum* / Ouija-board logic-grid) is a daily **logic grid puzzle**
> dressed as a Victorian séance: the matrix is transposed (seats = numbered columns 1..N, each category's values = rows),
> cells cycle **blank → snuffed candle (exclude) → glowing rune (confirm) → blank**, auto-elimination is derived, clues
> ("the spirit whispers") light up the cells they name, a living **planchette** leans toward each binding, wrong
> submissions are **Poltergeist Strikes (+60s)**, and completion is a reverent **Banished** ceremony that records to the
> grimoire. The v4 spec is emphatic: *the logic never changes* — most decisions below are about presentation, feedback,
> pacing, and framing, not new rules. Pick an option per question (combine or write your own); every question ends in
> `Other:`. Answer in the `> USER NOTES:` line.

---

## Setup

### Q: How should a Séance round open — what does the player see first?
- [ ] A) The full grid already laid out (all seats/categories visible), candles lit, clues in the left rail
- [ ] B) A dark table; candles ignite one by one and the grid fades in as the planchette settles to center
- [x] C) A "séance invitation" card (rite + spirit + backstory) the player must tap to "begin the séance," then the grid
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How prominent should the framing narrative (`rite`, `spirit`, `backstory`) be at the start?
- [x] A) Full-bleed intro moment — spirit name + backstory center stage before the puzzle
- [ ] B) Compact HUD line only (as today), backstory as a small caption
- [ ] C) Backstory hidden behind an "open the case file" tap, HUD shows just rite + spirit
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should any cell be pre-seated as a worked example on the very first puzzle a new player sees?
- [ ] A) No — always a blank board; the player learns by doing
- [x] B) Yes, one confirm pre-placed with a "the spirits offer a gift" label (first-ever play only)
- [x] C) A one-time interactive tutorial séance separate from the daily
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How is the clue list ("the spirit whispers") presented on first sight?
- [ ] A) All clues expanded in the left rail, plain list
- [x] B) Clues appear as torn parchment slips that flutter in one at a time
- [ ] C) Collapsed panel showing only the count; player expands to reveal
- [ ] Other: __________________________________________
> USER NOTES:

### Q: On mobile, where do the clues live relative to the grid?
- [x] A) Collapsible drawer above the grid (rail collapses to a bar)
- [ ] B) Bottom sheet the player pulls up over the grid
- [ ] C) Inline, clues stacked above, grid scrolls below (current vertical flow)
- [ ] Other: __________________________________________
> USER NOTES:

---

## Rules

### Q: The cell-cycle is blank → exclude → confirm → blank on tap. Keep three states on one control?
- [x] A) Keep exactly as-is (single tap cycles all three)
- [ ] B) Tap toggles exclude; long-press/second gesture sets confirm (fewer accidental confirms)
- [ ] C) Left-tap = confirm, right-click/two-finger = exclude
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Auto-elimination (confirming a cell auto-snuffs its row/column) is derived, never stored. How visible should the auto-X's be?
- [x] A) Render auto-X's identically to manual X's (indistinguishable — current behavior)
- [x] B) Auto-X's rendered dimmer / with a faint "the spirits did this" shimmer to distinguish machine vs. player marks
- [x] C) Let the player toggle auto-elimination on/off entirely
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Keep "Whisper mode" (a no-history scratchpad overlay for testing hypotheses)?
- [ ] A) Keep it, exactly as today (separate scratch board, triple-click clears scratch)
- [ ] B) Keep but make it visually distinct — scratch marks drawn in chalk/pencil vs. engraved real marks
- [x] C) Drop it — undo/redo history is enough
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Triple-click currently bulk-clears a cell's whole row + column (but spares confirmed cells). Keep this gesture?
- [ ] A) Keep triple-click bulk-clear as-is
- [ ] B) Replace with an explicit "sweep row/col" button on hover
- [x] C) Remove it — it's too easy to trigger by accident
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does tracing a clue (tapping it) relate to the grid?
- [ ] A) Highlight the named cells' columns (current: `hiCols` glow)
- [ ] B) Planchette physically drifts to point at the traced clue's region
- [x] C) Both — glow + planchette lean together
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the player be able to "flag a clue spent" (✓) and have it dim?
- [x] A) Keep as-is, with the "N more eliminations possible — mark done anyway?" confirm
- [ ] B) Keep flagging but drop the confirm prompt (silent)
- [x] C) Auto-dim a clue once no eliminations remain from it (no manual flag)
- [ ] Other: __________________________________________
> USER NOTES:

---

## Scoring

### Q: The score today is time (count-up "Ectoplasmic Decay" clock) + 60s per Poltergeist Strike. Keep time-as-score?
- [x] A) Keep pure time + strike penalty
- [x] B) Add a hint penalty (each hint = +Ns to the clock)
- [ ] C) Switch to a star/tier rating derived from time & strikes rather than a raw number
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What counts as a "good" score the UI should celebrate?
- [x] A) Under a fixed target time (e.g. sub-3:00) with zero strikes
- [ ] B) Beat the player's own personal best for that puzzle size
- [ ] C) Relative tiers (e.g. Novice / Adept / Medium / Grand Medium) shown at the end
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How heavy should the Poltergeist Strike penalty be?
- [ ] A) +60s each (as today)
- [x] B) Escalating (+30, +60, +120 …) to punish repeated wrong submits harder
- [ ] C) No time penalty — just cap the number of allowed submissions
- [ ] Other: __________________________________________
> USER NOTES: Add a cap of submissions too.

### Q: Should using a Hint affect the score at all?
- [ ] A) No — hints are free (as today)
- [x] B) Yes — a small time penalty per hint
- [ ] C) No score penalty, but hinted completions are marked (e.g. no "flawless" badge)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How much scoring history should the grimoire surface?
- [x] A) Just streak + spirits-banished count
- [ ] B) Per-puzzle time, strikes, and whether hints were used, as journal entries
- [ ] C) A distribution/curve of the player's solve times over the week
- [ ] Other: __________________________________________
> USER NOTES:

---

## Win / lose

### Q: What triggers the win? Today: manual **Submit** validates every seat has exactly one confirm matching truth.
- [x] A) Keep explicit Submit button (player declares the séance complete)
- [ ] B) Auto-detect completion the instant the grid is fully & correctly bound (no button)
- [ ] C) Auto-detect only when the grid is *full*; then validate on that (surfaces errors without a manual submit)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there a lose/fail state, or only "slower time"?
- [ ] A) No lose state — you always eventually banish the spirit; strikes just cost time (as today)
- [x] B) Hard fail after K Poltergeist Strikes ("the spirit escapes" — puzzle locks until tomorrow)
- [x] C) Soft fail — after K strikes the room offers to reveal the solution (marked as a forfeit)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The completion ceremony ("Banished" — reverent, planchette moves on its own, spirit fades). How long / how skippable?
- [x] A) Short reverent moment (~2–3s), auto-advances to the results card
- [ ] B) Longer cinematic (candles ignite, ghosts gather, board glows) with a "skip" affordance
- [ ] C) Ceremony plays once ever; on later daily wins it's a brief flourish
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the end-of-round results state show?
- [x] A) Time, strikes, and a share button (current)
- [ ] B) Add the **Spirit Memory** card — a historical séance / Victorian-spiritualism fact unlocked on completion
- [ ] C) Add a "the spirit's true identity revealed" reveal tying the solved grid back to the backstory
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What should the shareable result look like?
- [x] A) Emoji-grid style (time + strikes + tier), spoiler-free
- [ ] B) A "séance transcript" — a few themed lines (spirit banished in X, N strikes)
- [ ] C) Both, player's choice
- [ ] Other: __________________________________________
> USER NOTES:

---

## Round / turn flow

### Q: Daily vs. free-play — what's the model?
- [x] A) One shared daily séance for everyone + an archive of past nights (as today)
- [ ] B) Daily + an endless "practice séance" generator with no streak stakes
- [ ] C) Daily only
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Can a player retry / reset mid-puzzle without penalty?
- [x] A) Full undo/redo history + a Clear button (regret is one ⌘Z away) — as today
- [ ] B) Same, plus a "restart the séance" that also resets the timer
- [ ] C) Undo/redo only, no full clear
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the archive (past séances) be entered and browsed?
- [x] A) A calendar/date list ("the medium's journal" pages)
- [ ] B) An "old filing cabinet" of case files, one drawer per spirit
- [ ] C) Simple prev/next night arrows from the current puzzle
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should progress persist if the player leaves mid-séance and returns?
- [x] A) Yes — restore the exact board + timer (localStorage)
- [ ] B) Restore the board but reset the clock
- [ ] C) No persistence — leaving abandons the attempt
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Pacing of ambient supernatural events (ghosts drifting, candle flicker, etc.) during play?
- [ ] A) Rare & subtle — something every few minutes, never during active deduction
- [ ] B) Reactive only — events fire on correct/incorrect deductions, not on a timer
- [x] C) Both a slow ambient loop and reactive bursts
- [ ] Other: __________________________________________
> USER NOTES:

---

## Difficulty

### Q: How is daily difficulty set across the week?
- [ ] A) Fixed size every day (predictable)
- [x] B) Ramp — easier early week, hardest on weekend (spirit "strength" scales)
- [ ] C) Rotating spirit archetypes that each imply a difficulty
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The main difficulty knob is grid size (N seats × K categories, N ≤ 7). What range should ship?
- [ ] A) Small & tight (N=4, K=3) — quick daily solves
- [ ] B) Medium (N=5, K=4)
- [x] C) Varies by day within a set range (e.g. N=4→6)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What kinds of clues should the generator lean on (affects felt difficulty)?
- [x] A) Mostly direct positive/negative links (X is / isn't Y)
- [x] B) Mix in relational/ordering clues that require chaining several deductions
- [x] C) Include a few "flavor-heavy" clues where parsing the prose is part of the challenge
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How generous is the Hint system (reveals the clue(s) that force the next move, never the answer)?
- [ ] A) Unlimited hints, free (as today)
- [ ] B) Limited hints per séance (e.g. 3), then locked
- [x] C) Unlimited but each one visibly "costs" (time / no-flawless)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the room's atmosphere reflect certainty/difficulty (candles brighten as you approach the solution)?
- [x] A) Yes — the room gets *less* haunted / brighter as more cells are correctly bound
- [x] B) Opposite — pressure/vignette deepens with elapsed time only (current)
- [x] C) Both signals present but very subtle
- [ ] Other: __________________________________________
> USER NOTES:

---

## Visual / UX / theme

### Q: Overall material palette for panels (spec: ebony, walnut, aged gold, ivory, ghost blue; accent is `#7040a8` "the Medium")?
- [x] A) Dark walnut wood + worn brass + ivory parchment, restrained gold trim
- [x] B) Black velvet + faded gold foil + scratched glass overlays (more opulent)
- [ ] C) Keep it closer to the current flat Parlor cards, just re-tinted spectral
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How literal should the Ouija-board influence be?
- [x] A) Borrow the language subtly — alphabet engravings on borders, sun/moon corner ornaments, compass rose
- [ ] B) Strongly literal — the grid sits on a rendered Ouija board surface
- [ ] C) Minimal — a planchette + serif type is enough of a nod
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The planchette is the signature animated element. What's its resting behavior?
- [ ] A) Barely-perceptible idle drift + tiny rotations; leans toward each new binding (≤600ms, current)
- [ ] B) Parked at board center, only moves on deductions/hints/completion
- [x] C) Follows the player's most recent tap like a cursor companion
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How present should the ghosts be during normal play?
- [x] A) Companions, not rewards — occasional peeks/drifts at screen edges, never a jumpscare
- [x] B) Tied to progress — they grow more present/frequent as deductions land correctly
- [ ] C) Nearly absent during play, saved almost entirely for the completion ceremony
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Feedback on a correct deduction (a cell bound)?
- [x] A) Glass-clink sound + planchette lean + soft pulse on the affected row/col (current-ish)
- [x] B) Add a brief spirit-orb / spectral-dust burst + brass shimmer
- [ ] C) Keep it minimal — just the sound, no motion (calmer)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Feedback on an incorrect submission (Poltergeist Strike)?
- [ ] A) Table shake + wrong-sound (current)
- [x] B) Add: room darkens, cold mist rolls across, a ghost sigh, planchette hesitates
- [ ] C) Minimal — a red flash on the strike counter, no shake
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Typography direction?
- [x] A) Elegant Victorian serif headings + readable body, antique letter-spacing, decorative drop-initials
- [ ] B) Serif headings but keep the current Parlor body font for legibility
- [ ] C) Restrained — one serif accent face, everything else system
- [ ] Other: __________________________________________
> USER NOTES:

---

## Edge cases

### Q: Reduced-motion behavior (spec calls for "responsive motion tuned for accessibility")?
- [x] A) Freeze ambient sim (candles/dust/planchette drift), keep instant state changes, no shake, vignette frozen (current)
- [x] B) Also strip the completion cinematic down to a static "banished" card
- [x] C) Offer an in-game "calm the room" toggle independent of the OS setting
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Offline / zero-env (the app must be fully playable with no DB — seed bank)?
- [x] A) Always serve a playable daily from the seed bank; atmosphere runs fully client-side (required)
- [ ] B) Same, but show a subtle "playing from the archive" marker when offline
- [ ] C) Other: __________________________________________
> USER NOTES:

### Q: A requested archive date that was never generated ("dark state" — DB up, no row)?
- [x] A) Themed empty state: "No record of that night survives in the archive." (current)
- [ ] B) Offer the nearest available night instead
- [ ] C) Redirect silently to today's séance
- [ ] Other: __________________________________________
> USER NOTES:

### Q: If ambient effects would hurt performance on a weak device (particles / candle shaders)?
- [ ] A) Auto-degrade: drop particle count / disable shaders, keep the grid crisp and interactive
- [ ] B) A quality toggle (High / Balanced / Low atmosphere) the player controls
- [x] C) Both — auto-detect with a manual override
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What happens if the player submits an incomplete grid (not every seat bound)?
- [x] A) Treat as a normal wrong submit → Poltergeist Strike
- [ ] B) Block submit until the grid is full, with a "the spirits need every seat named" nudge (no penalty)
- [ ] C) Warn once, then allow the penalized submit
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Sound defaults & muting (ambient bed + interaction SFX)?
- [ ] A) Ambient starts on mount, silent under mute OR reduced-motion; a persistent mute control
- [x] B) Start muted by default; player opts into the séance soundscape
- [x] C) Ambient on, but require a first user interaction before any audio (autoplay-policy safe)
- [ ] Other: __________________________________________
> USER NOTES:
