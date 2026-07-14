# Decision — The Game Glow-Up Playbook (reusable template)

Date: 2026-07-13 · Status: adopted · Scope: the next ~11 game rooms

This is the reusable-template deliverable (spec E6), synthesized from what the
Séance glow-up cycle **actually shipped** (units e2/e3/e4/e5, see their landed
notes). It exists so the next game repeats this cheaply — target **~60% reuse**
of the intake/authoring machinery, re-authoring only the per-game specifics.

---

## 1. Reuse instructions — spinning up the next game's intake

The intake system is two reusable files + one throwaway-per-game file:

| File | Reuse | Role |
|---|---|---|
| `docs/planning/design-intake/AUTHORING.md` | **verbatim** | game-agnostic authoring contract: question format, doctrine, Floors, sources |
| `docs/planning/design-intake/_core.md` | **verbatim** (see §5 caveat) | the CORE MCQ questionnaire — settings/motion/audio/mobile/delivery/persistence questions that apply to ANY room |
| `docs/planning/design-intake/<game>.md` | **authored fresh** | the per-game doc — only the room-specific presentation/feedback/pacing questions |

**Reuse-% basis:** CORE (`_core.md`, ~2452 lines) + AUTHORING.md (~88 lines) are
reused verbatim; the per-game doc (`seance.md` was ~2343 lines) is the authored
delta. The *machinery* (format, doctrine, Floors, hub questions, the whole
game-agnostic CORE) carries over untouched — so the marginal authoring cost of
game N+1 is dominated by its own per-game doc, and the fixed CORE/contract cost
(~half the total intake surface) is paid once. That is the ~60% claim.

**The pattern that makes it cheap (from AUTHORING.md, proven this cycle):**

1. **Pre-filled recommended `[x]` picks ARE the assumed spec.** Every MCQ ships
   already answered with a defensible, doctrine-tied pick + a `> WHY:` line. The
   picks are not placeholders — they are the design decisions the implementation
   briefs build against.
2. **The blocker gate.** The authored intake is the human BLOCKER
   (`blockers.md`). Gated build units MUST NOT dispatch until the user ticks the
   box (`verify: user-attested` — trust the tick, no probe).
3. **Accept = zero re-brief; override = re-brief one unit.** User accepts all
   picks → gated units run with no re-brief. Each override (via the `USER NOTES:`
   line) re-briefs ONLY the affected unit. This cycle the user exercised exactly
   that: post-authoring checkbox toggles in `_core.md` (motion decoration, XL
   text step, richer material glints) are user overrides landing on the picks —
   the intended review loop, not a re-author.

To start game N+1: copy `AUTHORING.md` + `_core.md` intent verbatim, write only
`docs/planning/design-intake/<game>.md`, then tick the blocker.

---

## 2. Unit seams — the decomposition that worked

The cycle split into 6 units across 4 waves (`depmap.md`). The ordering was the
load-bearing decision:

- **E0 foundation first (wave 1, ungated).** Settings/theme/sound-toggle
  infrastructure (`lib/settings.ts`, `SettingsHub.tsx`, `RoomShell.tsx`) lands
  before any content unit, because every downstream unit consumes its contracts:
  `useReducedMotion` (calm OR OS), `useQuality`, text-scale/contrast tokens. e2,
  e3, e4 all wired to these — a content-first order would have re-touched each.
- **Audio-infra before audio-content.** The shared master bus (`lib/sound.ts`,
  wave-2 `e4-audio-infra`) lands before the per-room cue map + wiring (wave-3
  `e4-audio-content`). Content routes every cue through the pre-existing bus
  (`playSfx`/`audio.event`/`audio.stinger`) — **no fork, no per-room mixer, no
  CDN**. Building the bus first made the content unit a pure additive cue map.
- **Visual before tutorial.** e2 (visual skin) lands before e3 (tutorial demo)
  so the tutorial reuses the shipped skin verbatim (brass-on-walnut, spectral
  violet, `data-skin="seance"`, the real `Planchette` motif at demo scale)
  instead of inventing a look. The tutorial `decided:` explicitly matched e2's
  brass-on-walnut + `.spiritName` display treatment — only possible because
  visual shipped first.

### The hot-file rule (most important seam)

`SeanceGame.tsx` is the **hot file** — both e2 (visual) and e4-audio-content
(cue wiring) must edit it. They were sequenced into **separate waves**, never
parallel: e2 in wave 2, then e4-audio-content branches off the *updated*
integration that already contains e2's version, and adds **cue calls only, no
visual change**. e2 pre-published the exact event sites in its `gotchas:` (bind =
`cycle()` nv===2; strike = submit fail; snuff = `cycle()` nv===1; ceremony =
Banished mount) so e4 wired blind-safely. **Rule for next game: any file two
units must both touch → split across waves, upstream publishes the hook sites in
its `.done.md`.**

Corollary — new files go in a fresh subdir to prove disjointness: e3's demo
lives under `components/tutorial/*` (a NEW subdir), NOT `components/` root or
`components/seance/`, so its created-file dir-prefix cannot collide with the hot
file. Mobile was *folded into* the visual unit (e2), not split out — one
responsive pass over the same `.tsx`/`.module.css` is correct craft, not two
units fighting over one file.

---

## 3. Cost / process footer — this cycle's shape

- **Waves:** W1 `e0` + `e5-delivery` (ungated, foundation/independent) → W2
  `e4-audio-infra` + `e2` → W3 `e3-tutorial` + `e4-audio-content` → W4 `e6`
  (this doc).
- **What gated on the intake (E1 blocker):** `e2`, `e3`, `e4-audio-content` —
  the presentation/feedback/audio-content units whose spec is the intake picks.
- **What was answer-independent (ungated, ran regardless of the tick):** `e0`
  (foundation contracts), `e5-delivery` (config-only Vercel-meter reductions),
  `e4-audio-infra` (the shared bus), `e6` (this synthesis). Half the units never
  needed the human tick — front-load those so the cycle keeps moving while the
  user reviews.
- **Integration model:** local-branch-merge, per-wave incremental ff to `main`;
  every unit branches `feat/<unit>` off the current `integration`; `PR: null`;
  no AI attribution. DoD per unit: `cd frontend && npm run build && npm run test
  && npm run lint` green, **zero-env**.
- **Verification reality:** headless playwright/lighthouse `/ui-qa` is NOT
  runnable in the worktrees — units verified via `npm run build`/`test`/`lint` +
  `design/validate.sh` + SSR `curl` smoke, and flagged "recommend a browser QA
  pass at land." Budget a manual browser QA at land; don't claim pixel/perf green
  from CI alone. **Each worktree shares git objects but NOT `node_modules` — every
  unit ran `npm ci` before its first DoD run** (skip it → whole suite red at import).

---

## 4. Gotchas — concrete traps (honor these picks)

Structural Floors that every pick must respect (AUTHORING.md §Floors):

- **Skins change only non-Floor `--skin-*` seams** via `app/skins.css` +
  `applySkin(...)`. e2 repainted via scoped `--c-*`/`--cat-*` token overrides
  (module.css consumes tokens unchanged) rather than rewriting the module — the
  lowest-diff route, AA held both themes. No JS-runtime theming layer.
- **≤1 infinite/looping animation per viewport**; everything else finite ≤600ms.
  e2's ambient sim is the one loop and is `useReducedMotion`/`useQuality`-gated
  (off=flat, reduced=static+no planchette loop, full=drift loop). e3's demo
  **plays once** (≤600ms/beat chain, no infinite loop) + Replay.
- **Committed-audio only** — no CDN, no runtime fetch. e4 committed small CC0
  one-shots to `public/audio/seance/*`; the ambient bed is a **procedural drone
  (ambientRoot), no committed bed asset**, auto-upgrading to an mp3 only if one
  is ever added. Cues fall back to synth if a file is absent — silent-safe.
- **Zero-env build stays green.** The seed-bank / no-network / no-JS /
  reduced-motion frame renders complete on its own; effects are garnish. Every
  unit's DoD proved zero-env.
- **Frozen logic.** Séance puzzle LOGIC (`lib/seance.ts` deduction) is frozen —
  intake questions are presentation/feedback/pacing/audio/settings/mobile ONLY,
  never a rule change. Each new game must state its own frozen-logic boundary in
  its per-game doc so intake never proposes a rules change.

Room-craft traps observed this cycle (carry the discipline, not the specifics):

- **Audio authority:** cues fire ONLY through the master gate (`playSfx`/`audio.*`);
  global mute OR volume 0 → silence; no audio before first user gesture (lazy
  audio-context). Discrete SFX are **mute-only**; only the ambient bed is
  reduced-motion-gated (feedback must survive reduced-motion).
- **Signature-sound restraint:** the planchette sound fires on hint-glide only
  (deliberate), not idle drift/per-lean; layered cues (bind+cascade) kept quiet —
  Apple-fy restraint, elegant over campy.
- **Theme-flip labels:** e2's Submit label uses `rgb(var(--c-bg))` so it reads on
  the gold plate in BOTH themes — watch gilt/gradient AA-large on light theme in
  browser QA (the one residual AA risk flagged).

### Known follow-ups the next cycle must not re-discover

- **Tutorial WIRING GAP:** the animated `<SeanceTutorialDemo/>` is mount-ready
  but NOT yet rendered — it needs a ~2-line additive edit in
  `components/TutorialOverlay.tsx` (a shared-root file e3 could not touch without
  breaking wave-3 disjointness). The steps *content* upgrade is live; the clip
  needs one follow-up line by the framework owner. **Lesson:** when a new
  component must mount in a shared-root file, plan the mount edit as an explicit
  E0/framework-owner task, not inside the leaf unit.
- **Delivery — puzzle rooms were dynamic, now static (SHIPPED):**
  `seance/ladder/map/clock/streak` were `?date=`-driven → a function+CPU per
  pageview (the biggest remaining meter driver). e5 did config-only safe
  reductions and RECOMMENDED the route fix; it shipped as its own follow-up unit
  once the visual units landed: the date moved from `?date=` to an
  `app/{room}/[[...date]]/page.tsx` segment with `revalidate=86400` +
  `generateStaticParams`, flipping all five **ƒ → ● SSG/ISR**. Safe because
  build-time inline generation is byte-identical to the DB archive row (same pure
  `generate<Room>` the nightly archiver calls) — no static-vs-runtime flip.
  **Lesson:** route-surgery that collides with leaf-unit ownership sequences
  *after* those units land, as its own unit — not folded into a config pass.

---

## 5. CORE game-agnostic status — a flag, not a pass

The DoD requires `_core.md` to be game-agnostic. Verified by grep for
`seance|ouija|planchette` (`grep -icE` on `_core.md`):

- **Result: 4 matches (NOT zero) — this is a FLAG per the DoD gate.**
- **Characterization (honest):** the CORE *structure* is game-agnostic — every
  question applies to any room. The 4 hits are: **3 shipped code-symbol
  references** (`cachedSeance` ×2 + `generateSeance` — legitimately reusable API
  citations) and **1 illustrative mention** (`planchette` cited as an example of
  a gesture-driven leave). None are game-LOCKED design decisions; the
  questions/picks themselves are portable.
- **Action for the next game:** either (a) treat the Séance mentions as examples
  and read past them, or (b) do a light scrub pass replacing the running example
  before copying CORE verbatim. Recommended: a one-time scrub so "reuse CORE
  verbatim" is literally true and CORE reads game-neutral. Flagging here rather
  than silently passing the gate.

---

## Referenced (all resolve at authoring — `test -f`'d)

`docs/planning/design-intake/AUTHORING.md` · `docs/planning/design-intake/_core.md`
· `docs/planning/design-intake/seance.md` · `frontend/components/SeanceGame.tsx`
· `frontend/components/SeanceGame.module.css` · `frontend/app/skins.css`
· `frontend/components/tutorial/SeanceTutorialDemo.tsx`
· `frontend/lib/tutorials/seance.ts` · `frontend/lib/sound/seanceCues.ts`
· `frontend/lib/sound.ts` · `frontend/lib/settings.ts`
· `frontend/components/SettingsHub.tsx` · `frontend/public/audio/seance/`
· `frontend/next.config.mjs` · `docs/design/2026-07-13-delivery-optimization.md`
· `docs/v4/08_seance.txt` · `design/INDEX.md` · `.orchestrator/depmap.md`
