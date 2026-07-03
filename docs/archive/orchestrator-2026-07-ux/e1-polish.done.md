# e1-polish.done.md

shipped: E1.1 layout (verified 360/768/1440, no page overflow), E1.5 sentence-case clues, E1.6 category color-coding + glyph, E1.7 spatial rewording.
files: frontend/lib/seance.ts (capFirst + renderClue), frontend/components/SeanceGame.tsx (cat color helpers).
decided: color by category SLOT -> CATEGORIES[c] hue (K<=4, distinct). TEXT=CATEGORY_INK var, FILL=CATEGORY_HEX (e3 two-tier). Inline styles from constants, NOT Tailwind dyn classes -> no safelist dependency. Band/headers/confirmed-cells colored; UI accents (hint/trace/buttons) stay wildcard purple ACCENT (brand, not category coding). a11y: each band carries CATEGORY_GLYPH + text label = non-color channel.
E1.7: seats render as ROWS (vertical axis) -> order "left of"->"above"; neighbor "directly beside"->"directly above or below". Tests use structural clueHolds (no .text asserts) so no fixtures broke.
E1.5: capitalize only the value that OPENS a clue sentence (lead); mid-sentence values stay lowercase (atmospheric).
gotchas: E1.8 full-QA is qa-sweep's. Playwright root locked to main-repo/.playwright-mcp (not worktree).
DoD: build EXIT=0, test 122/122 green. lint=next lint still fails repo-wide (no eslint config on integration, pre-existing, all units).
branch: ux/e1-polish (off integration)
