# e4-mobile — all-routes mobile QA sweep (2026-07-02, 360x780 + 390x844)

Method: playwright iframe sweep of all 17 routes (16 + 404) at 360/390px —
scrollWidth overflow probe + tap-target (<44px) census + tiny-type (<12px) probe;
Lighthouse mobile a11y+perf on home + worst 3. Dev server, so perf scores unreliable.

## Triage table (post-fix)

| route | h-scroll | sub-44 taps | verdict |
|---|---|---|---|
| / about board clock daily gauntlet map mystery overture profile streak thread wedges 404 | none | 0 | ship |
| cold-case | none | strike ✕ 28x28 (was 22) | ship (residual) |
| ladder | none | grid cells 31x31 | ship (dense puzzle grid, inherent) |
| seance | none | matrix cells 24x24 | ship (K·N logic grid, inherent; matrixWrap scrolls) |

## Lighthouse mobile a11y (before → after)

- 🟢 home 98 → **100** (fixed: heading-order `app/page.tsx:93` h3→h2; label-content-name-mismatch `components/Deck.tsx` dropped stale aria-labels)
- 🟢 seance 96 → **100** (fixed: color-contrast text-bg-on-accent → text-white `components/SeanceGame.tsx`; td-has-header corner td→th)
- 🟢 board 90 → **100** (fixed: aria-required-children/parent — role=row `contents` wrappers `components/BoardGame.tsx`)
- 🟢 cold-case 100 (no change needed)

## Fixes shipped (E4.1)

- 🟡→🟢 microlabel pill buttons/links 26–34px tall → global 44px floor at ≤640px (`app/globals.css`)
- 🟡→🟢 RoomShell lobby pill + header logo home link → 44px (`components/RoomShell.tsx`)
- 🟡→🟢 footer room/order links 17px → 44px rows mobile (py-3, sm:py-1), summary + brand 44px (`components/SiteFooter.tsx`)
- 🟡→🟢 board settings gear 32x34 → 44 mobile (`components/BoardGame.tsx`); clock year slider 16px → 44px hit area (`components/ClockGame.tsx`)
- 🟡 tiny type <10px → floors raised to ~10px: seance matrix labels (`SeanceGame.module.css`), cold-case attr labels (`WeeklyCase.module.css`), mystery intro/checkmarks (`MysteryIntro.tsx`, `MysteryInvestigate.tsx`). Full 14px impossible in dense grids without breaking fit.

## Residuals (accepted, playability > pixel perfection per brief)

- 🟡 seance matrix cells 24px, ladder cells 31px, cold-case strike 28px — dense game grids; enlarging breaks single-view fit.
- 🟢 no overflow-x hacks used anywhere; body untouched.

Verdict: **ship** — 0 🔴 across all routes; a11y 100 on all four audited routes.
