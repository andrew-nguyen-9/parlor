# e3-design — Light mode, guidelines, references (E3.1–E3.3)

Proposal for user sign-off (gate A5). Sections below are written as ready-to-merge
`docs/v2/DESIGN_SYSTEM.md` sections; the token table at the end is the machine
contract for e3-tokens. All contrast ratios computed (WCAG 2.1 relative luminance),
not estimated.

## Summary (approve/reject on these 10 lines)

1. Light mode stays "a daylit tour" — same parchment bg/surface/ink as today; **2 token value changes only**: `brass` `#966E28→#7D5C20`, `gold` `#A07C2E→#94722A` (both currently fail AA as text on parchment).
2. **New token `focus`**: today's hardcoded `#e6c878` focus ring is ~1.3:1 on parchment (invisible). Dark = goldlite, light = burgundy.
3. **New "jewel-ink" tier**: 6 `--cat-*` vars, text-safe per theme (≥4.5:1 on bg *and* surface, both themes). Canonical `CATEGORY_HEX` fills stay untouched — jewels split into *fill* (SVG/glow, unchanged) vs *ink* (any colored text).
4. Fixes a live dark-mode bug too: music/screen/wildcard jewels fail AA as text on dark surfaces today.
5. `.gilt`/`.gold-text` gradients get light-theme stops (current gilt gold is ~2:1 on parchment); display-size only, per new rule.
6. Deck card faces are declared **theme-invariant** (a physical parchment card is parchment in daylight too) — zero deck CSS churn.
7. Guidelines (E3.2): color-role law, layout rhythm on the existing `--d-*` tokens, mobile/desktop split, one-light-source cursor rule, motion budget (≤1 ambient loop per viewport), reduced-motion contract.
8. Three new references distilled: lusion.co (capability-gated richness), poolsuite.net (total period commitment), obys.agency (editorial type/grid).
9. Everything else in both palettes: **unchanged**. Brand identity (oxblood/gold/Cinzel) untouched.
10. Full AA contrast table below — every text-role pair ≥4.5:1, every UI-role pair ≥3:1, decorative pairs explicitly exempted by rule.

---

## §Light mode — "a daylit tour of the mansion" (E3.1)

*(ready to merge into DESIGN_SYSTEM.md, replacing the current "Light / Dark" section's light half)*

Dark is the mansion by candlelight; light is the same house with the curtains
drawn back. Nothing is repainted — the parchment that was the *cards* becomes the
*walls*, the gold that was the *light* becomes the *hardware*. Concretely:

**Semantic-role remap (not a brand swap):**

| Role | Dark ("candlelight") | Light ("daylit tour") |
|---|---|---|
| surface-base | near-black oxblood `bg` | aged parchment `bg` |
| raised panel | lifted oxblood `surface` | brighter parchment `surface` — panels read as *paper on paper*, lifted by `line` hairline + soft shadow, never by hue shift |
| hairline / engraving | oxblood `line` | brass-tinted `line` (decorative only — see role law) |
| primary text | parchment `ink` | deep burgundy-brown `ink` |
| secondary text | rose-ash `muted` | umber `muted` |
| accent text (small) | `gold` / `brass` | `brass` (darkened bronze) — gold is *never* body/small text in light |
| primary highlight | `gold` (luminous) | `gold` (bronze; large text + borders only) |
| flame / glow | `candle` blooms *outward* (light source) | `candle` is *pigment*, not light: warm underline/fill accents, no bloom radii — daylight has one light source already |
| hero glow / the eye | `burgundy` glow | `burgundy` becomes the strongest *ink* accent (8.7:1) — seals, active states, focus |
| danger | `ember` | `ember` (slightly deep) |
| focus ring | `focus` = goldlite | `focus` = burgundy |

**Atmosphere in light.** The candle-glow radial gradients invert meaning: in dark
they are pools of light; in light they are *sun through gauze* — keep `--body-grad`
(already theme-aware) but any component glow (`.candle-pool`, `.glow`,
`drop-shadow` blooms) drops to ≤40% of its dark opacity or is removed under
`[data-theme="light"]`. Shadows do the depth work instead: light mode may use
soft umber shadows (`rgba(58,26,32,…)`), never black.

**Deck card faces are theme-invariant.** `.deck-front` / `.deck-back-art` render a
physical object; a parchment playing card is parchment in daylight. Their hardcoded
literals are *by design* and MUST NOT be varred. Same for share-card renders.

**Gilt in light.** `.gilt` / `.gold-text` / `.deck-pip` gradients are tuned for
dark; on parchment their bright stops fall to ~2:1. Rule: gilt classes resolve
via theme-scoped gradient stops — light stops `#7D5C20 → #94722A → #B8903C → #7D5C20`
(bright stop ≤20% of the run) — and gilt is **display-size only** (≥24px bold /
≥19px equivalent), where the darkest-stop 4.8:1 and mid-stop 3.5:1 both clear
AA-large. Never gilt a microlabel or body copy in light; use `brass` solid.

### WCAG AA contrast table (computed)

AA thresholds: **4.5:1** normal text · **3:1** large text (≥24px or ≥19px bold) and
UI component boundaries · decorative/disabled exempt (marked). `bg` is the governing
(worse) surface in light; `surface` governs in dark — both listed.

**Light theme:**

| fg token (hex) | on `bg` #EDE4CB | on `surface` #FAF4E3 | role class | verdict |
|---|---|---|---|---|
| ink `#3A1A20` | 12.28 | 14.17 | text | AA + AAA |
| muted `#7A5C50` | 4.77 | 5.50 | text (secondary) | AA |
| brass `#7D5C20` **(new)** | 4.84 | 5.58 | text (accent, microlabels) | AA |
| gold `#94722A` **(new)** | 3.52 | 4.07 | large text / borders only | AA-large |
| goldlite `#B8903C` | 2.33 | — | decorative shine only | exempt |
| candle `#D69628` | 2.01 | — | decorative glow only | exempt |
| smoke `#96846C` | 2.85 | — | disabled / ghost | exempt |
| ember `#B43214` | 4.86 | 5.61 | text (danger) | AA |
| burgundy `#6E1F2B` | 8.74 | 10.09 | text (hero accent) + focus ring | AA + ring 3:1 ✓ |
| line `#CEB88E` | 1.52 | — | decorative hairline only | exempt (see role law) |
| cat-history `#8A5710` | 4.80 | 5.54 | jewel-ink | AA |
| cat-music `#A82C5C` | 5.21 | 6.01 | jewel-ink | AA |
| cat-sports `#1F7040` | 4.80 | 5.54 | jewel-ink | AA |
| cat-screen `#245A9C` | 5.49 | 6.33 | jewel-ink | AA |
| cat-geography `#0F6E7A` | 4.69 | 5.41 | jewel-ink | AA |
| cat-wildcard `#7040A8` | 5.54 | 6.40 | jewel-ink | AA |

**Dark theme (unchanged values; jewel-ink is the only addition):**

| fg token (hex) | on `bg` #150409 | on `surface` #24101A | role class | verdict |
|---|---|---|---|---|
| ink `#F0E6CF` | 16.07 | 14.54 | text | AA + AAA |
| muted `#9A7A78` | 5.15 | 4.66 | text (secondary) | AA |
| gold `#C9A24A` | 8.31 | — | text/accent | AA |
| brass `#A87A2E` | 5.21 | — | text/accent | AA |
| ember `#D4431E` | 4.39 | 3.97 | large text / UI danger | AA-large (pair with icon/label for small) |
| focus = goldlite `#E6C878` | 12.25 | 11.08 | focus ring | ✓ |
| cat-history `#C8852A` (=fill) | 6.50 | 5.88 | jewel-ink | AA |
| cat-music `#D25585` **(new)** | 5.11 | 4.62 | jewel-ink | AA (fill `#B83468` = 3.54, fails small text) |
| cat-sports `#2D9155` (=fill) | 5.03 | 4.55 | jewel-ink | AA |
| cat-screen `#4A85CC` **(new)** | 5.24 | 4.74 | jewel-ink | AA (fill `#2B6AB5` = 3.64) |
| cat-geography `#1E97A6` **(new)** | 5.73 | 5.18 | jewel-ink | AA (fill `#178B99` = 4.46 on surface) |
| cat-wildcard `#9B70D4` **(new)** | 5.38 | 4.86 | jewel-ink | AA (fill `#7040A8` = 2.84, fails even large) |

---

## §Color-role law + guidelines (E3.2)

*(ready to merge as a new DESIGN_SYSTEM.md section; every rule is checkable without judgment calls)*

### Color roles — the law

1. **Text carries only text-safe tokens.** `ink`, `muted`, `brass`, `ember`,
   `burgundy`, and `--cat-*` jewel-ink. In dark, `gold`/`goldlite`/`candle` also
   qualify (all >8:1). In light, `gold` is large-text-only; `goldlite`/`candle`
   never carry text.
2. **Jewels are two-tier.** *Fill* = `CATEGORY_HEX` (canonical, theme-invariant):
   SVG fills, wedge fills, glows, chart marks — always paired with
   `CATEGORY_GLYPH` and/or `CATEGORY_LABEL` (never color alone, standing 2.14 rule).
   *Ink* = `var(--cat-*)`: any colored *text* (microlabels, headers, scores).
   New code that sets `style={{color: CATEGORY_HEX[...]}}` is wrong; use the var.
3. **`line` is decorative.** If a border is the *only* affordance of an
   interactive element or state, use `brass` (3:1+ in both themes), not `line`.
4. **One danger color.** `ember` only; at small sizes pair with an icon or word.
5. **Focus is `--c-focus`**, one global ring (already in globals.css `:focus-visible`
   — swap the literal for the var). Components may thicken it, never re-color it.
6. **No new hex literals in components.** Tokens or `var(--cat-*)` only.
   Exemptions: deck card faces + share-card renders (theme-invariant physical
   objects, documented above).

### Layout grid + rhythm

- **The `--d-*` tokens are the grid.** Gutter, max width, gap, card-min, stack —
  already in globals.css. Rooms consume them; no room invents its own gutter or
  max-width. New rhythm needs = a §3.0-style token follow-up, not a local value.
- **Vertical rhythm**: blocks separate by `--d-stack`; within a block, multiples
  of 0.25rem. Section headers use `.deco-rule`; panels use `.gilt-frame` on
  `surface`. One `.density-grid` per room for card collections.
- **Type scale**: display (Cinzel) for nameplates/headers via `.display`,
  `.microlabel` for signage, system stack for body. Question/answer text ≥1rem,
  line-height ≥1.5, never inside a gilt/gradient treatment (legibility overrides
  any effect — standing rule, restated because light mode tempts it).

### Mobile vs desktop

- **Mobile-first, pointer-enhanced.** Base styles are the phone; `lg:`/1024px
  adds density (the `--d-*` media block already models this). Nothing is
  desktop-only *content* — only desktop-only *garnish*.
- **Touch**: every target ≥44px (deck buttons already comply — that's the bar);
  horizontal scroll only inside a component with a visible affordance (Séance
  matrix pattern), never the page.
- **Hover is garnish, never information.** Anything revealed on hover must also
  be reachable by tap/focus. Card tilt/lift = pointer-only (`@media (hover:hover)`);
  touch gets the pressed state.

### Cursor treatments (where they earn their place)

- **One light source.** The `--mx/--my` viewport-pinned radial (GoldSheen → `.gilt`,
  `.deck-pip`) is *the* cursor treatment: all gilt on a page is lit by the same
  moving point. Any new cursor-reactive effect must join this system (read the
  same vars), not add a second light. Rationale: one physical metaphor
  (candle/sun follows the visitor) instead of n gimmicks.
- Cursor motion is **decoration-layer only** — never moves layout, never gates
  content, never exceeds `opacity`/`transform`/`background-position` changes.
- **Defaults are the fallback**: SSR, reduced-motion, and touch all resolve to
  the centered default (`--mx:50% --my:32%`) — already the pattern; keep it.
- The Streak darkness `--gx/--gy` glow is the one sanctioned *second* instance
  (it is diegetic: the candle). Cap remains: max one cursor-tracked element
  active per screen state.

### Interactive functionality

- **States are triple-encoded**: color + shape/border + text or glyph (a11y floor).
- **Feedback ≤150ms** perceived: press states are instant (CSS), async results
  may animate in after.
- All shared/daily state through `lib/rng.ts` seeded PRNG; free randomness only
  in click handlers/effects (standing rule; restated for motion flourishes:
  a "random" shuffle flourish on load must be seeded or client-effect-only).
- Every overlay/zoom (deck zoom pattern) closes on Esc and backdrop click, traps
  focus while open, and returns focus on close.

### Motion restraint (the budget)

- **Every animation earns its place** = it must be *diegetic* (candle flickers,
  pendulum swings, card deals) or *feedback* (state change). Decorative motion
  that is neither: cut.
- **Ambient budget: ≤1 infinite/looping animation per viewport** (the room's
  signature: flame, pendulum, eye-glow — pick one). Marquee + signature is the
  home's already-spent budget. Everything else is finite and ≤600ms.
- **Curve vocabulary**: entrances `cubic-bezier(0.22,1,0.36,1)` (the curtain),
  flips `cubic-bezier(0.2,0.8,0.2,1)` — the two existing curves are the whole
  vocabulary; no new easings.
- **Reduced-motion path for every rule** (non-negotiable): the globals.css
  universal clamp + iteration-count:1 stays the backstop, but every *new* named
  animation must also appear in the explicit kill-list or freeze to a designed
  static frame (Streak flame mid-brightness = the model).
- **Perf floor (lighthouse-ci gate)**: animate only `transform`/`opacity`/
  `filter`; no new `backdrop-filter` surfaces beyond the deck zoom; no
  full-viewport blur >120px; imagery stays optional-enhancement (seed-bank/offline
  render must look complete without it).

---

## §Reference distillation — 3 additions (E3.3)

*(ready to append to the existing "Reference-site learnings" table)*

| Site | Take (don't clone) |
|---|---|
| lusion.co | Richness is *capability-gated*: heavy effects load progressively and degrade to a complete static composition. PARLOR reading: the seed-bank/no-JS/reduced-motion render is the *design*, effects are garnish on top — design the static frame first, then animate it. |
| poolsuite.net | Total commitment to a period metaphor — UI chrome, microcopy, cursor, loading states all stay in character, built from cheap flat assets (no photography, no WebGL). PARLOR reading: the mansion voice extends to *every* surface — empty states, errors, toasts, the 404 — and commitment beats fidelity: engraving-style vectors over textures over photos. |
| obys.agency | Editorial typography as the interface: oversized display type, strict grid, generous whitespace; motion is almost entirely type/scroll choreography. PARLOR reading: Cinzel at scale + whitespace *is* the luxury cue — when a room feels flat, fix the type scale and rhythm before adding ornament or motion. |

Common thread holds: **restraint + intentional motion; nothing templated, no
AI-slop** — all three win by doing *fewer* things in *complete* character.

---

## Token table (machine contract for e3-tokens)

Rules for the implementer: values not listed = unchanged. New CSS vars use RGB
channels (`R G B`) like existing tokens. Jewel-ink vars are new in *both* themes.

| name | role | dark hex | light hex | tailwind key | css var |
|---|---|---|---|---|---|
| bg | surface-base | `#150409` | `#EDE4CB` | `bg` | `--c-bg` (unchanged) |
| surface | raised panel | `#24101A` | `#FAF4E3` | `surface` | `--c-surface` (unchanged) |
| line | decorative hairline | `#4A2233` | `#CEB88E` | `line` | `--c-line` (unchanged) |
| ink | primary text | `#F0E6CF` | `#3A1A20` | `ink` | `--c-ink` (unchanged) |
| muted | secondary text | `#9A7A78` | `#7A5C50` | `muted` | `--c-muted` (unchanged) |
| brass | accent text / interactive border | `#A87A2E` | **`#7D5C20`** ← | `brass` | `--c-brass` |
| gold | highlight (light: large-text/border only) | `#C9A24A` | **`#94722A`** ← | `gold` | `--c-gold` |
| goldlite | shine (decorative) | `#E6C878` | `#B8903C` | `goldlite` | `--c-goldlite` (unchanged) |
| candle | flame/glow (decorative) | `#F5C542` | `#D69628` | `candle` | `--c-candle` (unchanged) |
| smoke | disabled/ghost | `#5A4452` | `#96846C` | `smoke` | `--c-smoke` (unchanged) |
| ember | danger | `#D4431E` | `#B43214` | `ember` | `--c-ember` (unchanged) |
| burgundy | hero accent (light: strongest ink accent) | `#6E1F2B` | `#6E1F2B` | `burgundy` | `--c-burgundy` (unchanged) |
| parchment | card-face literal | `#EFE8C0` | `#EFE8C0` | `parchment` | `--c-parchment` (unchanged) |
| focus | focus ring | **`#E6C878`** new | **`#6E1F2B`** new | `focus` | `--c-focus` **new** |
| cat-history | jewel-ink (text) | `#C8852A` | `#8A5710` | `history` → var | `--cat-history` **new** |
| cat-music | jewel-ink (text) | `#D25585` | `#A82C5C` | `music` → var | `--cat-music` **new** |
| cat-sports | jewel-ink (text) | `#2D9155` | `#1F7040` | `sports` → var | `--cat-sports` **new** |
| cat-screen | jewel-ink (text) | `#4A85CC` | `#245A9C` | `screen` → var | `--cat-screen` **new** |
| cat-geography | jewel-ink (text) | `#1E97A6` | `#0F6E7A` | `geography` → var | `--cat-geography` **new** |
| cat-wildcard | jewel-ink (text) | `#9B70D4` | `#7040A8` | `wildcard` → var | `--cat-wildcard` **new** |

**Implementation notes (mechanical):**

1. globals.css is §3.0-frozen — these edits are exactly the sanctioned "token
   follow-up": add `--c-focus` + six `--cat-*` to `:root` and `[data-theme="light"]`;
   swap `:focus-visible` literal `#e6c878` → `rgb(var(--c-focus))`; add
   light-scoped gradient stops for `.gilt`/`.gold-text` (`[data-theme="light"] .gilt {…}`).
2. tailwind.config.ts: category colors `history…wildcard` switch from static hex
   to `rgb(var(--cat-*) / <alpha-value>)` (safelist untouched — class names
   don't change).
3. lib/types.ts: `CATEGORY_HEX` stays (canonical fill, for SVG/inline glow). Add
   `CATEGORY_INK: Record<Category,string>` = `var(--cat-*)` CSS strings for
   inline `style={{color}}` call sites (e.g. app/page.tsx ledger, room HUDs).
   Fill call sites (SVG, wedges, map pins) keep `CATEGORY_HEX`.
4. Audit pass: grep component inline styles for `CATEGORY_HEX` used as `color:`
   → migrate those (and only those) to `CATEGORY_INK`.
5. No deck-*/share-card changes (theme-invariant, documented above).
