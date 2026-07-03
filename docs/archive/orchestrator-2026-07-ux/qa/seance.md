# /ui-qa /seance — 2026-07-02 · 1280x800 + 360x800 · LH carried from e4 (a11y 100)
functionality
- 🟢 cell tap cycles snuff/bind, aria-label announces state ("seat 1, rider the Strongman: snuffed") — works, 0 console errors
aesthetics
- 🟢 category-colored column groups (RIDER/TOKEN/MOUNT) pair color+suit+label — on rubric; both themes read well
mobile
- 🟡 24px matrix cells <44px — `components/SeanceGame.tsx` — dense-grid inherent, accepted by e4; keep on record
a11y
- 🟢 grid semantics + labels present
creativity
- 🟢 idea: candle-flicker on the timer digits as the clock climbs (reduced-motion: static)
verdict: ship
