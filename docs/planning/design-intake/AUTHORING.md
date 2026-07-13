# Design-Intake Authoring Contract

Game-agnostic rules for writing a PARLOR game glow-up questionnaire. This file
is the reusable template head for the CORE questionnaire (`_core.md`) — the next
game reuses CORE verbatim and writes only its own per-game doc. Read it before
writing any intake section.

## Purpose

A pre-filled MCQ questionnaire the USER reviews. Every question already carries
my **recommended pick** — those picks ARE the assumed design spec that the
implementation briefs build against. The user accepts (zero re-brief) or
overrides via the notes line (re-briefs only the affected unit). So each pick
must be a defensible, self-consistent design decision, not a placeholder.

## Question format (EXACT — do not vary)

```
### Q: <the question, one line, ends with a question mark>
- [ ] A) <option>
- [x] B) <the recommended option — exactly one [x] per question unless the Q is explicitly multi-select>
- [ ] C) <option>
- [ ] Other: __________________________________________
> WHY: <one line — the design rationale for the [x] pick, tied to a doctrine principle or a cited source>
> USER NOTES:
```

Rules:
- Exactly **one `[x]`** per question. Multi-select allowed ONLY when the options
  genuinely compose (e.g. "both a slow loop AND reactive bursts") — mark each
  chosen box `[x]` and the `WHY` names why they combine.
- Every question ends with an `Other:` write-in line.
- Every question has a `> WHY:` line (rationale) and a blank `> USER NOTES:` line.
- Group questions under `##` theme headers. One `#` H1 title per doc.
- Questions are decision-relevant. No filler, no restating a Floor as a question
  (Floors are non-negotiable — see below — never offer an option that breaks one).

## Doctrine — how to choose the recommended pick

1. **Bold, v4-led.** Default to the grander vision in `docs/v4/08_seance.txt` and
   the wishlist (Apple-fy, full-bleed immersion, amplified Ouija, cinematic
   ceremony). **v4 wins ties over the currently-shipped behavior.** When in doubt,
   pick the more ambitious, more premium option — the user downgrades if they want.
2. **Rich but disciplined.** Atmosphere is CSS/GPU-cheap. Never recommend a pick
   that needs a new runtime dep, a new Vercel image-opt/function/edge cost, or
   breaks the motion budget. Premium via craft, not spend.
3. **Apple-fy = restraint + depth.** Fewer, better elements; generous spacing;
   real depth/material; slow deliberate transitions; one light source; no
   confetti-spam. Elegant over campy (v4: "Avoid stereotypical Halloween visuals").
4. **Accessible by construction.** Every motion pick has a reduced-motion answer;
   every audio pick respects global mute; contrast/target/focus Floors hold.
5. **Self-consistent.** Picks across sections must not contradict (if audio starts
   muted, don't elsewhere assume an ambient bed autoplays). Cross-check shared
   dimensions: mute defaults, reduced-motion, full-bleed layout, persistence.

## Floors — NEVER offer an option that violates these (`design/INDEX.md` §Floors)

- Contrast: body ≥4.5:1; large/bold ≥3:1; UI parts ≥3:1 — AA both themes.
- Touch targets ≥44×44px (incl. in-game grid cells/chips); pointer ≥24×24px.
- Motion: every animation has a reduced-motion variant; **≤1 infinite/looping
  animation per viewport**; everything else finite ≤600ms.
- One global focus ring (`--c-focus`, 2px+2px); components thicken never re-color.
- Q&A / puzzle text ≥1rem, line-height ≥1.5, never inside a gilt/gradient/flame.
- The seed-bank / no-network / no-JS / reduced-motion frame renders complete on
  its own; effects are optional garnish. **Zero-env build stays green.**
- Category = color + glyph + label, never color alone.
- SSR: no `Math.random()` in render (`lib/rng.ts`); flash-free theme toggle;
  frontend never writes the DB.
- Skins change only non-Floor `--skin-*` seams via `frontend/app/skins.css` +
  `applySkin(...)`; no JS-runtime theming layer; `CATEGORY_HEX` single-source.

## Reference sources (read the ones your section needs; don't re-derive)

- `docs/v4/08_seance.txt` — the bold visual bible (source of Séance defaults).
- `design/INDEX.md` (Floors + skins), `design/PATTERNS.md` §Motion/§Mobile/§Skins,
  `design/FOUNDATIONS.md` (tokens, color, breakpoints), `design/UI-KIT.md`, `design/VOICE.md`.
- Shipped: `frontend/components/SeanceGame.tsx` + `SeanceGame.module.css`,
  `components/seance/*`, `lib/seance.ts` (FROZEN — presentation only),
  `RoomShell.tsx`, `lib/theme.ts`/`themes.ts`/`boardSettings.ts`,
  `lib/sound.ts`/`SoundToggle.tsx`, `app/skins.css`, `public/audio/`.
- Vercel meters (spec §Reference): image-opt 4K/5K, Fluid CPU 1h17m/4h, edge 120K/1M,
  fast-origin 1.16GB/10GB, functions 103K/1M, ISR 38K/1M, prov-mem 6.9/360 GB-hr.

## Séance-frozen note (per-game docs)

Séance puzzle LOGIC is frozen (`lib/seance.ts` deduction rules unchanged). Intake
questions are presentation / feedback / pacing / audio / settings / mobile ONLY —
never a rule change. Don't offer options that alter the no-guessing deduction.
