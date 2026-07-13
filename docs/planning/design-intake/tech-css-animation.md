# Design Intake — CSS Keyframe / Transition BUDGET (per room)

> **For the USER to fill in.** This questionnaire elicits the *per-game* CSS-animation
> choices — which keyframe loops, which entrances, which micro-transitions each room
> spends its budget on — **inside** the locked floors. It does **not** re-litigate the floors.
>
> **Locked floors (NOT up for a vote — do not answer against these):**
> - **≤1 infinite/looping animation per viewport** — the room's single *signature* loop
>   (`design/PATTERNS.md §Motion`). Everything else is finite and ≤600ms.
> - **reduced-motion is a designed state** — the `@media (prefers-reduced-motion: reduce)`
>   block in `frontend/app/globals.css` (lines 356–384) kills every perpetual decorative
>   loop by name + a universal clamp (`animation-iteration-count:1`); a static frame stands in.
> - **perf floor** — animate only `transform`/`opacity`/`filter`; no full-viewport blur >120px;
>   the no-JS / seed-bank / reduced-motion frame must look complete without any of it.
> - **easing** — only two curves exist: entrances `cubic-bezier(0.22,1,0.36,1)`,
>   flips `cubic-bezier(0.2,0.8,0.2,1)`. No new curves.
>
> **Grounding (real files, real keyframes):** `frontend/app/globals.css` already ships
> `curtain-in` (`.page-enter`), `flicker` (`.animate-flicker`), `clock-swing` (`.clock-pendulum`),
> `flame-dance` (`.streak-flame`), `streak-darken`, `eye-glow`. `design/PATTERNS.md §Motion`
> owns the budget. The 7 games: **clock (Chronos), streak (Ignite), map (Atlas),
> mystery (Sanctum), wedges (Fractures), thread (Thread), seance (Seance)** — plus 4 orphan
> rooms **board / daily / gauntlet / ladder** where relevant.
>
> Mark `[x]`. Options are mutually exclusive unless noted; combine or write your own after `Other:`.

---

## A. The signature loop — which room spends its one perpetual animation, and on what

### Q1: Each room gets **at most one** infinite CSS loop. For rooms whose signature is a Three.js/Phaser canvas (clock gear-train, streak Phaser candle, map starfield), does that canvas **consume** the room's one-loop budget, or may a *tiny* CSS ambient loop (e.g. a background `drift`) also run?
- [ ] A) Canvas IS the loop — zero CSS keyframe loops in canvas rooms (strictest reading of ≤1)
- [ ] B) Canvas + one *sub-viewport* CSS loop allowed if it's off the play surface (chrome only)
- [ ] C) Case-by-case — decide per room in the matrix below (Q2)
- [ ] Other: __________________________________________
> USER NOTES:

### Q2: Confirm / reassign each room's **one** signature CSS loop (canvas rooms may answer "none — canvas owns it"):
| room | shipped/proposed signature loop | keep? | replace with | make it CSS-only (no canvas)? |
|------|--------------------------------|-------|--------------|-------------------------------|
| clock (Chronos) | `clock-swing` pendulum / gear-train canvas | | | |
| streak (Ignite) | `flame-dance` + Phaser candle | | | |
| map (Atlas) | starfield canvas drift | | | |
| mystery (Sanctum) | `eye-glow` seal pulse | | | |
| wedges (Fractures) | shattered-mirror ring fill | | | |
| thread (Thread) | chain-links reveal (finite, not a loop) | | | |
| seance (Seance) | `flicker` candle | | | |
- [ ] Other (global note): __________________________________________
> USER NOTES (per game):

### Q3: The global `.glow` drifting blob (`drift 18s infinite`, `globals.css:242`) currently runs app-wide. Where should it live?
- [ ] A) App-wide background on every room (it's chrome — counts against no room's per-viewport budget)
- [ ] B) Home / lobby only; game rooms drop it so the signature loop is unambiguous
- [ ] C) Only the wildcard rooms (gauntlet/seance) that have no strong diegetic loop
- [ ] Other: __________________________________________
> USER NOTES:

---

## B. Entrances — the room/board/card arrival animation

### Q4: The `.page-enter` curtain (`curtain-in`, 0.35s, 12px rise + fade) is the shipped page transition. Which rooms use it verbatim vs. a room-specific entrance?
- [ ] A) All rooms use `.page-enter` as-is — one consistent arrival, cheapest
- [ ] B) Immersive rooms (clock/streak/map/mystery/seance) get a themed entrance; orphans keep `.page-enter`
- [ ] C) Every room themes its own entrance (most bespoke, highest budget)
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q5: For rooms that reveal a **board/grid of cells** (board Codex, wedges, gauntlet, daily), how do cells enter?
- [ ] A) Whole board fades in as one block (single `curtain-in`, no per-cell cost)
- [ ] B) Staggered per-cell entrance (transform+opacity, ≤500ms total, capped stagger)
- [ ] C) No entrance — board is present on load (reduced-motion parity by default)
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q6: For rooms that reveal **clues/links one at a time** (thread chain-links, seance clue-by-clue, ladder rungs), each reveal is a finite transition. How much?
- [ ] A) Minimal: opacity fade only (≤200ms), no movement
- [ ] B) Opacity + short slide/scale in (transform, ≤350ms) with entrance easing
- [ ] C) Themed per room (chain "stitch", rung "climb", spirit "manifest") — bespoke keyframes
- [ ] Other: __________________________________________
> USER NOTES (per game):

---

## C. Feedback micro-transitions — answer / press / correct / wrong

### Q7: The selection/press state must be ≤150ms perceived and triple-encoded (color+shape+text). What's the CSS press treatment on answer buttons/cells across rooms?
- [ ] A) One shared utility (scale 0.97 + border/shadow shift, 120ms) reused everywhere
- [ ] B) Shared press, but correct/wrong get a room-tinted flash on top
- [ ] C) Per-room press character (e.g. board cell "flip-lift", wedge "shard-snap")
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q8: Wrong-answer feedback. Streak ships a Phaser camera shake (`streak-darken` finish). Do other rooms get a CSS "wrong" motion, and how strong?
| room | wrong-answer motion | none / tiny / shake+flash |
|------|--------------------|---------------------------|
| clock | | |
| streak | camera shake + darken (shipped) | |
| map | | |
| mystery | | |
| wedges | | |
| thread | | |
| seance | | |
- [ ] A) None get shake — wrong = static color/glyph change only (calmest)
- [ ] B) A single shared ≤250ms shake/flash utility, opt-in per room above
- [ ] Other: __________________________________________
> USER NOTES:

### Q9: Correct-answer / score-up feedback (points tick, wedge fills, streak increments). CSS budget?
- [ ] A) Number/pill transitions only (color + count, ≤300ms), no particle-y flourish
- [ ] B) A short one-shot "pop" keyframe (scale bounce, ≤400ms) on the earned element
- [ ] C) Room-diegetic (wedge fills its slice, streak flame brightens via `--flame`) — no generic pop
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q10: Overlay / results / deck-zoom enter+exit (Esc + backdrop close, focus-trapped). Transition?
- [ ] A) Backdrop fade + panel scale-from-95% (≤300ms), shared across all overlays
- [ ] B) Fade only — no scale (fastest, least layout thrash)
- [ ] C) Per-context (results "curtain", zoom "lift") bespoke
- [ ] Other: __________________________________________
> USER NOTES:

---

## D. Idle / ambient decorative motion (the part most at risk of over-budget)

### Q11: Beyond the one signature loop, do any rooms get **idle** decorative motion (slow shimmer, breathing glow, floating emblem) — knowing it counts against the ≤1-loop floor?
- [ ] A) No idle decoration anywhere — the signature loop is the only perpetual motion (strict)
- [ ] B) Idle allowed ONLY where there is no signature loop (thread/ladder/board/daily) to give them life
- [ ] C) Idle allowed but must be the *same* element as the signature (e.g. a glow that also is the loop)
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q12: The gilt/gold treatment uses one viewport-fixed `--gold-sheet` (no per-element shimmer — that was the multi-source look §3.2 removed). Reaffirm: any room want to spend budget re-introducing a *moving* gilt highlight?
- [ ] A) No — gold stays static/fixed everywhere (keep the one-light-source rule intact)
- [ ] B) One hero title per room may get a single slow sheen sweep on mount (finite, once)
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q13: Cursor-tracked decoration is capped at one element per screen state (Streak's candle glow is the sanctioned second). Does any other room want a cursor-tracked CSS effect?
- [ ] A) No — only Streak's glow; everyone else centered/static on SSR/touch/reduced-motion
- [ ] B) Yes, map (Atlas) — a subtle cursor parallax on the starfield chrome
- [ ] C) Yes, one other room: __________ (name it, decoration-layer only)
- [ ] Other: __________________________________________
> USER NOTES:

---

## E. Reduced-motion static frames (designing the floor, not disabling it)

### Q14: The global reduced-motion block already kills loops by name + clamps everything. Beyond that kill-list, does each room need a *designed* static frame (a deliberate still pose), or is "frozen mid-animation" acceptable?
| room | reduced-motion frame | frozen-ok / designed-still |
|------|---------------------|----------------------------|
| clock | pendulum + gears | |
| streak | flame @ 0.7 opacity (shipped) | |
| map | starfield | |
| mystery | eye-glow seal | |
| wedges | mirror ring | |
| seance | candle @ steady | |
- [ ] A) Frozen-mid is fine everywhere — no extra design work
- [ ] B) Each room ships a hand-tuned still (like streak's `opacity:0.7`) — more polish
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q15: New keyframes added by any room MUST also be added to the reduced-motion kill-list by name (belt-and-suspenders to the universal clamp, `globals.css:365`). Enforce how?
- [ ] A) Convention only — reviewer checks the kill-list on every new `@keyframes`
- [ ] B) A `selftest`/lint assertion: every `@keyframes` name appears in the reduced-motion block
- [ ] C) Prefer a shared `.motion-loop` class already covered by the kill-list — new names discouraged
- [ ] Other: __________________________________________
> USER NOTES:

---

## F. Budget policy & durations (global knobs)

### Q16: Confirm the finite-transition duration bands (`PATTERNS.md §Motion`): micro/press 100–150ms · transition 200–350ms · spatial deal/flip/zoom 300–500ms. Any room need to exceed?
- [ ] A) Bands are hard caps — no room exceeds 500ms for any finite transition
- [ ] B) Bands are defaults; one signature "hero" reveal per room may reach 600ms
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q17: Where a room's signature is a canvas (clock/streak/map), the **CSS** layer around it (chrome, HUD, chips) — what's its animation budget?
- [ ] A) Chrome is fully static — all motion lives in the canvas
- [ ] B) Chrome gets micro-transitions only (press/hover/reveal), no loops
- [ ] C) Chrome may carry the room's one loop IF the canvas doesn't animate idle
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q18: Orphan rooms (board/daily/gauntlet/ladder) have thinner diegetic identity. Motion posture for them?
- [ ] A) Utilitarian — entrance + press + reveal only, zero idle loop (fastest, calmest)
- [ ] B) Give each a *modest* signature loop to match the immersive rooms' richness
- [ ] C) Gauntlet (multi-room run) borrows each sub-room's motion; board/daily/ladder stay utilitarian
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q19: Global "motion density" dial — one sentence to guide every ambiguous per-room call above:
- [ ] A) **Restrained** — when in doubt, cut it; static reads as premium
- [ ] B) **Balanced** — signature loop + crisp feedback, no idle garnish
- [ ] C) **Lively** — spend the budget; every room should feel alive at idle
- [ ] Other: __________________________________________
> USER NOTES:

### Q20: Anything room-specific about CSS motion not captured above (a keyframe you want, one you want killed, a room that should feel unusually still or unusually alive)?
- [ ] Other / freeform: __________________________________________
> USER NOTES (per game):
