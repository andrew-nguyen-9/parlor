# _common.md — every unit obeys (injected by path into all dispatches)

- Obey `.orchestrator/orchestrator.md` §"Standing constraints" + §"Efficiency layer" + §"Safeguards".
- caveman ultra (prose/notes/returns) + ponytail ultra (laziest correct diff). Code, comments, commit messages: normal, complete, **no AI attribution anywhere**.
- Work in an isolated worktree. Branch `ux/<unit>` off current `integration`. Commit only when DoD green.
- **DoD:** `cd frontend && npm run build && npm run lint && npm run test` — all green. (Docs/skill-only units: still run the gate; it's cheap and proves no regression.)
- SSR: no `Math.random()` in render paths — use `frontend/lib/rng.ts`. Offline/seed-bank play must not regress.
- Séance/Mystery determinism + solvability tests gate — never weaken a test to pass.
- Verify upstream `.done.md` claims against committed code (Serena/LSP) before relying on them.
- Finish: write `.orchestrator/<unit>.done.md` ≤15 lines:
  `shipped:` / `files:` / `decided:` / `gotchas:` / `branch:`
- Return JSON ONLY: `{"id":"<unit>","status":"done|blocked","branch":"ux/<unit>","pr":null,"note":"≤2 lines"}`
