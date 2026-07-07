# PARLOR v3 — Games

Per-game deep-dive scope. Every keeper game gets the same three-part mandate;
this doc records the *specific* improvement for each. Detail the chosen mechanic
change in a `brainstorming` session before building if it touches play rules.

## The three-part mandate (every game segment)

1. **Gameplay deep-dive** — one concrete play improvement (named per game below).
   Brainstorm first if it changes rules.
2. **Desktop one-screen fit** — everything needed to play is visible at once on a
   1280×800 and 1920×1080 viewport, no scroll-to-play. Verify with
   `chrome-devtools resize_page`. Mobile keeps its existing responsive behavior.
3. **Social hook** — emit a `GameResult` to `lib/share.ts` (built in 3.0): a
   Wordle-style emoji grid + an `@vercel/og` share card. No DB, no account.

Shared-file edits are forbidden in game segments (see ROADMAP firewall). New
styles go in a per-game `*.module.css`.

---

## §3.1 — Board (Codex)
- **Owns:** `BoardGame.tsx` (+ `BoardGame.module.css`).
- **Gameplay:** daily-double wagering, a running score readout, full keyboard
  navigation of the 5×5 grid.
- **One-screen:** 5×5 value grid + selected clue + score all visible; the clue
  opens in-place (overlay sized to the board), never pushing content off-screen.
- **Social:** share which clues hit/missed (colored grid) + final score.

## §3.2 — Clock (Chronos)
- **Owns:** `ClockGame.tsx`.
- **Gameplay:** proximity-streak bonus (consecutive close guesses compound);
  harder daily calendar twists (Mayan/etc.).
- **One-screen:** clock face + year slider + per-round feedback, no scroll.
- **Social:** a 5-round proximity line (how close each guess was).

## §3.3 — Wedges (Fractures)
- **Owns:** `WedgesGame.tsx`.
- **Gameplay:** speed bonus; clearer per-category lockout feedback.
- **One-screen:** six-wedge ring + active question + timer together.
- **Social:** the filled-ring emoji (which wedges earned).

## §3.4 — Streak (Ignite)
- **Owns:** `StreakGame.tsx`.
- **Gameplay:** more categories; a clean accelerating timer.
- **One-screen:** the two comparison cards + flame, no scroll.
- **HARD CONSTRAINT:** flame/darkness effects never reduce question/answer
  legibility; reduced-motion freezes the flame.
- **Social:** the streak length reached.

## §3.5 — Map (Atlas Obscura)
- **Owns:** `MapGame.tsx`, `WorldMap.tsx`.
- **Gameplay:** clearer per-round km scoring; daily ancient-civilization rotation.
- **One-screen:** map + result distance readout; offline only (no tile servers).
- **Social:** the per-round distance line (km bars).

## §3.6 — Thread
- **Owns:** `ThreadGame.tsx`.
- **Gameplay:** a hint that costs; clearer chain visualization + per-link reveals.
- **One-screen:** chain + input + reveals.
- **Social:** the solved-% of the chain.

## §3.7 — Séance  *(data depends on 3.11)*
- **Owns:** `SeanceGame.tsx`.
- **Gameplay:** tune difficulty; fit the logic-puzzle board on one desktop screen.
- **Note:** server-generated, Neon-archived, **no seed fallback** — develop
  against an archived/sample puzzle; full END STATE verifies once 3.11's transform
  fix restores live data.
- **Social:** solve time / grid.

## §3.8 — Ladder (The Climb of the Initiate)  *(data depends on 3.11)*
- **Owns:** `LadderGame.tsx`.
- **Gameplay:** sharpen the math/logic constraint solving; fit one screen.
- **Note:** same data dependency as Séance.
- **Social:** the solved result.

## §3.9 — Mystery (Sanctum Mysterii) — crown jewel
- **Owns:** the `Mystery*.tsx` cluster (`MysteryGame`, `MysteryIntro`,
  `MysteryInvestigate`, `MysteryAccusationForm`, `MysteryVerdict`,
  `MysteryStatusPill`) + `Mystery.module.css`.
- **Gameplay:** harder logic, weaker hints; collapse the flow so the *active*
  step fits one desktop screen (no panel sprawl). Keep the daily case solvable
  (vitest).
- **Social:** the verdict — solved/failed + number of deductions used.

## §3.10 — Gauntlet
- **Owns:** `GauntletGame.tsx`.
- **Gameplay:** hint-time penalties; clearer stage transitions in the speed run.
- **One-screen:** each stage fits one screen.
- **Social:** the teased Wordle-style **line of squares** is the canonical share
  artifact — build it here against `lib/share.ts`.

---

# New rooms (registered in 3.0, built in Wave D)

## §3.22 — Audio room ("Name the Intro")
- **Owns:** `app/<audio-room>/page.tsx`, `AudioRoomGame.tsx`, `AudioRoom.module.css`
  (all new; route + qtype registered in 3.0).
- **Concept:** play a Deezer 30s preview, name the track/artist. Absorbs the
  retired Jukebox's audio mechanic. Keyless (previews already ingested).
- **Mandate:** one-screen + shareable like any game.
- **Brainstorm first** — exact scoring/rounds are open.

## §3.23 — Hard-mode weekly Mystery (REMOVED — wishlist #12, F5)
- **Status:** the Cold Case room was fully removed. Route `/cold-case`,
  `WeeklyCaseGame.tsx`, `WeeklyCase.module.css`, and `lib/weeklyCase.ts` no
  longer exist. This segment is retired; retained here for history only.
