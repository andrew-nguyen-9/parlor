# Orchestrator run — 2026-07 UX overhaul (archived)

Complete artifact set from the multi-session orchestrator run that shipped the
six UX epics (E1 Séance polish, E2 Mystery depth, E3 design tokens, E4 mobile,
E5 games meta, E6 `/ui-qa` tooling). Landed on `main` at `267bf88`
(merge of `integration`, 2026-07-02); review fixes in `f4ba921`.

| File | What |
|---|---|
| `spec.md` | Normalized epics + acceptance criteria (Session A) |
| `orchestrator.md` | Framework copy w/ project config Session A filled in |
| `prd.json`, `depmap.md` | Unit breakdown + dependency edges (Session B) |
| `blockers.md` | Pre-fan-out decision gates (all confirmed) |
| `progress.md` | Unit tracker — 13 units across 5 waves, all ✅ |
| `briefs/` | Per-unit dispatch briefs |
| `proposals/` | Fable design/analysis outputs: `e3-design.md` (design-system rationale — the WHY behind the tokens), `e2-mystery.md`, `e5-games.md` |
| `*.done.md` | Per-unit completion claims (verified by Session D) |
| `qa/` | `/ui-qa` reports for home + all 13 game routes, `backlog.md` (6 🟡 deferred findings — still actionable), `e4-mobile-sweep.md` |

Live `.orchestrator/` is gitignored scratch recreated per run; this snapshot is
the durable record. Most-referenced pieces: `proposals/e3-design.md` and
`qa/backlog.md`.
