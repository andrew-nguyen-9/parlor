# e6-ui-qa done

shipped: `/ui-qa <route>` project skill (loop: dev-server → desktop snapshot → mobile 360–430 → Lighthouse perf+a11y mobile → design-review lens → report to `.orchestrator/qa/<slug>.md`) + smoke run on `/`.
files: `.claude/skills/ui-qa/SKILL.md` (rubric: brand def, slop tells, 44px taps, 360px no-hscroll, AA contrast, category-not-color-alone, motion+reduced-motion, SSR rng, offline mode); `.orchestrator/qa/home.md` (committed with `-f`, dir is gitignored).
decided: wrapped playwright MCP + `npx lighthouse` CLI (chrome-devtools MCP browser was locked by another profile); usage documented inside SKILL.md, no extra docs.
smoke result on `/`: verdict ship, 0 🔴; 🟡s = no body serif (default sans, tailwind.config.ts:32), 34px deck chips + 17px footer links, h3-without-h2 (page.tsx:198), aria-label/visible-text mismatch (Deck.tsx:291). LH a11y 98, perf 48 (dev server — unreliable).
gotchas: **`npm run lint` exits 1 on main AND integration** (no ESLint config; deprecated `next lint` prompts interactively) — pre-existing, blocks every unit's DoD lint leg; flag for integration gate. Build green, 15 files / 112 tests green.
branch: ux/e6-ui-qa (1 commit a5d17ad off integration 7efa8ee)
