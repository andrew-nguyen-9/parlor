# The Séance — Design-Intake Questionnaire (game-specific)

> **For the USER to review.** Séance (*Sanctum* / Ouija logic-grid) is a daily **logic grid puzzle** dressed as a
> Victorian séance. **The puzzle LOGIC is FROZEN** (`lib/seance.ts` deduction rules unchanged) — every question
> below is presentation / feedback / pacing / atmosphere / audio / mobile, never a rule change. Defaults are
> **bold, v4-led** (`docs/v4/08_seance.txt`): full-bleed immersion, amplified Ouija, cinematic ceremony, Apple-fy.
> Each question = my recommended `[x]` + `> WHY:` + a blank `> USER NOTES:`. **The recommended picks ARE the
> assumed spec** — accept all → zero re-brief; override via a notes line → re-briefs only that unit. Pairs with
> the CORE doc (`_core.md`); authoring rules in `AUTHORING.md`.
>
> **~280 questions**, 6 sections. This replaces the earlier 44-Q seed (its picks are preserved + expanded).

## Contents
- **S1 · Setup, framing & onboarding** — the cold-open, invitation, backstory, clue reveal
- **S2 · Rules-surface, interaction & deduction feedback** — cell-cycle, auto-elim, clue tracing, feedback (E2)
- **S3 · Scoring, win/lose & the Banished ceremony** — score model, fail states, the flagship ceremony
- **S4 · Visual overhaul — the 13 UI issues, palette, typography & skin** — the E2 driver
- **S5 · Immersion, atmosphere, ghosts & Ouija ritual** — ambient, planchette, textures (E2)
- **S6 · Animated tutorial, audio content, mobile & edge cases** — E3 · E4-content · E5-mobile · edge

---

## S1 · Setup, framing & onboarding

> Séance puzzle LOGIC is frozen — every question below is presentation, framing,
> pacing, or onboarding only, never a rule change. Picks default to the bold,
> v4-led vision (`docs/v4/08_seance.txt`): a full-bleed immersive open, a séance
> invitation, candles that ignite, a planchette that settles, parchment whispers
> that flutter in. v4 wins ties over the currently-shipped behavior (today the
> grid renders instantly with a HUD line + a `defaultOpen` clue rail). Exactly
> one `[x]` per question unless the options genuinely compose.

## The cold open — round-open sequence

### Q: How should a Séance round open — what does the player see first?
- [ ] A) The full grid already laid out (all seats/categories visible), candles lit, clues in the left rail
- [ ] B) A dark table; candles ignite one by one and the grid fades in as the planchette settles to center
- [x] C) A "séance invitation" card (rite + spirit + backstory) the player must tap to "begin the séance," then the grid
- [ ] Other: __________________________________________
> WHY: v4 opens with "a fresh séance invitation" and a deliberate ceremony — a tap-to-begin gate turns a spreadsheet into a rite, sets the mood before any deduction, and satisfies the autoplay-policy first-interaction requirement for audio in one gesture.
> USER NOTES:

### Q: What lives on the séance invitation card?
- [ ] A) Just "Tonight's séance" + a begin button (minimal)
- [x] B) Rite name, the spirit's name, one line of backstory, the date, and a single "Begin the séance" seal to tap
- [ ] C) Full backstory paragraph + puzzle size + difficulty, like a full case briefing
- [ ] Other: __________________________________________
> WHY: Enough to establish who you're summoning and why (the emotional hook) without front-loading a wall of text — Apple-fy restraint: fewer, better elements, the fuller backstory deferred to the case file and Spirit Memory.
> USER NOTES:

### Q: What is the invitation card's material / visual treatment?
- [ ] A) A standard Parlor card, re-tinted spectral
- [x] B) Aged ivory parchment with faded gold-foil border, wax-seal begin affordance, sitting on the dark walnut table
- [ ] C) A carved-wood plaque with brass engraving
- [ ] Other: __________________________________________
> WHY: v4's "appears like a fresh séance invitation" + parchment/foil/wax material vocabulary; the wax seal reads instantly as "press to break the seal," premium via CSS craft (texture + gradient + shadow), zero runtime cost.
> USER NOTES:

### Q: How does the player trigger "begin the séance"?
- [ ] A) A plain button labeled "Start"
- [x] B) Press-and-the-seal-breaks: a single tap on the wax seal / "Begin the séance" affordance, wood-depress feel
- [ ] C) A hold-to-summon gesture (press and hold ~1s to build tension)
- [ ] Other: __________________________________________
> WHY: One deliberate tap is the lowest-friction gate that still feels ceremonial; hold-to-summon risks fighting the ≥44px target Floor and frustrating repeat players — save tension-building for the reveal, not the entry gesture.
> USER NOTES:

### Q: After the seal breaks, do candles ignite one by one as the table appears?
- [x] A) Yes — candles ignite in sequence, warm light blooming outward from center, revealing the table
- [ ] B) All candles are simply already lit when the grid fades in
- [ ] C) No candle animation — a straight cross-fade to the lit table
- [ ] Other: __________________________________________
> WHY: v4's completion ceremony "every candle ignites"; echoing a gentler version at the open bookends the ritual and motivates the one warm light source (Apple-fy: one light source, slow deliberate reveal). Finite ≤600ms per candle, staggered, so it never spends the loop budget.
> USER NOTES:

### Q: Does the planchette settle to board center as the opening beat?
- [x] A) Yes — the planchette drifts in and settles to center as the grid resolves, then begins its idle
- [ ] B) The planchette is already parked at center from the first frame
- [ ] C) No planchette during the open; it appears only once play starts
- [ ] Other: __________________________________________
> WHY: The planchette is the game's signature animated element (v4); having it glide to rest as the final open beat hands the board to the player and establishes it as a living companion from second one — a single finite settle before its idle loop.
> USER NOTES:

### Q: Is the underlying table revealed by a dark-table fade-in, or lit from the start?
- [x] A) Dark table fades up from black/near-black as candles catch — corners stay in shadow (lit-center vignette)
- [ ] B) Table is fully lit and even from the first painted frame
- [ ] C) A quick fade with no darkness beat
- [ ] Other: __________________________________________
> WHY: v4 lighting: "warm candlelight illuminates the interface, corners fade naturally into darkness" — emerging from dark is the whole séance feeling, and it matches the shipped `AmbientGlow` lit-center vignette so the open flows straight into the ambient sim.
> USER NOTES:

### Q: What is the choreography order of the cold-open beats?
- [x] A) Invitation → seal breaks → dark table fades up → candles ignite in sequence → planchette settles → clues flutter in → interactive
- [ ] B) Invitation → everything (table, candles, grid, clues) resolves together in one fade
- [ ] C) Invitation → grid appears instantly → candles/planchette animate in after play has begun
- [ ] Other: __________________________________________
> WHY: A staged, legible sequence (light, then the board, then the whispers) reads as a ceremony and directs attention in the right order; simultaneous reveals muddy the moment and undercut the deliberate pacing v4 asks for ("nothing should animate quickly").
> USER NOTES:

### Q: How long is the full cold open before the board is interactive?
- [ ] A) Snappy — under ~1s total
- [x] B) ~2–3s of deliberate ceremony, but the board is tappable the instant it resolves (never gate input behind flourish)
- [ ] C) A longer ~4–5s cinematic
- [ ] Other: __________________________________________
> WHY: Long enough to feel like a rite, short enough to respect a daily habit; the hard rule is that flourish never blocks interaction once the grid is present — matches the shipped philosophy that effects are optional garnish over a complete frame.
> USER NOTES:

### Q: Do returning players (same day, already past the invitation) replay the full cold open?
- [ ] A) Yes — the ceremony plays every entry
- [x] B) First entry of a given daily plays the full open; re-entries restore straight to the board (with a brief candle-catch flourish only)
- [ ] C) A persistent "skip intro" toggle the player sets once
- [ ] Other: __________________________________________
> WHY: The ceremony is precious on first sight but tedious on the fifth return-from-tab; persistence already restores the board + timer (localStorage), so gate the full open on "first open of this puzzle" and give re-entries only a light flourish. Respects the daily-habit loop.
> USER NOTES:

### Q: What is the reduced-motion / "calm the room" variant of the cold open?
- [x] A) Invitation card still shown (it's a tap gate, not motion); on begin, the lit board appears with an instant cross-fade — no candle sequence, no planchette drift, no flutter
- [ ] B) Skip the invitation entirely and land straight on the grid
- [ ] C) Keep all beats but play them faster
- [ ] Other: __________________________________________
> WHY: Floor: every animation needs a reduced-motion variant. The invitation gate carries meaning (and the audio-unlock tap) so it stays; the motion beats collapse to an instant state change, matching the shipped reduced-motion contract (freeze ambient sim, instant state changes).
> USER NOTES:

## Framing narrative — rite · spirit · backstory

### Q: How prominent should the framing narrative (`rite`, `spirit`, `backstory`) be at the start?
- [x] A) Full-bleed intro moment — spirit name + backstory center stage on the invitation before the puzzle
- [ ] B) Compact HUD line only (as today), backstory as a small caption
- [ ] C) Backstory hidden behind an "open the case file" tap, HUD shows just rite + spirit
- [ ] Other: __________________________________________
> WHY: Bold, v4-led full-bleed immersion — the spirit and its story are the reason to care about the deduction, so they get one uninterrupted center-stage moment on the invitation before the grid crowds them out; the HUD then keeps only a quiet reminder.
> USER NOTES:

### Q: Where does the framing live once play has started (after the invitation)?
- [ ] A) Full backstory paragraph pinned above the grid the whole session
- [x] B) A quiet HUD line (rite · spirit) with backstory available behind an "open the case file" tap
- [ ] C) Framing disappears entirely once you're playing
- [ ] Other: __________________________________________
> WHY: The intro already delivered the story full-bleed; during solving the player needs the grid, so demote framing to an unobtrusive HUD line + on-demand recall — keeps focus on deduction while never losing the thread (v4: "nothing should distract from solving").
> USER NOTES:

### Q: How is the deeper backstory recalled mid-play?
- [x] A) An "open the case file" affordance that slides open a parchment/journal panel with the full backstory
- [ ] B) A hover tooltip on the spirit's name
- [ ] C) It isn't recallable — it's shown once at the open only
- [ ] Other: __________________________________________
> WHY: v4 explicitly names the "open the case file" reveal and the old-medium's-journal aesthetic; an explicit, re-openable panel lets curious players re-read without the story ever occupying grid space, and reuses the journal material already planned for the archive.
> USER NOTES:

### Q: How is the spirit's name treated typographically at the intro?
- [x] A) Large elegant Victorian serif with antique letter-spacing and a decorative drop-initial, faintly engraved/foil
- [ ] B) The current Parlor microlabel accent style, just larger
- [ ] C) A plain heading, no ornament
- [ ] Other: __________________________________________
> WHY: v4 typography: "elegant serif headings, decorative initials, subtle engraved effects, letter-spacing evoking antique printed books" — the spirit's name is the emotional center of the intro and deserves the flagship type treatment. Headings-only keeps body copy in the readable face (≥1rem Floor untouched).
> USER NOTES:

### Q: Should the spirit have a visual identity (sigil / silhouette) on the invitation?
- [x] A) Yes — a subtle etched sigil or veiled silhouette accompanying the name, cool-blue lit, never a literal cartoon ghost
- [ ] B) No visual — name and backstory text only
- [ ] C) A full illustrated portrait
- [ ] Other: __________________________________________
> WHY: v4: ghosts emit cool blue light, "avoid stereotypical Halloween visuals," elegant over campy — an abstract etched sigil gives the spirit presence and ties to the completion "hidden spirit appears" beat, without needing bespoke per-spirit art (a procedural/glyph sigil is CSS/SVG-cheap).
> USER NOTES:

### Q: How does the rite label read?
- [x] A) Evocative Victorian rite names ("The Parlour Séance," "The Midnight Sitting") in small-caps microlabel
- [ ] B) Functional labels ("Puzzle #142")
- [ ] C) Just the date
- [ ] Other: __________________________________________
> WHY: The rite is atmosphere-per-word; Victorian naming sustains the fiction that this is a sitting, not a puzzle number. Keeps the existing `rite · spirit` microlabel slot, just leans the copy more period-authentic (v4 voice: reverent, mysterious).
> USER NOTES:

### Q: What tone and length should the backstory copy hold?
- [x] A) 1–2 sentences, reverent and slightly ominous, hinting at why this spirit is restless (a hook, not a synopsis)
- [ ] B) A full paragraph of lore
- [ ] C) A single teasing clause
- [ ] Other: __________________________________________
> WHY: Enough to make the spirit feel like a person with unfinished business (motivating the "reveal their true identity" payoff) but short enough to read in one breath on the invitation — Apple-fy restraint, and it fits the existing `backstory` field without schema change.
> USER NOTES:

### Q: On completion / archive re-entry, how does the framing re-present?
- [x] A) The Spirit Memory card ties the solved grid back to the spirit's identity/backstory; archive entries reopen as journal pages carrying the same framing
- [ ] B) Framing isn't shown again after the first solve
- [ ] C) Only the raw time/strikes, no narrative recap
- [ ] Other: __________________________________________
> WHY: v4: "the spirit's true identity revealed" + Spirit Memory card + archive-as-medium's-journal — closing the narrative loop makes the deduction feel like it meant something, and reuses the journal/case-file material established at the open.
> USER NOTES:

## First-run onboarding

### Q: Should any cell be pre-seated as a worked example on the very first puzzle a new player sees?
- [ ] A) No — always a blank board; the player learns by doing
- [x] B) Yes, one confirm pre-placed with a "the spirits offer a gift" label (first-ever play only)
- [x] C) A one-time interactive tutorial séance separate from the daily
- [ ] Other: __________________________________________
> WHY: Composes: the gift cell teaches the confirm→auto-eliminate payoff in-situ on the real board, while the optional separate tutorial séance protects the sacred daily from being a teaching sandbox — together they onboard without ever mutating the daily's frozen logic or its shared start state.
> USER NOTES:

### Q: When is onboarding offered?
- [x] A) First-ever Séance session only (persisted flag); never again unless re-requested
- [ ] B) Every time a player starts a new daily
- [ ] C) Whenever a puzzle introduces a size/clue-type the player hasn't seen
- [ ] Other: __________________________________________
> WHY: Onboarding is a one-time cost; showing it repeatedly insults returning players and clutters the daily ritual. A single localStorage flag (like the existing hint-panel/persistence pattern) gates it, with an explicit re-access path for anyone who wants a refresher.
> USER NOTES:

### Q: How is the gift cell labeled and revealed?
- [x] A) "The spirits offer a gift" — the confirm appears with a soft spirit-orb bloom and a one-line note on what it means (this seat is bound; watch its row/column snuff)
- [ ] B) A pre-placed confirm with no explanation
- [ ] C) A generic "example" badge
- [ ] Other: __________________________________________
> WHY: The gift only teaches if it explains the mechanic it demonstrates (confirm → derived auto-elimination), and the "gift from the spirits" framing keeps the lesson inside the fiction rather than breaking into tutorial-UI voice (v4: notifications as "messages from beyond").
> USER NOTES:

### Q: Is the tutorial séance a separate puzzle or an overlay on the daily?
- [x] A) A separate, tiny fixed practice séance (its own board) reachable before/instead of the first daily — never touches the daily's state
- [ ] B) An overlay of coach-marks drawn on top of the real daily board
- [ ] C) No dedicated tutorial — the gift cell is the only teaching
- [ ] Other: __________________________________________
> WHY: A separate fixed board lets the player make (and undo) real mistakes safely without spending or corrupting the shared daily; overlaying the daily risks nudging the frozen puzzle's start state and pressures a first-timer under the live clock. (The animated tutorial's motion design itself is section S6.)
> USER NOTES:

### Q: Is onboarding skippable / dismissible?
- [x] A) Yes — a clear "skip the tutorial / enter the séance" out at every step; experienced players never sit through it
- [ ] B) Mandatory the first time; must complete before the first daily
- [ ] C) No tutorial at all, only the gift cell
- [ ] Other: __________________________________________
> WHY: Accessible-by-construction and respectful of players arriving from other Parlor rooms who already grok logic grids; a forced tutorial is friction. The gift cell (which is passive) remains as the always-present safety net for anyone who skips.
> USER NOTES:

### Q: Beyond the gift cell and optional tutorial, how much learn-by-doing coaching appears on the real board?
- [x] A) At most one gentle, dismissible first-move nudge (e.g. planchette leans toward an obvious opening deduction); otherwise trust the player
- [ ] B) Persistent coach-marks on every control until dismissed
- [ ] C) None — no in-board coaching at all
- [ ] Other: __________________________________________
> WHY: The planchette already "leans toward an area that deserves attention" (hint behavior) — reusing that as a single silent first-move suggestion teaches in-fiction without tutorial chrome cluttering the flagship board. Persistent coach-marks would violate the "nothing resembles standard UI" goal.
> USER NOTES:

### Q: How is the core cell-cycle (blank → snuffed candle → glowing rune → blank) first taught?
- [x] A) A short in-fiction line on the invitation / first board ("tap to snuff a candle, tap again to light the rune") plus the gift cell demonstrating a lit rune
- [ ] B) A separate legend panel the player must read
- [ ] C) Not taught explicitly — discovered by tapping
- [ ] Other: __________________________________________
> WHY: The three-state tap is the one genuinely non-obvious control; a single fiction-flavored sentence paired with a live example (the gift) is the minimum that prevents confusion without a manual — the candle/rune vocabulary is already the shipped state names.
> USER NOTES:

### Q: Is the "player has seen onboarding" state persisted, and where?
- [x] A) Yes — localStorage flag (client-only, like scores/persistence); zero DB writes from the frontend
- [ ] B) Server-side per account
- [ ] C) Not persisted — recompute each visit
- [ ] Other: __________________________________________
> WHY: Floor: the frontend never writes the DB, and Séance has no accounts — onboarding-seen is exactly the localStorage-shaped state the app already uses for streaks/persistence. Keeps zero-env play fully functional.
> USER NOTES:

### Q: Can onboarding be re-accessed later?
- [x] A) Yes — a "how to conduct a séance" entry in the room's help/menu re-opens the tutorial séance any time
- [ ] B) No — first run only, gone forever
- [ ] C) Only by clearing browser storage
- [ ] Other: __________________________________________
> WHY: Players return after weeks away and forget; a discreet, always-available "rules of the sitting" recall costs nothing and prevents the frustration of a lost mechanic — standard accessible practice, themed as a page in the medium's journal.
> USER NOTES:

## The whispers — clue list first presentation

### Q: How is the clue list ("the spirit whispers") presented on first sight?
- [ ] A) All clues expanded in the left rail, plain list
- [x] B) Clues appear as torn parchment slips that flutter in one at a time
- [ ] C) Collapsed panel showing only the count; player expands to reveal
- [ ] Other: __________________________________________
> WHY: v4: "microinteractions... tooltips appear like handwritten notes," "notifications delivered as messages from beyond" — the spirit whispering each clue onto a fluttering parchment slip is the immersive, v4-led read of the clue rail, and it makes the clues feel authored by the spirit rather than printed by a UI. Finite staggered entrance, no loop.
> USER NOTES:

### Q: What is each clue's material / visual treatment?
- [x] A) Torn ivory parchment slip, antique serif ink, faint deckled edge and drop-shadow — like a note laid on the table
- [ ] B) A plain bordered list row, re-tinted
- [ ] C) Engraved into a wood panel
- [ ] Other: __________________________________________
> WHY: v4 material vocabulary (old parchment, aged paper, handwritten notes) and "inputs: parchment textures" — parchment slips read as whispers-made-physical and keep clue prose on a high-contrast ivory ground (protecting the ≥4.5:1 body-text Floor; text never sits in a gradient/flame).
> USER NOTES:

### Q: How do the parchment slips flutter in — timing and order?
- [x] A) Staggered, top-to-bottom, ~80–120ms apart, each a short settle (≤600ms), as if laid down one by one
- [ ] B) All at once with a single fade
- [ ] C) Random order / random positions
- [ ] Other: __________________________________________
> WHY: A gentle top-down stagger reads as the spirit dictating in sequence and directs the eye through the clues in reading order; each slip's entrance is finite ≤600ms so the composition never spends the ≤1-loop viewport budget (which the planchette already holds).
> USER NOTES:

### Q: What is the rail's default state on desktop after the flutter-in settles?
- [x] A) Fully expanded — all clues readable (the flutter-in resolves to today's shipped `defaultOpen` rail)
- [ ] B) Collapsed to just the count; player expands
- [ ] C) Expanded but only the first ~3 clues, "reveal more" for the rest
- [ ] Other: __________________________________________
> WHY: Clues are load-bearing for a no-guessing deduction — hiding them behind a click adds friction with no atmospheric payoff. The flutter is the flourish; the resting state stays the shipped fully-open rail, so the frozen solve experience is unchanged.
> USER NOTES:

### Q: What does the whisper panel's title / count read as?
- [x] A) "the spirit whispers (N)" — lowercase, intimate, count in parentheses (as shipped)
- [ ] B) "Clues (N)" — plain and functional
- [ ] C) No count, just "the spirit whispers"
- [ ] Other: __________________________________________
> WHY: The shipped copy is already on-voice and the count is genuinely useful (players track how many whispers remain); keep it. Dropping the count would lose real utility for no thematic gain.
> USER NOTES:

### Q: Do the clues flutter in on every entry, or only first sight?
- [x] A) Flutter on first open of a given daily; on re-entry (restored board) they're simply present, no re-animation
- [ ] B) Flutter every single time the board mounts
- [ ] C) Only ever animate for a brand-new player, never after
- [ ] Other: __________________________________________
> WHY: Consistent with the cold-open rule — the flourish belongs to the first arrival at a puzzle; replaying it on every tab-return is tedious and delays access to load-bearing clues. Ties to the same "first open of this daily" flag as the cold open.
> USER NOTES:

### Q: When a clue is flagged spent, how does the slip respond?
- [x] A) The parchment dims and slightly curls/creases (spent), still readable, restorable via its ✓ toggle (as shipped, re-skinned)
- [ ] B) The slip animates away / is removed
- [ ] C) No visual change beyond the checkmark
- [ ] Other: __________________________________________
> WHY: v4 wants "solved relationships receive elegant engraved embellishments rather than simple highlights"; a dimmed, curled slip that stays readable and restorable preserves the shipped non-destructive flag behavior (no logic change) while making "spent" feel physical.
> USER NOTES:

## Entry, loading & the first frame

### Q: On mobile, where do the clues live relative to the grid?
- [x] A) Collapsible drawer above the grid (rail collapses to a bar)
- [ ] B) Bottom sheet the player pulls up over the grid
- [ ] C) Inline, clues stacked above, grid scrolls below (current vertical flow)
- [ ] Other: __________________________________________
> WHY: The transposed matrix already fits narrow widths with no horizontal scroll; a collapsible drawer-bar above the grid keeps the whispers one tap away without permanently stealing the vertical space the tall K·N grid needs, and honors ≥44px touch targets on the bar.
> USER NOTES:

### Q: What renders during the summoning / loading state (fetch or SSR settle)?
- [x] A) A dark table with a single guttering candle and "summoning…" microtext — the séance mood begins before content arrives
- [ ] B) A generic Parlor spinner / skeleton
- [ ] C) Blank until content paints
- [ ] Other: __________________________________________
> WHY: The loading beat is free atmosphere — an in-fiction summoning state (v4 "loading/summoning") makes even the wait feel like the room drawing breath, and it flows continuously into the dark-table fade-in of the cold open rather than jarring from a modern spinner.
> USER NOTES:

### Q: What is the very first painted frame (pre-hydration / no-JS / seed-bank)?
- [x] A) The complete dark-table + invitation card (or the board, on re-entry) rendered server-side — fully legible and playable-shaped before any JS
- [ ] B) A blank/loading frame until the client hydrates the atmosphere
- [ ] C) The lit grid with no framing until JS adds it
- [ ] Other: __________________________________________
> WHY: Floor: the no-JS / no-network / reduced-motion frame must render complete on its own — effects are optional garnish. The invitation and board are server-renderable content; candles/planchette/flutter are progressive enhancement layered on after hydration, so zero-env build stays green.
> USER NOTES:

### Q: How does the route transition into Séance from the home page feel?
- [x] A) A brief fade-to-dark as the parlor door closes behind you, resolving into the summoning state — a deliberate threshold
- [ ] B) An instant hard cut to the Séance page
- [ ] C) A standard Parlor page-slide
- [ ] Other: __________________________________________
> WHY: v4 "transitions are slow, deliberate, and cinematic" and the door-latch SFX already exists in the shipped sound set (`sfxDoorLatch`) — a short fade-through-dark sells "entering the sitting room" and pairs sound to motion. Kept finite (≤600ms) with a reduced-motion instant-cut fallback.
> USER NOTES:

### Q: How does the seed-bank (zero-env / offline) open compare to the online open?
- [x] A) Identical — the full invitation, cold open, and atmosphere run entirely client-side; no marker distinguishing offline
- [ ] B) Same puzzle but a visible "playing from the archive" marker when offline
- [ ] C) A stripped-down open when offline
- [ ] Other: __________________________________________
> WHY: Atmosphere is pure CSS/GPU and the seed bank always yields a playable daily — there's no reason the offline open should feel lesser, and an "offline" badge would puncture the immersion for no user benefit (the deduction and mood are wholly client-side).
> USER NOTES:

### Q: What does the summoning microcopy say?
- [x] A) Rotating in-fiction lines ("lighting the candles…", "the veil thins…", "the spirit stirs…"), reverent and brief
- [ ] B) "Loading…"
- [ ] C) No text, atmosphere only
- [ ] Other: __________________________________________
> WHY: v4 voice is reverent and mysterious; a couple of short seeded lines (via `lib/rng.ts` for SSR-consistency, no `Math.random()` in render) keep the wait in-world. Must stay ≥1rem and high-contrast on the dark table (body-text Floor).
> USER NOTES:

### Q: What is the entry transition's duration and easing?
- [x] A) Slow, soft ease-in-out, ~400–600ms per beat — deliberate, never snappy (v4: "nothing should animate quickly")
- [ ] B) Fast, ~150–250ms, keep it brisk
- [ ] C) No easing preference — use the Parlor default
- [ ] Other: __________________________________________
> WHY: v4 explicitly wants slow, deliberate, cinematic motion with smooth easing throughout; ~400–600ms sits at the top of the finite-animation Floor (≤600ms) so it feels luxurious without ever crossing into sluggish or budget-violating territory. Reduced-motion collapses these to instant.
> USER NOTES:

## S2 · Rules-surface, interaction & deduction feedback

> Séance puzzle **logic is FROZEN** (`lib/seance.ts` deduction rules unchanged). Every question below is about how the shipped rules are *presented and felt* — gesture surface, mark rendering, clue feedback, planchette behavior, and the correct/incorrect sensory beats — never a change to the no-guessing deduction. Picks are v4-led (richer feedback, disciplined motion). Exactly one `[x]` unless the options genuinely compose.

---

### Cell-cycle interaction

#### Q: The cell-cycle is blank → snuffed candle (exclude) → glowing rune (confirm) → blank on a single tap. Keep three states on one control?
- [x] A) Keep exactly as-is (single tap cycles all three)
- [ ] B) Tap toggles exclude; long-press / second gesture sets confirm (fewer accidental confirms)
- [ ] C) Left-tap = confirm, right-click / two-finger = exclude
- [ ] Other: __________________________________________
> WHY: single-tap-cycles-three is the shipped muscle memory and the fastest path through a grid; the glow-up earns immersion in the *presentation* layer, not by re-teaching the control (v4: flow never changes).
> USER NOTES:

#### Q: If a rune is cycled one tap past confirm back to blank (an accidental over-tap), how forgiving should that be?
- [x] A) A lightweight inline "restore" affordance on the just-touched cell (no modal), leaning on the existing undo
- [ ] B) No special guard — undo/redo already covers it
- [ ] C) Require a settle-pause before confirm registers
- [ ] Other: __________________________________________
> WHY: an inline restore for the last cell is lighter than reaching for ⌘Z and never blocks fast cyclers; a settle-pause would fight the shipped tap rhythm.
> USER NOTES:

#### Q: Should confirm (glowing rune) land with heavier feedback than exclude (snuffed candle), given it carries more deductive weight?
- [x] A) Yes — confirm gets a brass-clink + one-shot rune ignite; exclude is a soft wax-snuff puff (distinct but quiet)
- [ ] B) Identical feedback for both states
- [ ] C) Confirm differs visually only, no distinct sound
- [ ] Other: __________________________________________
> WHY: the two marks mean different things, so their cues should differ; distinct-but-restrained feedback aids eyes-free confidence without adding a loop or breaking the mute floor.
> USER NOTES:

#### Q: Add a carved-wood "press" microinteraction on cell tap (v4: "wood depresses slightly")?
- [x] A) Yes — a sub-100ms wood-press + soft magical ripple on every cell tap
- [ ] B) No press, just the state-glyph swap
- [ ] C) Ripple only on confirm, not exclude
- [ ] Other: __________________________________________
> WHY: v4 asks every interaction to reinforce material; a ≤100ms press is GPU-cheap, finite, reduced-motion-exempt, and sells "engraved" over "flat UI".
> USER NOTES:

#### Q: Within the required color + glyph + label triple-encode, what glyph vocabulary reads clearest for the three cell states?
- [x] A) Snuffed candle (exclude) + glowing rune/sigil (confirm) + empty engraved slot (blank) — authentic séance vocabulary
- [ ] B) Classic logic-grid ✗ (exclude) + ● (confirm)
- [ ] C) Down-planchette (exclude) + up-planchette (confirm)
- [ ] Other: __________________________________________
> WHY: v4's authentic-séance vocabulary beats spreadsheet ✗/● and reads at a glance; every option keeps color + glyph + `aria-label` (bound/snuffed/unmarked), so the triple-encode floor holds.
> USER NOTES:

#### Q: Offer a hold-to-peek preview of the next cell state before committing?
- [x] A) No preview — the cycle is instant and discoverable; a peek adds latency to every tap
- [ ] B) Long-press previews the next state before it commits
- [ ] C) A first-run coach-mark shows the cycle order once
- [ ] Other: __________________________________________
> WHY: instant commit preserves the shipped solve speed and the "instant state changes" floor; teaching the cycle belongs in onboarding, not a per-tap delay.
> USER NOTES:

---

### Auto-elimination rendering

#### Q: Auto-elimination (confirming a cell auto-snuffs its row/column) is *derived, never stored*. How visible should the auto-X's be versus manual marks?
- [ ] A) Render auto-X's identically to manual X's (indistinguishable)
- [x] B) Auto-X's rendered dimmer / with a faint "the spirits did this" shimmer to distinguish machine vs. player marks
- [x] C) Let the player toggle that distinction on/off
- [ ] Other: __________________________________________
> WHY (compose B+C): a faint spirit-shimmer tells the player which marks their logic *forced* vs. which they placed — narratively "the spirits did this" — and a toggle keeps the calmer uniform grid available; neither touches the derived deduction.
> USER NOTES:

#### Q: How do the auto-snuffs appear when a confirm forces them?
- [x] A) They ripple outward from the confirmed cell along the row, then the column (a spirit "sweeping" the seats), staggered ≤600ms
- [ ] B) All appear instantly with the confirm
- [ ] C) Fade in slowly over ~1s
- [ ] Other: __________________________________________
> WHY: a short staggered sweep makes the causal chain legible ("this binding caused these") and stays finite ≤600ms; instant hides the logic, a 1s fade drags the solve.
> USER NOTES:

#### Q: When a confirm is undone, its derived auto-X's must vanish too. How is that shown?
- [x] A) The sweep reverses — auto-X's retract toward where the rune was, mirroring the bind animation
- [ ] B) They just disappear instantly
- [ ] C) A soft smoke-dissipate on the cleared cells
- [ ] Other: __________________________________________
> WHY: since auto-elim is derived (never stored), reversing the same motion keeps cause/effect readable and reinforces that undo is total.
> USER NOTES:

#### Q: How do the auto-X's behave under reduced motion?
- [x] A) They appear instantly with the confirm (no sweep), still carrying the static dimmer/shimmer distinction
- [ ] B) Drop the manual-vs-derived distinction entirely under reduced motion
- [ ] C) Keep the sweep, just slower
- [ ] Other: __________________________________________
> WHY: reduced motion strips the sweep to an instant state change (motion floor) while the spirit-shimmer distinction survives as a texture, not a motion.
> USER NOTES:

#### Q: Should the "the spirits did this" shimmer be a one-time shimmer-in or a persistent effect?
- [x] A) Shimmer once on creation, then settle to a persistent dimmer/desaturated state (no ongoing animation)
- [ ] B) A persistent faint pulsing glow on all auto-X's
- [ ] C) Distinct only during the shimmer-in, identical afterward
- [ ] Other: __________________________________________
> WHY: a one-shot shimmer honors the ≤1-loop-per-viewport floor (the planchette owns the loop), while a settled dimmer keeps the manual-vs-derived read available all round.
> USER NOTES:

---

### Clue interaction

#### Q: How does tracing a clue (tapping it) relate to the grid?
- [ ] A) Highlight the named cells' columns (current `hiCols` glow)
- [ ] B) Planchette drifts to point at the traced clue's region
- [x] C) Both — glow + planchette lean together
- [ ] Other: __________________________________________
> WHY: the glow answers "which seats?" precisely while the planchette lean sells the séance; together they make tracing feel supernatural without hiding the exact columns.
> USER NOTES:

#### Q: Should the player be able to "flag a clue spent" (✓) and have it dim?
- [x] A) Keep as-is, with the "N more eliminations possible — mark done anyway?" confirm
- [ ] B) Keep flagging but drop the confirm prompt (silent)
- [x] C) Also auto-dim a clue once no eliminations remain from it (given the current board)
- [ ] Other: __________________________________________
> WHY (compose A+C): manual spent-flagging with the honest confirm respects the player's own bookkeeping; auto-dimming a fully-exhausted clue is a safe presentation cue — it names no answer, only that the clue has nothing left to give.
> USER NOTES:

#### Q: What tone should the "mark clue spent" confirm take?
- [x] A) Spirit-voice, themed ("the whisper still holds N secrets — silence it anyway?")
- [ ] B) Plain functional copy ("N eliminations remain — mark done?")
- [ ] C) No dialog, silent flag
- [ ] Other: __________________________________________
> WHY: v4 wants notifications as "messages from beyond"; a themed confirm keeps immersion while still stating the honest count, and silent-flag loses the safety check.
> USER NOTES:

#### Q: The traced-column glow must keep cell text ≥4.5:1 and out of any gradient/flame. Within that floor, what's the glow's character?
- [x] A) A soft candle-wash bloom behind the cells (warm amber, low alpha)
- [ ] B) A crisp engraved gold outline around the traced columns
- [ ] C) A faint moonlight-blue tint
- [ ] Other: __________________________________________
> WHY: a warm bloom matches "lit by candlelight" and pairs with the planchette lean; all three keep runes/labels legible, so it's an aesthetic call — amber reads warmest as "the spirit's attention."
> USER NOTES:

#### Q: How should hover, keyboard-focus, and active/traced states differ on a clue row?
- [x] A) Hover = subtle parchment-lift + spectral-particle hint; focus = the one global focus ring (thickened, never recolored); active = persistent glow + ✓ available
- [ ] B) Same treatment for hover and focus
- [ ] C) No hover affordance, click-only
- [ ] Other: __________________________________________
> WHY: distinct hover/focus/active states with the single `--c-focus` ring satisfy the focus floor and give pointer users the "hover shimmers" v4 asks for without stealing the traced-state's glow.
> USER NOTES:

#### Q: Can multiple clues be traced (lit) at once?
- [x] A) Tracing a new clue replaces the last — one active trace (matches shipped `activeClue`)
- [ ] B) Allow pinning several clues lit simultaneously
- [ ] C) A trace-all toggle
- [ ] Other: __________________________________________
> WHY: a single active trace keeps the grid readable and matches the shipped one-clue `hiCols`; overlapping glows would muddy which seats belong to which whisper (clarity, logic untouched).
> USER NOTES:

#### Q: How does a dimmed / spent clue behave?
- [x] A) Stays tappable to re-trace and can be un-flagged (restore), exactly as shipped (○/✓ toggle)
- [ ] B) Spent clues collapse out of the list
- [ ] C) Spent clues lock until reset
- [ ] Other: __________________________________________
> WHY: the shipped ✓/○ restore is regret-proof; collapsing or locking a clue hides text the player may want to re-read, and re-reading changes nothing about the deduction.
> USER NOTES:

---

### Planchette as deduction cursor

#### Q: What is the planchette's resting / idle behavior?
- [x] A) Slow idle drift + tiny rotations as THE single viewport loop, easing toward the most-recent tapped cell like a cursor companion
- [ ] B) Parked at board center, moves only on binds / hints / completion
- [ ] C) Pure random drift, ignores the player's hand
- [ ] Other: __________________________________________
> WHY: letting the shipped drift settle toward the last touch turns the planchette into a felt deduction cursor ("the pointer follows your hand") while staying the one sanctioned loop; parking it wastes the signature element.
> USER NOTES:

#### Q: Keep the shipped lean + brighten on each confirm (the `pulse` reaction)?
- [x] A) Keep — a finite ≤600ms lean toward the bound seat + gold brighten on every confirm (shipped)
- [ ] B) Lean only, no brighten
- [ ] C) No per-bind reaction
- [ ] Other: __________________________________________
> WHY: the shipped 0.5s lean *is* the "correct deduction → planchette glides slightly" v4 moment; it's finite and reduced-motion-exempt, and dropping it removes the planchette's core reactivity.
> USER NOTES:

#### Q: When a clue is traced, the planchette leans toward its region — what region, kept answer-safe (never the solution)?
- [x] A) Toward the midpoint of the seats/columns the clue *names* (the whole candidate band)
- [ ] B) Toward the clue slip itself, then a soft nod at the grid
- [ ] C) A gentle sway between the named seats, resolving back to center
- [ ] Other: __________________________________________
> WHY: leaning at the candidate band (never any single cell) preserves the no-guessing deduction — it directs attention, never reveals which seat is correct; that firewall is the frozen-logic line.
> USER NOTES:

#### Q: How does the planchette react to a Poltergeist Strike (wrong submit)?
- [x] A) It recoils / hesitates — a finite stutter-back — then re-settles
- [ ] B) Planchette is unaffected by strikes
- [ ] C) It flees off-board
- [ ] Other: __________________________________________
> WHY: v4 lists "planchette hesitates" as the incorrect-deduction cue; a small finite recoil personifies the spirits' displeasure; fleeing off-board would lose the cursor.
> USER NOTES:

#### Q: Keep the completion "spelling" sweep (shipped `spelling`)?
- [x] A) Keep the finite glide sweep that "spells" then settles to center on Banished (shipped)
- [ ] B) Skip straight to center, no spell
- [ ] C) Spell out the actual solution letters
- [ ] Other: __________________________________________
> WHY: the shipped spelling sweep is the reverent signature moment; spelling literal answer letters would be gratuitous, and the sweep fires post-solve so logic is untouched.
> USER NOTES:

#### Q: Planchette behavior under reduced motion?
- [x] A) Freeze to a still, legible frame — no drift, no lean, no spell (shipped)
- [ ] B) Keep the lean but drop the drift
- [ ] C) Slow everything down
- [ ] Other: __________________________________________
> WHY: shipped behavior and the motion floor — reduced motion holds the one loop dead still; keeping any lean would leave an animation running with no reduced variant.
> USER NOTES:

---

### Correct-deduction feedback

#### Q: How much of the v4 correct-bind stack (glass-clink + pulse + orb/dust + brass shimmer) fires per confirm?
- [x] A) Layer them, disciplined: glass-clink (shipped) + soft row/col pulse + tiny spectral-dust puff + brass-engraving shimmer — all finite, one coordinated beat
- [ ] B) Just the glass-clink (shipped minimal)
- [ ] C) Full burst every bind (orb + dust + pulse + shimmer + sound)
- [ ] Other: __________________________________________
> WHY: v4 wants richer feedback but "disciplined"; one coordinated ≤600ms beat feels premium, while a full orb-summon on every cell would spam and blow the motion budget.
> USER NOTES:

#### Q: When does the spirit-orb (heavier than the dust puff) appear?
- [x] A) Reserve the orb for milestone binds (a seat fully resolved / a category completed); dust puff on ordinary binds
- [ ] B) Orb on every bind
- [ ] C) No orb until the completion ceremony
- [ ] Other: __________________________________________
> WHY: gating the orb to a resolved seat gives progression texture ("the spirits strengthen as deductions land") without desensitizing it; ordinary binds stay light.
> USER NOTES:

#### Q: What's the scope of the pulse on a correct bind?
- [x] A) Pulse the affected row AND column of the bound cell (the seats the bind touches)
- [ ] B) Pulse only the bound cell
- [ ] C) Pulse the whole grid
- [ ] Other: __________________________________________
> WHY: pulsing the row + column mirrors the auto-elimination the bind just caused, so the feedback teaches the deduction; a whole-grid pulse over-signals.
> USER NOTES:

#### Q: What audio accompanies a correct bind (must respect global mute)?
- [x] A) Glass-clink + a faint ghost-chime — short, non-repeating, silent under mute / reduced motion
- [ ] B) A longer resonant swell per bind
- [ ] C) No audio, motion only
- [ ] Other: __________________________________________
> WHY: short SFX honor the mute floor and stay out of the way at a fast solve pace; a per-bind swell would fatigue and steal the completion swell's specialness.
> USER NOTES:

#### Q: How is a settled, confirmed relationship treated after its bind beat (v4: "engraved embellishments rather than simple highlights")?
- [x] A) A one-shot brass-engraving shimmer, then it settles to a subtle engraved treatment (not a flat highlight)
- [ ] B) A flat colored highlight on bound cells
- [ ] C) No persistent treatment
- [ ] Other: __________________________________________
> WHY: v4 explicitly wants "elegant engraved embellishments" for solved relationships; settling to an engraved look reads premium and is a static texture (no loop).
> USER NOTES:

#### Q: Should the room warm / grow less haunted as correct binds accumulate (the seed's certainty→brighter signal)?
- [x] A) Yes — each correct bind nudges the room subtly brighter / calmer, very gradual and capped
- [ ] B) No cumulative change
- [ ] C) Sudden brightening only at milestones
- [ ] Other: __________________________________________
> WHY: the seed already chose "room gets less haunted as cells bind"; a gradual capped warm keeps it subliminal (players "notice after weeks") and never distracts from the current deduction.
> USER NOTES:

---

### Incorrect / Poltergeist-Strike feedback

#### Q: How much of the v4 strike stack (shake + darken + cold-mist + ghost-sigh + planchette-hesitate) fires on a wrong submit?
- [x] A) Layer them, disciplined: table shake (shipped) + brief room darken + cold-mist roll + ghost-sigh + planchette hesitate — one coordinated ≤600ms beat
- [ ] B) Keep just the shake + wrong-sound (shipped)
- [ ] C) A single red flash on the strike counter, no shake
- [ ] Other: __________________________________________
> WHY: v4 lists exactly this stack for a wrong submit; coordinated into one finite beat it lands as "the spirits are displeased" — memorable, not punishing — and each layer has a reduced-motion / mute fallback.
> USER NOTES:

#### Q: How intense is the table shake, and what replaces it under reduced motion?
- [x] A) Keep the shipped small horizontal shake ([-8,8,-6,6,0]); under reduced motion swap to a static darken + counter flash, no translate
- [ ] B) A bigger, longer shake
- [ ] C) Remove the shake entirely
- [ ] Other: __________________________________________
> WHY: the shipped shake is already restrained; the reduced-motion swap satisfies the motion floor (no vestibular translate) while still signaling the strike via darken + count.
> USER NOTES:

#### Q: How does the cold-mist behave on a strike?
- [x] A) A low-opacity mist sweeps across the table once (≤600ms), then dissipates
- [ ] B) Mist lingers as a persistent overlay until the next action
- [ ] C) No mist
- [ ] Other: __________________________________________
> WHY: a one-shot mist is finite and atmospheric; a lingering overlay would compete with grid legibility and risk a second viewport loop.
> USER NOTES:

#### Q: How deep is the room-darken on a strike (readability floor applies)?
- [x] A) A brief dip in ambient brightness only — cell / clue text contrast never drops below the AA floor
- [ ] B) A dramatic near-blackout
- [ ] C) No darken
- [ ] Other: __________________________________________
> WHY: the puzzle-text legibility + contrast floors cap how dark it can go; the darken is atmospheric dimming of the *frame*, not the content, so AA holds mid-strike.
> USER NOTES:

#### Q: What audio marks a strike (must respect mute + no-jumpscare)?
- [x] A) A soft ghost-sigh, under global mute, silent in reduced motion / first-interaction-gated, non-startling
- [ ] B) A louder wail
- [ ] C) No audio on strike
- [ ] Other: __________________________________________
> WHY: v4 insists "nothing jumpscares"; a quiet sigh respects the mute floor and the no-startle pillar while still marking the error audibly for sound-on players.
> USER NOTES:

#### Q: The shipped model treats an incomplete submit as a normal Poltergeist Strike. How should the two read?
- [x] A) Same strike feedback, but the toast names the reason ("the spirits need every seat named" vs. "the spirits reject your reading")
- [ ] B) Identical feedback, no reason given
- [ ] C) Different, softer feedback for incomplete
- [ ] Other: __________________________________________
> WHY: the seed chose to penalize incomplete as a normal strike (logic frozen); naming the reason in themed copy is honest presentation and helps the player learn without changing the penalty.
> USER NOTES:

#### Q: How does the 💀 strike counter itself react on increment?
- [x] A) It pulses cold once on increment, tint deepening as strikes climb (presentation of the shipped count)
- [ ] B) Static counter, no reaction
- [ ] C) A big animated number
- [ ] Other: __________________________________________
> WHY: a single cold pulse ties the counter into the strike beat; the seed's escalating-penalty idea is echoed visually (deepening tint) without altering the count.
> USER NOTES:

---

### Scratchpad, undo & hypothesis testing

#### Q: Keep "Whisper mode" (a no-history scratchpad overlay for testing hypotheses)?
- [ ] A) Keep it exactly as today (separate scratch board, triple-click clears scratch)
- [ ] B) Keep but make it visually distinct — scratch marks in chalk/pencil vs. engraved real marks
- [x] C) Drop it — undo/redo history is enough
- [ ] Other: __________________________________________
> WHY: the shipped undo/redo already lets a player branch a hypothesis and back out; a parallel scratch board doubles the mental model and the surface for confusion — dropping it is the Apple-fy call.
> USER NOTES:

#### Q: Triple-click currently bulk-clears a cell's whole row + column (sparing confirmed cells). Keep this gesture?
- [ ] A) Keep triple-click bulk-clear as-is
- [ ] B) Replace with an explicit "sweep row/col" button on hover
- [x] C) Remove it — too easy to trigger by accident
- [ ] Other: __________________________________________
> WHY: hidden multi-tap gestures fire by accident on fast solvers and aren't discoverable; with undo/redo + Clear present, the destructive triple-click earns removal (matches the seed).
> USER NOTES:

#### Q: With Whisper mode gone, how does a player test a speculative branch?
- [x] A) Undo/redo *is* the branch mechanism — mark speculatively, and ⌘Z rewinds the whole line if it dead-ends (shipped history)
- [ ] B) Add a dedicated "what-if" mode that auto-reverts on exit
- [ ] C) Nothing — discourage speculation
- [ ] Other: __________________________________________
> WHY: undo/redo is one familiar mental model for branching; a separate what-if mode is exactly the whisper-mode complexity just dropped, and honest marking + rewind suffices.
> USER NOTES:

#### Q: How should the Clear-board button behave (shipped: instant, undoable, no confirm)?
- [x] A) Keep it instant and undoable — no confirm dialog; ⌘Z restores the whole board (shipped)
- [ ] B) Add a themed confirm before clearing
- [ ] C) Remove Clear, undo-only
- [ ] Other: __________________________________________
> WHY: shipped rationale — a regretted Clear is one ⌘Z away, so a dialog is friction; undo is the single, consistent safety net across every destructive action here.
> USER NOTES:

#### Q: How visible is undo/redo, and how deep is the history?
- [x] A) Visible ↶/↷ buttons (disabled at the ends) + ⌘Z / ⇧⌘Z, full-depth session history (shipped)
- [ ] B) Limited-depth undo (last N marks)
- [ ] C) Keyboard-only, no buttons
- [ ] Other: __________________________________________
> WHY: shipped behavior — visible controls are discoverable and already disable at the stack ends; capping depth would surprise a player mid-hypothesis, and buttons + keys serve both input modes.
> USER NOTES:

#### Q: What feedback plays on undo / redo?
- [x] A) It softly reverses the last mark's own animation (rune fades / candle relights) rather than a hard state pop
- [ ] B) A hard instant state change
- [ ] C) A rewind sound with no visual differentiation
- [ ] Other: __________________________________________
> WHY: reversing the mark's own micro-animation keeps cause/effect legible and premium; under reduced motion it falls back to the instant state change (floor-safe).
> USER NOTES:

---

### Keyboard, touch & pointer input

#### Q: How does keyboard navigation work across the scrying matrix (`role="grid"`)?
- [x] A) Arrow-key roving-tabindex across cells; Space/Enter cycles the focused cell (blank→exclude→confirm); the one focus ring marks position
- [ ] B) Tab through every cell linearly
- [ ] C) No keyboard cell control (pointer / touch only)
- [ ] Other: __________________________________________
> WHY: a roving-tabindex grid with Enter-to-cycle makes the puzzle fully keyboard-solvable (a11y) and matches the shipped `role="grid"`; linear Tab through N×K cells is punishing, pointer-only excludes keyboard users.
> USER NOTES:

#### Q: Are clue tracing and spent-flagging keyboard-operable?
- [x] A) Yes — clues are focusable buttons; Enter traces (`aria-pressed`), a secondary control / ✓ flags spent, all within the focus-ring system (shipped `aria-pressed`)
- [ ] B) Clues reachable but not operable by keyboard
- [ ] C) Mouse-only clue interaction
- [ ] Other: __________________________________________
> WHY: the shipped clue rows already carry `aria-pressed` / `aria-label`; making trace + flag fully keyboard-operable completes the a11y story and costs nothing new.
> USER NOTES:

#### Q: How does cell cycling work on touch, given the ≥44×44px target floor?
- [x] A) Single tap cycles (parity with pointer); cells honor ≥44×44px even on the largest grids
- [ ] B) Tap to select, then a second control to set state
- [ ] C) Shrink cells on big grids to fit the viewport
- [ ] Other: __________________________________________
> WHY: one-tap parity keeps the interaction identical across input types, and the 44px floor is non-negotiable — big grids scroll rather than shrink below target size.
> USER NOTES:

#### Q: How are hover-only affordances handled on touch?
- [x] A) Spectral-particle hover + parchment-lift on fine pointers only (`@media (hover:hover)`); touch gets an equivalent press/active state, no hover-gated info
- [ ] B) Same hover effects forced onto touch (tap-to-reveal)
- [ ] C) No hover effects anywhere
- [ ] Other: __________________________________________
> WHY: gating hover behind `hover:hover` keeps touch honest (no info hidden behind a hover a finger can't perform) while fine-pointer users still get v4's "hover shimmers"; dropping hover entirely wastes desktop polish.
> USER NOTES:

#### Q: How are mis-taps protected against on dense touch grids?
- [x] A) Generous touch-slop + the always-available undo make mis-taps cheap to fix; no per-tap confirm
- [ ] B) A confirm dialog before each confirm-state on touch
- [ ] C) Nothing
- [ ] Other: __________________________________________
> WHY: per-tap dialogs would wreck the solve rhythm; hit-slop plus the existing undo is the standard, unobtrusive mobile answer and reuses machinery already shipped.
> USER NOTES:

## S3 · Scoring, win/lose & the Banished ceremony

> Séance puzzle logic is FROZEN (`lib/seance.ts`) — every question below is
> presentation / feedback / pacing only, never a rule change. Picks default to
> the v4 bible's reverent, cinematic completion moment. Shipped today: a count-up
> "Ectoplasmic Decay" clock (`total = elapsed + strikes*60`), a `Banished` state
> with the planchette spelling the spirit, a Spirit-Memory parchment card, and a
> spoiler-free all-green emoji grid share.

## Score model — the Ectoplasmic Decay clock

### Q: The score today is the count-up "Ectoplasmic Decay" clock plus a strike penalty. Keep time-as-score?
- [x] A) Keep pure time as the primary score (count-up clock, lower is better)
- [x] B) Add a hint penalty — each hint adds `+Ns` to the same clock
- [ ] C) Switch to a star/tier rating derived from time & strikes instead of a raw number
- [ ] Other: __________________________________________
> WHY: Time-as-score is the shipped model and reads instantly; folding the hint cost into the SAME clock (A+B compose) keeps one legible number rather than a second scoreboard.
> USER NOTES:

### Q: How is the running clock framed in the HUD during play?
- [x] A) "Ectoplasmic Decay" label + `mm:ss` mono tabular numerals (current)
- [ ] B) A silent, un-labelled timer — surface elapsed time only on the results card
- [ ] C) A decaying candle/wax meter instead of digits (time read as burn-down)
- [ ] Other: __________________________________________
> WHY: A named, always-visible count-up is honest about the stakes and matches the shipped `fmt(seconds)` HUD; hiding it would undercut the "decay" tension the theme trades on.
> USER NOTES:

### Q: How heavy should the Poltergeist Strike penalty be?
- [ ] A) Flat +60s each (as shipped)
- [x] B) Escalating (+30, +60, +120 …) so repeated wrong submits hurt progressively harder
- [ ] C) No time penalty — cap the number of allowed submissions instead
- [ ] Other: __________________________________________
> WHY: Escalation punishes brute-force guessing (which the no-guessing deduction design forbids in spirit) while a gentle first strike keeps a single slip from feeling ruinous. Pair with a submission cap (next Q).
> USER NOTES: Add a cap of submissions too.

### Q: Should there also be a hard cap on total submissions per séance?
- [x] A) Yes — a generous cap (e.g. 5 submits) that feeds the lose/fail state below
- [ ] B) No cap — only the escalating time penalty deters wrong submits
- [ ] C) Cap only the ARCHIVE/practice modes, unlimited on the live daily
- [ ] Other: __________________________________________
> WHY: The seed note asks for a cap, and a cap is what gives "the spirit escapes" a concrete trigger (see fail state); generous enough that a careful solver never meets it.
> USER NOTES:

### Q: Should using a Hint affect the score?
- [ ] A) No — hints stay free (as shipped)
- [x] B) Yes — a small fixed time penalty added to the clock per hint
- [ ] C) No time cost, but any hint forfeits the "flawless / no-strike" badge only
- [ ] Other: __________________________________________
> WHY: A visible-but-small cost keeps hints an honest tool (you can always finish) without making a hinted solve indistinguishable from an unaided one; consistent with the A+B clock pick above.
> USER NOTES:

### Q: How large should the per-hint time penalty be?
- [x] A) Modest and fixed (~+15s), same for every hint
- [ ] B) Escalating like strikes (+15, +30, +60 …)
- [ ] C) Scaled to grid size (bigger boards, bigger hint cost)
- [ ] Other: __________________________________________
> WHY: A flat modest cost is predictable and easy to reason about mid-solve; escalating hint costs would double-punish exactly the struggling player a hint exists to help.
> USER NOTES:

### Q: What counts as a "good" score the results should celebrate?
- [x] A) Under a fixed target time (e.g. sub-3:00) with zero strikes
- [ ] B) Beating the player's own personal best for that grid size
- [ ] C) Purely the relative tier reached (Novice → Grand Medium)
- [ ] Other: __________________________________________
> WHY: A fixed, knowable bar ("flawless under 3:00") gives every player the same aspirational target on a shared daily; personal-best framing belongs in the grimoire, not the celebration beat.
> USER NOTES:

### Q: Should a Medium tier (Novice → Adept → Medium → Grand Medium) be shown at the end?
- [x] A) Yes — a named tier derived from time + strikes, shown on the results card
- [ ] B) No — just the raw time and strike count, no tier label
- [ ] C) Tier shown only in the share string, not on the results card
- [ ] Other: __________________________________________
> WHY: A reverent title ("Grand Medium") is period-appropriate flavour and gives the share a spoiler-free badge; it's cosmetic over the frozen score, not a second currency.
> USER NOTES:

### Q: Is the tier purely cosmetic, or does it feed back into scoring?
- [x] A) Purely cosmetic — a label over the same time+strikes number, no mechanical effect
- [ ] B) The tier IS the score (raw time hidden entirely)
- [ ] C) Tier unlocks cosmetic room decorations but nothing scored
- [ ] Other: __________________________________________
> WHY: Keeping tier as pure garnish over the frozen time model avoids inventing a parallel economy and keeps the daily's shared, comparable clock authoritative.
> USER NOTES:

## Win trigger — declaring the séance complete

### Q: What triggers the win? Today an explicit Submit validates every seat has one confirm matching truth.
- [x] A) Keep the explicit Submit button — the player DECLARES the séance complete
- [ ] B) Auto-detect the instant the grid is fully & correctly bound (no button)
- [ ] C) Auto-detect only when the grid is FULL, then validate on that fill
- [ ] Other: __________________________________________
> WHY: A deliberate "conduct the séance" gesture is the ritual's climax and preserves the shipped `submit()` contract; auto-winning would rob the player of the moment of committing to their answer.
> USER NOTES:

### Q: How should the Submit control itself feel, thematically?
- [x] A) A single engraved ritual button ("Conduct the séance" / "Speak, spirit")
- [ ] B) A plain "Submit" button re-tinted spectral
- [ ] C) A press-and-hold / planchette-drag gesture to "commit" the reading
- [ ] Other: __________________________________________
> WHY: An engraved, named ritual action matches the v4 "nothing should resemble modern flat UI" mandate while staying a single unambiguous tap (a hold gesture risks accidental or missed submits).
> USER NOTES:

### Q: What happens if the player submits an INCOMPLETE grid (not every seat bound)?
- [x] A) Treat it as a normal wrong submit → a Poltergeist Strike (current)
- [ ] B) Block submit until full, with a "the spirits need every seat named" nudge (no penalty)
- [ ] C) Warn once, then allow the penalized submit
- [ ] Other: __________________________________________
> WHY: Consistency — a premature reading is a wrong reading; treating it as a strike keeps one simple rule and discourages "submit to probe" without a special-case branch.
> USER NOTES:

### Q: On a wrong submit, does the room say WHICH seats were wrong?
- [x] A) No — strike only; the board keeps every mark, no cells are revealed (preserves the deduction)
- [ ] B) Highlight how MANY are wrong (a count) but not which
- [ ] C) Flag the specific wrong cells
- [ ] Other: __________________________________________
> WHY: Revealing which cells are wrong would leak deduction the frozen logic requires the player to earn; a bare strike keeps the puzzle honest (option C would effectively be a free hint).
> USER NOTES:

## Lose / fail — when the spirit escapes

### Q: Is there a lose/fail state, or only "slower time"?
- [ ] A) No lose state — you always eventually banish the spirit; strikes just cost time (as shipped)
- [x] B) Hard fail after K strikes — "the spirit escapes," the puzzle locks until tomorrow
- [x] C) Soft fail — at K strikes the room OFFERS to reveal the solution, marked a forfeit
- [ ] Other: __________________________________________
> WHY: B+C compose into one humane arc: at the strike cap the séance is lost, but instead of a dead lock the room offers a forfeit-reveal so the player still sees the answer — stakes without a punishing wall.
> USER NOTES:

### Q: How many strikes (K) should trigger the fail state?
- [x] A) 5 — generous; only reckless guessing gets there
- [ ] B) 3 — tense, mistakes matter early
- [ ] C) Scales with grid size (more seats, more allowed strikes)
- [ ] Other: __________________________________________
> WHY: A generous K=5 means a careful solver never sees the fail path, so the lose state reads as a guard-rail against brute force rather than a difficulty spike on a logic puzzle.
> USER NOTES:

### Q: When the player takes the soft-fail reveal, how is that recorded?
- [x] A) Marked a FORFEIT in the grimoire — no streak credit, distinct from a true banishing
- [ ] B) Recorded as a normal completion (reveal is invisible in history)
- [ ] C) Not recorded at all — the night simply has no entry
- [ ] Other: __________________________________________
> WHY: A forfeit must be honestly distinct so the grimoire's "spirits banished" count and streak stay meaningful; hiding it would inflate stats and cheapen a real solve.
> USER NOTES:

### Q: Does a forfeit / hard-fail break the daily streak?
- [x] A) Yes — a forfeit breaks the streak (only a true banishing extends it)
- [ ] B) No — playing at all preserves the streak; only skipping the day breaks it
- [ ] C) A one-per-month "grace night" absorbs a single forfeit without breaking streak
- [ ] Other: __________________________________________
> WHY: The streak should mean flawless-enough channellings; letting a forfeit hold the streak would make "banished" and "gave up" equivalent. (C is a reasonable softening if the user prefers mercy.)
> USER NOTES:

### Q: After a hard fail, what does the locked puzzle show until tomorrow?
- [x] A) The revealed correct grid with a somber "the spirit escaped this night" frame
- [ ] B) The player's failed board frozen, solution hidden until they tap "reveal"
- [ ] C) A blank sealed board — no board state until the next daily
- [ ] Other: __________________________________________
> WHY: Showing the solved grid closes the loop (the player still learns the answer) and the somber frame honours the loss without a punitive black-out; ties directly to the soft-fail reveal above.
> USER NOTES:

## The Banished ceremony — the flagship moment

### Q: The completion ceremony ("Banished" — planchette moves on its own, spirit reveals itself). How long, how skippable?
- [x] A) Short reverent moment (~2–3s), then auto-advances to the results card
- [ ] B) A longer cinematic (candles ignite, ghosts gather, board glows) with a manual "skip"
- [ ] C) Full cinematic once ever; a brief flourish on every later daily win
- [ ] Other: __________________________________________
> WHY: v4 is emphatic — "no excessive celebration… the moment should feel reverent." A tight ~2–3s beat is cinematic without becoming a cutscene the player must sit through every day.
> USER NOTES:

### Q: What is the ceremony's central choreography?
- [x] A) The planchette glides on its own and spells the spirit's name, then settles to center (shipped `Planchette spelling`)
- [ ] B) Ghosts fully materialise and circle the table as the focal action
- [ ] C) Every candle ignites and the Ouija board floods with light
- [ ] Other: __________________________________________
> WHY: The self-moving planchette IS v4's defining image ("the planchette glides on its own… the spirits finally reveal themselves"); candles/ghosts are the supporting layer, not the lead.
> USER NOTES:

### Q: How rich is the supporting atmosphere behind the planchette during the ceremony?
- [x] A) Restrained bloom — candles stabilise, a soft light rises, one ghost peacefully fades into light
- [ ] B) Full room event — every candle ignites, spirit energy circles, chandeliers glow
- [ ] C) Bare — planchette + spirit name only, no environmental change
- [ ] Other: __________________________________________
> WHY: "Candles stabilise… final spirit peacefully fades" (v4) is the reverent register; a full room pyrotechnic reads campy and risks the ≤1-looping-animation / motion budget. One light source, deliberate.
> USER NOTES:

### Q: Should the ceremony offer a skip / tap-to-advance affordance?
- [x] A) Yes — a tap anywhere (or "skip") jumps straight to the results card at any time
- [ ] B) No skip — the ~3s beat always plays in full
- [ ] C) No skip on first-ever win; skippable thereafter
- [ ] Other: __________________________________________
> WHY: Even a short ceremony must never trap a returning daily player; an always-available tap-through respects pace while the default still plays the moment. (C is a fine compromise if first-run impact matters more.)
> USER NOTES:

### Q: Should the first-ever banishing differ from repeat daily wins?
- [x] A) Same reverent beat every time — consistency is the ritual
- [ ] B) A richer, longer first-ever ceremony; brief flourish on repeats
- [ ] C) First-ever adds a one-time "you have made contact" onboarding note over the beat
- [ ] Other: __________________________________________
> WHY: A ritual gains meaning by being the SAME each night; a special first-run risks a let-down on day two. (Option C adds welcome context without changing the choreography, if the user wants a first-run touch.)
> USER NOTES:

### Q: Reduced-motion / "calm the room" variant of the ceremony?
- [x] A) Static "Banished" card — planchette already at rest, spirit name + time shown, no glide, no particles
- [ ] B) A single short cross-fade, no looping motion
- [ ] C) Same ceremony but at reduced particle count
- [ ] Other: __________________________________________
> WHY: Floor requires a reduced-motion answer for every animation; a fully static reveal (shipped `reduce` path already parks the planchette) delivers the payload with zero motion and stays AA-legible.
> USER NOTES:

### Q: Audio at the moment of banishing (respecting global mute / autoplay policy)?
- [x] A) A single soft resonant swell / choir-like chord, gated by the global mute + reduced-motion, one-shot only
- [ ] B) Ethereal whispered "congratulations" voices layered over the swell
- [ ] C) Silent — the ceremony is purely visual
- [ ] Other: __________________________________________
> WHY: One warm one-shot swell crowns the moment cheaply and cannot loop; it stays silent under mute/reduced-motion per the Floors. Whisper voices risk feeling campy and add asset weight for little gain.
> USER NOTES:

## Results card — after the spirit is banished

### Q: What does the end-of-round results card show as its core?
- [x] A) Time, strike count, and a share button (current)
- [ ] B) A dense stat panel (time, strikes, hints, tier, streak, best) all at once
- [ ] C) Just the share button — stats live only in the grimoire
- [ ] Other: __________________________________________
> WHY: The shipped time + strikes + share is the clean, legible core; heavier stats belong one tap deeper in the grimoire so the results beat stays calm (Apple-fy restraint).
> USER NOTES:

### Q: Should the results card unlock a "Spirit Memory" fact (Victorian-spiritualism / séance history)?
- [x] A) Yes — a parchment Spirit-Memory card surfaces a historical fact on completion (already shipped)
- [ ] B) No — keep results to the score only
- [ ] C) Only on milestone days (streaks / weekends)
- [ ] Other: __________________________________________
> WHY: v4 names Spirit Memory explicitly and it already ships (`styles.memory` renders `puzzle.backstory`); a small reward-of-knowledge deepens progression without touching the puzzle.
> USER NOTES:

### Q: Should completion reveal the spirit's "true identity," tying the solved grid back to the backstory?
- [x] A) Yes — a brief "the spirit's identity revealed" line binds the solved seats to the framing story
- [ ] B) No — the spirit name + Spirit-Memory fact are enough narrative
- [ ] C) Reveal only in the archive re-view, not on first completion
- [ ] Other: __________________________________________
> WHY: v4's emotional core is "the spirits finally reveal themselves"; a short narrative payoff makes the solved grid mean something beyond a filled matrix. Kept to a line so it never buries the score.
> USER NOTES:

### Q: Should the results card compare THIS solve to the player's history (personal best / average)?
- [x] A) A single subtle line — e.g. "your fastest banishing yet" only when it's a new best
- [ ] B) A full comparison (best / average / percentile) on every completion
- [ ] C) No comparison on the card — history lives entirely in the grimoire
- [ ] Other: __________________________________________
> WHY: A one-line best-only nudge rewards a personal record without turning the reverent card into a dashboard; the full picture stays in the grimoire for players who seek it.
> USER NOTES:

## Share output — the spoiler-free artifact

### Q: What should the shareable result look like?
- [x] A) Emoji-grid style — an all-green board shaped K×N + time + strikes, spoiler-free (shipped)
- [ ] B) A "séance transcript" — a few themed prose lines (spirit banished in X, N strikes)
- [ ] C) Both, player's choice
- [ ] Other: __________________________________________
> WHY: The emoji grid is the proven, glance-able, spoiler-free social format (matches Mystery's share seam) and already ships via `buildShare`; prose transcripts are longer and easier to leak solution shape.
> USER NOTES:

### Q: What rides in the share HEADLINE above the grid?
- [x] A) Rite + "{spirit} banished" + ⏱ time + 💀 strikes (current `✦ The Séance` block)
- [ ] B) Add the Medium tier badge to the headline
- [ ] C) Time only — no spirit name, no strike count
- [ ] Other: __________________________________________
> WHY: The shipped headline is already themed and spoiler-free (the spirit name is flavour, not an answer); if the tier pick lands, appending the badge here is the one small extension worth considering (see B).
> USER NOTES:

### Q: How is spoiler-safety guaranteed in the share?
- [x] A) The grid is uniformly all-green (one 🟩 per binding) — it encodes solve SHAPE, never the answers or clue order
- [ ] B) Emoji vary by category colour (leaks structure)
- [ ] C) Include the clue count / difficulty glyphs alongside the grid
- [ ] Other: __________________________________________
> WHY: A uniform all-green board (shipped) proves completion without revealing a single binding — the only truly spoiler-free encoding for a shared daily where friends solve the same puzzle.
> USER NOTES:

### Q: Should the share include a link back to the puzzle?
- [x] A) Yes — the `card.url` deep-link to that date's séance (current)
- [ ] B) No link — text + grid only
- [ ] C) Link only for the live daily, stripped for archive shares
- [ ] Other: __________________________________________
> WHY: The deep-link is how a share becomes an invite (drives friends to the same daily) and is already spoiler-free — it points at the puzzle, not the solution.
> USER NOTES:

## Grimoire & history — the medium's journal

### Q: How much scoring history should the grimoire surface by default?
- [x] A) Just streak + spirits-banished count (current)
- [ ] B) Per-puzzle time, strikes, and whether hints were used, as journal entries
- [ ] C) A distribution/curve of the player's solve times over the week
- [ ] Other: __________________________________________
> WHY: A calm headline (streak + count) matches the shipped grimoire and the reverent tone; richer per-night detail is opt-in one layer deeper (next Q) rather than the front page.
> USER NOTES:

### Q: Should tapping into the grimoire reveal a per-puzzle JOURNAL entry?
- [x] A) Yes — each past night expands to time, strikes, hints-used, and forfeit/flawless status
- [ ] B) No — the count + streak headline is the whole grimoire
- [ ] C) Journal entries, but stats hidden behind a further tap
- [ ] Other: __________________________________________
> WHY: v4 frames archives as "pages inside an old medium's journal"; a per-night entry on demand satisfies stat-seekers while the default headline stays uncluttered.
> USER NOTES:

### Q: Should the grimoire show a solve-time DISTRIBUTION (like Wordle's guess histogram)?
- [x] A) A subtle weekly/rolling time curve inside the journal, opt-in view
- [ ] B) No distribution — a stats overload that fights the reverent tone
- [ ] C) A full lifetime histogram front-and-center
- [ ] Other: __________________________________________
> WHY: A quiet, opt-in curve rewards engaged players (per the dataviz-in-context ethos) without imposing a chart on the séance's calm surface; a front-page histogram would feel like analytics, not a grimoire.
> USER NOTES:

### Q: Should streak milestones visibly change the séance room over time (v4: "restore decorations")?
- [x] A) Yes — subtle, permanent room embellishments unlock at streak milestones
- [ ] B) No — streaks are a number only, the room is constant
- [ ] C) Milestone decorations, but purely in the grimoire, not the play room
- [ ] Other: __________________________________________
> WHY: v4 calls for "streak milestones subtly restore additional decorations to the séance room"; slow, earned room enrichment is a premium progression signal that never touches the frozen puzzle. Keep each unlock subtle (Floor: motion budget).
> USER NOTES:

### Q: How is the grimoire / journal reached from a completed séance?
- [x] A) The "📖 grimoire — N spirits banished" line on the results card (current entry point)
- [ ] B) A persistent top-nav grimoire icon always available
- [ ] C) Both — results-card line AND a persistent icon
- [ ] Other: __________________________________________
> WHY: The shipped results-card line ties the journal to the moment it gains a new entry (natural flow); a persistent icon is a reasonable addition if the user wants mid-play access (see C).
> USER NOTES:

## S4 · Visual overhaul — the 13 UI issues, palette, typography & skin

> Drives the **E2 UI-overhaul unit**. Séance puzzle logic is FROZEN — every
> question below is presentation only. Each of the 13 enumerated wishlist issues
> is resolved here. Recommended picks are **bold, v4-led, Apple-fy** (restraint +
> depth). Floors are never up for a vote (AA contrast both themes, ≥44px targets,
> ≤1 looping animation/viewport, one global focus ring, Q&A ≥1rem never inside a
> gilt/gradient, category = color+glyph+label, skins touch only non-Floor seams).

---

## Full-width layout & filling the screen

### Q: The room caps at `FluidStage maxWidth="74rem"`, leaving dead L/R margins on desktop (issue #1). How should Séance use horizontal space?
- [ ] A) Keep the 74rem cap (current)
- [x] B) Push the atmospheric room **full-bleed to the viewport edges**, with the board + clue rail on a wider bounded reading column (~86rem) centered inside it
- [ ] C) Everything edge-to-edge with no max width at all
- [ ] Other: __________________________________________
> WHY: v4 "full-page immersion" + Apple-fy restraint — atmosphere bleeds to the edges so there's no framed "window," while the matrix keeps a bounded measure so cell/label legibility never stretches thin (Floor).
> USER NOTES:

### Q: Grid column gaps read too loose (issue #2). How tight should the seat columns / cell spacing be?
- [ ] A) Keep the current cell padding & `--d-col-gap`
- [x] B) **Tighten** — reduce inter-cell padding and the matrix `--d-col-gap` a step so the board reads as one dense engraved plate, not scattered chips
- [ ] C) Collapse gaps to hairlines (cells share borders, spreadsheet-tight)
- [ ] Other: __________________________________________
> WHY: v4 wants a carved, unified board; tightening removes the "spreadsheet of floating boxes" feel while ≥44px tap targets (Floor) still hold — density comes from padding, not shrinking hit areas.
> USER NOTES:

### Q: Fonts feel small and the screen underfilled (issue #8). What's the sizing direction for board labels, seat numbers & the clue ledger?
- [x] A) **Size everything up** — seat/value/category labels and clue text step up one notch; the board becomes the visual hero filling the play area
- [ ] B) Keep current sizes, just widen the container
- [ ] C) Size up the board only; keep the clue rail compact
- [ ] Other: __________________________________________
> WHY: v4 "fill the screen," Apple-fy "fewer, bigger, better" — the current 0.7rem axis labels waste the reclaimed width; larger type also lifts the axis labels toward the ≥3:1 UI-part contrast comfortably.
> USER NOTES:

### Q: On tall desktop windows the card floats in the upper area (screen underfilled, issue #8 cont). How should Séance fill vertical space?
- [x] A) The **immersive room fills the viewport height** (candlelit atmosphere top-to-bottom); the board + rail vertically center within it
- [ ] B) Keep the current `min-height: min(62vh, 580px)` card
- [ ] C) Grow the card to full height with the board pinned top
- [ ] Other: __________________________________________
> WHY: v4 "sitting alone in a candlelit room" reads only if the room owns the whole frame; centering the interactive core keeps ergonomics while the atmosphere does the filling.
> USER NOTES:

### Q: The bottom control buttons currently misalign / overlap on some widths (issue #6). How is the footer control row rebuilt?
- [x] A) Rebuild `.nav` as a **single robust flex/grid row** with consistent wrap behavior and guaranteed spacing — no overlap at any width, controls never collide with the "← Lobby" pill
- [ ] B) Stack the controls vertically on narrow widths only
- [ ] C) Move controls into a fixed bottom bar
- [ ] Other: __________________________________________
> WHY: A real bug fix, not a style choice — the overlap breaks touch targets (Floor); a resilient wrapping row is the disciplined fix and keeps the RoomShell lobby pill clear.
> USER NOTES:

### Q: The footer/control row reads as detached from the board (issue #7). How should it integrate into the layout?
- [x] A) **Integrate it into the table** — the control row sits inside the scrying-table surface as an engraved lower ledge (shared material, brass divider), not a separate strip below
- [ ] B) Keep it as a bordered `.nav` strip but tighten the gap
- [ ] C) Float controls as a translucent bar over the board
- [ ] Other: __________________________________________
> WHY: v4 "nothing should feel like standard UI"; making the controls part of the table's carved wood dissolves the detached-toolbar look while keeping them reachable and legible.
> USER NOTES:

### Q: Where should the primary Submit / "conduct the séance" action sit in the rebuilt footer?
- [x] A) **Anchored as the hero control** — one prominent engraved brass plate, secondary actions (Clear, Undo, Hint) grouped quieter beside it
- [ ] B) All controls equal weight in a row
- [ ] C) Submit floats separately near the board
- [ ] Other: __________________________________________
> WHY: Apple-fy hierarchy — one clear primary action, restrained secondaries; the plate radius (`round=switch, plate=action`) and focus ring Floors are preserved.
> USER NOTES:

### Q: The clue rail leaves its left-third column looking thin/underfilled on desktop (issue #8). How should it fill its space?
- [x] A) **A torn-parchment ledger that fills its column** — clue slips are larger, generously spaced on a parchment surface, reading as pages in the medium's journal
- [ ] B) Keep the compact clue list, narrow the column
- [ ] C) Move clues below the board full-width
- [ ] Other: __________________________________________
> WHY: v4 "clues appear as torn parchment slips," "fresh séance invitation"; a filled parchment ledger uses the reclaimed width and reinforces the material palette without shrinking the board.
> USER NOTES:

### Q: The HUD (spirit identity + Ectoplasmic-Decay timer) reads as a thin flat strip. How is it dressed up (issue #8)?
- [x] A) **An engraved brass nameplate** — spirit name in the display face, the timer as a carved counter, sitting on the table's upper ledge (mirrors the integrated footer)
- [ ] B) Keep the current compact flex row
- [ ] C) Float the timer separately over the board
- [ ] Other: __________________________________________
> WHY: v4 "nothing should feel like standard UI," "carved wood… gold trim"; a nameplate HUD balances the integrated lower control ledge and fills the top edge, while the timer stays plain-legible (not inside a gilt treatment).
> USER NOTES:

---

## Dissolving the frame — full-page immersion

### Q: The `.shell` card has hard window/panel edges that box the game in (issue #5). How should those edges resolve?
- [x] A) **Blend the edges into the room** — replace the hard 1px card border with a soft vignette/gradient falloff so the table melts into the surrounding darkness (v4 "corners fade naturally into darkness")
- [ ] B) Keep a defined card but soften to a thicker gilt frame
- [ ] C) Keep the hard border as a deliberate "table edge"
- [ ] Other: __________________________________________
> WHY: v4 "blend into full-page immersion" + "one light source" — a candlelit vignette that fades to dark corners is the Apple-fy way to remove the boxed-in feel without losing the sense of a physical table.
> USER NOTES:

### Q: The background is flat (issue #4). What atmospheric treatment replaces it?
- [x] A) **Layered candlelit depth** — a warm radial candle-glow light source, a faint walnut/velvet material gradient, and the frozen `--tex-grain` overlay; all static, GPU-cheap, zero-network
- [ ] B) A single subtle gradient only
- [ ] C) An image/photo backdrop
- [ ] Other: __________________________________________
> WHY: v4 "the room itself becomes more alive," Apple-fy "real depth/material" — layered CSS gradients + the existing grain give expensive-feeling atmosphere with no new dep and no motion-budget cost.
> USER NOTES:

### Q: Color transitions across the board are sharp-edged (issue #9). How premium should the gradients / state transitions be?
- [x] A) **Soft everywhere** — feather column highlights, hover glows, and the candle bloom with wide gradient falloffs and slow easing; no hard color steps
- [ ] B) Soften highlights only, keep crisp cell borders
- [ ] C) Keep sharp edges for a cleaner, flatter read
- [ ] Other: __________________________________________
> WHY: v4 "premium soft transitions," "nothing should animate quickly" — feathered gradients read as light, not fill; slow easing on the sole planchette loop respects the ≤1-loop and ≤600ms Floors.
> USER NOTES:

### Q: How much light-vs-dark falloff between the board and the room corners?
- [x] A) **Pronounced but elegant** — the board sits in a pool of candlelight, corners fall to near-black; restrained bloom, one light source
- [ ] B) Even illumination across the whole room
- [ ] C) Subtle falloff only
- [ ] Other: __________________________________________
> WHY: v4 "warm candlelight illuminates the interface, corners fade into darkness," "bloom restrained and elegant" — a single specular light source is already the house law (`--gold-sheet`).
> USER NOTES:

### Q: In light mode ("daylit tour"), how does the immersive treatment adapt?
- [x] A) **Same architecture, roles remapped** — the vignette becomes a soft umber falloff on parchment, no black shadows, no hardcoded white overlays (channel tokens flip for free)
- [ ] B) Force dark styling in Séance regardless of theme
- [ ] C) A flatter, plainer light treatment
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS light law — Séance's module already builds from `--c-*` channels so light remaps automatically; overriding to force-dark would break the flash-free theme toggle Floor.
> USER NOTES:

---

## Palette, material & Apple-fy

### Q: Overall material palette for panels (spec: ebony, walnut, aged gold, ivory; accent `#7040a8` "the Medium")? *(carried from seed)*
- [x] A) Dark walnut wood + worn brass + ivory parchment, restrained gold trim
- [x] B) Black velvet + faded gold foil + scratched glass overlays (more opulent)
- [ ] C) Keep it closer to the current flat Parlor cards, just re-tinted spectral
- [ ] Other: __________________________________________
> WHY: A+B compose — walnut/brass/ivory is the structural material; velvet + faded-gold-foil + glass are the opulent surface layers over it. Together they hit v4 "handcrafted and expensive" while staying CSS-cheap (gradients/textures, no assets).
> USER NOTES:

### Q: "Apple-fy the color scheme" (issue #10). What does that mean concretely for Séance?
- [x] A) **Restraint + depth** — a tight, cohesive palette (few hues, many tones), soft desaturated jewel-tones, generous negative space, one warm light source — never campy Halloween color
- [ ] B) A brighter, higher-contrast spooky palette
- [ ] C) Keep the current tint, just add gradients
- [ ] Other: __________________________________________
> WHY: AUTHORING doctrine defines Apple-fy exactly as restraint+depth; v4 "avoid stereotypical Halloween visuals, elegant rather than campy" — fewer, better tones read premium.
> USER NOTES:

### Q: What single accent color leads the Séance interactive language (borders, active states, planchette)?
- [x] A) **Worn brass as the structural accent**, with the violet `#7040a8` ("the Medium") reserved for spectral/spirit moments only
- [ ] B) Violet-led throughout (the wildcard identity front and center)
- [ ] C) Aged gold as the lead accent
- [ ] Other: __________________________________________
> WHY: v4 "buttons feel engraved… brass," Apple-fy restraint — brass carries the everyday UI so the spectral violet stays special when spirits act; brass also clears the ≥3:1 interactive-border Floor in both themes.
> USER NOTES:

### Q: Category color-coding on the axes reads too weak (issue #3). How is it strengthened — while keeping color+glyph+label (Floor)?
- [x] A) **Stronger category INK + a tinted group band** — bolder `--cat-*` ink on axis labels plus a subtle category-tinted left-edge band / divider per category group, glyph + label always present
- [ ] B) Just bump the ink saturation
- [ ] C) Fill whole category rows with tint
- [ ] Other: __________________________________________
> WHY: v4 "stronger color-coding" without breaking the triple-encode Floor — a tinted group band adds a second color cue that's still paired with glyph+label; option C would risk swamping cell state legibility.
> USER NOTES:

### Q: Category strengthening must not touch `CATEGORY_HEX` (single-source Floor). How is the stronger tint applied?
- [x] A) **Override the `--cat-*` INK vars, scoped inside `[data-skin="seance"]`** — repaint this room's category text tones only; `CATEGORY_HEX` fills stay single-source
- [ ] B) Add new per-category hex literals in the module
- [ ] C) Edit `lib/types.ts` category colors
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS skin law — a skin may redefine `--cat-*` ink in its own scope but the fill constant stays single-source; B/C violate the no-new-literals and single-source Floors.
> USER NOTES:

### Q: How saturated should the overall scheme be (v4 "muted burgundy, oxidized brass, moon silver")?
- [x] A) **Desaturated, aged, low-chroma** — everything reads antique and faded; spectral cyan/violet are the only moments of higher chroma
- [ ] B) Rich and saturated jewel tones throughout
- [ ] C) Near-monochrome walnut/brass with color only on categories
- [ ] Other: __________________________________________
> WHY: v4 palette is explicitly aged/oxidized/muted, Apple-fy restraint — low chroma reads expensive and lets the rare spectral accents land; AA contrast still computed on every text token.
> USER NOTES:

---

## Ouija board motifs & ornament

### Q: How literal should the Ouija-board influence be? *(carried from seed)*
- [x] A) Borrow the language subtly — alphabet engravings on borders, sun/moon corner ornaments, compass rose
- [ ] B) Strongly literal — the grid sits on a rendered Ouija board surface
- [ ] C) Minimal — a planchette + serif type is enough of a nod
- [ ] Other: __________________________________________
> WHY: v4 "borrowing its design language, not literally replacing the interface" + "recognize the inspiration without sacrificing usability" — decorative borrowing keeps the logic grid readable; a literal board (B) would fight cell legibility.
> USER NOTES:

### Q: Should the panel/table borders carry engraved alphabet / spirit-symbol ornamentation (issue #11)?
- [x] A) **Yes — a faint engraved alphabet + spirit-symbol border frieze**, as static SVG/CSS at the table's outer edge, decorative and `aria-hidden`, never behind Q&A text
- [ ] B) A plain brass hairline frame only
- [ ] C) Ornament only in the header, not the border
- [ ] Other: __________________________________________
> WHY: v4 "decorative alphabet engravings around panel borders" — a static inline-SVG frieze is zero-network and GPU-free; keeping it out of the text zone respects the "never inside a gilt/gradient" legibility Floor.
> USER NOTES:

### Q: Corner & center ornaments — which Ouija motifs earn a place (issue #11)?
- [x] A) **Crescent-moon corner ornaments + a sun/moon header motif + a subtle compass-rose watermark** behind the board center
- [ ] B) Corner filigree only (reuse the deck's ❧/✦)
- [ ] C) No added ornaments, rely on type + planchette
- [ ] Other: __________________________________________
> WHY: v4 names crescent corners, sun/moon, and compass rose explicitly; a low-opacity compass-rose watermark adds "advanced design" depth without competing with cell state — a garnish that degrades cleanly.
> USER NOTES:

### Q: Should the board use engraved gold dividers between category groups (issue #11)?
- [x] A) **Yes — gold-engraved dividers** replace the plain `line` group separators, reading as inlaid brass rules on carved wood
- [ ] B) Keep the current 1px `line` separators
- [ ] C) No separators; rely on spacing alone
- [ ] Other: __________________________________________
> WHY: v4 "gold engraved dividers," "wooden inlays throughout" — an engraved rule is decorative (goldlite is rule-exempt for contrast) and reinforces the group structure the categories already encode.
> USER NOTES:

### Q: Texture — how much material grain / scratched-glass over the surfaces (issue #11)?
- [x] A) **The frozen `--tex-grain` over the room bg + a subtle scratched-glass sheen on raised panels**, both static and ≤3% opacity, never behind Q&A
- [ ] B) Heavier visible wood-grain / paper texture on every surface
- [ ] C) No texture, keep surfaces clean
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §material — `--tex-grain` is the sanctioned, frozen, zero-network grain that kills sterile-vector banding; a restrained glass sheen adds v4 "scratched glass" depth without taxing legibility.
> USER NOTES:

### Q: Should decorative borders have any animated highlight (v4 "animated border highlights")?
- [x] A) **No new loop** — the ornament stays static; the single per-viewport loop budget is spent on the planchette drift (interaction-driven trace-pulses are finite, not loops)
- [ ] B) A slow shimmer traveling the border frame
- [ ] C) Border pulses on every correct deduction
- [ ] Other: __________________________________________
> WHY: Floor — ≤1 infinite/looping animation per viewport, already claimed by the planchette; an animated border would exceed it. Correct-deduction shimmer is a finite ≤600ms burst, allowed and handled in the feedback section.
> USER NOTES:

### Q: The planchette is the signature ornament. How does it read as a physical object over the board?
- [x] A) **A carved translucent planchette with a brass rim and a faint glass lens**, casting a soft candlelit shadow — the one moving element, drifting slowly
- [ ] B) A flat minimal pointer shape
- [ ] C) An outlined/wireframe planchette
- [ ] Other: __________________________________________
> WHY: v4 "the planchette becomes the game's signature animated element," "premium… handcrafted"; a material planchette with a soft shadow sells depth as the sole loop, and reduced-motion freezes it to a still.
> USER NOTES:

---

## Typography direction

### Q: Typography direction? *(carried from seed)*
- [x] A) Elegant Victorian serif headings + readable body, antique letter-spacing, decorative drop-initials
- [ ] B) Serif headings but keep the current Parlor body font for legibility
- [ ] C) Restrained — one serif accent face, everything else system
- [ ] Other: __________________________________________
> WHY: v4 typography section names all of these; the existing pairing (Fraunces display over system-sans body) already delivers "engraved period display over maximally-legible body," so this is a tuning, not a new font dep.
> USER NOTES:

### Q: Should the display face be a NEW Victorian serif or the house Fraunces tuned for Séance?
- [x] A) **Reuse Fraunces** via the `--skin-font-display` seam, pushed toward a higher-WONK / engraved axis for a more antique-book feel — no new font dependency
- [ ] B) Add a new period display face (e.g. a blackletter-adjacent serif) via `next/font`
- [ ] C) Keep Fraunces exactly as the house default
- [ ] Other: __________________________________________
> WHY: Apple-fy "premium via craft, not spend" — Fraunces' opsz/WONK/SOFT axes already give hand-cut engraving character; a new face is a dep + payload cost for marginal gain.
> USER NOTES:

### Q: Decorative drop-initials — where do they appear?
- [x] A) **On the séance-invitation intro and the Spirit Memory card only** — a single ornamented initial per block, display-size, never inside Q&A/clue body
- [ ] B) On every clue and heading
- [ ] C) None — too fussy
- [ ] Other: __________________________________________
> WHY: v4 "decorative initials," Apple-fy restraint — drop-caps are a ceremonial flourish; keeping them off functional puzzle text respects the "never inside gilt/gradient" legibility Floor.
> USER NOTES:

### Q: Letter-spacing / antique-printing treatment on labels?
- [x] A) **Wide antique tracking on `.microlabel` signage only** (HUD, section labels), normal tracking on all Q&A and clue body
- [ ] B) Wide tracking everywhere for period feel
- [ ] C) No tracking changes
- [ ] Other: __________________________________________
> WHY: v4 "letter spacing should evoke antique printed books" — tracking belongs on uppercase signage (already the `.microlabel` pattern at 0.22em); tracking body text hurts the ≥1rem/lh-1.5 readability Floor.
> USER NOTES:

### Q: Body & clue copy — does the legibility Floor override the Victorian styling?
- [x] A) **Yes, always** — clue/board/Q&A text stays system-sans ≥1rem, line-height ≥1.5, on flat ink tokens; serif + ornament live only in headings/chrome
- [ ] B) Set clues in the serif display face for atmosphere
- [ ] C) Serif clues at a smaller size to fit more
- [ ] Other: __________________________________________
> WHY: Non-negotiable Floor — Q&A/puzzle text ≥1rem never inside a decorative treatment; v4 itself says "readable body copy." B/C are not offerable.
> USER NOTES:

---

## Wiring the `[data-skin="seance"]` skin block

### Q: The `[data-skin="seance"]` block in `app/skins.css` is an empty placeholder and `applySkin("seance")` is unwired (known-deferred, issue #12). Wire both in E2?
- [x] A) **Yes — spread `{...applySkin("seance")}` on the room root and fill the seance block** (the `wedges` block is the shipped template); this is where all palette/type/layout decisions above land
- [ ] B) Keep styling in `SeanceGame.module.css` only, leave the skin block empty
- [ ] C) Defer skin wiring to a later unit
- [ ] Other: __________________________________________
> WHY: The skin seam is THE sanctioned per-game override mechanism (INDEX §Design model) — routing the overhaul through it keeps globals untouched and the Floors above the skin layer; the module keeps layout, the skin carries palette/material/type.
> USER NOTES:

### Q: `--skin-bg` / `--skin-surface` — what values does the Séance skin set?
- [x] A) **Deep ebony/walnut `--skin-bg` + a raised velvet-walnut `--skin-surface`** (RGB channels), darker & warmer than the house default, holding AA text contrast both themes
- [ ] B) Leave both at the house defaults
- [ ] C) A cooler slate ground
- [ ] Other: __________________________________________
> WHY: v4 material palette (ebony/walnut/velvet); the skin owns holding AA for whatever ground it picks, so the ink tokens are chosen against these grounds — a warmer/darker room than the house baseline sells the parlor.
> USER NOTES:

### Q: `--skin-accent` — what value?
- [x] A) **Worn brass** (RGB channels near the house brass, slightly warmer) — the structural interactive accent; violet stays a scoped spectral token, not the seam
- [ ] B) The violet `#7040a8`
- [ ] C) Aged gold
- [ ] Other: __________________________________________
> WHY: Matches the accent decision above — brass carries borders/focus-adjacent affordances at ≥3:1; keeping violet off the shared accent seam preserves it for spirit moments.
> USER NOTES:

### Q: `--skin-ink` / `--skin-muted` — what tones?
- [x] A) **Warm ivory `--skin-ink` + an aged-parchment `--skin-muted`**, tuned to clear AA (≥4.5:1) against the ebony/walnut ground
- [ ] B) House defaults
- [ ] C) Cooler moon-silver ink
- [ ] Other: __________________________________________
> WHY: v4 "ivory parchment" text on dark wood; the skin is responsible for AA on its own ground, so ink is picked to pass ≥4.5:1 there — warm ivory reads candlelit, not clinical.
> USER NOTES:

### Q: `--skin-bg-image` — what material/gradient does the seam carry?
- [x] A) **A layered candle-glow radial + walnut/velvet linear gradient** (the atmospheric depth from issue #4), pure CSS, zero-network
- [ ] B) `none` (keep bg flat)
- [ ] C) A tiled texture image asset
- [ ] Other: __________________________________________
> WHY: The `--skin-bg-image` seam is exactly for room material; layered gradients give the one-light-source candlelit room with no asset/network cost (`wedges` sets its dual-radial bg the same way).
> USER NOTES:

### Q: `--skin-radius` — action-plate corner radius?
- [x] A) **Slightly softer than house 4px (≈6px)** — carved-wood plates read a touch rounder/warmer, still "plate not pill"
- [ ] B) Keep 4px house default
- [ ] C) Sharp 2px engraved corners
- [ ] Other: __________________________________________
> WHY: Apple-fy warmth without breaking the shape language (round=switch, plate=action) — a modest bump reads hand-worn; toggles stay `rounded-full` regardless.
> USER NOTES:

### Q: `--skin-font-display` — what does the seam point at?
- [x] A) **Fraunces tuned toward its engraved/antique axis** (per the typography decision) — no new font dep
- [ ] B) A new Victorian display face
- [ ] C) `var(--font-display)` unchanged
- [ ] Other: __________________________________________
> WHY: Mirrors the type decision — the seam lets Séance carry its own display flavor without touching globals or adding payload.
> USER NOTES:

### Q: `--skin-gutter` / `--skin-maxw` — the layout-grid seam values (issue #1/#12)?
- [x] A) **Wider `--skin-maxw` (~86rem) + a generous `--skin-gutter`** so the reading column uses the reclaimed width while the full-bleed atmosphere lives outside it
- [ ] B) Leave both at house defaults (64/80rem)
- [ ] C) Remove the max width entirely
- [ ] Other: __________________________________________
> WHY: Resolves the wasted-margin issue through the sanctioned seam rather than ad-hoc CSS; a bounded (not infinite) maxw keeps board/label legibility intact.
> USER NOTES:

### Q: `--skin-motion-duration` / `--skin-motion-ease` — the signature motion feel?
- [x] A) **Slow & deliberate** — a longer duration (~500ms) on a soft cinematic ease (like `wedges`' `cubic-bezier(0.16,1,0.3,1)`), matching v4 "nothing should animate quickly"
- [ ] B) House default (300ms, entrance curve)
- [ ] C) Snappier for responsiveness
- [ ] Other: __________________________________________
> WHY: v4 "slow, deliberate, cinematic" is the Séance signature; the seam sets the room's default beat while individual transitions still respect the ≤600ms Floor and reduced-motion variants.
> USER NOTES:

### Q: Beyond the seams, how much does the skin's scoped global override (`--cat-*`, `--d-*`) repaint?
- [x] A) **Targeted** — override `--cat-*` ink (stronger categories) and tighten `--d-col-gap` for this room only; leave other globals to the seams
- [ ] B) Repaint the full `--c-*` palette inside the scope
- [ ] C) Seams only, no scoped global overrides
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS allows scoped global overrides but Apple-fy restraint favors the minimum that achieves the look — category ink + col-gap are the two the seams can't express; wholesale `--c-*` repaint duplicates what the seams already do.
> USER NOTES:

### Q: Who owns holding the §Floors for whatever the skin picks?
- [x] A) **The E2 unit owns it** — every skin value (ground/ink pairs, accents) is verified AA both themes, focus ring intact, ≥44px targets, ≤1 loop, before landing; validated via `design/validate.sh` + `/ui-qa /seance`
- [ ] B) Assume the house tokens keep it safe
- [ ] C) Verify only in dark mode
- [ ] Other: __________________________________________
> WHY: Skin law — the game owns the Floors for its own values; a darker/warmer custom ground means contrast must be re-checked in BOTH themes, not inherited.
> USER NOTES:

### Q: Performance guard for the atmosphere on weak devices (candle gradients, grain, planchette)?
- [x] A) **Static-first by construction** — all atmosphere is CSS gradients + a frozen grain + one transform-only loop; no shaders/particles in the skin layer, so nothing to degrade
- [ ] B) Add a shader/particle layer with an auto-degrade path
- [ ] C) A manual quality toggle
- [ ] Other: __________________________________________
> WHY: Apple-fy "premium via craft, not spend" + the completeness Floor — building the overhaul from GPU-cheap CSS means the base render is already the performant one; heavier effects (if ever) are a separate opt-in unit.
> USER NOTES:

## S5 · Immersion, atmosphere, ghosts & Ouija ritual

> Presentation-only (Séance logic is FROZEN). Every pick below is atmosphere, feedback, or pacing — never a rule.
> Hard floor threaded through the whole section: **≤1 infinite/looping animation per viewport**, everything else
> finite ≤600ms, and **every effect has a reduced-motion variant**. The shipped composition (`SeanceAtmosphere.tsx`)
> already spends its ONE loop on the planchette drift and keeps candles / dust / smoke / grain STATIC; picks here
> respect that budget by construction (a second infinite loop is never offered — it would break a Floor).

## Ghost presence — companions, not rewards

### Q: How present should the ghosts be during normal play?
- [x] A) Companions, not rewards — occasional peeks/drifts at screen edges, never a jumpscare
- [x] B) Tied to progress — they grow more present/frequent as deductions land correctly
- [ ] C) Nearly absent during play, saved almost entirely for the completion ceremony
- [ ] Other: __________________________________________
> WHY: v4 pillar "The Spirits Are Always Watching" — ghosts watch/react/return as companions; A+B compose (ambient baseline that intensifies with correctness) and both are event/state-driven, not a new loop.
> USER NOTES:

### Q: Where do ambient ghost apparitions appear relative to the puzzle?
- [x] A) Only at edges / behind the board — drift across screen margins, never over the active grid
- [ ] B) Anywhere, including a translucent pass directly over the grid
- [ ] C) Fixed "watching" spots in the far corners only
- [ ] Other: __________________________________________
> WHY: Legibility Floor — Q&A/puzzle cells must never sit under moving decoration; v4's own examples ("crosses behind the puzzle", "peeks around the edge") are edge/back-plane by nature.
> USER NOTES:

### Q: What form does a typical drifting apparition take?
- [x] A) A soft cool-blue silhouette / orb that fades in and out (spec: "ghosts emit cool blue light")
- [ ] B) A detailed figure (child, shadow-man) rendered semi-photographically
- [ ] C) Abstract smoke that briefly suggests a face
- [ ] Other: __________________________________________
> WHY: Apple-fy = restraint + depth; a luminous silhouette reads as elegant Victorian spiritualism (ghost-blue in the palette) and is GPU-cheap opacity/blur, where a detailed figure risks campy Halloween.
> USER NOTES:

### Q: How is a single apparition animated within the motion budget?
- [x] A) A finite fade-in → drift → fade-out clip (≤ a few s), triggered on a timer/event — not an infinite loop
- [ ] B) A continuously looping float that never resolves
- [ ] C) A static overlay that just cross-fades between positions
- [ ] Other: __________________________________________
> WHY: The one viewport loop is the planchette; apparitions must be finite triggered clips so the room can feel alive without a second infinite animation (Motion Floor).
> USER NOTES:

### Q: When a correct deduction lands, how do the spirits acknowledge it?
- [x] A) A brief spirit-orb / faint apparition flickers near the bound cell, then fades
- [ ] B) All ambient ghosts pause and "turn to watch" the player
- [ ] C) No ghost response on individual deductions — reserved for milestones
- [ ] Other: __________________________________________
> WHY: v4 "every correct deduction subtly strengthens their presence" — a local, finite orb ties the reward to the exact cell without interrupting deduction.
> USER NOTES:

### Q: Should any ghost ever move suddenly, loudly, or toward the player (jumpscare)?
- [x] A) Never — all motion is slow, soft, and receding; the game explicitly rejects jumpscares
- [ ] B) One rare "startle" for tension
- [ ] C) Player-tunable scare intensity
- [ ] Other: __________________________________________
> WHY: Hard v4 directive ("Nothing is loud. Nothing jumpscares. Everything rewards observation") and an accessibility stance; a single non-negotiable answer.
> USER NOTES:

### Q: Are ghosts finally, fully revealed anywhere?
- [x] A) Only in the completion ceremony — they gather and materialize as the reverent payoff
- [ ] B) A partial reveal at the halfway milestone too
- [ ] C) Never fully shown — always suggestion, never form
- [ ] Other: __________________________________________
> WHY: v4 "The completed puzzle... the spirits finally reveal themselves" — holding full form for the ceremony makes the reveal the emotional climax rather than a routine sight.
> USER NOTES:

## Candlelight, one light source & the living dark

### Q: How do candles behave at rest during active play?
- [x] A) Static warm glow at rest; a finite flare only on events (correct = brighter, strike = dips) — no idle flicker loop
- [ ] B) Continuous CSS flicker loop on every candle
- [ ] C) Completely static, no reaction to events either
- [ ] Other: __________________________________________
> WHY: A perpetual flicker would be a second infinite loop (Floor breach); a static base + finite event flares delivers "candle burns brighter / briefly flickers" from v4's feedback list within budget.
> USER NOTES:

### Q: Does the séance commit to a single dominant light source?
- [x] A) Yes — one warm candle bloom from top-centre; corners fall to darkness (spec: "one light source", "corners fade into darkness")
- [ ] B) Even, flat lighting across the whole board
- [ ] C) Multiple competing light sources for drama
- [ ] Other: __________________________________________
> WHY: Apple-fy restraint + the shipped `AmbientGlow intensity=0.5 position="50% -4%"` already establishes the single top-centre source; one light reads as premium and directs the eye to the grid.
> USER NOTES:

### Q: What drives the room brightening — puzzle progress or elapsed time?
- [x] A) Progress — the room grows warmer/brighter as more cells are correctly bound (spec: "candles brighten as certainty increases")
- [ ] B) Elapsed time — it slowly darkens the longer you take
- [ ] C) Fixed brightness, no change
- [ ] Other: __________________________________________
> WHY: v4 "the room subtly becomes less haunted as the player approaches the solution" — progress-linked light rewards correctness and is a state transition, not a loop.
> USER NOTES:

### Q: How is the "brighten with progress" change delivered visually?
- [x] A) A slow state transition of the vignette/bloom variables on each milestone (finite, eased ≤600ms)
- [ ] B) An instant step-change in brightness
- [ ] C) A continuous animated ramp that never settles
- [ ] Other: __________________________________________
> WHY: "Nothing should animate quickly... deliberate" — an eased finite transition per milestone feels cinematic and stays inside the finite-≤600ms rule.
> USER NOTES:

### Q: Is there a vignette darkening the frame edges?
- [x] A) Yes — a soft radial vignette that lifts as progress increases (or deepens with time), never touching the grid legibility
- [ ] B) No vignette — even edges
- [ ] C) Heavy cinematic black bars
- [ ] Other: __________________________________________
> WHY: The vignette is the core "lit-centre, dark-corners" séance frame (shipped `AmbientGlow`); it must stay behind translucent content so body text keeps ≥4.5:1 contrast (Floor).
> USER NOTES:

### Q: Should wax visibly drip / candles visibly shorten over the session?
- [x] A) A static wax-drip texture on the holders; no live melting animation
- [ ] B) Real-time melting that shortens candles as the timer runs
- [ ] C) No wax detail at all
- [ ] Other: __________________________________________
> WHY: Live melting is either another loop or per-frame work for negligible payoff; a rendered wax-drip texture gives the "handcrafted, expensive" material cue (v4 materials list) for free.
> USER NOTES:

### Q: On an incorrect submission (Poltergeist Strike), how does the light react?
- [x] A) Room briefly darkens + candle flickers down, then recovers — a finite dip (paired with cold-mist/ghost-sigh feedback)
- [ ] B) A harsh red flash
- [ ] C) No lighting change
- [ ] Other: __________________________________________
> WHY: v4 incorrect-feedback list ("candle briefly flickers, room slightly darkens"); a soft finite dip stays reverent and never uses a jarring red that would clash with the ghost-blue/amber palette.
> USER NOTES:

## Ambient event pacing — the slow loop & reactive bursts

### Q: Pacing of ambient supernatural events (ghosts drifting, candle flicker, etc.) during play?
- [ ] A) Rare & subtle — something every few minutes, never during active deduction
- [ ] B) Reactive only — events fire on correct/incorrect deductions, not on a timer
- [x] C) Both a slow ambient loop and reactive bursts
- [ ] Other: __________________________________________
> WHY: v4 wants a room that "continuously breathes" AND reacts; a slow scheduler for ambient garnish plus event-triggered bursts covers both without any single element looping infinitely.
> USER NOTES:

### Q: How often does an ambient (non-reactive) event fire?
- [x] A) Roughly every 2–4 minutes, jittered so it never feels metronomic (spec: "every few minutes, something happens")
- [ ] B) Every 20–30 seconds — a busy, always-active room
- [ ] C) Only once or twice per whole session
- [ ] Other: __________________________________________
> WHY: v4 "Every few minutes, something supernatural happens" and "notice something new after weeks of play" — sparse, jittered timing rewards observation and keeps the room from feeling animated-busy.
> USER NOTES:

### Q: May an ambient event fire while the player is mid-deduction (actively tapping cells)?
- [x] A) No — suppress ambient events during active interaction; resume on idle
- [ ] B) Yes — the room lives regardless of what the player is doing
- [ ] C) Only quiet ones (candle sway) during interaction, big ones only on idle
- [ ] Other: __________________________________________
> WHY: "never distracts from solving" is a stated v4 priority; gating ambient bursts on an idle window keeps attention on the grid exactly when it matters.
> USER NOTES:

### Q: Are ambient events randomized or scripted?
- [x] A) Randomized from a pool, but SSR-safe — seeded via `lib/rng.ts`, never `Math.random()` in a render path
- [ ] B) A fixed scripted sequence every session
- [ ] C) Fully free `Math.random()` selection
- [ ] Other: __________________________________________
> WHY: Variety keeps the room fresh, but the SSR Floor forbids `Math.random()` in render; free shuffles are allowed only inside client effects/handlers (date-seeded PRNG otherwise).
> USER NOTES:

### Q: How do reactive bursts differ in weight from ambient drifts?
- [x] A) Reactive bursts are local + brief (near the acted cell); ambient drifts are broad + slow (screen-margin, atmospheric)
- [ ] B) Both use the same weight and duration
- [ ] C) Reactive bursts are the big showy ones, ambient is barely-there
- [ ] Other: __________________________________________
> WHY: Tying reactive feedback to the acted cell makes cause/effect legible; keeping ambient broad-and-slow preserves the "always watching" mood without competing for attention.
> USER NOTES:

### Q: Do ambient events keep firing after the puzzle is solved (results/ceremony state)?
- [x] A) No — the scheduler stops; the ceremony choreographs its own finite sequence, then the room settles calm
- [ ] B) Yes — ambient keeps looping under the results card
- [ ] C) Everything freezes instantly at solve
- [ ] Other: __________________________________________
> WHY: v4 completion is reverent ("the room falls silent") — handing off from the ambient scheduler to a bespoke finite ceremony avoids competing motion and honors the intended stillness.
> USER NOTES:

## The planchette's signature motion

### Q: What is the planchette's resting behavior?
- [ ] A) Barely-perceptible idle drift + tiny rotations; leans toward each new binding (≤600ms, current)
- [ ] B) Parked at board center, only moves on deductions/hints/completion
- [x] C) Follows the player's most recent tap like a cursor companion
- [ ] Other: __________________________________________
> WHY: v4 wants the planchette as the signature living element; a cursor-companion that trails the last tap makes it feel possessed-yet-responsive, and it stays the single sanctioned viewport loop (shipped `Planchette` drift).
> USER NOTES:

### Q: How fast does the planchette move when following / leaning?
- [x] A) Slow and eased, arriving in ≤600ms — a deliberate glide, never a snap
- [ ] B) Instant snap to target
- [ ] C) A long, drawn-out 1–2s travel each time
- [ ] Other: __________________________________________
> WHY: Finite-≤600ms Floor plus v4 "Nothing should animate quickly. Everything should feel deliberate" — the ≤600ms eased lean matches the shipped binding animation.
> USER NOTES:

### Q: The planchette is the element that spends the one looping-animation budget — confirmed?
- [x] A) Yes — the planchette idle drift is THE per-viewport loop; all other atmosphere is static or finite-triggered
- [ ] B) No — give the loop to candle flicker instead, planchette moves only on events
- [ ] C) Split the loop across several elements
- [ ] Other: __________________________________________
> WHY: Shipped composition already designates the planchette as the lone loop with everything else static; the Motion Floor forbids splitting into multiple infinite loops, so this stays the disciplined allocation.
> USER NOTES:

### Q: On a hint, how does the planchette guide the player?
- [x] A) It softly leans / drifts toward the region that deserves attention, without directly highlighting UI (spec)
- [ ] B) It jumps and points sharply at the exact clue
- [ ] C) No planchette involvement — hints use a separate highlight
- [ ] Other: __________________________________________
> WHY: v4 planchette hint spec verbatim — "the planchette softly leans toward an area" — keeps the ghostly-guidance fiction intact instead of a blunt UI callout.
> USER NOTES:

### Q: In the completion ceremony, what does the planchette do?
- [x] A) Glides confidently across the board spelling a short confirmation, then settles to center (a finite one-shot sweep)
- [ ] B) Just brightens in place
- [ ] C) Spins dramatically
- [ ] Other: __________________________________________
> WHY: v4 defining moment "the planchette glides on its own"; the shipped `spelling` sweep is a finite 2.6s clip — reverent, not a spin, and honors "No excessive celebration."
> USER NOTES:

### Q: Is the planchette interactive, or purely decorative?
- [x] A) Purely decorative — `pointer-events:none`, `aria-hidden`; it reflects state but is never a control
- [ ] B) Draggable — the player can slide it themselves
- [ ] C) Clickable to trigger hints
- [ ] Other: __________________________________________
> WHY: Logic is FROZEN and the grid cells are the controls; a decorative planchette (as shipped) avoids introducing an input surface that could confuse the deduction interaction.
> USER NOTES:

## Ouija ritual motifs & board-surface literalness

### Q: How literal should the Ouija-board influence be?
- [x] A) Borrow the language subtly — alphabet engravings on borders, sun/moon corner ornaments, compass rose
- [ ] B) Strongly literal — the grid sits on a rendered Ouija board surface
- [ ] C) Minimal — a planchette + serif type is enough of a nod
- [ ] Other: __________________________________________
> WHY: v4 "borrowing its design language... Not literally replacing the existing interface" and "recognize the inspiration without sacrificing usability" — motifs on the frame, not under the data.
> USER NOTES:

### Q: Where do the decorative alphabet engravings live?
- [x] A) Etched faintly around panel/border edges, well outside the interactive grid
- [ ] B) Behind the grid cells as a full board-face backdrop
- [ ] C) Not used
- [ ] Other: __________________________________________
> WHY: Engraved borders (v4 Ouija list) give unmistakable board identity while keeping cell contrast clean — text must never sit on a busy engraved field (Legibility Floor).
> USER NOTES:

### Q: Which corner ornaments define the frame?
- [x] A) Sun/moon + crescent motifs and a compass rose, as carved brass SVG in the four corners (shipped `Ornament variant="corner"`)
- [ ] B) Plain gold rule lines, no figurative motifs
- [ ] C) Skulls / bats / pumpkins
- [ ] Other: __________________________________________
> WHY: v4 lists "crescent moon corner ornaments, sun and moon motifs, ornamental compass roses"; the sun/moon/compass vocabulary is authentic spiritualism and explicitly avoids the rejected Halloween iconography.
> USER NOTES:

### Q: How ornate are the Victorian flourishes and gold dividers?
- [x] A) Delicate and restrained — thin engraved lines, faded gold foil, generous negative space
- [ ] B) Heavy, maximalist gilt everywhere
- [ ] C) None — flat dividers
- [ ] Other: __________________________________________
> WHY: Apple-fy "fewer, better elements; generous spacing"; restrained gold trim (palette: "aged gold, faded gold foil") reads expensive where maximal gilt reads gaudy.
> USER NOTES:

### Q: Are spirit symbols / sigils etched into backgrounds?
- [x] A) Yes — very subtly, low-contrast, behind non-text panel areas only
- [ ] B) Boldly, as a prominent watermark across the board
- [ ] C) No sigils
- [ ] Other: __________________________________________
> WHY: v4 "spirit symbols subtly etched into backgrounds"; low-contrast placement adds depth on repeat play ("notice something new after weeks") without ever reducing content contrast.
> USER NOTES:

### Q: How is dust/smoke rendered in the ambient layer?
- [x] A) Static, seeded particle field + faint still smoke/grain (shipped `ParticleField animate={false}` + `GrainFog animate={false}`)
- [ ] B) Continuously drifting particle simulation
- [ ] C) No particles
- [ ] Other: __________________________________________
> WHY: A frozen seeded frame gives the "dust floats through moonlight" texture at zero loop cost; live particle drift would be a second infinite loop (Floor breach) and heavier on weak GPUs.
> USER NOTES:

### Q: Do wax drips, dust, and smoke sit in front of or behind the grid?
- [x] A) Behind everything (zIndex 0), translucent, so they never cross Q&A/puzzle text (shipped layering)
- [ ] B) In front, as a foreground overlay across the grid
- [ ] C) Mixed depths
- [ ] Other: __________________________________________
> WHY: Shipped `SeanceAtmosphere` sits at zIndex 0 behind content at zIndex 1 precisely so texture never crosses text — the Legibility Floor made structural.
> USER NOTES:

## Materials in motion — brass, parchment, velvet, glass

### Q: How do brass elements (buttons, engravings, ornaments) shimmer?
- [x] A) A finite gilt sheen that sweeps once on hover/event (≤600ms), static otherwise
- [ ] B) A perpetual animated shine loop
- [ ] C) Flat brass, no shimmer
- [ ] Other: __________________________________________
> WHY: v4 "brass engravings shimmer" + "hover states shimmer with ghostly light"; a one-shot finite sheen delivers it on interaction without spending the loop budget.
> USER NOTES:

### Q: Do parchment surfaces (clue slips, tooltips) move?
- [x] A) A finite flutter/settle when they appear (torn-parchment entrance), then still
- [ ] B) A constant gentle flutter loop
- [ ] C) No motion — parchment just fades in
- [ ] Other: __________________________________________
> WHY: The seed already frames clues as "torn parchment slips that flutter in one at a time"; a finite entrance flutter matches that and avoids an idle loop per slip.
> USER NOTES:

### Q: How is the scratched-glass / glass-overlay material treated?
- [x] A) A static scratched-glass texture over panels with a soft candlelight bloom baked in (spec: "glass reflects candlelight")
- [ ] B) A live moving reflection that tracks the candle
- [ ] C) No glass layer
- [ ] Other: __________________________________________
> WHY: v4 materials "scratched glass... glass reflects moving candlelight"; a static texture with baked bloom gives the premium glassmorphism cue cheaply, where a live tracking reflection is a loop + GPU cost.
> USER NOTES:

### Q: Is velvet / walnut given tactile depth?
- [x] A) Yes — soft inner shadows, subtle grain, and a matte velvet fall-off on dark panels (static material, no motion)
- [ ] B) Flat color fills, no material depth
- [ ] C) Photographic wood/velvet images
- [ ] Other: __________________________________________
> WHY: v4 "Panels should resemble carved wood... faded velvet" and "real depth/material"; CSS shadow + grain gives handcrafted depth with no runtime image-opt cost (Vercel budget).
> USER NOTES:

### Q: On button press, do materials physically respond?
- [x] A) A subtle "wood depresses" / brass-engrave inset on press (finite, ≤200ms), plus the existing tap SFX
- [ ] B) No press feedback beyond color
- [ ] C) A large bouncy press animation
- [ ] Other: __________________________________________
> WHY: v4 microinteraction "Button press: wood depresses slightly"; a small finite inset reinforces the carved-material fiction without a springy, un-Victorian bounce.
> USER NOTES:

## Atmosphere reflects state — the room grows more alive

### Q: Should the room's atmosphere reflect certainty/difficulty (candles brighten as you approach the solution)?
- [x] A) Yes — the room gets *less* haunted / brighter as more cells are correctly bound
- [x] B) Opposite — pressure/vignette deepens with elapsed time only (current)
- [x] C) Both signals present but very subtle
- [ ] Other: __________________________________________
> WHY: v4 "the room subtly becomes less haunted as the player approaches the solution" AND time pressure; A+B compose under C — two subtle, state-driven signals (progress-warmth vs time-vignette) that never fight for attention.
> USER NOTES:

### Q: As the puzzle progresses, does ghost/ambient frequency change?
- [x] A) Ghosts react more often on correct deductions, but the room grows calmer/warmer overall near the solution
- [ ] B) The room gets busier and more haunted the closer you are
- [ ] C) Frequency is constant regardless of progress
- [ ] Other: __________________________________________
> WHY: Reconciles v4's two statements — "ghosts react more frequently when players make correct deductions" yet "less haunted as the player approaches the solution": reactive spikes on wins, calmer ambient baseline overall.
> USER NOTES:

### Q: Is there a visible "the room is more alive now" cue at milestones (e.g. half-solved)?
- [x] A) Subtle, cumulative — one more decoration/light restored per milestone, no banner or callout
- [ ] B) An explicit "50% — the veil thins" toast
- [ ] C) No milestone cue at all
- [ ] Other: __________________________________________
> WHY: v4 "the room itself becomes more alive as the puzzle progresses" and "streak milestones subtly restore decorations" — quiet accretion fits reverence better than a gamey toast.
> USER NOTES:

### Q: Does the atmosphere ever signal difficulty/uncertainty (e.g. when stuck)?
- [x] A) Very subtly — with long inactivity the vignette/mist thickens slightly, lifting the moment progress resumes
- [ ] B) An overt "you seem stuck" prompt with the room reacting hard
- [ ] C) No stuck-state atmosphere change
- [ ] Other: __________________________________________
> WHY: A faint idle-thickening reads as the spirits growing restless (immersive) without nagging; it resolves on activity, keeping agency with the player and staying finite/state-driven.
> USER NOTES:

## Reduced-motion, auto-degrade & quality tiers

### Q: Reduced-motion behavior for the ambient sim?
- [x] A) Freeze ambient sim (candles/dust/planchette drift), keep instant state changes, no shake, vignette frozen (current)
- [x] B) Also strip the completion cinematic down to a static "banished" card
- [x] C) Offer an in-game "calm the room" toggle independent of the OS setting
- [ ] Other: __________________________________________
> WHY: Motion Floor requires a reduced-motion variant for every effect; A+B+C compose — OS-honoring freeze, a static ceremony fallback, and an in-app override for players who want calm without changing OS settings.
> USER NOTES:

### Q: Under reduced motion, does the planchette (the one loop) still move at all?
- [x] A) No — it holds a still, legible frame; no drift, no lean (shipped `reduce` path)
- [ ] B) It keeps a tiny drift
- [ ] C) It hides entirely
- [ ] Other: __________________________________________
> WHY: The planchette is the sole loop, so reduced motion must freeze it (as shipped); keeping it visible-but-still preserves the composition without any animation.
> USER NOTES:

### Q: Do reactive event feedbacks (correct/strike flares) survive reduced motion?
- [x] A) Yes as instant state changes — the brighten/dim happens, but without the animated sweep/shake
- [ ] B) They're fully removed
- [ ] C) They animate normally
- [ ] Other: __________________________________________
> WHY: Feedback must remain legible for accessibility; swapping animated flares for instant state changes keeps cause/effect clear while honoring reduced motion (no shake, no sweep).
> USER NOTES:

### Q: If ambient effects would hurt performance on a weak device?
- [ ] A) Auto-degrade: drop particle count / disable shaders, keep the grid crisp and interactive
- [ ] B) A quality toggle (High / Balanced / Low atmosphere) the player controls
- [x] C) Both — auto-detect with a manual override
- [ ] Other: __________________________________________
> WHY: v4 "performance-first animation architecture... across devices"; auto-detect protects weak hardware by default while a manual override respects player choice — the grid always stays crisp and interactive.
> USER NOTES:

### Q: What are the atmosphere quality tiers, concretely?
- [x] A) High = full texture + planchette loop + all finite bursts; Balanced = static textures + reduced bursts; Low = flat panels, state-only feedback, no loop
- [ ] B) A single on/off switch for all atmosphere
- [ ] C) Many granular per-effect toggles
- [ ] Other: __________________________________________
> WHY: Three coherent tiers map cleanly onto the loop/finite/static budget and degrade gracefully; per-effect toggles would over-complicate a garnish layer that must never gate playability.
> USER NOTES:

### Q: When atmosphere is degraded/frozen, is the game still fully playable and legible?
- [x] A) Always — the seed-bank / no-JS / reduced-motion / low-quality frame renders complete on its own; effects are optional garnish (Floor)
- [ ] B) Some atmosphere is required for the room to make sense
- [ ] C) A "degraded mode" banner warns the experience is lesser
- [ ] Other: __________________________________________
> WHY: Non-negotiable Floor — the base frame must render complete with zero effects and zero env; atmosphere is garnish, never a dependency, and no apologetic banner is warranted.
> USER NOTES:

## S6 · Animated tutorial, audio content, mobile & edge cases

> Séance puzzle **logic is frozen** (`lib/seance.ts`). Every question below is
> presentation / feedback / pacing / audio / settings / mobile — never a rule
> change. Recommended picks are **v4-led** (animated cinematic tutorial, deep
> séance audio, native-feeling mobile) and every one is Floor-safe (motion ≤1
> loop/viewport + reduced-motion variant; audio respects the single global mute
> + autoplay policy; touch targets ≥44px), zero new Vercel cost, and uses
> **committed audio only** (no CDN — the `lib/sound.ts` synth + bundled
> `kenney_*`/`cues/` assets). One `[x]` per question unless the options compose.

---

### Tutorial (E3)

Animated board-fill walkthrough, skippable, reduced-motion → static, replay,
placement/trigger, first-run vs on-demand, how much it teaches.

#### Q: Should Séance's tutorial upgrade from the shipped static icon+phrase steps to an animated board demo?
- [ ] A) Keep the current 4 static steps + one worked example (`lib/tutorials/seance.ts`) unchanged
- [x] B) Add a small **animated scrying-board demo**: the planchette glides, one seat binds, its row/col auto-snuffs — the 4 steps narrate the motion
- [ ] C) Replace steps entirely with a full guided interactive first puzzle
- [ ] Other: __________________________________________
> WHY: v4 makes the tutorial a flagship moment; a tiny GPU-cheap demo of the auto-snuff cascade teaches the one mechanic newcomers miss, without touching the stable tutorial registry.
> USER NOTES:

#### Q: What exactly should the animated demo show, in sequence?
- [ ] A) Just the moment a seat binds (◯)
- [x] B) The full micro-cycle: tap → snuff (✕), tap again → bind (◯), then the auto-snuff ripple across that seat's row + column
- [ ] C) A whole small puzzle solved end to end
- [ ] Other: __________________________________________
> WHY: the three-state cell cycle plus **derived** auto-elimination is the sole rule people trip on; one worked micro-cycle is enough — a full solve spoils and bores.
> USER NOTES:

#### Q: Is the demo a live interactive board or a canned playback?
- [ ] A) A real interactive mini-board the player must tap through
- [x] B) A canned, non-interactive playback ("watch" clip) reusing the real cell styling; the live board is where they act
- [ ] C) Other: __________________________________________
> WHY: a scripted clip is deterministic (SSR-safe, no `rng`), trivially reduced-motion-swappable, and can't strand a first-timer mid-gesture.
> USER NOTES:

#### Q: How does the demo animate relative to the ≤1-loop motion budget?
- [x] A) Plays once per step reveal, advancing with the shipped Framer-Motion staggered step text; no infinite loop
- [ ] B) Loops continuously while the overlay is open
- [ ] C) Other: __________________________________________
> WHY: the Floor caps one infinite loop per viewport; a finite ≤600ms-per-beat sequence tied to the existing step stagger stays inside budget.
> USER NOTES:

#### Q: Reduced-motion behavior for the animated demo?
- [x] A) Swap to the shipped static steps + a labelled before/after still (blank → bound+snuffed), no motion
- [ ] B) Play the demo but slower
- [ ] C) Hide the demo entirely under reduced-motion
- [ ] Other: __________________________________________
> WHY: the Floor requires a reduced-motion variant; a static before/after still teaches the same cascade as a **designed** state, not a degraded one.
> USER NOTES:

#### Q: Placement / trigger — keep RoomShell's first-play overlay + persistent "?" help icon?
- [x] A) Keep exactly that: auto-open on first unseen visit (`parlor:tutorial-seen:/seance`), replay via the fixed bottom-right "?" icon
- [ ] B) Move the trigger into the séance-invitation card
- [ ] C) A dedicated menu entry only, no auto-open
- [ ] Other: __________________________________________
> WHY: it's the shipped, SSR-safe, per-room-persisted pattern every room shares; Séance should enrich the tutorial **content**, never fork the system.
> USER NOTES:

#### Q: First-run vs on-demand — does the animated demo play in both, or only first-run?
- [x] A) Both — identical content first-run and on replay via "?"
- [ ] B) Animated first-run only; the "?" replay shows static steps
- [ ] C) Other: __________________________________________
> WHY: consistency beats cleverness; a returning player who forgot the auto-snuff rule deserves the same clear demo, and reuse costs nothing.
> USER NOTES:

#### Q: How is the tutorial dismissed / skipped?
- [x] A) Fully skippable — Escape, backdrop tap, and an explicit themed "Enter the séance" primary button; dismissal persists per room
- [ ] B) Must watch the demo through once before the dismiss unlocks
- [ ] C) Other: __________________________________________
> WHY: the shipped overlay already wires Escape + persistence; a clear in-world primary dismiss respects players who already know the game.
> USER NOTES:

#### Q: How much should the tutorial teach?
- [x] A) The core loop only (bind, auto-snuff, stabilise, wrong = +time) — 2–5 steps
- [ ] B) Also cover scoring, strikes, hints, and the archive
- [ ] C) Everything, including atmosphere/ghost lore
- [ ] Other: __________________________________________
> WHY: v4 "5-year-old legible"; overloading the first moment buries the one thing that matters — deduction, no guessing.
> USER NOTES:

#### Q: Should the worked example use the live daily's clue or a fixed evergreen one?
- [ ] A) Pull a real clue from today's puzzle
- [x] B) A fixed evergreen whisper (the shipped "Mr. Vane and the salt ring…"), never the live puzzle
- [ ] C) Other: __________________________________________
> WHY: a canned example is spoiler-free, deterministic, and seed-independent; pulling the live clue would leak the day's solve.
> USER NOTES:

#### Q: On finishing the tutorial, hand off to the Setup group's first-ever "gift" pre-placed confirm?
- [x] A) Yes — tutorial teaches the cascade, the pre-seated gift lets them feel it once on the real board
- [ ] B) No pre-seat; blank board after the tutorial
- [ ] C) Other: __________________________________________
> WHY: keeps this section consistent with the accepted Setup pick (first-ever "the spirits offer a gift" confirm); demo + gift reinforce the same lesson.
> USER NOTES:

#### Q: Voice / tone of the tutorial copy?
- [x] A) In-world medium's voice ("Read the whispers, bind every soul to its seat"), matching the shipped tagline
- [ ] B) Plain functional instructions
- [ ] C) Other: __________________________________________
> WHY: v4 premium framing — the tutorial is the first atmosphere beat; the shipped tagline already sets this register.
> USER NOTES:

#### Q: Should the demo reuse the real SeanceAtmosphere planchette visual?
- [x] A) Yes — reuse the same planchette motif at demo scale (learned here, recognised on the board)
- [ ] B) A simpler placeholder marker in the demo
- [ ] C) Other: __________________________________________
> WHY: Apple-fy = fewer, better elements; teaching with the exact signature motif builds recognition and avoids a second bespoke asset.
> USER NOTES:

#### Q: Any audio during the tutorial demo?
- [x] A) Silent by default (matches muted-by-default soundscape); if the player has already unlocked/unmuted, sync the snuff + bind cues to the demo
- [ ] B) Always play a narrated/voiced walkthrough
- [ ] C) Other: __________________________________________
> WHY: self-consistent with the muted-default + first-gesture-unlock decisions; never autoplay audio inside an overlay before a gesture.
> USER NOTES:

#### Q: Does the Ectoplasmic-Decay timer run while the tutorial overlay is open?
- [x] A) No — the timer starts only once the overlay is dismissed / the first cell is tapped
- [ ] B) Yes, the clock runs during the tutorial
- [ ] C) Other: __________________________________________
> WHY: fair scoring — a first-timer reading the walkthrough shouldn't bleed seconds; matches the "declare the séance begun" Setup framing.
> USER NOTES:

---

### Audio content (E4)

Ambient bed, cell SFX (snuff/bind), ceremony/Banished stinger, Poltergeist cue,
committed assets vs small new committed assets, mute/volume routing, per-event
mapping, first-interaction unlock, default-muted-vs-opt-in.

#### Q: What is the Séance ambient bed?
- [ ] A) Leave it on the engine's neutral A2 fallback pad (no `seance` root today)
- [x] B) Add a `seance` entry to the procedural drone roots (a low, slow pad) as the always-available baseline; auto-upgrade to a committed `ambient-seance.mp3` loop if one is dropped in
- [ ] C) No ambient bed — SFX only
- [ ] Other: __________________________________________
> WHY: séance currently falls through to the generic pad; a dedicated low root is free, and `lib/sound.ts` auto-upgrades to a committed loop with zero code change.
> USER NOTES:

#### Q: If a committed ambient loop is added, where does it come from (no CDN)?
- [x] A) A small CC0 seamless drone (~30–90s) committed at `/audio/ambient-seance.mp3`, per the audio README's opengameart guidance
- [ ] B) Fetch a loop from a CDN at runtime
- [ ] C) Other: __________________________________________
> WHY: committed-asset-only, zero Vercel/image-opt cost; the engine already looks for `ambient-{room}.mp3` and seamless-loops it.
> USER NOTES:

#### Q: Snuff-candle (✕) cell SFX — which source?
- [x] A) A soft, short, dry puff/tap — reuse a committed one-shot (`cues/ui/toggle`, an `impactSoft`/`footstep_wood` from the Kenney packs) at low gain
- [ ] B) A new bespoke recorded snuff sample
- [ ] C) No sound on snuff
- [ ] Other: __________________________________________
> WHY: snuffing is a small dry action; a committed subtle tap reads right and needs no new asset — the packs ship 587 CC0 one-shots.
> USER NOTES:

#### Q: Bind-rune (◯) cell SFX — which source?
- [x] A) The glass-resonance cue — `sfxGlassClink()` synth, auto-upgraded by a committed `impactGlass_light`, matching v4's "glass clink on a correct deduction"
- [ ] B) A rising chime unrelated to glass
- [ ] C) Other: __________________________________________
> WHY: v4 names glass resonance for a binding; `sfxGlassClink` already exists and a committed impactGlass upgrades it — on-theme, zero new asset.
> USER NOTES:

#### Q: Poltergeist-strike (wrong submit) cue — which source?
- [x] A) A heavier, darker hit — `sfxWrong()` synth plus a committed `impactWood_heavy` / `cues/voice/wrong`, paired with the room-darken + cold-mist visual
- [ ] B) A loud jumpscare sting
- [ ] C) A neutral error beep
- [ ] Other: __________________________________________
> WHY: v4 wants a *felt* penalty (ghost sigh, room darkens) not a jumpscare; a low wood thud + the existing wrong synth lands the weight, all committed.
> USER NOTES:

#### Q: Banished ceremony / completion stinger — which source?
- [x] A) Keep the already-wired committed `/audio/stinger.mp3` and layer `sfxPianoChord()` for the reverent choir-like swell
- [ ] B) A big orchestral hit
- [ ] C) Silence, no completion sound
- [ ] Other: __________________________________________
> WHY: stinger.mp3 already upgrades `audio.stinger()` with no code change; the soft piano chord matches v4's "warm swell, reverent, no explosion."
> USER NOTES:

#### Q: Should binding trigger a distinct auto-snuff (cascade) sound?
- [x] A) A single soft whisper/sweep once per bind (not one tick per auto-X) — a committed low `impactSoft`/wind at very low gain
- [ ] B) One tick per auto-snuffed cell
- [ ] C) No cascade sound
- [ ] Other: __________________________________________
> WHY: one gentle cascade cue reinforces "the spirits did this" without a machine-gun of ticks; per-cell sounds would be noisy and un-premium.
> USER NOTES:

#### Q: New small committed assets vs. reuse-only?
- [x] A) Reuse the committed packs/cues first; commit at most a couple of small CC0 séance-specific one-shots (candle puff, planchette slide) only where the synth is thin
- [ ] B) Commit a full bespoke séance sound set
- [ ] C) Synth-only, add nothing
- [ ] Other: __________________________________________
> WHY: "premium via craft not spend" — committed bytes are free but reuse keeps the repo lean; add bespoke only where nothing existing fits.
> USER NOTES:

#### Q: Planchette-slide sound when it glides to a binding/hint?
- [x] A) A soft wood-slide swell under the glass-clink — a committed `footstep_wood`/low sweep, very quiet, only on deliberate glides (never idle drift)
- [ ] B) A sound on every idle drift too
- [ ] C) No planchette sound
- [ ] Other: __________________________________________
> WHY: v4 "planchette sliding across polished wood"; gating it to intentional glides (not the idle loop) keeps it rare and premium.
> USER NOTES:

#### Q: How is all Séance audio routed for volume / mute?
- [x] A) Entirely through the single `lib/sound.ts` `muted` authority + shared AudioContext — no per-room volume slider, no second audio path
- [ ] B) A Séance-only volume mixer
- [ ] C) Other: __________________________________________
> WHY: Floor + self-consistency: one mute authority already governs every room; Séance must not fork routing or add a runtime dep.
> USER NOTES:

#### Q: Should discrete Séance SFX (snuff/bind/strike) respect reduced-motion, or only mute?
- [x] A) Only mute — one-shot SFX are not motion; the ambient bed stays reduced-motion-gated (as shipped), discrete cues still fire under reduced-motion
- [ ] B) Silence all audio under reduced-motion
- [ ] C) Other: __________________________________________
> WHY: reduced-motion targets animation; silencing feedback cues would harm accessibility, while the looping bed correctly stays off under reduced-motion.
> USER NOTES:

#### Q: Autoplay-policy — when does any Séance audio first sound?
- [x] A) Nothing sounds until the first user gesture unlocks the AudioContext; the ambient bed starts only after unlock + unmute
- [ ] B) Try to start the bed on mount
- [ ] C) Other: __________________________________________
> WHY: Floor: audio respects the autoplay policy; the engine already lazily creates/resumes the context on first gesture — Séance must not pre-arm it.
> USER NOTES:

#### Q: Default sound state on entering the séance?
- [x] A) Muted by default; the player opts into the soundscape (consistent with the Edge-cases sound decision)
- [ ] B) Ambient on by default
- [ ] C) Other: __________________________________________
> WHY: self-consistency with the accepted default-muted + first-interaction picks; a séance you didn't ask to hear shouldn't blare on load.
> USER NOTES:

#### Q: When a player unmutes mid-séance, what happens?
- [x] A) The ambient bed fades in and interaction cues arm immediately; unmute uses the shipped confirmation chirp
- [ ] B) Audio waits until the next room visit
- [ ] C) Other: __________________________________________
> WHY: `setMuted(false)` already resumes the last room's desired bed; reusing it keeps behavior uniform and the chirp confirms the toggle.
> USER NOTES:

#### Q: Per-event mapping — should hover / trace also make sound?
- [x] A) No hover sound on the grid; reserve audio for committed state changes (snuff, bind, strike, hint glide, ceremony)
- [ ] B) A soft tick on every cell hover
- [ ] C) Other: __________________________________________
> WHY: Apple-fy restraint — a sound on every hover is fatiguing on a slow deliberate puzzle; audio should mark decisions, not cursor movement.
> USER NOTES:

#### Q: Should the ambient bed duck when the Banished ceremony plays?
- [x] A) Stop the bed for the ceremony's silence-then-swell beat (v4: "the room falls silent… then the swell"), resuming after
- [ ] B) Keep the bed at full volume under the stinger
- [ ] C) Build a real ducking/side-chain graph
- [ ] Other: __________________________________________
> WHY: v4's defining moment is the reverent silence before the swell; stopping the bed is both on-theme and simpler than a ducking graph.
> USER NOTES:

---

### Mobile (E5)

Grid/clue layout, drawer vs bottom-sheet, ≥44px cells, safe-area insets,
thumb-reach, full-bleed, orientation, keyboard-avoidance.

#### Q: Grid + clue layout on a phone?
- [x] A) Vertical stack — collapsible clue rail above, the transposed matrix below (the shipped `.main` column flow); no horizontal scroll, ever
- [ ] B) Side-by-side rail + grid squeezed onto the phone
- [ ] C) Grid first, clues in a floating overlay
- [ ] Other: __________________________________________
> WHY: the transposed matrix (≤7 seat columns) already fits 320–1920px via `table-layout:fixed`; stacking preserves the no-scroll invariant.
> USER NOTES:

#### Q: Clues on mobile — collapsible drawer (top) or bottom-sheet?
- [x] A) Collapsible drawer above the grid (matches the accepted Setup mobile pick)
- [ ] B) A bottom-sheet the player drags up over the grid
- [ ] C) Other: __________________________________________
> WHY: self-consistency with the Setup group's mobile clue decision; the shipped CollapsiblePanel already collapses the rail to a bar on a phone.
> USER NOTES:

#### Q: Cell tap targets on the tightest phones?
- [x] A) Hold the ≥44px `min-height` where width allows; at the one extreme (N=7 @ 320px) let cell *width* shrink to preserve no-horizontal-scroll
- [ ] B) Force 44px always and allow a horizontal scroll on wide grids
- [ ] C) Other: __________________________________________
> WHY: this is the shipped documented trade-off — the no-scroll invariant wins over 44px only at that single extreme; everywhere else the floor holds.
> USER NOTES:

#### Q: Safe-area insets (notch / home indicator)?
- [x] A) Pad the shell and the pinned controls footer with `env(safe-area-inset-*)` so nothing hides under the notch or home bar
- [ ] B) Ignore insets, rely on default margins
- [ ] C) Other: __________________________________________
> WHY: full-bleed immersion must not clip controls under system UI; insets are CSS-cheap and standard.
> USER NOTES:

#### Q: Thumb reach — where do Submit / primary controls sit on mobile?
- [x] A) Pin the primary "Stabilise"/Submit in the bottom controls footer, within thumb reach, ≥44px
- [ ] B) Top of the screen with the HUD
- [ ] C) Floating action button over the grid
- [ ] Other: __________________________________________
> WHY: the shipped `.nav` footer is already bottom-pinned; keeping the primary action in the thumb zone is standard mobile ergonomics.
> USER NOTES:

#### Q: Should Séance go full-bleed on mobile?
- [x] A) Yes — edge-to-edge scrying table on phones (FluidStage full-bleed), corners relaxing to the viewport edges
- [ ] B) Keep the inset card with page margins on mobile
- [ ] C) Other: __________________________________________
> WHY: v4 "full-bleed immersion" — the atmosphere reads as a room you're inside, and it reclaims scarce phone width for the grid.
> USER NOTES:

#### Q: Orientation handling?
- [x] A) Portrait-first, but both portrait AND landscape work via the responsive stack; no rotation lock, no "please rotate" wall
- [ ] B) Lock to portrait
- [ ] C) Other: __________________________________________
> WHY: never block an orientation (accessibility); the width-based layout already reflows, and locking fails users who mount their phone.
> USER NOTES:

#### Q: Keyboard-avoidance — is there any text input in Séance?
- [x] A) No text entry in normal play (all tap-driven); if the share/archive uses a field, let the browser scroll it into view — no custom keyboard handling
- [ ] B) Build a custom keyboard-avoidance layout shifter
- [ ] C) Other: __________________________________________
> WHY: the puzzle is pure tap; avoiding text input sidesteps keyboard-avoidance entirely (YAGNI), keeping mobile simple.
> USER NOTES:

#### Q: How does the collapsed clue drawer indicate there are clues to read?
- [x] A) A labelled bar with the clue count ("The spirit whispers · 5") that expands on tap, ≥44px
- [ ] B) A bare chevron icon only
- [ ] C) Other: __________________________________________
> WHY: discoverability — a bare icon hides the core input; a counted label tells the player what's inside without opening it.
> USER NOTES:

#### Q: On mobile, should tracing a clue reveal its highlighted seat columns?
- [x] A) Yes — tapping a clue collapses the drawer / scrolls so the highlighted seat columns are visible without manual scrolling
- [ ] B) Highlight only; the player scrolls to find them
- [ ] C) Other: __________________________________________
> WHY: on a phone the clue and its target can be a scroll apart; auto-revealing the trace keeps the deduction loop tight, matching the glow + planchette-lean feedback.
> USER NOTES:

#### Q: Planchette / ambient atmosphere on mobile — full or reduced?
- [x] A) Full atmosphere but perf-gated (auto-degrade particle count on weak devices per the Edge-cases pick); the single planchette loop stays
- [ ] B) Strip all atmosphere on mobile
- [ ] C) Other: __________________________________________
> WHY: consistent with the perf auto-degrade decision; the one sanctioned loop is cheap, heavier particle layers scale down on constrained hardware.
> USER NOTES:

#### Q: Accidental-tap protection on dense grids?
- [x] A) Keep single-tap 3-state cycling; ensure each cell button fills its `td` with adequate spacing — no long-press requirement on mobile
- [ ] B) Require a long-press to confirm (◯) on mobile
- [ ] C) Other: __________________________________________
> WHY: the Rules group kept single-tap cycling; a mobile-only long-press would fight muscle memory — spacing, not a gesture change, prevents mis-taps.
> USER NOTES:

#### Q: Sticky HUD (timer / identity) on mobile scroll?
- [x] A) Let the HUD scroll with the page (not sticky); keep the grid area stable so the timer doesn't eat scarce vertical space
- [ ] B) Pin the HUD to the top on scroll
- [ ] C) Other: __________________________________________
> WHY: on a tall stacked layout a sticky HUD steals rows from the grid; the timer is glanceable, not something you watch continuously.
> USER NOTES:

---

### Edge cases

Offline/zero-env, archive dark state, perf auto-degrade, incomplete-grid submit,
sound defaults, persistence. (Picks preserved from the accepted seed; `WHY`
added.)

#### Q: Reduced-motion behavior (spec: "responsive motion tuned for accessibility")?
- [x] A) Freeze the ambient sim (candles/dust/planchette drift), keep instant state changes, no shake, vignette frozen (current)
- [x] B) Also strip the completion cinematic down to a static "banished" card
- [x] C) Offer an in-game "calm the room" toggle independent of the OS setting
- [ ] Other: __________________________________________
> WHY: the Floor mandates a reduced-motion variant for every effect; freezing the sim + a static ceremony + an in-game override compose into full, layered motion control.
> USER NOTES:

#### Q: Offline / zero-env (fully playable with no DB — seed bank)?
- [x] A) Always serve a playable daily from the seed bank; atmosphere runs fully client-side (required)
- [ ] B) Same, but show a subtle "playing from the archive" marker when offline
- [ ] C) Other: __________________________________________
> WHY: zero-env playability is a Floor; the seed bank + client-only atmosphere means Séance never needs the DB or network to be fully playable.
> USER NOTES:

#### Q: A requested archive date that was never generated ("dark state" — DB up, no row)?
- [x] A) Themed empty state: "No record of that night survives in the archive." (current)
- [ ] B) Offer the nearest available night instead
- [ ] C) Redirect silently to today's séance
- [ ] Other: __________________________________________
> WHY: an in-world empty message keeps immersion and is honest; silently redirecting would confuse a player who typed a specific date.
> USER NOTES:

#### Q: If ambient effects would hurt performance on a weak device (particles / candle shaders)?
- [ ] A) Auto-degrade only: drop particle count / disable shaders, keep the grid crisp
- [ ] B) A quality toggle (High / Balanced / Low atmosphere) the player controls
- [x] C) Both — auto-detect with a manual override
- [ ] Other: __________________________________________
> WHY: v4 wants premium atmosphere everywhere; auto-degrade protects weak devices while a manual toggle respects player choice — neither alone suffices.
> USER NOTES:

#### Q: If the player submits an incomplete grid (not every seat bound)?
- [x] A) Treat it as a normal wrong submit → Poltergeist Strike
- [ ] B) Block submit until the grid is full, with a "the spirits need every seat named" nudge (no penalty)
- [ ] C) Warn once, then allow the penalized submit
- [ ] Other: __________________________________________
> WHY: the puzzle is frozen — Submit validates every seat; an incomplete board is simply wrong, and penalizing it keeps one consistent rule with no special-case UI.
> USER NOTES:

#### Q: Sound defaults & muting (ambient bed + interaction SFX)?
- [ ] A) Ambient starts on mount, silent under mute OR reduced-motion; a persistent mute control
- [x] B) Start muted by default; the player opts into the séance soundscape
- [x] C) Ambient on, but require a first user interaction before any audio (autoplay-policy safe)
- [ ] Other: __________________________________________
> WHY: these compose — muted-by-default respects the player, and the first-gesture unlock satisfies the autoplay Floor; together, no sound until both consent and a gesture.
> USER NOTES:

#### Q: Persisting a mid-séance and returning — how, and what about a stale day?
- [x] A) Restore the exact board + running timer from localStorage (as accepted); if the daily rolled over while away, keep the restored attempt under its own date and load today's fresh
- [ ] B) Restore the board but reset the clock
- [ ] C) No persistence — leaving abandons the attempt
- [ ] Other: __________________________________________
> WHY: consistent with the accepted persistence pick; guarding the date-rollover case stops a yesterday-board bleeding into today's streak.
> USER NOTES:

#### Q: If a committed audio asset is missing / fails to decode (404, corrupt)?
- [x] A) Fall through to the procedural synth silently and never refetch (the engine's known-absent cache); the game stays fully playable and silent-safe
- [ ] B) Surface an error / retry the fetch
- [ ] C) Other: __________________________________________
> WHY: `lib/sound.ts` already caches a miss as permanent and synthesizes instead — zero-env/offline stays green with nothing surfaced to the player.
> USER NOTES:
