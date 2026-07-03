# e4-mobile.done.md

shipped: E4.1 mobile pass all 17 routes (360/390 sweep: 0 h-scroll, tap targets ≥44px outside dense grids, micro-type floors ~10px) + E4.2 lighthouse mobile a11y 100 on home/board/seance/cold-case (was 98/90/96/100). Report: .orchestrator/qa/e4-mobile-sweep.md.
files: app/globals.css (≤640px microlabel 44px floor), app/page.tsx (h3→h2), components/{RoomShell,SiteFooter,BoardGame,ClockGame,Deck,SeanceGame,MysteryIntro,MysteryInvestigate}.tsx, {SeanceGame,WeeklyCase}.module.css.
decided: CSS-first — one global media-query rule covers all microlabel pills (no per-component churn). Board role=grid gets role=row wrappers with `contents` class (a11y fix, zero layout change). Deck stale aria-labels dropped (CardFace name = accName). Seance accent buttons text-bg→text-white (2.65→5.7 contrast, both themes).
gotchas: `npm run build` while dev server runs corrupts .next chunk serving → pages render unstyled, audits lie; restart dev after builds. Residual sub-44 taps: seance matrix 24px / ladder 31px / cold-case strike 28px cells — dense-grid inherent, playability > pixel (brief). Perf scores dev-server-only, unreliable.
verify: build EXIT=0, vitest 122/122 green. lint = pre-existing repo-wide fail (no eslint config), ignored per baseline.
branch: ux/e4-mobile (commit d358efc off integration)
