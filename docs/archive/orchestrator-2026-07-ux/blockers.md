# Blockers — tick each `- [x]` before Session C fans out. C halts if any unchecked.

## Decisions (user was away at intake — confirm or override the defaults)
- [x] A1 scope/release = **all 6 epics, merge per-epic to main** — verify: user OK or picks subset/batch
- [x] A2 model workflow = **Fable proposes → Opus builds** — verify: user OK or "Opus does both"
- [x] A3 design docs = **extend docs/v2/DESIGN_SYSTEM.md** — verify: user OK or new doc
- [x] A4 QA process = **reusable `/ui-qa` skill** — verify: user OK or checklist/CI
- [x] A5 E3 design-guidelines proposal held for user sign-off before implement — verify: user OK

## Capability / access
- [x] Fable model dispatchable for design/analysis units (agent `model: fable`) — verify: a Fable subagent returns; else fall back to A2="Opus does both"
- [x] No secrets needed for E1–E6 (all visual/UX; app runs offline). DB write role (`DATABASE_URL`) only if regenerating Séance/Mystery archives — verify: not required this run, or provide in frontend/.env.local

## None external
No accounts/infra to provision — all work is in-repo frontend + docs.
