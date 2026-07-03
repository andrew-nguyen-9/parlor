# e2-mystery — Fable Mystery analysis (E2.7 → E2.2/E2.3/E2.5/E2.6)

Sources read: `frontend/lib/mystery.ts`, `lib/mystery.test.ts`, `lib/mysteryScore.ts`,
`components/MysteryIntro.tsx`, `MysteryInvestigate.tsx`, `MysteryAccusationForm.tsx`,
`MysteryVerdict.tsx`, `MysteryStatusPill.tsx`, `Mystery.module.css`.

---

## 1. E2.7 — Workflow critique (weak spots, ranked)

| # | Finding | Severity |
|---|---|---|
| C1 | **Ringleader leak.** `generateCase()` only ever adds suspect→victim relationship edges for culprits (`addRel(ringleader, victim, "rival")`; innocents' edges draw from `suspects` only, victim excluded). The Alibi-step dossier shows "To the victim: …" — so tapping 7 dossiers instantly names the ringleader with **zero clues spent**. WHO puzzle fully bypassable. | critical |
| C2 | **WHERE/WHEN is reading, not deduction.** Clues 1–4 literally state the eliminated rooms/hours; the matrix auto-fills. 4/7 clues carry no inference. (E2.2 fixes.) | high |
| C3 | **Motive is dead weight + leaked.** The opening prose says "The reckoning is {motive}" on screen one; clue 7 re-reveals it; the accusation never asks for it. An entire narrative axis with no gameplay. (E2.3 fixes.) | high |
| C4 | **Clues 5 & 6 are static duplicates.** Both are date-invariant tutorial text explaining the same corroboration rule. Two of seven clue slots wasted every day. | high |
| C5 | **Score not gated on winning.** `mysteryScore.score()` computes `total` independent of `won` — a fast 1-clue LOSS scores ~1000+. Leaderboard/compare nonsense. | high |
| C6 | **tableBonus exploit.** +40 per correct tag, checked only at submit. Player deduces answer, then mechanically tags everyone correctly right before submitting → free +280. Also redundant with the WHO axis itself. | med |
| C7 | **Dead code:** `autoMarkUsed` is hardcoded `false` in `MysteryInvestigate.submit()` (penalty path unreachable); `shareText()` in `mysteryScore.ts` is unused (verdict builds its own via `lib/share`). | med |
| C8 | **Hidden timer.** Time penalizes score (1pt/5s) but no clock is shown during play. Punishing an invisible meter kills the speed-run loop instead of feeding it. | med |
| C9 | **Step 1 ↔ step 2 friction.** WHEN is deduced on the Evidence matrix but applied on the Alibis board — constant step-flipping with no cross-highlight. | med |
| C10 | **Sameness.** Title = date; opening/clue prose fixed templates; only names/rooms/hours vary. Day 3 feels like day 1. (E2.5 fixes.) Also murder hour is always 7/8/9 PM — regulars meta-learn to ignore 6/10 PM columns. | med |
| C11 | Verdict share uses client `new Date()` instead of `mystery.date`; midnight-straddle mislabels the share. | low |
| C12 | 4-state tag pill cycle (blank→potential→prime→cleared) overshoots on miss-tap; no reverse. | low |

**Scoring redesign (competitive speed-scoring):** per-axis partial credit, win-gated feel without all-or-nothing:

```
earned = 350·WHOcorrect + 150·WHERE + 150·WHEN + 150·WEAPON + 200·MOTIVE   (max 1000)
cluePenalty = 60 × (cluesRevealed − 1)        (max 360)
timePenalty = floor(elapsedSeconds / 5)        (cap 300)
total = max(0, earned − cluePenalty − timePenalty)
won   = all five axes correct
```
Drop `tableBonus`, `autoMarkUsed`, `autoMarkPenalty`, dead `shareText()`. Gambling stays fun (skip the motive clue → 1/6 guess for 200 pts vs −60 certain). Visible timer (E2.6 #1) closes the loop.

---

## 2. E2.2 — WHERE/WHEN rebalance (CHOSEN design)

Replace the four read-the-answer elimination clues with **3 inference clues**; WHO tutorial shrinks to 1 (merge old 5+6). Engine fields unchanged except noted.

**WHEN — bracket clues** (2 clues, still emit `eliminatesHours`):
- Clue 1 "Last seen alive": *"{innocent witness} poured the victim a sherry at {HOURS[hourIndex−1]} — whatever happened, happened after."* → `eliminatesHours = [0..hourIndex−1]`.
- Clue 2 "The discovery": *"The body was already cold when {witness} raised the alarm at {HOURS[hourIndex+1]}."* → `eliminatesHours = [hourIndex+1..4]`.
- Requires `hourIndex ∈ 1..3` — **exactly today's constraint**, now diegetically justified (keep it; don't widen).
- Matrix survives unchanged for hours; player reads a bracket, not a list.

**WHERE — the unclaimed-room cross clue** (1 clue, NEW mechanic):
- Generator already guarantees that at the murder hour the 7 suspects' `claimed` rooms cover **exactly the 5 non-scene rooms** (culprits solo + innocent groups fill `nonSceneRoomNames`). So the scene is *the one room nobody claims at the fatal hour* — derivable today, never surfaced.
- Clue 3 "The room nobody names": *"Every guest names a room for the fatal hour — but one door in this house goes unclaimed. No one will admit to the murder room."* `eliminatesRooms: []`.
- WHERE is now solved on the **alibi board** by cross-referencing the pinned hour — genuinely non-obvious, zero new generator work.

**Engine deltas:**
- `deduceScene(c): string` — tally `claimed[hourIndex]`, return the unique unclaimed room.
- `verifySolvable()` — hours leg: union of `eliminatesHours` = all but `hourIndex` (keep matrix check on the hour axis). Rooms leg: replace matrix-confirm with `deduceScene(c) === c.scene` + uniqueness. WHO leg unchanged.
- `deductionMatrix()` → repurpose as an **hour tracker** (room rows no longer eliminated by clues; UI shrinks the grid to a 5-slot hour strip — see E2.6 #3). Keep the function signature; rooms rows simply stay "unknown".
- Tests: update matrix expectations; add `deduceScene` determinism + 200-day sweep; keep the never-name-answer prose test and extend it (see E2.3/E2.5).

---

## 3. E2.3 — Weapon + motive clue trails (CHOSEN design)

**Model:** add to `mystery.ts`:
```ts
export const WEAPONS = [
  { name: "the antique letter opener", tags: ["sharp", "metal"] },
  { name: "the fireplace poker",       tags: ["blunt", "metal"] },
  { name: "the marble bookend",        tags: ["blunt", "stone"] },
  { name: "the cello string",          tags: ["silent", "cord"] },
  { name: "the silk sash",             tags: ["silent", "cord"] },
  { name: "the poisoned absinthe",     tags: ["silent", "poison"] },
] as const;
// MysteryCase gains: weapon: string;
// Clue gains: eliminatesWeapons: number[]; eliminatesMotives: number[];  (default [])
```

**Weapon trail (clues 5+6):** pick `weapon` from seeded rnd. Shuffle the 5 non-answer indices; clue 5 eliminates 3, clue 6 eliminates 2 (same deterministic partition pattern as today's rooms). Prose: if an eliminated set shares a tag, use the tag template (*"No blood was spilled — nothing sharp did this"* / *"no bruising — nothing blunt"* / *"no ligature marks — no cord"*); else generic coroner phrasing naming the struck weapons. UI shows a 6-slot weapon rack that strikes out as clues land (e2-ui).

**Motive trail (clue 7) + C1 leak fix, interlocked:**
- Bijection `KIND_FOR_MOTIVE`: rival→Stolen Credit, debtor→Financial Revenge, old flame→A Jealous Heart, secret-keeper→A Buried Secret, business partner→Inheritance, **new kind "witness"**→Silencing a Witness (add "witness" to `REL_KINDS`).
- Generation: ringleader's victim-tie kind = `KIND_FOR_MOTIVE[motive]` (replaces hardcoded "rival"). Pick 3 motives ≠ true motive as the **eliminated set**; give **2 innocent red herrings** victim ties whose kinds map to 2 of those eliminated motives. Now 3 suspects show victim ties → C1 leak dead.
- Clue 7 text eliminates those 3 motives (*"The will was unsigned — inheritance profited no one; the victim's songs were her own; no debts stood…"* — template per motive). `eliminatesMotives = [those 3]`.
- Deduction: 3 motives survive; only ONE surviving motive's kind appears on any suspect→victim tie → that's the motive, and its holder cross-confirms the ringleader. Two-step inference, unique by construction.
- **Remove motive from the opening prose** (C3 leak).

**Accusation/verdict:** form gains WEAPON + MOTIVE dropdowns (reuse `DropdownSelect`; grid goes `grid-cols-3`→responsive 5). `MysteryAttempt` gains `weaponGuess: string|null`, `motiveGuess: string|null`; scoring per §1. Verdict "the truth" panel gains weapon + already shows motive; `verdictSummary` gains 1–2 lines for the new axes.

**`verifySolvable()` extension:** two new legs — union of `eliminatesWeapons` over all clues = all indices but `weapon`'s; motive leg: exactly one surviving motive has a matching victim-tie kind, and it's `c.motive`. Add both to the 200-day sweep test.

---

## 4. E2.5 — Engine diversity (CHOSEN: prose banks; structure variants → backlog)

**Golden rule:** draw ALL prose randomness from a **second stream** `proseRnd = mulberry32(seedFromDate(date) ^ 0x9e3779b9)` so logic determinism/tests never shift when banks grow.

New file `frontend/lib/mysteryProse.ts` (pure data + pick helpers):
- **Titles** (kills date-title sameness): 12 templates × noun bank (16) — e.g. `"The Affair of the {noun}"`, `"A Death in {noun}"`, `"The {noun} Reckoning"`; nouns: Gilded Hour, Velvet Envelope, Seventh Guest, Cold Sherry… ≈ 192 titles.
- **Openings**: skeleton (3 structural orders) × discovery-line bank (8) × atmosphere-line bank (8) × closing-line bank (6) ≈ 1,150 combos. Must never contain scene/hour/motive/weapon — **extend the existing leak test** to all four.
- **Clue phrasings**: 4 variants per clue type (bracket-alive, bracket-found, unclaimed-room, corroboration, weapon-elim, motive-elim) ≈ 24 templates. Witness clues are **attributed to a seeded innocent suspect** (flavor + cohesion; never a culprit, so attribution is not a tell).
- Rough LOC: ~180 lines of banks + ~40 lines of pick/format.

**Backlog (not this round):** rotate 6-of-10 room pools (touches `ROOM_TINT` indexing); structural variants (alternate days swap the unclaimed-room clue back to classic room-elimination); victim-specific opening riffs off `quirk`.

---

## 5. E2.6 — Dynamic interactive elements (impact × effort)

| # | Idea | Impact | Effort | Verdict |
|---|---|---|---|---|
| 1 | **Live timer + running-score chip** in `caseBar` (score ticks down with time/clues — makes speed competitive and the penalty honest, fixes C8) | H | L | **chosen** |
| 2 | **Hour-column spotlight**: once hours narrow to one (or on tap of an hour header), that column glows across BOTH the tracker and the alibi board (fixes C9; carries the new WHERE mechanic) | H | L | **chosen** |
| 3 | **Matrix → hour-strip tracker** (5 slots, struck as brackets land) — the E2.2 UI counterpart | H | L | **chosen** |
| 4 | **Weapon rack strip** in Evidence step, 6 chips, struck by clues 5/6, tap = select as weapon guess | H | L | **chosen** |
| 5 | **Pencil strikes**: tap any alibi-board room chip to strike it (player notes, localStorage-free, resets on reload) | M | M | **chosen** (e2-ui, cut first if tight) |
| 6 | Tag pill: long-press/right-click cycles backwards (fixes C12) | L | L | **chosen** (one-liner) |
| 7 | Detective notepad (free text, localStorage) | M | L | backlog |
| 8 | Confidence wager slider (×0.5–×2 pre-submit) | M | L | backlog (score-inflation risk) |
| 9 | Draggable suspect string-board (red yarn) | M | H | backlog |

---

## 6. CHOSEN SET — build-unit split (implement verbatim)

### e2-engine (engine + scoring, `lib/*`)
1. `mystery.ts`: WEAPONS + `weapon` on case; `eliminatesWeapons`/`eliminatesMotives` on Clue; bracket WHEN clues; unclaimed-room WHERE clue + `deduceScene()`; merge old clues 5+6 into one; weapon partition clues 5+6; motive-elimination clue 7; `REL_KINDS` + "witness"; `KIND_FOR_MOTIVE` bijection; ringleader tie = motive kind; 2 red-herring victim ties (C1); motive out of opening (C3); `verifySolvable()` 5-leg (WHO/WHERE/WHEN/WEAPON/MOTIVE).
2. `mysteryProse.ts`: banks per §4, second rng stream, wire into `generateCase`.
3. `mysteryScore.ts`: per-axis scoring per §1; `weaponGuess`/`motiveGuess` on attempt; delete `tableBonus`/`autoMark*`/dead `shareText`.
4. `mystery.test.ts`: update + extend (determinism, 200-day 5-leg solvability, 4-way prose-leak test, `deduceScene` sweep).

### e2-ui (components)
1. `MysteryInvestigate`: hour-strip tracker replaces room×hour matrix; timer+score chip in caseBar; hour-column spotlight (tracker↔alibi board); pencil-strike room chips; weapon rack strip.
2. `MysteryAccusationForm`: + weapon & motive dropdowns; 5-field validity gate.
3. `MysteryVerdict`: weapon row in truth panel; `verdictSummary` lines for weapon/motive; use `mystery.date` not `new Date()` (C11).
4. `MysteryStatusPill`: reverse-cycle on long-press/contextmenu (C12).

**Backlog:** notepad, wager, string-board, room-pool rotation, structural variants, achievements for no-clue solves.

**Gotchas for builders:** prose banks MUST use the second rng or every historical case shifts; the unclaimed-room invariant already holds by construction (don't re-derive); `hourIndex` must stay 1..3 for bracket clues; never let a culprit be a clue's attributed witness; keep séance/mystery determinism + solvability tests green — extend, never weaken.
