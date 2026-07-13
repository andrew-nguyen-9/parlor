# Animation research — how to add motion in PARLOR

Status: **research only**. No component was touched to produce this doc. Claude-authored
animation tends to read as generic/slop when hand-implemented ad hoc (per user); this is the
reference future cycles should design *from*, not a spec to copy-paste. Written against the
current design contract (`design/INDEX.md` §Floors, `design/PATTERNS.md` §Motion,
`design/FOUNDATIONS.md` §3D/Stage) and the shipped code that already implements it.

## 1. The non-negotiable floor (today, every game)

From `design/INDEX.md` §Floors and `design/PATTERNS.md` §Motion — these hold regardless of
which technique you pick, and regardless of the per-game motion freedom below:

- **≤1 infinite/looping animation per viewport** — the room's one diegetic signature (flame,
  pendulum, eye-glow, gear-train). Everything else is finite, ≤600ms.
- **Every named animation has a reduced-motion variant.** Not a pause — a *designed static
  frame* (lusion rule: design the still state first, then animate on top of it).
- **One light source.** `--gold-sheet` is the one viewport-fixed cursor light; Streak's candle
  glow is the one sanctioned diegetic second. New cursor-reactive effects join the existing
  light, they don't add one.
- **Perf floor**: animate only `transform` / `opacity` / `filter`. No new `backdrop-filter`
  beyond the deck zoom, no full-viewport blur >120px.
- **Motion is diegetic or feedback, never decoration for its own sake.** If it isn't telling
  the player something happened (feedback) or isn't part of the room's fiction (diegetic —
  flame flickers because it's a candle), cut it.
- **Legibility overrides every effect.** Q&A text is never inside a gilt/gradient/flame
  treatment, full stop.
- **Two easing curves only**: entrances `cubic-bezier(0.22,1,0.36,1)`, flips
  `cubic-bezier(0.2,0.8,0.2,1)`. Durations: micro/press 100–150ms, transition 200–350ms,
  spatial (deal/flip/zoom) 300–500ms.
- **CSP/offline**: PARLOR ships zero-env, zero-network by default (seed-bank fallback is the
  design, not a degraded mode). No animation technique may depend on a CDN, a hosted asset
  fetch, or a third-party script tag at runtime. `frontend/next.config.mjs` has no
  `Content-Security-Policy` header defined today, but the project convention is CSP-safe by
  construction anyway: every dependency is an npm package bundled by the Next build
  (`framer-motion`, `three`, `phaser` are already in `frontend/package.json` — no `<script
  src="https://cdn...">`, no runtime-fetched Lottie JSON from a hosted CDN, no Google
  Fonts `<link>` — fonts go through `next/font`). Treat "no CDN" as load-bearing: it is what
  keeps the reduced-motion / no-JS / seed-bank render "complete on its own."

## 2. Per-game motion freedom (E0)

E0 (this cycle) converts the design North Star from a global lock into a **skins + floor**
model: a game may declare its own palette/materials/layout/motion/type/bg via a documented
per-route theme mechanism, *without* editing globals — but the floor in §1 above is still
enforced everywhere (`design/validate.sh` gates it). Practically, once E0 lands:

- A room can pick its **own** signature loop, easing personality, and motion density inside
  the ≤1-loop / ≤600ms-finite / reduced-motion-variant budget — it cannot opt out of the
  budget itself.
- Per-game freedom is about *character* (what the flame looks like, how the deal-in moves),
  not about *quantity* or *safety*. A game that wants two looping ambient effects still has to
  pick one, or make the second reduced-motion-safe and prove it's feedback, not decoration.
- Until E0's theme mechanism lands, treat this section as forward-looking: don't hand-implement
  a per-game motion system speculatively (out of scope for this doc — research only).

## 3. Technique matrix

| Technique | Best for | Reduced-motion story | CSP/offline story | Perf notes |
|---|---|---|---|---|
| **CSS `@keyframes` / transitions** | Ambient loops (flame flicker, pendulum swing, glow pulse), simple state transitions, anything that doesn't need JS to compute | Cheapest: one `@media (prefers-reduced-motion: reduce)` block, kill by class name (see §4) | Fully offline, zero deps, ships in the CSS bundle | Cheapest possible; GPU-composited if scoped to `transform`/`opacity`/`filter` |
| **Framer Motion** (installed, `^11.18.2`) | Orchestrated entrances/exits (`AnimatePresence`), gesture-driven interaction (drag, hover, press), staggered lists, layout animation (`layout` prop), spring feel | Built-in `useReducedMotion()` hook — already the house pattern (see §4) | Pure npm package, bundled by Next, zero network at runtime | Watch bundle size on routes that don't need it (it's already a shared dep so marginal cost is low); prefer `transform`/`opacity` variants over `layout` animation on large lists |
| **canvas / `requestAnimationFrame`** (raw, or via Three.js / Phaser, both installed) | Particle fields, WebGL scenes (Chronos gears, Atlas starfield), game-render layers (Ignite's Phaser canvas) where DOM nodes-per-particle would be too many | Must be hand-coded: skip the RAF loop entirely under reduced-motion and render one static frame — see `ThreeStage.tsx` and `atmosphere/ParticleField.tsx` for the shipped pattern | Fully offline once the JS bundle loads — no textures/fonts pulled from a CDN; guard renderer creation (try/catch), degrade to DOM/static on WebGL failure (a floor, not optional) | DPR capped ≤2, ONE shared RAF loop per stage (not one per effect), full dispose on unmount (geometry/material/texture/renderer) |

Rule of thumb for picking:

1. **Is it the room's one signature loop, and is it just visual (no interactivity/physics)?**
   → CSS `@keyframes`. Cheapest, no JS needed, trivially reduced-motion-safe.
2. **Does it involve React state, sequencing, gestures, or entrance/exit choreography?**
   → Framer Motion. It's already the house library; `useReducedMotion()` is already wired in
   half the rooms (Board, Wedges, Séance, Thread, Map).
3. **Is it dozens+ of independently-moving primitives, or a WebGL scene?**
   → canvas/RAF via Three.js (`ThreeStage`) or Phaser (Streak's pattern), or raw canvas for
   simpler particle work (`atmosphere/ParticleField.tsx`). Never hundreds of DOM nodes for a
   particle effect — that's a canvas job.

## 4. Reduced-motion recipes (copy the shipped pattern, don't reinvent)

**Framer Motion** — call the hook, branch the animate props (shipped in `MapGame.tsx`,
`WedgesGame.tsx`, `SeanceGame.tsx`, `ThreadGame.tsx`, `BoardGame.tsx`):

```tsx
import { motion, useReducedMotion } from "framer-motion";

const reduced = useReducedMotion();
<motion.div
  initial={reduced ? false : { opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
/>;
```

**CSS** — a named kill-list in `globals.css`, `!important` so component-level overrides can't
resurrect it, plus a universal duration/iteration clamp as a belt-and-suspenders catch-all
(this is the actual shipped block, `frontend/app/globals.css`):

```css
@media (prefers-reduced-motion: reduce) {
  .streak-flame { animation: none !important; opacity: 0.7 !important; } /* designed still state, not just "off" */
  .glow, .animate-marquee, .animate-flicker, .page-enter, .clock-pendulum, .eye-glow {
    animation: none !important;
  }
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important; /* prevents an infinite 0.01ms loop from spinning the CPU */
    scroll-behavior: auto !important;
  }
}
```

Add every new named animation to the kill-list block, and design what it freezes *to* — the
Streak flame doesn't disappear, it holds at mid-brightness (a considered still frame, not a
missing piece).

**canvas/RAF** — check the media query once, skip the loop entirely, render one frame
(`ThreeStage.tsx` and `atmosphere/useReducedMotion.ts` are the shipped versions):

```tsx
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  renderOnce(scene, camera, renderer); // one static, composed frame — not a random freeze mid-loop
  return; // no requestAnimationFrame at all
}
let raf = requestAnimationFrame(tick);
// ...cleanup: cancelAnimationFrame(raf) + dispose geometries/materials/textures/renderer on unmount
```

For React-driven RAF hooks, use the shared `atmosphere/useReducedMotion.ts` SSR-safe hook
(starts `false` to match the server render, flips on mount, tracks live OS changes) rather than
a fresh `matchMedia` read per component.

## 5. Ambient-loop budget in practice

Each room already has exactly one designated loop (`design/PATTERNS.md` §Room signatures):
Séance's `animate-flicker` candle, Board's `flip-scene`, Clock's gear-train (Three.js,
kinematic), Streak's Phaser flame+camera-shake, Map's starfield drift, etc. Before adding any
new looping effect:

1. Is there already a loop on this route? If yes, the new effect must be **finite** (≤600ms,
   triggered by an event) or it doesn't ship — budget is per-viewport, not per-component.
2. Is it diegetic (part of the room's fiction) or pure feedback (a state changed)? If it's
   neither, cut it — this is the single most common way "AI-authored" animation reads as slop:
   motion added because a component looked static, not because it's telling the player
   something.
3. Would a canvas-composited version (opacity/transform driven from outside the loop) be
   cheaper than literally animating on every frame? Prefer CSS `animation` (browser-composited,
   free-running) over a JS RAF tick for anything that doesn't need per-frame logic.

## 6. Cursor / "one light source" in practice

`--gold-sheet` is a single viewport-fixed CSS custom property pair (`--gx`/`--gy`) that every
`.gilt` surface reads from — one `pointermove` listener updates it, every gilt element lights
from the same spot. Streak's candle glow (`--gx`/`--gy` driving a radial-gradient overlay,
`streak-darken` keyframe) is the one sanctioned second light, because it's diegetic (the
player's cursor *is* the candle in the dark). Adding a third cursor-reactive light anywhere is
against the floor — if a new room wants cursor-reactivity, wire it into the existing
`--gx`/`--gy` variables rather than introducing a second listener/second glow. Cursor motion
must stay decoration-layer only (`opacity`/`transform`/`background-position`); it never moves
layout or gates content, and SSR/touch/reduced-motion all resolve to the centered default (no
listener attached at all under `prefers-reduced-motion` or a touch pointer).

## 7. Anti-patterns (what makes Claude-authored motion read as slop)

- **Animating everything on mount.** A page where five elements all fade+slide in
  simultaneously reads as a template, not a design. Stagger deliberately (Framer's
  `staggerChildren`) or animate nothing — don't animate half-heartedly.
- **Bouncy/elastic easing as a default.** PARLOR has exactly two curves (§1). A spring/bounce
  on a card flip reads as a Bootstrap demo, not a Victorian mansion. If a component reaches for
  Framer's default spring physics instead of the two house curves, that's a tell.
  Purposeful and restrained beats "delightful."
- **Motion with no state-change reason.** Idle wiggle, hover jiggle, decorative parallax that
  doesn't track anything — cut it. Every animation in PARLOR is diegetic or feedback (§1);
  "it looked flat" is not a reason.
- **Multiple simultaneous looping effects that all compete.** A glow *and* a shimmer *and* a
  drift on one screen is the #1 way a "haunted mansion" reads as a casino. One loop wins.
- **Skipping the reduced-motion design pass.** Reduced-motion is not "add
  `animation: none` and call it done" — design the still frame the way Streak's flame freezes
  at a *considered* mid-brightness, not a random paused frame.
- **New hex-literal glows / new light sources.** A gradient glow that doesn't route through
  `--gold-sheet`/`--gx`/`--gy` or a category's `--cat-*` token is both an a11y regression risk
  and a "one light source" violation in one line.

## 8. What NOT to reach for (evaluated and rejected for now)

- **GSAP** — best-in-class sequencing, but several of its plugins (ScrollTrigger's premium
  tier historically, MorphSVG, etc.) have licensing wrinkles and its idiomatic setup patterns
  lean on CDN-hosted club plugins in a lot of tutorials/examples. Framer Motion already covers
  PARLOR's orchestration needs (`AnimatePresence`, variants, gestures) without adding a second
  animation library to the bundle. Revisit only if a specific timeline-scrubbing need Framer
  can't do surfaces.
- **Lottie / `lottie-web`** — After Effects JSON exports are typically produced+hosted through
  a cloud pipeline and can be asset-heavy; they also invite "stock motion graphics," which
  fights the bespoke-engraving brand voice (`design/VOICE.md`, `docs/v2/DESIGN_SYSTEM.md`
  poolsuite.net take: "commitment beats fidelity — engraving vectors over textures over
  photos"). Skip unless a specific bespoke, offline-bundled JSON export is hand-authored in the
  house style — not a stock Lottie asset.
- **react-spring** — functionally overlaps Framer Motion; adding it duplicates a physics engine
  already in the bundle for no capability gain. Don't add a second spring library.
- **Any hosted web-font / icon animation CDN** (e.g. animated icon-as-a-service embeds) — direct
  CSP/offline violation; the app must render complete with zero network.

## 9. Worked examples (recipes, not implementations)

**A. New room's one signature loop (CSS)** — e.g. a slow-drifting fog band:

```css
.mansion-fog { animation: fog-drift 18s linear infinite; will-change: transform; }
@keyframes fog-drift { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
```
Add `.mansion-fog` to the `globals.css` reduced-motion kill-list; design its still frame
(probably `transform: translateX(0)`, mid-opacity) rather than just stopping the file.

**B. Deal-in / entrance choreography (Framer Motion)** — a staggered card grid:

```tsx
const reduced = useReducedMotion();
<motion.div
  variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.05 } } }}
  initial="hidden" animate="show"
>
  {cards.map((c) => (
    <motion.div
      key={c.id}
      variants={{
        hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16, rotate: -2 },
        show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      }}
    />
  ))}
</motion.div>;
```

**C. Feedback flash on a correct/wrong answer (Framer Motion + CSS)** — finite, ≤600ms, triple
encoded (color + shape/border + text/glyph — never color alone, an a11y floor, not a motion
one): a border-color transition + a one-shot scale pulse capped at `animation-iteration-count:
1`, no infinite loop, so it's exempt from the ambient budget entirely.

**D. Game-render layer (canvas, e.g. a future particle burst on a milestone)** — follow
`atmosphere/ParticleField.tsx`: seed the field deterministically (no `Math.random()` in a
render path — `lib/rng.ts`), one shared RAF loop, reduced-motion renders the seeded still
composition instead of animating it, full cleanup on unmount.

## 10. Verification checklist for future implementers

- [ ] New animation added to the `globals.css` reduced-motion kill-list (or uses
      `useReducedMotion()`/the RAF-skip pattern) — verify with OS-level reduced-motion toggled.
- [ ] Still ≤1 infinite loop on the viewport after the change (audit the room's existing
      signature loop first).
- [ ] Only `transform`/`opacity`/`filter` animated; no new `backdrop-filter`/blur
      >120px full-viewport blur; new named animations don't add a CDN/offline dependency of
      any kind.
- [ ] No new light source; cursor-reactivity (if any) reads `--gx`/`--gy`, doesn't add a
      second listener.
- [ ] `design/validate.sh` still green; route still renders complete with JS/network disabled
      (seed-bank / offline floor).
- [ ] Route re-run through the `ui-qa` skill (motion + reduced-motion is in its rubric).
