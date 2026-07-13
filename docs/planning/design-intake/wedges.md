# Fractures (wedges) — Design Intake Questionnaire

> Codename **Fractures** — the six-wedge, category-lockout trivia room (Trivial-Pursuit lineage). The v4 spec is
> emphatic: **the gameplay, question flow, categories, scoring, and layout stay EXACTLY as they are today.** The
> whole redesign is a visual/atmospheric skin — an antique broken mirror that reassembles as you earn wedges.
> This questionnaire captures the decisions that skin needs. A few questions probe gameplay-adjacent presentation
> (score surfacing, streak framing) — answer those without breaking the "mechanics unchanged" rule.
>
> How to use: each `### Q:` is a decision only you can make. Tick one option, combine, or write your own. Every
> question ends with `Other: ____`. Jot reasoning under `> USER NOTES:` — that becomes the build brief.
>
> Grounding (what exists today): `ShatteredMirror` SVG of six wedges cracking along daily-shifting fault lines;
> `WedgeLegend` chips (earned ✓ / active • / pending dim); 15s per-question timer; speed bonus `100 + 20×secondsLeft`;
> main round (round-robin queue across categories) then a bonus phase; per-category **lockout** (earn a wedge, that
> category serves no more); `wonRing` = all six earned; `Ghost` quips on a miss; a `wrongPulse` crack-flash; score
> kept on the legacy 0–6 wedge scale (xp separate); `Confetti` + achievement toasts + sfx/haptic + ambient drone.

---

## Setup

### Q: What does a Fractures round show the moment it opens, before the first question?
- [ ] A) The whole mirror pre-shattered — six dim wedges, every fault line already cracked, waiting to be repaired
- [x] B) An intact mirror that visibly shatters into the six wedges as the round begins (one-time break animation)
- [ ] C) A dark frame where wedges fade in one at a time as the queue loads
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How prominent should the `ShatteredMirror` be at setup relative to the question card?
- [ ] A) Hero — the mirror is the whole screen, the question card floats over its center
- [x] B) Companion — mirror on one side (or above), question card is the main focus beside it
- [x] C) Ambient — mirror is a faint full-bleed background, question card sits clearly on top
- [ ] Other: __________________________________________
> USER NOTES: you decide

### Q: The six wedges map to the six categories (Science, History, Entertainment, Sports, Art, Geography). How are they arranged?
- [x] A) Fixed clock positions — each category always the same wedge, so regulars learn the layout
- [ ] B) Daily-shuffled — wedge positions rotate with the daily seed (fresh mirror each day)
- [x] C) Fixed positions, but the fault-line crack pattern between them shifts daily
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What greets a returning daily player before they tap "start"?
- [ ] A) Yesterday's reformed mirror lingering, then dissolving into today's fresh fracture
- [ ] B) A cold-open shattered mirror with today's date etched into the silver frame
- [x] C) A one-line "the mirror is broken again" prompt over the idle glass
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the `WedgeLegend` chip strip appear at setup, or only once play starts?
- [x] A) Present from setup — all six chips dim, previewing the categories to come
- [ ] B) Hidden until the first question, then slides in
- [x] C) Fold the legend into the mirror itself (no separate chip strip); each wedge is its own status
- [ ] Other: __________________________________________
> USER NOTES:

---

## Rules

### Q: How does answering a question map onto the mirror repairing?
- [x] A) Correct = that category's wedge reassembles and its fault lines seal with silver veins; miss = a new crack spreads
- [ ] B) Correct = the wedge brightens/clears (stays cracked but lit); full repair only at wedge-earned
- [x] C) Correct = a single shard glides back into its wedge; the wedge needs several to fully reform
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Per-category **lockout** (once a category is earned it serves no more) is core today. How is that state made legible on the mirror?
- [x] A) Earned wedge goes solid/mirror-finish and stops flickering — visibly "done"
- [x] B) A silver seam locks around the earned wedge's border
- [x] C) The earned category's `WedgeLegend` chip fills + checks; the wedge just brightens
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the player choose an answer (the choice buttons)?
- [x] A) Frosted-crystal buttons stacked below the mirror (current-style list, glass skin)
- [x] B) Answer options embedded as shards around the mirror frame — tap the shard
- [x] C) List of glass buttons, but the active wedge's accent color tints them
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The current active category — should the player know which wedge they're answering for before they read the question?
- [x] A) Yes — the active wedge pulses (`•`) and the question card is tinted its accent color
- [ ] B) Yes, but subtly — only the legend `•` marker moves; the card stays neutral
- [ ] C) No — keep it category-blind until answered, then reveal which wedge it fed
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What can a player do besides answer — any allowed moves beyond tap-an-option?
- [x] A) Nothing — tap an answer or let the timer run out, that's the whole verb (keep it pure)
- [ ] B) Allow a "reflect" peek — tap the mirror to briefly clear the smoke/see progress, no answer effect
- [ ] C) Allow skipping the current question (moves on, no wedge, no penalty beyond lost time)
- [ ] Other: __________________________________________
> USER NOTES:

---

## Scoring

### Q: The score today is the 0–6 wedge count (leaderboard scale), with speed points feeding xp separately. How is the primary score shown?
- [x] A) As earned wedges only — the mirror IS the score; number of reformed wedges = your result
- [x] B) Wedge count reflected inside the mirror's center (per spec's "score reflected inside the mirror")
- [x] C) Keep a small numeric HUD too, but styled as an etched engraving, not a flat counter
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The speed bonus (`100 + 20×secondsLeft`) currently flashes a "+N". How should that feedback read in the glass theme?
- [x] A) A crystalline "+N" that refracts/sparkles off the just-repaired wedge, then fades
- [ ] B) Silver dust bursts scaled to the bonus size — bigger bonus, more dust
- [ ] C) Keep a clean "+N" flash, just restyled with the frost/silver palette
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the 15s timer be visualized so speed pressure stays felt but on-theme?
- [x] A) A hairline crack creeping across the active wedge — reaches the edge = time's up
- [ ] B) Smoke thickening over the question as seconds drain (readability preserved)
- [ ] C) A thin silver arc / ring draining around the card (clean, legible)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What counts as a "good" Fractures score to celebrate?
- [ ] A) All six wedges (`wonRing`) — full mirror reformed is the only real trophy
- [ ] B) Any 4+ wedges is "good"; 6 is perfect
- [x] C) Speed-weighted — 6 wedges AND high bonus points (a fast full clear) is the flex
- [ ] Other: __________________________________________
> USER NOTES:

### Q: A miss earns nothing today. Should a miss visibly cost anything beyond "no wedge"?
- [ ] A) Purely cosmetic — a new crack spreads (`wrongPulse`), no score change (keep it as-is)
- [ ] B) The mirror darkens briefly per spec's "temporary darkness before recovering"
- [x] C) Cracks accumulate visibly across the whole round, tallying your misses at the end
- [ ] Other: __________________________________________
> USER NOTES:

---

## Win / lose

### Q: What is the win state — the completion ceremony when the last wedge is earned?
- [x] A) Full ceremony per spec: shards lift, rotate, mirror reforms into one pristine reflection, moonlight fills the screen
- [ ] B) Restorative/quiet — cracks simply seal, smoke clears, the mirror settles whole (no confetti burst)
- [ ] C) Ceremony + the existing `Confetti`/win sfx, glass-tinted
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does a partial finish look like (round ends without all six wedges)?
- [x] A) The mirror settles half-reformed — earned wedges clear, unearned ones stay fractured (honest, a little melancholy)
- [x] B) A gentle "the mirror rests unfinished until tomorrow" close over the partial glass
- [ ] C) Same reform ceremony but only the earned wedges lift into place
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there ever a hard "lose" (fail) state, or only degrees of incompleteness?
- [x] A) No lose — you always finish with 0–6 wedges; the mirror just reflects how far you got
- [ ] B) Zero wedges = a distinct "the mirror stays shattered" fail screen
- [ ] C) Running out of questions before any wedge is a soft loss with an encouraging retry nudge
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the emotional tone land at the end — the spec calls it "restorative rather than celebratory"?
- [ ] A) Serene and hushed — quiet awe, a single crystalline resonance, no fanfare
- [ ] B) Warm reward — earned brightness + a soft cheer; restorative but still a payoff
- [x] C) Cinematic — slow, film-like reassembly with a musical swell
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The reformed mirror shows "one perfect reflection." What is reflected?
- [x] A) An abstract pristine silver surface — clean glass, no imagery
- [x] B) The player's score/streak elegantly engraved into the clear glass
- [x] C) A subtle rendering of today's categories/answers as an etched summary
- [ ] Other: __________________________________________
> USER NOTES:

---

## Round / turn flow

### Q: Today the round is a round-robin queue across categories, then a bonus phase. How should the main→bonus transition feel?
- [x] A) A distinct beat — smoke rolls across, mirror dims, then bonus questions surface as "final shards"
- [ ] B) Seamless — bonus questions just continue, no visible phase break
- [x] C) A short interstitial naming the bonus round ("the last fractures")
- [ ] Other: __________________________________________
> USER NOTES:

### Q: On answering, there's a reveal + a "reinforce" (the just-won answer echoes onto the next prompt). What paces the between-question beat?
- [ ] A) Auto-advance after a short glass-settle animation — hands-free flow
- [ ] B) Player taps "next" to advance — they control when the shard settles
- [x] C) Auto-advance, but the repair animation length sets the pace (correct = longer, satisfying beat)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should retries / replays work for the daily?
- [x] A) One shot per day — the daily mirror can only be broken once (current daily-game norm)
- [ ] B) Replayable for practice, but only the first attempt counts for streak/leaderboard
- [ ] C) Freeplay mode is unlimited; daily is one-shot
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What distinguishes daily from freeplay visually/atmospherically?
- [x] A) Daily = the "real" antique mirror with the dated silver frame; freeplay = a plainer practice pane
- [ ] B) Identical presentation; only a small label differs
- [ ] C) Freeplay dims the ceremony (no big reform payoff) to reserve the moment for the daily
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The `Ghost` heckles on a miss with a deterministic quip. How does the Ghost fit the fractured-mirror fiction?
- [ ] A) It's a distorted reflection in the cracked glass that speaks when you err — part of the mirror
- [x] B) Keep the Ghost as a side character (current framing), just glass-skinned
- [ ] C) Drop the persona — a miss just cracks the glass, no voice (let atmosphere carry it)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should progress persist visibly across the round (accumulating repair), or reset the mirror's look per question?
- [x] A) Cumulative — the mirror carries all repairs and all cracks forward; final state = the whole story
- [ ] B) Per-question focus — only the active wedge animates; the rest hold steady
- [ ] Other: __________________________________________
> USER NOTES:

---

## Difficulty

### Q: Gameplay difficulty is unchanged (same question pool). Should the visuals imply any difficulty progression?
- [x] A) No — difficulty is invisible; the skin never signals "this one's hard"
- [ ] B) Later/bonus wedges get a colder, more fractured look to imply escalating stakes
- [ ] C) The lighting darkens as fewer wedges remain, raising tension toward the finish
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Does the 15s timer stay flat, or should the mirror theme motivate any pacing change?
- [ ] A) Flat 15s for every question (unchanged — don't touch mechanics)
- [x] B) Keep 15s, but bonus-round questions feel more urgent purely via visuals (faster smoke, tighter crack)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Category lockout means late-round questions come from fewer categories. Should that narrowing be surfaced?
- [x] A) Yes — earned/locked wedges visibly "close," so it's clear the pool is shrinking to what's left
- [ ] B) No — keep it invisible; just serve the next question
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should there be any accessibility-driven difficulty knob (e.g., a calmer, slower-pressure mode)?
- [ ] A) A "no-timer / relaxed" toggle for players who want the atmosphere without clock pressure (freeplay only)
- [x] B) No modes — one canonical experience
- [ ] C) A reduced-intensity visual mode that also softens the timer urgency cues
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the effective difficulty of "earning all six" feel — the wonRing bar?
- [ ] A) Genuinely hard — full mirror is rare and prestigious, and the ceremony earns its weight
- [x] B) Attainable most days for engaged players — the payoff is the ritual, not the rarity
- [ ] Other: __________________________________________
> USER NOTES:

---

## Visual / UX / theme (Fractures skin — E0)

### Q: Which materials lead the skin? (spec palette: obsidian/charcoal/mirror-silver/frost-white, ice-blue/steel/moonlight-cyan accents)
- [x] A) Cold moonlit — obsidian + mirror silver + moonlight cyan, restrained and premium
- [ ] B) Warmer antique — deep charcoal + tarnished silver + soft violet, "Victorian mansion mirror"
- [ ] C) Icy crystal — frost white + ice blue + electric silver, brighter and sharper
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How aggressive should the ambient atmosphere (smoke, floating dust, drifting particles) be?
- [x] A) Lush — volumetric smoke, floating glass dust, visible light rays; cinematic (perf-gated)
- [ ] B) Restrained — a faint drift of particles, subtle haze; never competes with the question
- [ ] C) Minimal — reflections and cracks only, almost no particle motion
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How do the six category wedges get their identity (spec: "engraved into pieces of glass")?
- [x] A) Etched line-art icons per category with distinct accent tints + per-wedge glass texture
- [x] B) Color-only — each wedge is a distinct silvered tint, no iconography
- [x] C) Icons + a signature refraction/highlight animation unique to each category on hover
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Typography direction (spec: elegant modern serif headings, editorial feel)?
- [x] A) Serif headings + clean sans body — luxury editorial contrast
- [ ] B) All-serif for a fully antique feel
- [ ] C) Match the existing Parlor design-system type; just add engraved dividers + wide spacing
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The crack / fracture rendering — how are the fault lines drawn?
- [x] A) SVG hairline masks (current `ShatteredMirror` approach), animated to spread/seal
- [x] B) Richer refraction/caustic effects along cracks (GPU, perf-gated)
- [ ] C) Simple styled borders on the wedges — cheapest, most robust
- [ ] Other: __________________________________________
> USER NOTES: Use better effects where possible.

### Q: How does lighting evolve with progress (spec: correct brightens, incorrect darkens then recovers)?
- [x] A) Full dynamic bed — the whole interface brightens toward moonlit clarity as wedges fill
- [ ] B) Localized — only repaired wedges catch light; global brightness holds steady
- [ ] C) Skip evolving lighting — keep a fixed mood for consistency/perf
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Audio — there's existing sfx/haptic + an ambient mirror-room drone. What's the sonic identity?
- [x] A) Crystalline chimes on repair, glass resonance on miss, a low mirror-room drone bed (per spec, incl. faint frame creaks)
- [ ] B) Minimal — one clean correct/wrong tone + the drone; no elaborate foley
- [ ] C) Silent by default (respect existing mute); atmosphere carried entirely by visuals
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Where does the score/streak live in the frame (spec wants it "reflected inside the mirror," not a disconnected HUD)?
- [x] A) Engraved into the silver frame around the mirror
- [x] B) Reflected faintly in the mirror's center, revealed as it clears
- [ ] C) A restyled corner HUD (etched-glass card) — keep it conventional but on-theme
- [ ] Other: __________________________________________
> USER NOTES:

---

## Edge cases

### Q: Reduced-motion (`prefers-reduced-motion`) — what happens to smoke, particles, and crack animations?
- [x] A) Freeze all ambient motion; repairs/misses become instant static state changes (crack appears/seals, no travel)
- [x] B) Keep slow essential feedback (wedge fills) but kill particles, drifting smoke, and shimmer
- [x] C) Offer a settings toggle in addition to honoring the OS preference
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Low-power / weak-GPU devices — how does the skin degrade if volumetric smoke and refraction are too heavy?
- [x] A) Tiered fallback — drop particles → drop blur/refraction → flat glass gradients, auto-detected
- [x] B) A single lightweight CSS-only tier that always runs (no WebGL/canvas dependency at all)
- [x] C) Render the full effect; accept lower frame rates on old devices
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Offline / zero-env (PARLOR must play fully from the seed bank). Does the Fractures skin need anything network-bound?
- [x] A) Fully offline — all glass/smoke/crack assets are inline SVG/CSS/canvas, zero fetches (required baseline)
- [ ] B) Offline-first with an optional richer texture pack that loads only when online
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The question pool runs dry before all six wedges are earnable (a category has no more questions). What then?
- [x] A) End the round gracefully — reform what was earned, leave the rest fractured (no soft-lock)
- [ ] B) Backfill from the bonus pool so the ring can still theoretically complete
- [x] C) Show a clear "no more shards for this category today" state on the affected wedge
- [ ] Other: __________________________________________
> USER NOTES:

### Q: A player tabs away mid-round (timer running) or the tab loses focus — what's the fair behavior?
- [x] A) Pause the timer + freeze the atmosphere while hidden; resume on return
- [ ] B) Timer keeps running (it's a speed game) — coming back to a timed-out question is on them
- [ ] C) Pause the timer but keep ambient motion so the mirror still feels alive
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Rapid/double taps or answering exactly as the timer hits zero (input race) — how is it resolved?
- [ ] A) First input wins, buttons lock instantly on resolve; a zero-tick that races a tap counts as the tap
- [x] B) Timeout always wins at 0 — late taps are ignored
- [x] C) Debounce with a tiny grace window so a near-deadline tap still registers
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Empty / error states (no daily set loaded, seed fallback, or a malformed question) — how does the mirror present that?
- [x] A) An intact, dim, un-fractured mirror with a quiet "no reflection today" message (never a broken-looking error)
- [ ] B) Fall through to the standard PARLOR empty state, glass-skinned
- [ ] C) Silently swap to freeplay/seed questions so there's always something to play
- [ ] Other: __________________________________________
> USER NOTES:
