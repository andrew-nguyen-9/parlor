# tech-reduced-motion — per-game DESIGNED static frame (design-intake questionnaire)

> **For the USER to fill in.** This decides, per room, what the *reduced-motion* and *no-WebGL* fallback
> actually LOOKS like — the "designed still state," not an accident of turning motion off. Tick / combine /
> write your own; every question ends in `Other: ____`. Answers wire the fallback INTO each engine.
>
> **Locked floors — NOT up for a vote (INDEX §Floors), your job is the choices *within* them):**
> - No-WebGL, WebGL-error, or `prefers-reduced-motion` must **never white-screen** a route — it degrades to an
>   accessible static frame or a DOM-HUD control surface (Streak's Phaser-degrade is the template).
> - "the zero-JS / seed-bank / reduced-motion render IS the design" · Q&A legibility overrides every effect ·
>   ≤1 looping animation per viewport · one light source · every named animation has a reduced-motion variant.
> - The static frame must render **complete on its own**; effects/imagery are optional garnish.
>
> **How the code decides today (grounding, so answers cite reality):**
> - `ThreeStage.tsx` reads `prefers-reduced-motion` once at mount → renders **one still `renderer.render()` frame,
>   no RAF, no `onFrame`**; re-renders that still on resize. On no-WebGL (`new WebGLRenderer` throws) it swaps to a
>   `role="img"` DOM notice: *"3D view unavailable here — the room still plays with the controls below."*
> - `useReducedMotion.ts` (atmosphere hook) → primitives freeze particles / drop RAF; tracks live OS toggle.
> - `globals.css` `@media (prefers-reduced-motion)` freezes the Streak flame (`opacity:0.7`, no darken sweep),
>   kills named perpetual keyframes, and universally clamps duration to `0.01ms` + iteration-count to `1`.
> - **Render tech per room** (who even HAS a fallback to design):
>   WebGL/`ThreeStage` → **Clock** (Chronos gear-train), **Map** (Atlas starfield/constellation).
>   Phaser/canvas render layer → **Streak** (Ignite flame). Fluid/`FluidStage` → **Séance**.
>   `ParticleField` (DOM/canvas atmosphere) → Clock, Streak, **Mystery** (Sanctum), **Wedges** (Fractures).
>   `framer-motion` only (no WebGL) → **Thread**, **Board**, **Gauntlet**, **Ladder** (+ Map/Streak/Séance/Wedges).

---

## A. Fallback philosophy (global, sets the default each room can override)

### Q1: Should the reduced-motion frame and the no-WebGL frame be the SAME artifact, or diverge per room?
- [x] A) Same designed still for both — one frame to author & QA per room (simplest)
- [ ] B) Diverge: reduced-motion = a frozen *frame of the live scene*; no-WebGL = a bespoke non-3D still (SVG/CSS)
- [ ] C) Per-room call (Clock same, Map diverges, etc. — fill the matrix in Q9)
- [ ] Other: __________________________________________
> USER NOTES:

### Q2: How is each static frame authored — snapshot vs bespoke illustration?
- [x] A) **Snapshot** the live 3D/canvas scene at a hand-picked "hero" pose (`ThreeStage` already renders one)
- [x] B) **Bespoke still** per room (a designed SVG/CSS engraving, not a paused animation)
- [x] C) **Pre-rendered poster** — bundle a static PNG/WEBP per room, shown when motion/WebGL is off
- [ ] Other: __________________________________________
> USER NOTES:

### Q3: If any poster images are bundled (Q2-C), what's the offline/CSP budget?
- [x] A) No raster posters — CSS/SVG only (keeps zero-network, no asset weight)
- [ ] B) One small (<40KB) inlined data-URI poster per WebGL room only (Clock, Map)
- [ ] C) Poster per immersive room, lazy-loaded, with a CSS placeholder underneath
- [ ] Other: __________________________________________
> USER NOTES:

### Q4: The "one light source / one focal element" rule — what single element must survive in each still?
- [x] A) The room's signature object (Clock→gear face, Map→constellation, Streak→ember, Séance→scrying pool)
- [x] B) Only the Q&A/HUD surface; decorative focal drops entirely in the static frame
- [ ] C) Signature object rendered flat (mono line-art) + the HUD, nothing else
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

---

## B. The two WebGL rooms — Clock & Map (they have the most to lose)

### Q5: `/clock` (Chronos) — what does the gear-train show when frozen (reduced-motion) vs absent (no-WebGL)?
- [x] A) Reduced-motion: gears rendered, motionless at a pleasing pose · No-WebGL: the current DOM notice + controls
- [x] B) Both: a flat SVG clock-face / gear engraving behind the guess controls (no 3D at all)
- [ ] C) Static frame is minimal — just the timeline/scrubber HUD, no gear imagery
- [ ] Other: __________________________________________
> USER NOTES:

### Q6: `/map` (Atlas) — the starfield-constellation puzzle already has a `world-atlas` polygon fallback. What's the reduced-motion still?
- [x] A) Frozen constellation (stars placed, no twinkle/drift) over the static polygon map
- [ ] B) Drop the starfield entirely under reduced-motion; show the flat polygon map + pins only
- [x] C) Constellation lines drawn as a static SVG overlay; stars as plain dots
- [ ] Other: __________________________________________
> USER NOTES:

### Q7: The no-WebGL DOM notice copy/treatment (currently a `role="img"` microlabel) — keep or upgrade per room?
- [ ] A) Keep the shared generic line for all WebGL rooms (least work, already accessible)
- [x] B) Room-specific copy ("The mechanism rests — set the year below" / "The stars are dim — chart from the map")
- [x] C) Replace the text notice with a static illustrated panel (ties to Q2-B/C)
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q8: Should players get a manual "reduce motion / disable 3D" toggle in-room, beyond the OS setting?
- [ ] A) No — OS `prefers-reduced-motion` is the only source of truth (least surface)
- [x] B) Yes, a per-session toggle in the room chrome that forces the static frame
- [x] C) A global site setting (persisted to localStorage) honored by every room
- [ ] Other: __________________________________________
> USER NOTES:

---

## C. Per-game static-frame matrix (the core decision)

### Q9: For EACH room, pick the fallback shape (F=frozen live scene · B=bespoke still · P=pre-rendered poster · H=HUD-only, no imagery):
| Room | Live tech | reduced-motion frame | no-WebGL / no-canvas frame |
|------|-----------|----------------------|-----------------------------|
| Clock (Chronos) | WebGL gears | ☐F ☐B ☐P ☐H | ☐B ☐P ☐H |
| Map (Atlas) | WebGL stars + polygons | ☐F ☐B ☐P ☐H | ☐B ☐P ☐H (polygons always) |
| Streak (Ignite) | Phaser flame | ☐F ☐B ☐P ☐H | ☐B ☐P ☐H |
| Séance (Sanctum) | Fluid stage | ☐F ☐B ☐P ☐H | ☐B ☐P ☐H |
| Mystery | ParticleField | ☐F ☐B ☐H | ☐B ☐H |
| Wedges (Fractures) | ParticleField + FM | ☐F ☐B ☐H | ☐B ☐H |
| Thread | framer-motion | ☐F ☐B ☐H | n/a (no WebGL) |
> USER NOTES:
> Other: __________________________________________

### Q10: `ParticleField` under reduced-motion — freeze in place, thin out, or remove?
- [ ] A) Freeze at current positions (already the hook's behavior) — texture stays, motion stops
- [ ] B) Reduce to a sparse static scatter (fewer dots, no RAF) — lighter, calmer
- [x] C) Remove entirely — flat background token only, per room
- [ ] Other: __________________________________________
> USER NOTES (per game — Clock/Streak/Mystery/Wedges may differ):

### Q11: `/streak` (Ignite) flame is already frozen to `opacity:0.7`. Is that the intended still, or bespoke?
- [ ] A) Keep the frozen dimmed flame as-is (matches the "ember at rest" read)
- [ ] B) Swap to a bespoke static ember/coal illustration under reduced-motion
- [x] C) Drop the flame; keep only the streak counter + tower HUD
- [ ] Other: __________________________________________
> USER NOTES:

### Q12: `/seance` (Sanctum) fluid scrying surface — what's the still?
- [ ] A) A frozen ripple frame (still water) behind the planchette/answer UI
- [ ] B) A flat engraved scrying-pool graphic (no fluid sim at all in static mode)
- [x] C) Plain background token — all fluid imagery drops, UI only
- [ ] Other: __________________________________________
> USER NOTES:

---

## D. framer-motion entrances/transitions (the non-WebGL rooms)

### Q13: Under reduced-motion, how should framer-motion entrance/layout animations resolve?
- [ ] A) Snap instantly to final state (no fade, no slide) — fastest, most literal
- [x] B) Allow a single ≤200ms opacity fade (no transform) — gentle but calm
- [ ] C) Per-room: content snaps, but a lone focal accent keeps a tiny fade
- [ ] Other: __________________________________________
> USER NOTES:

### Q14: Board (orphan) card-flip reveal (`.flip-scene`/`.flip-inner` 3D CSS) under reduced-motion?
- [ ] A) Instant swap front→back (no flip, no cross-fade)
- [x] B) Cross-fade the two faces (≤200ms), no rotation
- [ ] C) Keep a single flip but cap it finite ≤300ms (still one-shot)
- [ ] Other: __________________________________________
> USER NOTES:

### Q15: The orphan rooms — Gauntlet, Ladder, Daily — do they need any designed still beyond the universal CSS clamp?
- [x] A) No — they're framer-motion/DOM only; the global `0.01ms` clamp is enough
- [ ] B) Yes for Ladder/Gauntlet timers (a moving bar) — define a static-but-legible timer treatment
- [ ] C) Daily (Wordle-loop) tile-flip needs an explicit instant-reveal variant
- [ ] Other: __________________________________________
> USER NOTES (per game):

---

## E. Legibility, loading, and detection details

### Q16: Text/Q&A overlaid on a static frame — contrast guarantee (Floor: body ≥4.5:1)?
- [ ] A) Every static frame carries a solid/scrim panel behind Q&A so contrast never depends on the imagery
- [ ] B) Static frames are pre-dimmed so text sits on a controlled tone (no per-frame scrim)
- [x] C) Q&A always renders in its own card, never directly on the scene (static or live)
- [ ] Other: __________________________________________
> USER NOTES:

### Q17: Relationship between the loading/skeleton state and the static frame?
- [ ] A) Reuse the static frame AS the skeleton (one artifact serves loading + reduced-motion)
- [x] B) Distinct: a neutral skeleton while loading, then the designed still if motion is off
- [ ] C) No skeleton — SSR seed-bank content is the first paint; static frame layers under it
- [ ] Other: __________________________________________
> USER NOTES:

### Q18: When WebGL is available but the device is low-end (mobile perf), should we ever pre-emptively serve the static frame?
- [ ] A) No — only OS reduced-motion or an actual WebGL failure triggers the still
- [ ] B) Yes — a heuristic (deviceMemory/`hardwareConcurrency`) can opt low-end into the static frame
- [x] C) Offer it via the manual toggle (Q8) but never auto-decide
- [ ] Other: __________________________________________
> USER NOTES:

### Q19: Should the reduced-motion frame still show category triple-encoding (color + suit glyph + label) identically?
- [ ] A) Yes — identical to the live room; the still changes nothing about category encoding
- [x] B) The still LEANS on glyph + label more (color effects may be muted when motion is off)
- [ ] Other: __________________________________________
> USER NOTES:

### Q20: Anything a room must NEVER lose in its static frame (the non-negotiables you want captured)?
- [ ] A) The primary interaction control (scrubber/guess/planchette) is always present & 44×44px
- [ ] B) The room's identity read (you can tell WHICH room it is from the still alone)
- [x] C) Both A and B, per room
- [ ] Other: __________________________________________
> USER NOTES (per game):
