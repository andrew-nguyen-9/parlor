# Chronos (clock) — Design-Intake Questionnaire

> **For the USER to fill in.** Each question is an open-ended product decision with candidate options — tick one,
> combine, or write your own in the `Other:` line, then add free-form thoughts under `USER NOTES:`. Answers drive the
> engine build; nothing here is authored trivia. Grounded in `docs/v4/03_chronos.txt` (the mechanical-reasoning
> watchmaking spec) and the shipped `frontend/components/ClockGame.tsx` (today's gear-seating prototype: a
> wheel-tray, shafts with target teeth-counts, tap-to-seat, ok/bad/pending statuses, a Peek toggle, win when the
> whole gear train reads ok).

---

## Setup — how a round is seeded and what the player sees first

### Q: What is on screen the instant Chronos opens?
- [] A) The full disassembled movement + a loaded wheel-tray (today's prototype) — everything visible at once
- [x] B) A tight macro shot of the empty main plate; components slide in from the tray as the camera pulls back
- [x] C) A brief "wind the crown to begin" title beat, then the bench
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: How much of the movement starts already assembled?
- [x] A) Bare plate — player seats every wheel from scratch
- [x] B) Mainspring barrel + center wheel pre-seated as an anchor, rest empty
- [x] C) A random-but-seeded subset pre-seated so no two weekdays feel identical
- [ ] Other: __________________________________________
> USER NOTES: All

### Q: How does the player learn each shaft's requirement (which wheel fits where)?
- [x] A) Each shaft shows its target teeth-count as a number (prototype behavior)
- [x] B) No numbers — the player deduces fit purely from gear-mesh geometry and power flow
- [x] C) Numbers hidden by default, revealable via the Inspect/Peek action
- [ ] Other: __________________________________________
> USER NOTES: All

### Q: What lives in the parts tray beside the gear train?
- [ ] A) Only wheels/gears (current scope)
- [x] B) Wheels + bridges + screws + a mainspring — the full spec component set
- [x] C) Wheels this launch; bridges/escapement phased in on the harder weekdays
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Is the daily puzzle deterministic across all players?
- [x] A) Yes — one seeded puzzle per date, everyone gets the identical movement (spec + `lib/rng.ts`)
- [x] B) Yes for daily, but freeplay/archive rolls a fresh seed
- [ ] C) Same puzzle, but starting camera angle / tray order shuffles per player
- [ ] Other: __________________________________________
> USER NOTES: Blend

---

## Rules — the core interaction and allowed moves

### Q: What is the primary verb of Chronos?
- [] A) Seat wheels onto shafts (tap tray-wheel → tap shaft), as shipped
- [x] B) Seat wheels AND install bridges over them AND wind the spring — a multi-stage build
- [x] C) Drag-and-drop components in 3D onto glowing sockets
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Can a wrong placement be undone freely, or does it cost something?
- [ ] A) Free — pick a seated wheel back up any time, no penalty
- [x] B) Free to move, but each "Run simulation" attempt is counted (spec tracks Simulation attempts)
- [ ] C) Free before you Run; locked once power flows
- [ ] Other: __________________________________________
> USER NOTES:

### Q: When does the player find out a placement is wrong?
- [ ] A) Immediately — the shaft turns red/bad the moment a mismatched wheel seats (prototype)
- [x] B) Only on Run — the simulation stalls at the first jammed gear and shows why
- [x] C) Hybrid — obvious mis-fits flag instantly; subtle ratio errors only surface on Run
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Must the movement be built in a valid order (dependencies), or any order?
- [ ] A) Any order — seat wheels however you like, only the final state matters
- [x] B) Strict — a bridge can't go on before the wheels beneath it; power can't test before the spring
- [x] C) Soft — any order allowed, but the sim won't Run until prerequisites exist
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: How does "Run the simulation" behave?
- [] A) One button — either the whole train ticks to life or it visibly jams at the fault
- [ ] B) Continuous — the train always tries to turn; correct pieces spin, wrong ones grind and stop
- [x] C) Staged — power flows wheel-by-wheel so the player watches it reach (or fail to reach) the escapement
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the Peek / Inspect action do?
- [ ] A) Toggles a ghost overlay of correct wheel positions (current Peek)
- [ ] B) Zooms the camera to inspect one component's spec (teeth, jewel, direction) without revealing the answer
- [x] C) Both, but the answer-revealing peek is gated behind the hint system
- [ ] Other: __________________________________________
> USER NOTES:

---

## Scoring — points, streaks, penalties, what a "good" score is

### Q: What is the headline score for a completed watch?
- [ ] A) Solve time only (spec tracks Completion time)
- [ ] B) Simulation attempts (fewer = better) — a deduction/precision score
- [x] C) A composite: time + attempts + hints used, rolled into a star/grade
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Do hints cost the player anything?
- [ ] A) No cost — hints are free, just tracked in stats
- [ ] B) Each hint knocks a star / adds a time penalty
- [x] C) A hint marks the day as "assisted" (no perfect-solve badge) but doesn't dock points
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there a bonus for a first-try flawless assembly?
- [x] A) Yes — "One Run, no hints" earns a special perfect badge
- [ ] B) No bonuses — the reveal itself is the reward
- [x] C) A subtle cosmetic (e.g. a gold-engraved plate) unlocks on flawless days
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: What counts as a "good" score the player should chase?
- [x] A) Sub-N-minute solve for that weekday's tier
- [x] B) Zero wrong Runs (pure deduction, no experimentation)
- [x] C) Maintaining the daily streak at all — completion is the win, speed is flavor
- [ ] Other: __________________________________________
> USER NOTES: All

### Q: How do streaks work across the Parlor family?
- [ ] A) Per-game Chronos streak, shown on its own stats page (Current/Longest per spec)
- [ ] B) Contributes to a shared Parlor-wide daily streak across all rooms
- [x] C) Both — a Chronos streak and a Parlor streak, tracked separately
- [ ] Other: __________________________________________
> USER NOTES:

---

## Win / lose — win condition, fail condition, end-of-round state

### Q: What is the exact win condition?
- [ ] A) Every shaft reads ok and the train ticks (current: all statuses ok → solved)
- [x] B) The full simulation runs: power → gear train → escapement locks/unlocks → balance oscillates → second hand ticks
- [x] C) The above AND the completion camera pull-back finishes
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Can a player actually "lose" Chronos?
- [ ] A) No lose state — it's a calm puzzle; you keep going until it ticks (spec: no timers, no failure)
- [x] B) Soft-lose — unlimited tries, but the shared card shows attempts/hints used
- [x] C) A daily attempt cap; over the cap = "unsolved today," streak breaks
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What is the win moment — the emotional payoff?
- [ ] A) Confetti + solved banner (current prototype)
- [x] B) The spec reveal: power flows, escapement ticks, balance wheel oscillates, camera pulls back — elegant, not explosive
- [x] C) A restrained tick-tick-tick audio swell fading to workshop ambience
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: What does the end-of-round screen show and offer?
- [ ] A) Score + share button + "come back tomorrow"
- [ ] B) Above + the optional educational card (how this movement's escapement/ratio works)
- [x] C) Above + the movement added to a permanent restored-watch Collection
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the shareable result look like?
- [x] A) Emoji/glyph grid (Wordle-style) encoding attempts and hints
- [ ] B) A small rendered image/badge of today's completed movement
- [ ] C) Text line: date, solve time, attempts, streak
- [ ] Other: __________________________________________
> USER NOTES:

---

## Round / turn flow — turn structure, pacing, retries, daily vs freeplay

### Q: How is a session paced?
- [x] A) Single continuous solve — no discrete turns, player works until it ticks
- [ ] B) Loose "phases": seat train → add bridges → wind spring → Run, gated in sequence
- [ ] C) Free-form building with a Run button available whenever the player wants to test
- [ ] Other: __________________________________________
> USER NOTES:

### Q: After a failed Run, what happens?
- [x] A) Sim stops at the fault, highlights the jammed component, player fixes and re-Runs (unlimited)
- [ ] B) A short reset animation returns pieces to a known state, keeping correct ones seated
- [ ] C) Nothing auto-changes — the player diagnoses from the stalled train themselves
- [ ] Other: __________________________________________
> USER NOTES:

### Q: One puzzle per day — what about replay?
- [x] A) One daily; solved state locks until midnight, then archive holds past puzzles (spec)
- [x] B) One daily + an always-available freeplay generator for practice
- [ ] C) Daily + archive + a weekly "assemble the whole week" marathon
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Can a player pause mid-build and resume later?
- [x] A) Yes — progress persists in localStorage, resume exactly where left off
- [x] B) Auto-saves per placement; refreshing never loses work
- [ ] C) No persistence — a session is one sitting (simplest)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there any onboarding for a first-time player?
- [x] A) A one-time guided Monday-style micro-puzzle (2–3 wheels) that teaches seating
- [x] B) Passive tooltips the first time each mechanic (bridge, spring, escapement) appears
- [ ] C) No tutorial — the low-tier weekdays are the tutorial
- [ ] Other: __________________________________________
> USER NOTES:

---

## Difficulty — how hard, how it scales, difficulty knobs

### Q: How should difficulty scale through the week (spec: Mon easy → Sun masterpiece)?
- [x] A) Follow the spec ladder exactly (Mon 3–5 min / few wheels wide tolerance → Sun 15–20 min full movement)
- [x] B) Same ladder but capped shorter (Sunday ≈ 10 min) to fit a quick daily habit
- [ ] C) Flat difficulty daily, with an optional "hard mode" toggle instead of a weekday curve
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: Which knobs turn difficulty up?
- [x] A) Component count (more wheels/shafts)
- [x] B) Added mechanic layers (bridges, gear ratios, escapement tuning, subsystems — the spec's Tue→Sun additions)
- [x] C) Deceptive dead-ends: convincing-but-wrong configurations and false mechanical solutions
- [ ] Other: __________________________________________
> USER NOTES: All

### Q: How tight is placement tolerance?
- [x] A) Exact — a shaft accepts exactly one wheel (current teeth-match)
- [ ] B) Wide on easy days, exact on hard days (spec: Monday "wide placement tolerance")
- [ ] C) Always exact, but easy days have fewer decoy wheels in the tray
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The spec insists on "exactly one logical solution, no guessing." How strict is that?
- [x] A) Hard rule — a constraint solver guarantees a unique, deducible solution every day
- [ ] B) Mostly — unique solution, but a couple of symmetric wheels may be interchangeable
- [ ] C) Relax it — multiple valid assemblies allowed as long as the watch ticks
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How assertive should the hint system be (spec: subtle, staged over minutes)?
- [ ] A) Exactly the spec ladder: region highlight → connection points glow → one translucent correct-position outline
- [ ] B) Player-triggered hints on demand at the same three escalating strengths
- [x] C) Both — auto-hints after long idle AND an on-demand hint button
- [ ] Other: __________________________________________
> USER NOTES:

---

## Visual / UX / theme — this game's per-game skin (E0)

### Q: What is Chronos's core visual identity?
- [x] A) Full spec: impossible luxury 3D movement — brushed brass, blued screws, ruby jewels, polished steel, warm macro lighting
- [x] B) A stylized 2.5D watch bench — premium but flatter/cheaper to render than full PBR Three.js
- [ ] C) The current lightweight Three.js gears, dressed up with better materials and lighting
- [ ] Other: __________________________________________
> USER NOTES: Blend

### Q: How much of the spec's premium rendering do we commit to at launch?
- [x] A) The works — PBR, HDR env, ACES tone-map, bloom, depth-of-field, SSR, TAA (spec rendering list)
- [ ] B) A tasteful subset — PBR materials + soft shadows + one accent bloom, skip DoF/SSR for perf
- [ ] C) Match Parlor's existing look first; layer premium effects later
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the camera feel?
- [ ] A) Spec luxury cam — velocity smoothing, spring interpolation, micro-inertia, soft stops, no snapping
- [ ] B) Fixed/gentle framing with tap-to-focus zoom, no free orbit (simpler, mobile-friendly)
- [x] C) Free orbit + zoom on desktop, locked framing on mobile
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the UI chrome sit against the movement (spec: glass panels, minimal type)?
- [x] A) Floating glass side/bottom panel for the tray + controls, movement fills the stage
- [ ] B) Everything integrated into the bench diegetically — tray is a real workshop mat, no floating UI
- [ ] C) Parlor's standard RoomShell chrome, movement in the content area
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What is the ambient mood before the watch comes alive (spec idle: floating dust, soft light shifts)?
- [x] A) Full spec — floating dust motes, gentle reflections, drifting warm light
- [ ] B) A calm still bench with only subtle light breathing (cheaper, no particles)
- [ ] C) Match Parlor's candle/jewel-ink ambient tokens from the design system
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How present is audio (spec: restrained workshop ambience + tiny interaction clicks)?
- [x] A) Full spec — quiet ambience loop + steel-on-brass/screw/gear-engage sounds + completion tick swell
- [ ] B) Interaction clicks + completion swell only, no continuous ambience
- [ ] C) Silent by default, opt-in via a sound toggle
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should Chronos use warm/light or cool/dark as its dominant palette?
- [x] A) Warm brass-and-amber on a dark macro backdrop (spec's warm ambient lighting)
- [ ] B) Respect the viewer's light/dark theme, retinting the bench to match
- [ ] C) Always a dark, jeweler's-loupe backdrop regardless of theme
- [ ] Other: __________________________________________
> USER NOTES:

---

## Edge cases — offline, reduced-motion, WebGL-degrade, empty/error states

### Q: The spec is Three.js/R3F/WebGL. What happens when WebGL is unavailable or fails to init?
- [x] A) Fall back to a 2D SVG/canvas gear-train that plays the identical puzzle (parity, no 3D)
- [ ] B) Show a static rendered board with tap-to-seat but no live 3D simulation animation
- [ ] C) A graceful "Chronos needs WebGL" card with the day's educational content still readable
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does Chronos behave with zero network / offline (Parlor must stay playable seed-only)?
- [x] A) Fully playable from the seed bank — puzzle definition ships in `seed-questions.json`, no fetch needed
- [ ] B) Today's puzzle caches after first load; offline replays the last fetched day
- [x] C) Offline gives a deterministic locally-generated puzzle from the date seed
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does `prefers-reduced-motion` change?
- [x] A) Kill idle dust/inertia + skip the pull-back reveal; jump straight to the ticking end-state
- [ ] B) Keep the reveal but cut camera motion and particle effects only
- [ ] C) A static-first mode: no ambient motion, animations only on explicit Run
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What if the day's puzzle data is missing or malformed?
- [ ] A) Silently fall back to a known-good seed puzzle so the room never breaks
- [ ] B) Show yesterday's archive puzzle with a small "today unavailable" note
- [x] C) A friendly empty-state card, streak protected (day doesn't count as a loss)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the layout adapt to mobile / small screens?
- [x] A) Movement scales down, tray becomes a horizontal scroll strip, tap-to-seat only (no orbit)
- [x] B) Portrait: stacked stage-over-tray; landscape: side-by-side
- [ ] C) Desktop/tablet-first per spec, with a simplified mobile fallback board
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What happens on weird input — double-taps, rapid re-seating, seating during the Run animation?
- [x] A) Lock interaction while the simulation animates; re-enable on stop
- [x] B) Debounce/queue taps so nothing double-fires or desyncs the state
- [ ] C) Allow interruption — tapping mid-Run halts the sim and returns to build mode
- [ ] Other: __________________________________________
> USER NOTES:
