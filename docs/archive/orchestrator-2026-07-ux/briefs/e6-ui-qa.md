# e6-ui-qa — reusable /ui-qa skill (E6.1–E6.2)

Obey `.orchestrator/briefs/_common.md`. **Model: Fable** (authoring a critique rubric = judgment work). Branch `ux/e6-ui-qa`.

## Task
Repo skill `.claude/skills/ui-qa/SKILL.md` (project skill — auto-discovered). Invoked as `/ui-qa <route>` (e.g. `/ui-qa /seance`).

**Ponytail hard rule: WRAP existing tooling, don't rebuild.** Available: gstack `design-review` (designer's-eye QA), gstack `qa-only` (report-only QA), gstack `browse` (headless browser), `chrome-devtools` lighthouse_audit, playwright MCP (mobile viewport snapshots).

## Skill behavior (define in SKILL.md)
1. Input: route path (+ optional `mobile` flag). Start dev server if not running (`cd frontend && npm run dev`).
2. Run the loop: browse/playwright desktop snapshot → mobile snapshot (360–430px) → lighthouse (perf + a11y, mobile) → design-review lens.
3. Report findings to `.orchestrator/qa/<route-slug>.md`, sections: **functionality / aesthetics / mobile / a11y / creativity** — each finding: severity (🔴🟡🟢), file:line guess, one-line fix hint.
4. Rubric (write into the skill — this is your Fable value-add): what counts as AI-slop, what "highly-designed" means for this brand (read `docs/v2/DESIGN_SYSTEM.md` first), tap-target ≥44px, no horizontal scroll at 360px, contrast AA, category never color-alone, motion earns its place + reduced-motion path.

## AC
- E6.1: `/ui-qa <route>` runs the loop, writes the report.
- E6.2: SKILL.md description makes future sessions auto-trigger it; usage documented in SKILL.md itself (no extra doc file — ponytail).
- Smoke test: run it once on `/` and commit the report as proof.
- E6.3 (dogfooding) happens in later units — not yours.
