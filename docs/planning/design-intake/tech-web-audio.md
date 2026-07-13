# Design-Intake — tech-web-audio (event SFX / one-shot cues)

> **For the USER to fill in.** This questionnaire decides how PARLOR's Web Audio
> *event SFX and one-shot cues* wire INTO each game engine — **which games get
> which cues, where they fire, how loud, and how they mute.** It is NOT about
> ambient loop beds (see `tech-audio-beds`) and NOT about implementing synths.
>
> **Grounding (real files, real constraints):**
> - `frontend/lib/sound.ts` — the synth-first engine: single lazy `AudioContext`,
>   single `muted` authority (`localStorage "parlor:muted"`), named `sfx.*`
>   one-shots (`tick/select/correct/wrong/combo/win/lose/countdown`), themed
>   ceremony cues (`sfxDoorLatch/sfxGlassClink/sfxPianoChord/sfxCorrect/sfxWrong`),
>   the `audio` manager (`sfx(cue)` where `SfxCue = "place"|"correct"|"wrong"|"hover"`,
>   plus `stinger()`), and optional `/audio/*.mp3` buffer upgrades.
> - `frontend/components/SoundToggle.tsx` — the one global mute button; defaults
>   muted-until-mounted, persists to localStorage, chirps on unmute.
> - **Locked floors (NOT up for a vote):** every cue is procedurally synthesized
>   so the app ships **zero audio assets** and plays from a clone; a bundled
>   `/audio/*.mp3` may *upgrade* a cue but is never *required* (CSP/no-CDN, offline);
>   there is exactly ONE mute authority; reduced-motion already silences the bed.
>
> **Games:** clock (Chronos), streak (Ignite), map (Atlas), mystery (Sanctum),
> wedges (Fractures), thread (Thread), seance (Seance).
> **Orphan rooms:** board, daily, gauntlet, ladder.

---

## A. Coverage — which games get event SFX at all

### Q1: Which games get *any* interaction SFX (one-shot cues on click/answer/tick)?
- [x] A) All 7 games + all 4 orphan rooms (universal cue coverage)
- [ ] B) The 6 immersive rooms only (clock/streak/map/mystery/wedges/seance), orphans silent
- [ ] C) Fast/arcade games only (clock/streak/gauntlet) — the rest read as "quiet"
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies):

### Q2: Which cue *categories* fire per game? (place/select, correct, wrong, hover, countdown, combo, stinger)
- [x] A) Full set everywhere it applies
- [ ] B) Result-only (correct/wrong/stinger) — no hover/tick chatter
- [ ] C) Per-game matrix below (tick the cells that apply)
- [ ] Other: __________________________________________
> USER NOTES — per-game cue matrix:
> | game     | place/select | correct | wrong | hover/tick | countdown | combo | stinger |
> |----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
> | chronos  |     |     |     |     |     |     |     |
> | ignite   |     |     |     |     |     |     |     |
> | atlas    |     |     |     |     |     |     |     |
> | sanctum  |     |     |     |     |     |     |     |
> | fractures|     |     |     |     |     |     |     |
> | thread   |     |     |     |     |     |     |     |
> | seance   |     |     |     |     |     |     |     |
> | board    |     |     |     |     |     |     |     |
> | daily    |     |     |     |     |     |     |     |
> | gauntlet |     |     |     |     |     |     |     |
> | ladder   |     |     |     |     |     |     |     |

### Q3: The `hover`/`tick` cue (currently `sfx.tick`, a 40ms square blip) — where is it welcome vs annoying?
- [ ] A) Nowhere — hover audio always grates; drop it entirely
- [x] B) Only on deliberate targets (map pins in atlas, wedge slices in fractures)
- [x] C) Only during a live timer (clock tick in chronos/gauntlet)
- [ ] Other: __________________________________________
> USER NOTES:

---

## B. Voice — sampled asset vs procedural synth, per game

### Q4: Should any game's cues *require* a distinct sampled voice (a bundled `/audio/*.mp3`), given synth is the guaranteed floor?
- [ ] A) No — synth-only everywhere; assets stay a pure optional upgrade
- [x] B) Yes, for the ceremony rooms only (thread/seance/ladder) — synth still the fallback
- [x] C) Yes for the room-completion `stinger()` only; interactions stay synth
- [ ] Other: __________________________________________
> USER NOTES (which games earn a sampled voice):

### Q5: When a bundled asset IS present, which games get a *themed* cue palette vs the shared generic set?
- [ ] A) Shared generic cues everywhere (one palette, cheapest)
- [x] B) Themed per mood: séance = eerie, thread = warm/speakeasy, fractures = brittle/glass, atlas = travel
- [x] C) Themed only for correct/wrong/stinger; place/hover stay generic
- [ ] Other: __________________________________________
> USER NOTES (per game timbre intent):

### Q6: Which existing themed one-shots map onto which games? (`sfxDoorLatch`, `sfxGlassClink`, `sfxPianoChord`)
- [x] A) Keep current: door+glass+piano → thread/seance/ladder ceremonies only
- [x] B) Reuse `sfxGlassClink` for fractures slice-lock, `sfxPianoChord` for chronos reveal
- [ ] C) Retire the themed set — collapse to the generic `sfx.*` everywhere
- [ ] Other: __________________________________________
> USER NOTES:

### Q7: Correct/wrong feedback — the plain `sfx.correct/wrong` vs the richer `sfxCorrect/sfxWrong`. Which per game?
- [x] A) Rich pair everywhere (better feel, slightly longer tones)
- [ ] B) Plain pair for fast games (chronos/ignite/gauntlet), rich pair for slow/ceremony rooms
- [x] C) Let each game pick; document the choice in its component
- [ ] Other: __________________________________________
> USER NOTES (per game):

---

## C. Volume & mix — per-game loudness within the shared master

### Q8: Do games need per-game base volume, or is one global level fine?
- [ ] A) One global level — every cue uses its hard-coded gain (current behavior)
- [ ] B) Per-game volume multiplier (e.g. atlas quieter, ignite louder) applied to all its cues
- [x] C) Per-category ceilings (hover softest, stinger loudest) shared across games
- [ ] Other: __________________________________________
> USER NOTES (relative loudness per game, e.g. 0.5×–1.5×):

### Q9: Rapid-fire cues (ignite combo streak, chronos ticking, gauntlet speed round) — how to avoid a harsh pile-up?
- [ ] A) Do nothing — short blips already decay fast enough
- [x] B) Rate-limit / throttle repeats (min gap ms) per game
- [ ] C) Duck earlier cues when a new one fires (soft voice-stealing)
- [ ] Other: __________________________________________
> USER NOTES:

### Q10: The `combo(level)` cue rises in pitch with level — which games use it and how far does it climb?
- [ ] A) Ignite only, uncapped rise (current)
- [x] B) Ignite + gauntlet + streak-on-board, cap the pitch so it never gets shrill
- [ ] C) No combo cue — replace with a single fixed "streak up" blip
- [ ] Other: __________________________________________
> USER NOTES:

### Q11: The win/lose fanfare (`sfx.win`/`sfx.lose` vs the `stinger()`) — which fires on which game's end state?
- [ ] A) `stinger()` for every room completion; `win`/`lose` only for pass/fail games (streak/gauntlet)
- [x] B) Full fanfare everywhere a game can be "won" or "lost"
- [x] C) Ceremony rooms (thread/seance/ladder) get a bespoke close, others get `stinger()`
- [ ] Other: __________________________________________
> USER NOTES (per game end-state cue):

---

## D. Mute & gating — per-game mute behavior within one authority

### Q12: The mute is one global authority. Does any game want a *scoped* override (e.g. SFX on but bed off)?
- [x] A) No — single global mute silences everything, keep it simple
- [ ] B) Split control: separate SFX vs ambient-bed toggles, both under the one button's menu
- [ ] C) Per-game remembered preference (this room defaults quiet even when globally unmuted)
- [ ] Other: __________________________________________
> USER NOTES:

### Q13: Default state — the toggle currently boots **muted**. Should any game auto-prompt or auto-enable audio?
- [ ] A) Keep muted-by-default globally; user opts in once, persists
- [x] B) Ceremony rooms (thread/seance) show a one-time "sound recommended" nudge
- [ ] C) Never auto-enable; but surface the toggle more prominently in audio-heavy rooms
- [ ] Other: __________________________________________
> USER NOTES:

### Q14: Reduced-motion already silences the ambient bed. Should it also gate *event SFX* per game?
- [ ] A) No — SFX are not motion; reduced-motion leaves cues fully audible everywhere
- [ ] B) Yes for the busiest games (ignite/gauntlet) — reduced-motion trims their cue density too
- [x] C) Reduced-motion drops decorative cues (hover/combo) but keeps result cues (correct/wrong)
- [ ] Other: __________________________________________
> USER NOTES:

### Q15: First-gesture unlock (autoplay policy) — the ctx wakes on first user gesture. Which game's first interaction is the unlock?
- [x] A) Any click anywhere (current) — no game-specific handling
- [x] B) Each game arms audio on its primary action (place tile, spin wedge, start timer)
- [x] C) A single "tap to enable sound" affordance shared across rooms
- [ ] Other: __________________________________________
> USER NOTES:

---

## E. Per-game cue identity — the signature sound of each room

### Q16: Give each game ONE signature interaction cue (the sound a player will remember). Fill the table.
- [ ] A) I'll specify per game below
- [x] B) Use sensible defaults — you propose one per game
- [ ] C) No signatures — keep every game on the shared generic set
- [ ] Other: __________________________________________
> USER NOTES — signature cue per game:
> | game     | the moment it fires        | desired character (e.g. "wooden click", "glass ping") |
> |----------|----------------------------|-------------------------------------------------------|
> | chronos  | lock in a year guess       |                                                       |
> | ignite   | extend the streak          |                                                       |
> | atlas    | drop a map pin             |                                                       |
> | sanctum  | reveal a clue              |                                                       |
> | fractures| claim a wedge slice        |                                                       |
> | thread   | connect the thread         |                                                       |
> | seance   | summon / answer            |                                                       |
> | board    | pick a tile                |                                                       |
> | daily    | submit a guess             |                                                       |
> | gauntlet | survive a round            |                                                       |
> | ladder   | climb a rung               |                                                       |

### Q17: Anything that should stay SILENT no matter what? (a room where audio would break the mood)
- [x] A) Nothing — every room may sound
- [ ] B) Séance stays near-silent except a single summon cue (tension over feedback)
- [ ] C) Daily/board stay silent (puzzle focus), sound reserved for the immersive rooms
- [ ] Other: __________________________________________
> USER NOTES: Rooms that are recommended with silence can have very passive audio.

---

> **Reminder:** answers here feed the SFX/cue layer only. Ambient beds, CSS/motion,
> and CSP/offline are separate intake files — flag any cross-cutting note for them.
