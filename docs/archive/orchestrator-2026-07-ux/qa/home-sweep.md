# /ui-qa / (qa-sweep re-check) — 2026-07-02 · 1280x800 + 360x800
functionality
- 🟢 deck, rooms grid, footer nav all render; 0 console errors
aesthetics
- 🟢 dark: burgundy velvet + gold Cinzel + parchment cards = highly-designed, no slop tells in layout/copy
- 🟢 light: parchment inversion holds; ticker + seal read well
- 🟡 body copy is default sans (no companion serif) — `tailwind.config.ts` fontFamily — carried from e6; backlog
mobile
- 🟡 FIXED: theme toggle was 40x44 — `components/ThemeToggle.tsx:37` — now min-h-11/min-w-11
verdict: ship
