# tech-motion — design-intake questionnaire

> **For the USER to fill in.** Area: the motion *engine* choice per room — **Framer Motion**
> vs **canvas/RAF** (Three.js `ThreeStage`, Phaser, hand-rolled `requestAnimationFrame`) vs
> **CSS-only** (keyframes/transitions). Each question is a per-game integration decision:
> *which engine drives which room's motion, where it's worth the cost, and where a room stays CSS-only.*
>
> **Locked floors — NOT up for a vote** (`design/INDEX.md §Floors`, `design/PATTERNS.md §Motion`):
> ≤1 infinite/looping animation per viewport · everything else finite ≤600ms · every named
> animation has a reduced-motion variant · WebGL rooms guard renderer creation + degrade to an
> accessible static/DOM frame (never white-screen) · animate only `transform`/`opacity`/`filter` ·
> one light source (`--gold-sheet`, viewport-fixed) + max one cursor-tracked element per screen
> (Streak's candle glow is the sanctioned second) · SSR-safe (no `Math.random()` in render).
> Your answers pick the ENGINE *within* those floors — never relax them.
>
> **Current reality (grounded):** Framer Motion is in Board, Wedges, Map, Seance (+Planchette),
> Thread, Ladder, Gauntlet, Streak, AudioRoom, Deck, TutorialOverlay, AchievementToast.
> Three.js via `ThreeStage`: Clock (gear-train), Map (starfield). Phaser canvas: Streak
> (candle+flame+rune grid). Hand-rolled RAF/canvas: `ParticleField`, `Confetti`.
>
> **Rooms in scope:** clock (Chronos) · streak (Ignite) · map (Atlas) · mystery (Sanctum) ·
> wedges (Fractures) · thread (Thread) · seance (Seance) — plus orphans board · daily · gauntlet · ladder.

---

## A. Engine-per-room baseline

### Q1: Default motion engine when a room needs NO physics/particles/3D — just entrance + feedback?
- [ ] A) CSS-only (keyframes/transitions) is the default; reach for Framer only when CSS can't express it
- [x] B) Framer Motion is the default everywhere for consistency (one mental model, `AnimatePresence` for exits)
- [x] C) CSS for entrance/idle, Framer only for orchestrated exit/reorder (`AnimatePresence`, layout animation)
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q2: Which rooms should stay strictly **CSS-only** (no Framer, no canvas) for their signature motion?
- [x] A) mystery (eye-glow), thread (chain links), ladder (rung climb) — all expressible in keyframes
- [ ] B) Only mystery — the rest keep Framer for reveal sequencing
- [ ] C) None — every room already imports Framer; don't fragment the toolset
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q3: Which rooms genuinely EARN a canvas/RAF or WebGL engine (vs. faking it in DOM/CSS)?
- [x] A) Only clock (gear-train) + map (starfield) + streak (flame) — the three 3D/particle rooms
- [x] B) Those three plus seance (candle particles / planchette drift)
- [x] C) Those three plus wedges (shattered-mirror shards)
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

---

## B. Framer Motion — where it's worth the bundle

### Q4: What is Framer Motion allowed to own (vs. plain CSS) across ALL rooms?
- [x] A) Only exits/presence + shared-layout reorder (`AnimatePresence`, `layout`) — CSS does entrances/idle
- [x] B) Entrances + exits + gesture (drag/tap springs) — Framer is the interaction layer, CSS is decoration
- [x] C) Anything spring-physics-shaped (planchette, wedge fill, deal-in); CSS only for micro-press
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q5: Deck deal-in + card flip-to-blurb (`Deck.tsx`) — engine?
- [x] A) Keep Framer (stagger + spring feel is the lobby's first impression)
- [x] B) Move to CSS staggered keyframes — deal-in is deterministic, no gesture needed
- [x] C) Framer for the flip gesture, CSS for the ambient deal-in
- [ ] Other: __________________________________________
> USER NOTES:

### Q6: Planchette drag (`seance/Planchette.tsx`) — spring engine?
- [ ] A) Framer drag + spring (natural weight; already there)
- [x] B) Hand-rolled RAF spring (drop the Framer dep from this leaf if it's the only user)
- [ ] C) CSS transition on pointer-move (cheapest; loses momentum)
- [ ] Other: __________________________________________
> USER NOTES:

### Q7: Wedges shattered-mirror ring fill (`WedgesGame.tsx`) — engine?
- [x] A) Framer per-shard spring (staggered wedge-by-wedge fill)
- [ ] B) CSS keyframe fill per wedge (no per-shard physics)
- [x] C) Canvas/RAF shard simulation (true shatter, heavier)
- [ ] Other: __________________________________________
> USER NOTES:

---

## C. Canvas / RAF / WebGL rooms — scope of the render loop

### Q8: Clock gear-train (`ThreeStage`, Three.js) — how much of the room is the render loop?
- [ ] A) Only the cogs are WebGL; dial skin, cast-year flap, HUD are DOM/CSS over the canvas
- [x] B) Whole play surface in Three.js (cogs + dial + flap as textured meshes)
- [x] C) Cogs in Three.js only when supported; CSS-SVG gear fallback is the primary and WebGL is the upgrade
- [ ] Other: __________________________________________
> USER NOTES:

### Q9: Streak flame (Phaser canvas, `StreakGame.tsx`) — keep Phaser or lighten?
- [ ] A) Keep Phaser (candle + flame bloom + rune grid + camera-shake in one engine)
- [x] B) Replace Phaser with hand-rolled RAF canvas (drop a heavy dep for one room)
- [ ] C) Keep Phaser for the flame, move the rune grid to DOM/CSS (Q&A legibility over canvas text)
- [ ] Other: __________________________________________
> USER NOTES:

### Q10: Map starfield (`ThreeStage`, ~1400 stars) — render-loop scope vs. DOM interaction?
- [x] A) Stars in Three.js, but tap-targets + numbered chip strip stay DOM (raycast only picks)
- [x] B) Everything (stars + selection gl/labels) inside the WebGL canvas
- [x] C) Stars as a static/RAF-drift canvas layer, selection entirely DOM on top
- [ ] Other: __________________________________________
> USER NOTES: You decide

### Q11: Should the two `ThreeStage` rooms (clock, map) share ONE renderer/init path, or diverge?
- [ ] A) Shared `ThreeStage` primitive + per-room scene — one guard/degrade path to maintain
- [x] B) Diverge — starfield and gear-train have little in common; duplicate is cheaper than abstraction
- [ ] Other: __________________________________________
> USER NOTES:

---

## D. The one-light-source & cursor-tracking rule

### Q12: Which single room owns the sanctioned SECOND cursor-tracked element (beyond `--gold-sheet`)?
- [ ] A) Streak's candle glow only (as currently sanctioned) — no other room tracks the cursor
- [x] B) Streak's candle + Séance's planchette-follows-pointer (two, both diegetic)
- [ ] C) Reassign it — Map's starfield parallax is the better cursor-tracked pick than Streak
- [ ] Other: __________________________________________
> USER NOTES:

### Q13: How does cursor-tracked motion degrade on touch / SSR / reduced-motion?
- [x] A) Resolve to the centered default (no tracking); pointer enhances only where `hover:hover`
- [x] B) Touch drives it via last-tap position (glow follows taps)
- [ ] C) Off entirely on touch; desktop-pointer garnish only
- [ ] Other: __________________________________________
> USER NOTES:

### Q14: When two motion engines coexist in one room (e.g. Framer HUD over a WebGL canvas), who owns the ONE loop?
- [x] A) The canvas owns the single looping animation; Framer is finite-only (entrances/exits ≤600ms) there
- [x] B) Budget is per-engine — canvas loop + one Framer loop is still "one per viewport" if visually merged
- [ ] C) Never mix a loop and a canvas in the same viewport; the HUD is fully static during play
- [ ] Other: __________________________________________
> USER NOTES:

---

## E. Orphan rooms (board · daily · gauntlet · ladder)

### Q15: Board 3D cell flip-to-reveal (`flip-scene`) — engine?
- [x] A) CSS 3D transform (`rotateY`, `transform-style: preserve-3d`) — no JS motion lib needed
- [x] B) Framer (spring flip + `AnimatePresence` for the reveal content)
- [x] C) CSS flip, Framer only for the daily board's deal-in stagger
- [ ] Other: __________________________________________
> USER NOTES:

### Q16: Gauntlet (`GauntletGame.tsx`) — it embeds a `WorldMap` pin-drop; motion engine for the run flow?
- [x] A) Framer for round-to-round transitions; the pin-drop map stays its own offline polygon render
- [x] B) CSS transitions between rounds (each round is a discrete screen swap)
- [x] C) Framer transitions + a shared results "line of squares" reveal
- [ ] Other: __________________________________________
> USER NOTES: you decide

### Q17: Ladder rung-by-rung climb + Thread chain-link reveal — same engine, or split?
- [ ] A) Both CSS staggered reveals (sequential, deterministic, no gesture) — no Framer
- [x] B) Both Framer (`AnimatePresence` staggered children) — reuse one reveal primitive
- [ ] C) Ladder CSS, Thread Framer (or vice-versa) — specify below
- [ ] Other: __________________________________________
> USER NOTES:

---

## F. Shared primitives, deps & budget

### Q18: `Confetti` + `ParticleField` (hand-rolled RAF canvas) — keep, or fold into an existing engine?
- [x] A) Keep hand-rolled RAF (tiny, zero dep, easy to gate on reduced-motion)
- [x] B) Fold into the Phaser/Three layer where a room already has one running
- [ ] C) Replace with CSS particle keyframes where count is small enough
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q19: Cross-room reveal/toast primitives (`AchievementToast`, `TutorialOverlay`) — one engine?
- [x] A) Framer owns all cross-room overlays (consistent enter/exit spring)
- [ ] B) CSS owns them (they're simple slide/fade; keep Framer for in-room play only)
- [ ] Other: __________________________________________
> USER NOTES:

### Q20: If a leaf component is the ONLY Framer user on its route, is dropping the dep worth it?
- [x] A) Yes — CSS/RAF it so that route ships no Framer (per-route bundle wins)
- [ ] B) No — Framer is app-wide already; a lone user costs ~nothing extra once loaded
- [ ] C) Only for the WebGL rooms (clock/map/streak) where every KB competes with the render loop
- [ ] Other: __________________________________________
> USER NOTES:

### Q21: Motion budget enforcement — how do we KEEP "≤1 loop per viewport" from regressing per room?
- [ ] A) A documented per-room "signature motion" table (in PATTERNS) is the contract; review gates it
- [ ] B) A lint/test that counts `infinite`/`animate` loops per route component
- [x] C) Both — table for intent + automated check for drift
- [ ] Other: __________________________________________
> USER NOTES:

### Q22: Reduced-motion static frame — who authors it per room, and is it engine-specific?
- [x] A) Each room ships a designed static frame first (lusion rule); engine just skips the loop
- [ ] B) Global `globals.css` kill-list is enough; no per-room static art
- [x] C) WebGL rooms get a hand-authored static poster; CSS rooms rely on the kill-list
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

---

> When done: hand back to the tech-motion implementer. Grounding used:
> `design/PATTERNS.md §Motion`, `design/INDEX.md §Floors`, live component tech
> (Framer / `ThreeStage` / Phaser / RAF usage). The `docs/research/animations.md`
> ref in the brief does not exist in-repo; substituted the live design corpus.
