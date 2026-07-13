# Ignite (streak) — design-intake questionnaire

> Codename **Ignite**. Today's build is the Witch's **rune cipher**: each rune tile stands for exactly one
> letter (a bijection glyph→letter over the incantation's distinct letters), and a minimal clue set
> (`anchor` / `vowel` / `consonant` / `before` / `adjacent` / `not`) solves it uniquely. You bind letters
> from the tray onto rune tiles on a Phaser board, then **Read the runes** to check; a correct map makes the
> **incantation blaze**. The v4 spec (`docs/v4/05_ignite.txt`) wants this to grow into a full alchemical
> **ritual** — runes + candles + chemical compounds + fire propagation along engraved channels, deterministic,
> one solution, an unlockable Compendium, and a Mon→Sun difficulty curve.
>
> Answer each prompt by ticking an option (combine or rewrite freely); every question ends with `Other:`.
> These answers drive the engine build — this file is decisions only, not trivia and not code.

## Setup — how a round is seeded and what the player sees first

### Q: What does the player see the instant Ignite opens?
- [ ] A) Dark shrine, all rune tiles blank, letter tray full — cold start
- [ ] B) One rune pre-bound as a worked example (a free `anchor`), the rest empty
- [ ] C) The full inscription (cipher runes) shown lit but unreadable; tray + clues below
- [ ] D) A short "the candle is unlit" beat, then the board fades in on first tap
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How is the letter tray seeded and ordered?
- [ ] A) A→Z sorted, only the incantation's distinct letters (current)
- [ ] B) Shuffled tray so alphabet order isn't a free clue
- [ ] C) Full A–Z always, extras greyed as "not in this incantation"
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How much of the ritual world frames the puzzle on load?
- [ ] A) Minimal — rune grid + tray, faint ember bloom only (current FlameAtmosphere)
- [ ] B) Framed by the shrine (roots, moss, candles) but puzzle stays center-stage
- [ ] C) Full cinematic shrine reveal (camera settle) before the board is interactive
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Which rune set skins a given day, and should the player know?
- [ ] A) Rotates silently by date across sets (Elder Futhark, Anglo-Saxon, …)
- [ ] B) Named in the header as lore ("Elder Futhark · the Witch's cipher" — current)
- [ ] C) Player-chosen skin in Settings; daily seed fixes only the puzzle, not the font
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Are candles / compounds present on day one, or a later-tier addition?
- [ ] A) Pure cipher now; candles + compounds arrive only Wed+ per the weekly curve
- [ ] B) Candles always visible as a progress meter (lit-per-rune-bound), no logic yet
- [ ] C) Ship the full ritual (candles + compounds + propagation) as the baseline
- [ ] Other: __________________________________________
> USER NOTES:

## Rules — core interaction and allowed moves

### Q: What's the primary bind gesture on the Phaser board?
- [ ] A) Tap a rune to select, tap a tray letter to drop it (current select-then-place)
- [ ] B) Drag a letter from the tray onto a rune tile
- [ ] C) Both — drag for pointer, tap-tap for keyboard/AT parity
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Must the map always stay a strict bijection (one letter per rune, no reuse)?
- [ ] A) Yes — placing a letter already in use moves it (enforced, current behavior)
- [ ] B) Yes, but block the move and flash the conflicting tile instead of stealing
- [ ] C) Allow temporary duplicates; only flag them at Read time
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does "Read the runes" (the check action) gate?
- [ ] A) Only enabled once every rune is bound (filled == K, current)
- [ ] B) Always tappable; partial reads reveal which bound runes are wrong
- [ ] C) Enabled at fill, but a wrong read locks any rune it can prove correct
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Which clue types stay in play?
- [ ] A) All six — anchor, vowel, consonant, before, adjacent, not (current)
- [ ] B) Trim to anchor + vowel + before for a gentler daily feel
- [ ] C) Keep all six, and add compound/element clues at higher tiers
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How do players interact with clues?
- [ ] A) Hover/tap a clue to ring-highlight the runes it names (current litGlyphs)
- [ ] B) Also let a clue auto-bind its forced letter with one tap ("apply")
- [ ] C) Clues are read-only lore; no board highlight
- [ ] Other: __________________________________________
> USER NOTES:

### Q: If compounds/catalysts land, what can the player do with them?
- [ ] A) Place a compound on a rune to unlock/redirect a fire path (new verb)
- [ ] B) Compounds are passive clue-givers only — no placement
- [ ] C) Mix two compounds in a crucible to reveal a letter
- [ ] Other: __________________________________________
> USER NOTES:

## Scoring — points, streaks, penalties, what "good" means

### Q: What is the headline score for a solve?
- [ ] A) Misreads (wrong Reads) — fewer is better, "flawless" at zero (current share)
- [ ] B) Time-to-solve
- [ ] C) A star/ember rating from misreads + hints used
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How do wrong Reads cost the player?
- [ ] A) Increment a visible misread counter + shake, no hard cap (current)
- [ ] B) Cost a candle each — run out and the ritual fails
- [ ] C) Purely cosmetic; misreads never block, only dull the final "flawless" badge
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should Ignite carry a cross-day streak (the room's namesake)?
- [ ] A) Yes — consecutive daily solves build a flame streak, shown on the home card
- [ ] B) Yes, but streak = days played, not days solved (kinder)
- [ ] C) No persistent streak; each day stands alone
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Do hints reduce the score?
- [ ] A) Yes — each hint (flicker → glow → outline) dims the flawless badge
- [ ] B) No — hints are free; only misreads count
- [ ] C) Hints cost a candle but never appear in the share string
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the shareable result string report?
- [ ] A) Rune row + set name + misreads/flawless + 🔥 (current)
- [ ] B) Add a candle/flame emoji bar encoding misreads
- [ ] C) Spoiler-safe grid only (no incantation, no rune identities)
- [ ] Other: __________________________________________
> USER NOTES:

## Win / lose — win condition, fail state, end-of-round

### Q: What exactly is the win condition?
- [ ] A) Full bijection matches the baked solution — the incantation blazes (current)
- [ ] B) Same, but every candle must also ignite via valid fire propagation
- [ ] C) Reveal the incantation AND identify the day's featured compound
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there a real lose/fail state, or only "keep trying"?
- [ ] A) No lose — unlimited Reads, you always eventually solve (current)
- [ ] B) Limited candles/Reads; running out ends the day as a soft loss
- [ ] C) No loss, but a "give up → reveal solution" option that voids the streak
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What is the win moment on screen?
- [ ] A) Incantation blazes in the win panel + completion stinger (current)
- [ ] B) Candles ignite one-by-one down the inscription, then the Eternal Flame erupts
- [ ] C) Full shrine wakes — roots pulse, embers rise, camera pulls up (v4 vision)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the end-of-round panel offer?
- [ ] A) Share + "inscribe again" reset (current)
- [ ] B) Add the day's educational card (compound / rune lore → Compendium)
- [ ] C) Add "next puzzle / archive" navigation and streak status
- [ ] Other: __________________________________________
> USER NOTES:

### Q: After a win, can the player keep playing that day's puzzle?
- [ ] A) Locked to the solved state; "inscribe again" only replays for fun (no score)
- [ ] B) Puzzle stays open; result is fixed once at first solve
- [ ] C) One puzzle per day, hard-locked until tomorrow
- [ ] Other: __________________________________________
> USER NOTES:

## Round / turn flow — structure, pacing, retries, daily vs freeplay

### Q: How is a "turn" paced?
- [ ] A) Free, untimed — bind, re-bind, Read whenever (current, no timers per spec)
- [ ] B) Untimed but a subtle elapsed clock for personal-best flavor
- [ ] C) Optional timed mode as a separate leaderboard
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How are retries after a wrong Read handled?
- [ ] A) Board stays as-is, shake + "the runes resist" note, keep editing (current)
- [ ] B) Wrong Read clears all bindings the clues can't prove — fresh-ish start
- [ ] C) Wrong Read locks proven-correct runes, frees the rest
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Daily vs freeplay — what's the offering?
- [ ] A) One deterministic daily ritual for everyone; that's it
- [ ] B) Daily + an Archive of past days (already themed as "no inscription survives")
- [ ] C) Daily + Archive + endless freeplay generator
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the weekly Mon→Sun curve visibly change the flow?
- [ ] A) Yes — longer inscriptions + more clue types as the week climbs to Sunday's Master Ritual
- [ ] B) Yes for length only; clue vocabulary stays constant
- [ ] C) Flat difficulty; every day is the same shape
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Where do candles/compounds enter the turn loop, if at all?
- [ ] A) Never — cipher-only forever
- [ ] B) As a second phase after the cipher: bind letters, THEN route the flame
- [ ] C) Interleaved — some runes only bind once their candle's compound is placed
- [ ] Other: __________________________________________
> USER NOTES:

## Difficulty — how hard, how it scales, difficulty knobs

### Q: What is the main difficulty knob?
- [ ] A) Incantation length K (more runes = more bindings)
- [ ] B) Clue tightness — fewer / more indirect clues per rune
- [ ] C) Both length and clue count scale together by weekday tier
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How generous should the clue set be?
- [ ] A) Always exactly-minimal (uniquely solving, no slack — current guarantee)
- [ ] B) Minimal on weekends, a couple of redundant "training wheels" clues early-week
- [ ] C) Player picks a difficulty that adds/removes redundant clues
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should "convincing false solutions" (Fri/Sat) be created?
- [ ] A) Rune sets that share transliteration prefixes to bait wrong `adjacent` reads
- [ ] B) Incantations that are near-anagrams so an early wrong lock feels right
- [ ] C) Compound red-herrings that look catalytic but aren't
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the incantation vocabulary itself scale difficulty?
- [ ] A) Common words early, rarer/archaic words (harder to guess-ahead) later
- [ ] B) Keep vocabulary fixed; difficulty is purely structural (clues/length)
- [ ] C) Theme words to the day's compound (e.g. "CINDER", "SULFUR")
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Any accessibility-driven easy mode?
- [ ] A) A "guided" toggle that auto-applies each clue's forced letter
- [ ] B) A larger-tile / high-contrast rune mode, same puzzle
- [ ] C) No modes — one shared daily for everyone
- [ ] Other: __________________________________________
> USER NOTES:

## Visual / UX / theme — Ignite's per-game skin (E0)

### Q: Which palette anchors Ignite?
- [ ] A) Deep charcoal + gold + burnished copper + amber firelight (v4 spec)
- [ ] B) Current PARLOR "history" amber (`#e0871f`) accent on surface tokens
- [ ] C) Dark emerald moss + parchment, fire as the only warm accent
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How present is "living fire" as feedback?
- [ ] A) Warm bloom strengthens as runes bind; embers erupt on win (current, modest)
- [ ] B) Each bound rune lights its own candle flame beside the tile
- [ ] C) Full GPU flame — flicker, heat distortion, spark showers (v4 aspiration)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How are runes rendered?
- [ ] A) Unicode glyph + transliteration label, no bundled SVG (offline-robust, current)
- [ ] B) Hand-drawn SVG runes carved into stone, transliteration on hover
- [ ] C) Unicode primary, optional SVG upgrade when assets load
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What's the layout on desktop vs mobile?
- [ ] A) Inscription top, rune grid center, letter tray bottom, clues collapsible
- [ ] B) Two columns on desktop (board | clues), stacked on mobile
- [ ] C) Board-first with clues in a slide-up sheet on mobile
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How cinematic should the win sequence be?
- [ ] A) Restrained — blaze the word, stinger, done (current)
- [ ] B) Sequential candle ignition down the inscription, ~2s
- [ ] C) Full shrine-wakes set piece with camera move (v4)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What's the ambient mood while idle?
- [ ] A) Breathing flame + floating ash + ritual/fire audio bed (current)
- [ ] B) Add fireflies, drifting mist, glowing fungi (v4 idle list)
- [ ] C) Near-silent, still — atmosphere only on interaction
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Does the Compendium ship as a visible surface?
- [ ] A) Yes — a collectible archive of runes/compounds/lore filled by solving (v4)
- [ ] B) Just an educational card per solve, no persistent collection yet
- [ ] C) Not now — defer the Compendium entirely
- [ ] Other: __________________________________________
> USER NOTES:

## Edge cases — offline, reduced-motion, degrade, empty/error, weird input

### Q: Reduced-motion behavior?
- [ ] A) Freeze the ember field to a still frame, no camera moves (current intent)
- [ ] B) Also cut the win stinger / audio bed
- [ ] C) Swap all motion for instant state changes; keep audio
- [ ] Other: __________________________________________
> USER NOTES:

### Q: If Phaser fails to load (or WebGL is blocked), what renders?
- [ ] A) DOM fallback board — rune buttons + tray + Read, fully playable (required)
- [ ] B) Static rune grid image + "open in a supported browser" note
- [ ] C) Canvas 2D fallback scene without shaders
- [ ] Other: __________________________________________
> USER NOTES:

### Q: A font can't draw the day's runes (tofu boxes) — then what?
- [ ] A) Clues already name every rune by transliteration ("Fehu ᚠ"), so play is unaffected (current)
- [ ] B) Also show the transliteration label under each tile permanently
- [ ] C) Auto-switch to a Latin-safe rune set when tofu is detected
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Archive-play of a date that was never generated (DB up, no row)?
- [ ] A) "No inscription survives from that night" dark state (current)
- [ ] B) Generate that date inline on the fly (deterministic by date)
- [ ] C) Redirect to the nearest available past ritual
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Fully offline / zero-env (seed-bank) play?
- [ ] A) Generate the daily ritual inline from the date seed — never dark offline (current)
- [ ] B) Serve a fixed seed-bank puzzle when no DB
- [ ] C) Both: seed-bank first, inline generator as fallback
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Player taps Read with the board full but all-wrong repeatedly?
- [ ] A) Keep shaking + counting misreads forever, no lockout (current)
- [ ] B) After N misreads, offer a hint escalation (flicker → glow → outline)
- [ ] C) After N misreads, surface a "reveal one correct rune" mercy option
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Clipboard blocked when sharing?
- [ ] A) Silently no-op (current)
- [ ] B) Fall back to a selectable text box / native share sheet
- [ ] C) Show a "copy failed" toast
- [ ] Other: __________________________________________
> USER NOTES:
