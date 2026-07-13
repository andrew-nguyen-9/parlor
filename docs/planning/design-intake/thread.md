# Thread of Fate — Design Intake Questionnaire

> **Codename:** Thread of Fate (The Weaver, "Seamstress of the Order")
> **For the USER to fill in.** This is not trivia and not an engine spec. Each question is a real product
> decision about how *this* game — the daily letter-chain woven on the loom — should look and behave. Tick an
> option, combine a few, or write your own on the `Other:` line, then leave a note under `USER NOTES:`.
>
> Grounding: today the game forges a daily **chain** of 5-ish links where each answer begins with the last
> letter of the previous (`passingLetter` → `firstLetter`), you type into a "name this stitch…" box and press
> **stitch →**, solve tiers are **hit / near / miss**, a two-step **hint ladder** (tie clue → letter scaffold)
> costs a clean stitch, a first wrong guess is forgiven, and a closing **final stitch** asks you to name the
> master **theme** before the tapestry reveal + share grid. The v4 direction wraps all of that in a Victorian
> weaving room around an ancient background loom.

---

## 1. Setup

### Q: When a Thread of Fate round opens, what does the player see first?
- [ ] A) The whole loom already strung — all 5 empty knots visible top-to-bottom, only the first active
- [x] B) A dark bench; knots fade in one at a time as the thread is drawn down from the top edge
- [ ] C) The Weaver seats the first thread for you (worked example), the rest of the rail empty
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How is the daily puzzle framed on screen (the v4 "pinned to an antique embroidery frame" idea)?
- [x] A) The chain rail sits inside a visible embroidery hoop / frame with today's date stitched on it
- [x] B) A loose "case file" tag tied with thread names the day; the rail floats over the loom
- [ ] C) No framing — the woven thread through the knots is the only structure
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How much of the chain's shape is revealed up front?
- [x] A) Show every knot as a blank slot so the player feels the full length of the weave ahead
- [x] B) Show only solved + active knots; the road ahead stays dark until reached
- [ ] C) Show count only ("5 stitches") with a single active knot
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the master theme be hinted before the final stitch, or hidden until the end?
- [x] A) Fully hidden — the "final stitch" theme guess is the first time the theme is named
- [x] B) A faint watermark / partial motif builds behind the rail as links solve
- [ ] C) Category of each link is shown, but the connecting theme stays secret
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What greets the player on the Weaver nameplate area at the top?
- [x] A) Just the nameplate ("The Weaver · Seamstress of the Order") + a progress read
- [x] B) A one-line in-character invitation from the Weaver ("A thread has come loose…")
- [ ] C) A running solved-% and clean-stitch tally, no character line
- [ ] Other: __________________________________________
> USER NOTES:

---

## 2. Rules

### Q: How forgiving should answer matching stay (today: substring / first-word / trimmed match)?
- [ ] A) Keep it loose as-is — this is the loosest input in Parlor, on purpose
- [x] B) Tighten to near-exact but ignore case/punctuation/leading "the"
- [ ] C) Loose, but require the correct passing letter to count (reinforces the chain rule)
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The letter-chain rule is the game's spine. How visible should the "begins with X" tell be?
- [x] A) Always show the passing letter on the active knot ("begins with 'R'")
- [ ] B) Only show it when the forged chain genuinely passes the letter (current behavior)
- [ ] C) Hide it by default; surface it only via the hint ladder
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What happens on the first wrong guess (today it's forgiven with "not quite — one more stitch")?
- [x] A) Keep one free retry, then the link unravels to a shown answer
- [ ] B) Unlimited retries but each one downgrades the stitch tier
- [ ] C) No mercy — first wrong guess reveals the answer
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should the player be able to skip a link and come back, or is the chain strictly linear?
- [x] A) Strictly linear — a chain must be woven in order
- [ ] B) Allow one "set aside" per game, revisited before the final stitch
- [ ] C) Any solved-out-of-order allowed, thread re-routes visually
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The two-level hint ladder (L1 tie clue, L2 letter scaffold) — keep, expand, or trim?
- [ ] A) Keep exactly two rungs as-is
- [x] B) Add a middle rung (category / era nudge) between tie and scaffold
- [x] C) Collapse to a single hint that reveals the tie only
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The "reveal answer" button — how prominent should the giving-up path be?
- [ ] A) Keep it as a quiet microlabel next to the hint
- [x] B) Hide it until after a hint is spent
- [ ] C) Remove it entirely; second wrong guess is the only reveal
- [ ] Other: __________________________________________
> USER NOTES:

---

## 3. Scoring

### Q: The three tiers are hit (clean) / near (hint spent) / miss (revealed or wrong). Keep this model?
- [x] A) Keep all three tiers and their 🟩/🟨/⬛ share squares
- [ ] B) Two tiers only — solved vs not, no penalty for hints
- [ ] C) Add a fourth tier for solved-on-first-try-no-tell (a "perfect stitch")
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Does spending a hint always downgrade hit → near, regardless of which rung?
- [ ] A) Yes — any help spends the clean stitch (current)
- [x] B) Only the letter-scaffold (L2) downgrades; the tie clue (L1) is free
- [ ] C) Hints never downgrade; they only cost time/streak
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the master-theme guess at the end weigh into the score?
- [ ] A) Bonus only — the chain % is the real score, theme is a flourish (current framing)
- [x] B) Theme is a full extra square that counts equally
- [x] C) Getting the theme redeems one missed link
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What does the player see as the headline number at the end?
- [ ] A) "X% woven · N clean · theme found/missed" (current)
- [x] B) A single stitch-count score out of a possible max
- [ ] C) A named rank ("Master Weaver", "Apprentice") derived from tiers
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What counts as a genuinely *good* Thread result worth sharing?
- [x] A) All links clean (all 🟩) — a flawless weave
- [x] B) Chain complete at all, regardless of hints — finishing is the win
- [x] C) Chain clean AND theme found — the full tapestry
- [ ] Other: __________________________________________
> USER NOTES:

---

## 4. Win / lose

### Q: What is the win condition for a daily Thread?
- [x] A) Reaching and naming the theme, however many hints were spent
- [x] B) Solving every link clean with the theme found
- [ ] C) There is no "lose" — every session completes; quality varies by tier
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Is there a fail state that ends the round early?
- [ ] A) No — a fully-missed chain still reaches the final stitch and reveal
- [x] B) Too many misses (e.g. 3 unraveled links) ends it before the theme
- [x] C) A per-round budget of reveals; running out ends the weave
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The v4 "completion ceremony" — how big should the tapestry reveal be?
- [x] A) Cinematic: loom falls silent, threads tighten, tapestry unfolds to show a hidden crest/imagery
- [ ] B) Restrained: gold corner ornaments frame the theme + share grid (close to today)
- [ ] C) Reveal scales with performance — full weave only on a clean run
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What hidden imagery does the finished tapestry reveal (v4: "a forgotten family crest appears")?
- [x] A) A rotating Parlor-lore crest / insignia tied to that day's theme
- [x] B) An embroidered picture literally depicting the day's master theme
- [x] C) A fragment of a larger picture that completes across many days
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What is the end-of-round resting state after the reveal?
- [x] A) The finished tapestry hangs, then gently fades toward "tomorrow's puzzle"
- [x] B) Stays on screen with the share card and a Threads-of-History card
- [ ] C) Returns to the loom room showing the archived weave among past days
- [ ] Other: __________________________________________
> USER NOTES:

---

## 5. Round / turn flow

### Q: How does the player move between links after solving one?
- [x] A) Auto-advance — the thread weaves down to the next knot and focuses the input
- [x] B) A beat of animation (needle stitch), then advance on its own (current-ish)
- [ ] C) Player taps "next stitch" to advance deliberately
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How does the closing "final stitch" theme step present itself?
- [x] A) A distinct panel at the foot of the rail with multiple-choice theme buttons (current)
- [x] B) A free-text "name the thread" box instead of choices
- [ ] C) The theme choices weave in as the last knot on the same rail
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Daily vs freeplay — what's the retry / replay policy?
- [x] A) One daily weave, no retries; freeplay archive for extra chains
- [ ] B) Daily locked, but you may re-view the solved tapestry any time
- [ ] C) Daily plus an endless "keep weaving" mode drawing fresh chains
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should there be any time pressure in the pacing?
- [x] A) None — the thread "should never move quickly"; take all the time you want
- [x] B) A soft elapsed timer shown but never punishing
- [ ] C) Optional speed mode for streak-chasers
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How do the v4 "Threads of History" fact cards fit the flow?
- [ ] A) One card offered after completion, drawn from weaving/espionage/Fates lore
- [ ] B) A small card unlocks per solved link, collectible over time
- [x] C) Skip them — keep the loop tight
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The v4 idea that streaks "gradually restore the weaving room" — how persistent should that be?
- [ ] A) Room visibly heals over daily streaks (furniture, tapestries, richer textiles)
- [ ] B) A single unlockable milestone at a streak threshold
- [x] C) No persistence — every day is a fresh identical room
- [ ] Other: __________________________________________
> USER NOTES:

---

## 6. Difficulty

### Q: What primarily makes a given day's Thread harder?
- [x] A) Obscurity of the link answers themselves (trivia depth)
- [x] B) How tightly the letter-chain constrains (rare passing letters like Q/X)
- [x] C) How hidden the master theme is behind the individual links
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Should difficulty scale across the week, or stay flat?
- [ ] A) Flat — every daily is roughly the same challenge
- [x] B) Ramps Mon→Sun (Wordle-style) toward a hard weekend weave
- [ ] C) Varies by theme, not a fixed curve
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Does difficulty change *within* a single chain?
- [ ] A) Flat across the 5 links
- [x] B) Escalates — later stitches are the toughest, the theme lands hardest
- [x] C) Easiest first (a gentle on-ramp), spikes in the middle
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Which difficulty knob should the player themselves control, if any?
- [x] A) None — the daily is the daily, one fixed challenge for everyone
- [ ] B) Optional "hard mode" that hides the letter tell and shortens retries
- [ ] C) A category filter in freeplay to lean into strengths
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How long should the chain be (today ~5 links + a theme)?
- [x] A) Keep ~5 links — a tight daily
- [x] B) 6–8 links for a meatier weave
- [x] C) Variable per day (3 short, up to 8 on hard days)
- [ ] Other: __________________________________________
> USER NOTES:

---

## 7. Visual / UX / theme

### Q: The background loom (v4 centerpiece) — how alive should it be?
- [x] A) Continuously weaving in the background: wood creaks, pulleys shift, thread tightens on each solve
- [ ] B) Mostly still, animating only when a link resolves or the tapestry completes
- [ ] C) A static painted loom backdrop — atmosphere without motion cost
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Which palette leads this room's skin (v4 lists walnut / burgundy / antique gold)?
- [x] A) Dark walnut + velvet black ground with radiant gold-thread accent (current gold wash direction)
- [ ] B) Warmer burgundy + aged brass, candlelit
- [ ] C) Cooler charcoal linen + ivory stitching, gold used sparingly
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the golden thread connecting the knots behave (today: measured SVG woven through centers)?
- [ ] A) A single continuous warp thread, colored segments weaving in as links resolve (current)
- [x] B) The thread visibly "stitches" with a traveling needle on each solve
- [x] C) Branching gold threads that preview the connection to the next answer
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What material language do the panels and buttons take on?
- [x] A) Layered fabric panels, embroidered borders, brass sewing buttons, thread-wrapped edges
- [ ] B) Keep today's clean rounded surfaces, add only subtle stitched accents
- [x] C) Aged parchment / journal surfaces with ink and wax
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The correct-answer feedback moment — how should a stitch land?
- [x] A) Gold thread rapidly stitches into place, embroidery blooms, soft gold particles, candlelight brightens
- [ ] B) A single clean needle stitch + the knot lighting up (restrained)
- [ ] C) Keep today's sfxCorrect + color change, minimal added motion
- [ ] Other: __________________________________________
> USER NOTES:

### Q: The wrong-answer feedback — how should resistance read?
- [x] A) Thread tangles/knots briefly, fabric wrinkles, gold dims, candle flickers — "nothing breaks, the fabric resists"
- [ ] B) Keep today's input shake + wrong sfx only
- [x] C) The knot visibly frays and the answer thread greys out
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How much of the v4 environmental storytelling (letters, mirrors, crests, hidden ink) belongs in-frame?
- [x] A) Rich — background room details reward observation and evolve over weeks
- [ ] B) A few tasteful props behind the loom, non-interactive
- [ ] C) Keep the focus on the rail; save lore for the completion reveal only
- [ ] Other: __________________________________________
> USER NOTES:

### Q: How should the hint scaffold (filled first/last letter + blanks) be styled?
- [x] A) As embroidered slots — filled letters in gold thread, blanks as empty stitch-holes (current gold direction)
- [x] B) As a row of loom pegs, letters seated on the warp
- [ ] C) Plain monospace slots, no textile styling
- [ ] Other: __________________________________________
> USER NOTES:

---

## 8. Edge cases

### Q: With reduced-motion on, what happens to the loom + weaving animations?
- [x] A) Loom goes fully static; thread segments appear instantly, no needle motion (respect current `useReducedMotion` gating)
- [x] B) Keep gentle opacity fades only, drop all movement/parallax
- [x] C) A single non-animated "woven" end-state, no transitions at all
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Offline / no-forge state — today it falls back to a generic chain or shows "the thread is not yet spun." Which?
- [ ] A) Always assemble a fallback chain from the seed bank so the room is never empty (current fallbackThread)
- [x] B) Show the empty "not yet spun" state honestly when no real thread exists
- [ ] C) Fallback chain, but clearly marked as a practice weave, not the daily
- [ ] Other: __________________________________________
> USER NOTES:

### Q: If the device can't run the fancier loom rendering (low-power / no GPU), what degrades?
- [x] A) Drop the animated loom to a static backdrop; keep the SVG thread rail fully working
- [x] B) Keep everything but lower particle/shader detail
- [x] C) Fall back to a plain vertical list of knots with no loom at all
- [ ] Other: __________________________________________
> USER NOTES:

### Q: Weird inputs (empty, whitespace, emoji, very long) in the "name this stitch" box?
- [x] A) Ignore blank/whitespace (button already disabled), trim the rest, never crash
- [x] B) Also cap length and strip non-letters before matching
- [x] C) Accept anything; matching leniency handles it
- [ ] Other: __________________________________________
> USER NOTES: Identify possible loopholes that a user may discover and close these so there is no more cheating. ultrathink.

### Q: If the clipboard is unavailable when sharing, what should the player get?
- [ ] A) Silent no-op — the share grid is already on screen to copy by hand (current)
- [x] B) A "select to copy" fallback highlighting the grid text
- [x] C) A small toast explaining copy failed
- [ ] Other: __________________________________________
> USER NOTES:

### Q: A chain whose links don't actually pass letters cleanly (data imperfection) — how should the UI behave?
- [x] A) Suppress the "begins with X" tell for that link, weave on silently (current guard)
- [ ] B) Still show the tell but mark it as approximate
- [ ] C) Treat it as a data error and prefer the fallback chain
- [ ] Other: __________________________________________
> USER NOTES:

### Q: What should the room do if the audio ambient bed can't start (autoplay blocked)?
- [x] A) Stay fully playable in silence; ambient starts on first interaction if allowed
- [ ] B) Show a small "tap for sound" affordance
- [x] C) No audio at all unless the player opts in
- [ ] Other: __________________________________________
> USER NOTES:
