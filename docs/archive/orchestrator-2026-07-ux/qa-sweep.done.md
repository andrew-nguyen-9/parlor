# qa-sweep done
shipped: /ui-qa dogfooded on home + all 13 game routes (seance board clock cold-case daily gauntlet ladder map mystery overture streak thread wedges), desktop 1280 + mobile 360 checks + light AND dark themes + per-room interaction; reports in .orchestrator/qa/*.md.
fixed (4, commit 3bca3fa): 🔴 /clock hydration mismatch every load (ClockFace SVG float drift — trig coords rounded to 3dp); 🟡 /gauntlet room label 09→06 (duped Climb of the Initiate); 🟡 ThemeToggle 40px→44px tap; 🟡 /map Indus glyph 卐→≋ (read as swastika).
backlog (6, .orchestrator/qa/backlog.md): emoji→engraved-motif set (all rooms), body serif, clock slider styling, map raster duotone, dense-grid <44px taps (e4-accepted), home ticker/footer credit dupe.
E3.5 verdict: PASS — both themes read highly-designed, no slop layout/copy; residual slop tell = raw emoji icons (backlogged).
🔴 left open: none. Console errors after fixes: 0 across all routes.
verify: build EXIT=0, vitest 122/122; lint pre-existing repo-wide fail ignored per baseline. LH not re-run (dev-server perf unreliable; e4 mobile-a11y sweep stands).
gotchas: headless Chrome resolves prefers-color-scheme:light → "dark" screenshots need explicit localStorage parlor.theme; /daily is an intentional redirect to /gauntlet.
branch: ux/qa-sweep (commit 3bca3fa off integration d358efc)
