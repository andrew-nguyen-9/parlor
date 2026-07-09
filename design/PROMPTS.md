# PROMPTS — paste-ready Claude Design briefs for the heavy custom animation work

Owner: E9. These are the "digital animation" surfaces the user will outsource to
Claude Design (or a motion designer). The app already ships a complete, playable
zero-JS/reduced-motion baseline — everything here is **optional garnish layered on
top**, never a dependency of the seed-bank render (design floor: "the no-network /
no-JS / reduced-motion frame IS the design").

## How to use
Paste one section verbatim as a single design task. Every prompt already carries the
non-negotiable guardrails; keep them. Deliverables land as a colocated `*.module.css`
+ (if interactive) a `"use client"` component — never edit `app/globals.css`
(frozen §3.0) or the design tokens.

## Shared guardrails (repeat in every outsourced task)
- **Tokens only.** Colours come from CSS vars in `design/FOUNDATIONS.md` /
  `globals.css` (`--c-*`, `--cat-*`, `--gold-sheet`). No raw hex/rgb in new CSS.
- **One light source.** All gilt clips the shared `--gold-sheet` with
  `background-attachment: fixed`; no per-element or cursor-driven highlights.
- **≤1 looping animation per viewport.** Everything else is finite ≤600ms.
- **Reduced-motion variant is mandatory** — mirror the kill-list pattern in
  `globals.css @media (prefers-reduced-motion: reduce)`; the still state must be
  a *designed* frame, not a frozen mid-tween.
- **Legibility overrides every effect.** Q&A text ≥1rem, line-height ≥1.5, never
  inside a gilt/gradient/flame treatment. Touch targets ≥44px.
- **No new runtime network** (no CDN/tile/font/API); must build + run zero-env.
- **Mobile-first, portrait, no horizontal scroll** at 320 / 768 / 1440px+.
- **SSR-safe:** no `Math.random()` in render paths — date-seeded `lib/rng.ts`.

---

## 1. Hero / threshold (`app/page.tsx` — "Parlor" title block)
Animate the landing threshold: the flaming-spade seal and the giant gilt "Parlor"
wordmark. Desired feel — a candle catching, the room resolving out of the dark; luxe,
ritual, unhurried. Ideas: a one-shot ignite/reveal on load, a very slow ambient
shimmer on the seal (single looping animation, this is the one). Must not delay LCP
or shift layout. Reduced-motion: the fully-lit static hero.

## 2. Room entrance / page transition (`RoomShell`)
A "velvet curtain" transition when entering a room from the lobby. Today it's a 0.35s
`curtain-in` fade-up (`globals.css .page-enter`). Design a richer per-room entrance
keyed on the room accent (`--cat-*`): the brass doorway rule drawing in, the nameplate
engraving, content settling. One-shot, ≤600ms, no CLS. Reduced-motion: instant, no
transform.

## 3. Correct / incorrect answer juice (cross-room)
A shared, tasteful feedback moment for a right vs wrong answer that each room can
trigger. Right = warm gold bloom + settle; wrong = a brief oxblood shudder. Must read
in ≤500ms, never obscure the Q&A text, respect the category colour. Deliver as a
reusable utility (class + optional tiny hook) rooms opt into — do NOT bake it into
individual game components here.

## 4. THE STREAK — the witch's candle escalation (`/streak`)
The flame + bloom already scale with `--flame` (`globals.css .streak-flame/.streak-bloom`).
Commission the *escalation* choreography: as the streak climbs, the flame grows, embers
rise, the surround darkens toward the `streak-dark` finish. Keep it BEHIND the Q&A layer,
never tinting text. Single looping flame; everything else event-driven. Reduced-motion:
steady mid-brightness (already stubbed).

## 5. THE CLOCK — gear-train seating (`/clock`, via `ThreeStage`)
The 3D gear train renders through `ThreeStage`. Design the *motion language* for seating
a wheel: gears meshing, a satisfying click-into-notch, the whole train turning once when
solved. Kinematic only — **no physics engine** (unique-solve + mobile perf). Must degrade:
`ThreeStage` now renders a DOM fallback when WebGL is absent — the animation is garnish on
the GL path only. DPR≤2, one shared RAF (already provided).

## 6. THE MAP — atlas reveal (`/map`, via `ThreeStage`)
Choreograph the omen/marker reveal on the 3D globe and the "lock in a guess" moment.
Constraint: the polygon/DOM control surface is the required offline path — 3D is an
upgrade. Portrait-framed camera (helper `framePortrait` provided). Reduced-motion: a
single composed still.

---

skipped: bespoke JS animation libs — CSS keyframes + the existing Framer Motion dep
cover all six; add a lib only if a brief proves it can't. Add per-room prompts beyond
these when a room gets a dedicated motion pass.
