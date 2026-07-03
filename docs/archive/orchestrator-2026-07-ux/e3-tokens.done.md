# e3-tokens — done

shipped: E3.4/E3.5 design tokens — light+dark, WCAG-AA, jewel-ink tier. Foundation; dependents inherit by class/var. No games restyled (task 5).
files: frontend/app/globals.css, frontend/tailwind.config.ts, frontend/lib/types.ts (+CATEGORY_INK), docs/v2/DESIGN_SYSTEM.md (merged E3.1-E3.3).
new vars: --c-focus (dark #E6C878 / light #6E1F2B); jewel-ink --cat-{history,music,sports,screen,geography,wildcard} BOTH themes (dark C8852A/D25585/2D9155/4A85CC/1E97A6/9B70D4; light 8A5710/A82C5C/1F7040/245A9C/0F6E7A/7040A8).
changed light values: --c-brass=#7D5C20, --c-gold=#94722A, --c-bg=#EDE4CB(237 228 203).
tailwind: text-/bg-/border-{cat} now = rgb(var(--cat-*)/<alpha>); safelist unchanged. Fills stay CATEGORY_HEX.
utilities: :focus-visible ring = rgb(var(--c-focus)); [data-theme=light] scoped gilt/gold-text bronze gradient + damped .glow/.candle-pool. No new components (ponytail).
switching contract: components consume tokens only (Tailwind bg-bg/text-ink/text-{cat} OR rgb(var(--c-*))/var(--cat-*)); flip <html data-theme> remaps all. No per-component light branch.
jewel two-tier: TEXT->CATEGORY_INK / text-{cat} / var(--cat-*); FILL(SVG/wedge/map/glow)->CATEGORY_HEX. Dependents migrate style={{color:CATEGORY_HEX}} on TEXT -> CATEGORY_INK (NOT done here per task 5).
decided: light bg nudged #E4D9B7->#EDE4CB (proposal's governing-surface constant) so all approved hexes hit approved AA; else accents ~4.3 on bg.
gotchas: deck-*/share-card faces + --gold-sheet theme-invariant (untouched). Dark jewel FILLS music/screen/geo/wildcard still fail AA as TEXT — fixed only via CATEGORY_INK adoption (dependents).
verify: npm ci && build OK + test 117/117 OK. WCAG: every light text token >=4.5:1 on bg #EDE4CB (computed).
branch: ux/e3-tokens (off integration).
