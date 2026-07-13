# tech-audio-beds — design intake questionnaire

> **For the USER to fill in.** This drives how ambient audio **beds** (seamless looping room
> atmospheres, distinct from one-shot SFX) get wired into each game engine. Tick options, combine,
> or write your own; every question ends with `Other: ____`.
>
> **Grounding (already true, do not re-decide):**
> - `frontend/lib/sound.ts` already ships a **procedural drone bed** per room via `startAmbient(room)` /
>   `stopAmbient()`, one imperative singleton, gated by the global `muted` flag. It looks up a per-room
>   root pitch in `AMBIENT_ROOTS` (`board=A2, clock=D3, wedges=C3, streak=E3, map=G2, daily=B2`).
> - It **auto-upgrades** to a sampled loop if `/audio/ambient-<room>.mp3` exists — else it silently
>   keeps the synth drone. **Those `.mp3` files do not exist yet** (missing-cue list, `.orchestrator/audio.done.md`).
> - CC0 / offline / no-CDN / CSP floors are **locked** (`docs/research/free-audio-sources.md`): any bed asset
>   must be CC0, committed to the repo, and served locally. These are not up for a vote.
> - The seven games: **clock (Chronos), streak (Ignite), map (Atlas), mystery (Sanctum),
>   wedges (Fractures), thread (Thread), seance (Seance)**; plus orphan rooms **board, daily, gauntlet, ladder**.
> - Note: `sound.ts`'s room keys (`board/clock/wedges/streak/map/daily`) predate the new game names — part
>   of what these answers settle is the bed↔room key mapping for `mystery/thread/seance/gauntlet/ladder`.

---

## A. Which rooms get a bed at all

### Q1: Which rooms should have an ambient bed by default?
- [ ] A) All 7 games + all 4 orphan rooms (bed everywhere)
- [ ] B) The 7 games only; orphan rooms (board/daily/gauntlet/ladder) stay SFX-only
- [ ] C) Only the "immersive / slow-dwell" rooms (e.g. seance, sanctum, map, clock) — fast rooms stay silent
- [ ] D) None by default — every bed is opt-in per room, off until the user unmutes
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q2: Should a bed play on the home/lobby and shared shells (RoomShell, gauntlet/ladder wrappers)?
- [ ] A) Yes — one quiet lobby bed, distinct from any room bed
- [ ] B) No — beds only inside an active game room; lobby is silent
- [ ] C) Gauntlet/ladder inherit the bed of whichever child game is on screen
- [ ] Other: __________________________________________
> USER NOTES:

### Q3: For rooms that are "background music"-averse (fast reaction games like streak/Ignite), is a bed wanted or a liability?
- [ ] A) Full bed — atmosphere over everything
- [ ] B) Ultra-minimal bed (a single low pad, no rhythm) so it never competes with reaction timing
- [ ] C) No bed — SFX only in fast rooms
- [ ] Other: __________________________________________
> USER NOTES (call out streak/Ignite specifically):

---

## B. Sampled asset vs procedural drone

### Q4: Where should we invest in a real CC0 `.mp3` bed vs leave the procedural drone?
- [ ] A) Sample every bedded room (source/commit `ambient-<room>.mp3` for all)
- [ ] B) Sample only the signature rooms (e.g. seance, sanctum, map); procedural drone elsewhere
- [ ] C) Keep procedural everywhere — ship zero bed assets, tune the synth per room instead
- [ ] Other: __________________________________________
> USER NOTES (name which rooms deserve a real sample):

### Q5: If a room keeps the procedural drone, is the current pad (detuned sines + a fifth, 650 Hz low-pass) acceptable, or should its character change per room?
- [ ] A) Fine as-is everywhere — just vary the root pitch (status quo)
- [ ] B) Vary timbre per room too (waveform, filter cutoff, LFO rate) for distinct moods
- [ ] C) Only re-voice the "signature" rooms; leave the rest on the default pad
- [ ] Other: __________________________________________
> USER NOTES:

### Q6: When a sampled `.mp3` bed is missing/still loading, what should play?
- [ ] A) The procedural drone (status quo — auto-swap on load, seamless)
- [ ] B) Silence until the sample loads (no synth fallback)
- [ ] C) Procedural drone permanently as the floor; sample is a pure enhancement (never block on it)
- [ ] Other: __________________________________________
> USER NOTES:

---

## C. Mood / tempo per game

### Q7: What mood should each game's bed evoke? (fill the matrix — pick a lane or write your own)
> Candidate lanes: `warm-drone` · `tense-pulse` · `sparse-ambient` · `playful-arcade` · `dark-ritual` · `airy-open` · `none`
- clock (Chronos): __________________________
- streak (Ignite): __________________________
- map (Atlas): __________________________
- mystery (Sanctum): __________________________
- wedges (Fractures): __________________________
- thread (Thread): __________________________
- seance (Seance): __________________________
- board / daily / gauntlet / ladder: __________________________
- [ ] Other framing entirely: __________________________________________
> USER NOTES:

### Q8: Should any bed carry a pulse/tempo, or are all beds strictly non-rhythmic pads?
- [ ] A) All non-rhythmic — pure sustained pads, no beat anywhere
- [ ] B) A subtle pulse only where it fits the game (e.g. clock/Chronos ticking, streak/Ignite heartbeat)
- [ ] C) Let tempo track game state (see Q11) rather than being fixed
- [ ] Other: __________________________________________
> USER NOTES:

### Q9: Should the bed's pitch/key relate to the room's SFX and completion stinger, or stay independent?
- [ ] A) Yes — bed root, SFX, and stinger share a key per room (harmonically unified)
- [ ] B) Independent — bed is just atmosphere, SFX can clash freely
- [ ] C) Only unify the signature rooms
- [ ] Other: __________________________________________
> USER NOTES:

---

## D. Dynamics: ducking, layering, state response

### Q10: When an SFX or the completion stinger fires, what happens to the bed?
- [ ] A) Nothing — bed and SFX just sum (status quo)
- [ ] B) Duck the bed briefly (lower its gain) so the SFX/stinger reads clearly, then restore
- [ ] C) Fully pause the bed during the stinger, resume after
- [ ] Other: __________________________________________
> USER NOTES:

### Q11: Should a bed react to game state (timer running low, streak climbing, wrong answer)?
- [ ] A) Static bed — never changes mid-game (simplest, status quo)
- [ ] B) Intensify near a deadline / high stakes (e.g. clock/Chronos, streak/Ignite raise filter or add a layer)
- [ ] C) Shift on outcome (a darker layer on a miss, brighter on a hit)
- [ ] D) Reactive only in the games where it's dramatic; static elsewhere
- [ ] Other: __________________________________________
> USER NOTES (which games get reactive beds):

### Q12: When moving between rooms, how should beds transition?
- [ ] A) Crossfade — old bed fades out as new fades in (no silent gap)
- [ ] B) Hard cut — stop old, start new
- [ ] C) Brief silence between rooms (a "breath"), then the new bed
- [ ] Other: __________________________________________
> USER NOTES:

---

## E. Volume, mute, persistence

### Q13: How loud should beds sit relative to SFX? (bed master gain is currently ~0.06, very quiet)
- [ ] A) Keep beds well under SFX — atmosphere you barely notice (status quo)
- [ ] B) Bring beds up so they're clearly present
- [ ] C) Per-room bed level (some rooms louder, e.g. seance; some barely there, e.g. streak)
- [ ] Other: __________________________________________
> USER NOTES:

### Q14: Should the bed have its own volume control separate from SFX?
- [ ] A) No — one global mute governs everything (status quo: `muted` flag gates all)
- [ ] B) Add a separate bed-volume slider (music vs effects, two channels)
- [ ] C) Add a bed on/off toggle (distinct from full mute) but no continuous slider
- [ ] Other: __________________________________________
> USER NOTES:

### Q15: Per-game mute memory — should muting be global or remembered per room?
- [ ] A) Global — one mute state across the whole app (status quo)
- [ ] B) Per-room bed preference remembered (mute seance's bed but keep map's)
- [ ] C) Global mute for SFX, per-room memory only for beds
- [ ] Other: __________________________________________
> USER NOTES:

### Q16: First-visit default — beds on or off until the user opts in?
- [ ] A) On by default (respect autoplay rules: start on first gesture)
- [ ] B) Off by default — a one-time "enable sound" prompt, beds silent until accepted
- [ ] C) SFX on by default, beds off by default (two-tier)
- [ ] Other: __________________________________________
> USER NOTES:

---

## F. Sourcing the missing CC0 beds

### Q17: For the rooms getting a sampled `.mp3` bed, where do we source it?
> (Floor: CC0, committed, no-CDN — `docs/research/free-audio-sources.md`.)
- [ ] A) OpenGameArt.org CC0 drone/pad loops (recommended in the audio done-note)
- [ ] B) Freesound.org CC0-only filter
- [ ] C) Generate our own loops offline (render the procedural drone to a seamless file) and commit those
- [ ] Other: __________________________________________
> USER NOTES:

### Q18: How long should each looping bed sample be, and how do we guarantee a seamless loop?
- [ ] A) Short (~10–20s) loop, equal-power crossfade at the seam
- [ ] B) Long (~60–120s) so repetition is less obvious (bigger asset weight)
- [ ] C) Don't sample — the procedural drone is seamless by construction; use it wherever seams are a risk
- [ ] Other: __________________________________________
> USER NOTES:

### Q19: Asset-weight budget — how much bundle size are beds allowed to add? (offline/committed repo)
- [ ] A) Tight — procedural default, sample at most 1–2 signature rooms
- [ ] B) Moderate — a handful of compressed loops (target < ~150 KB each)
- [ ] C) Generous — sample every bedded room, size is acceptable
- [ ] Other: __________________________________________
> USER NOTES:

### Q20: Do the new game rooms (mystery/Sanctum, thread/Thread, seance/Seance, gauntlet, ladder) need new bed keys added to `AMBIENT_ROOTS`, and what root pitch/mood each?
- [ ] A) Add all — give each its own root + mood (specify below)
- [ ] B) Alias the new rooms onto existing keys (e.g. mystery→board, thread→wedges) to reuse tuning
- [ ] C) Only seance/Sanctum get bespoke beds; thread/gauntlet/ladder stay SFX-only
- [ ] Other: __________________________________________
> USER NOTES (root pitch + mood per new room):

---

> When done, tick/annotate above. These answers set: which rooms get beds, sampled-vs-procedural per
> room, mood/tempo/key, ducking + state-reactivity, volume/mute model, and CC0 sourcing for the missing
> `ambient-<room>.mp3` cues — all within the locked CC0/offline/no-CDN floors.
