# /ui-qa report — `/` (home)

- date: 2026-07-02 · viewports: 1280×800 desktop, 390×844 + 360×800 mobile
- Lighthouse (mobile, **dev server** — perf numbers unreliable, rerun on `npm run build && npm start` before acting): perf 48, a11y 98
- console: 0 errors, 0 warnings

## functionality
- 🟢 Deck modes (gather/browse/shuffle), card flip modal with Play/Close CTAs, theme toggle — all work; rooms list links resolve.

## aesthetics
- 🟡 Body copy renders in default `ui-sans-serif` — DESIGN_SYSTEM wants a readable serif companion for body/questions — `frontend/tailwind.config.ts:32` + `frontend/app/layout.tsx:13` — fix: wire a text serif via `next/font` as `--font-body`, add to `fontFamily.body`.
- 🟢 Gold-on-parchment hero is restrained and on-brand; seal motifs (suits, glyph counts, engraving card frames, corner fleurons) present — no slop tells found.

## mobile
- 🟢 No horizontal scroll at 360px (`scrollWidth` = 360).
- 🟡 Deck-mode chips ~34px tall (<44px tap target) — `frontend/components/Deck.tsx:92` — fix: `min-h-11` / bump `py`.
- 🟡 Footer room links ~17px tall — `frontend/components/SiteFooter.tsx` list items — fix: `py-2` on the links (touch padding, not font size).

## a11y
- 🟡 Heading order skips: `h3` room titles with no `h2` ("The Rooms" label is a div) — `frontend/app/page.tsx:198` — fix: make the section label an `h2` (visually unchanged).
- 🟡 Lighthouse `label-content-name-mismatch` on deck cards: visible text ("the Order Sanctum Mysterii") not contained in `aria-label` ("Sanctum Mysterii — open") — `frontend/components/Deck.tsx:291` — fix: prepend the character name in the label or `aria-hidden` the flavor line.
- 🟢 Marquee duplicate copy correctly `aria-hidden`; `prefers-reduced-motion` rules present in CSS.

## creativity
- 🟢 "Shuffle" could end with cards briefly arranging into the spade constellation (DESIGN_SYSTEM "magical shapes") before settling — one-shot, reduced-motion skips it.
- 🟢 Ticker facts could take a candle-flicker gold highlight on hover — ties the Streak flame motif into the home page.

**Verdict: ship** — no 🔴; queue the 🟡s (body serif is the highest-value fix).
