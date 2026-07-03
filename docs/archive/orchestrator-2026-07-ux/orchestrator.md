# orchestrator.md

Multi-agent orchestrator run as **four chat sessions** (A→B→C→D). Each session does one job, writes its output to disk, and ends with a **copy-paste kickoff prompt** for the next. Context stays thin because detail lives in files, never in chat — the kickoff prompt + disk artifacts *are* the handoff.

This file is a **template** (lives in dotfiles at `~/.claude/orchestrating/orchestrator.md`, alongside `wishlist.md` — the fill-in bootstrap). Session A copies it into the target project with the [Swap per project](#swap-per-project) blanks filled. Everything downstream reads the **project copy**, never the template.

**When to use** — big asks only: many genuinely independent epics, shared scaffolding, multi-day, worth ~15× fan-out. Smaller → `lite.md` (one pass) or `medium.md` (plan + bounded fan-out). The `wishlist.md` router picks; this file assumes it chose orchestrator.

## How to run

Each session is a **separate, fresh chat** — open a new chat, paste that session's kickoff prompt, let it run, copy the kickoff it prints at the end, open the next new chat. Don't run two sessions in one window: the whole point is that a cold session carries no prior context, so the window stays thin. **Session A is first — it has no upstream kickoff; start it with the bootstrap prompt in §Session A.** Resuming mid-session (e.g. C after a budget stop) = new chat reading `handoff.md`, not the kickoff.

## Artifacts — one home for all state

All cross-session state lives in **`.orchestrator/`** at the project repo root. Every session reads/writes here; nothing of substance lives in chat. Add `.orchestrator/` to `.gitignore` unless you want the trail committed.

```
.orchestrator/
  orchestrator.md   # the project copy of this template (A writes; B/C/D read)
  spec.md           # A writes; B reads once; C/D reference
  blockers.md       # A writes (checkbox list); C gates on it
  depmap.md         # B writes (dependency map); C reads
  prd.json          # B writes (machine task list); C runs
  briefs/<unit>.md  # B writes; C injects path into each dispatch
  progress.md       # B seeds unit→status table; C updates as waves land
  <unit>.done.md    # C agents write; dependents + D read
  handoff.md        # C writes on a budget stop; the resuming C chat reads
```

Paths below are relative to `.orchestrator/`. When a kickoff says "read `./spec.md`" it means `.orchestrator/spec.md`.

## The four sessions

| Session | Job | Writes to disk | Hands off |
|---------|-----|----------------|-----------|
| **A — Intake** | Scope the asks via batched multiple-choice rounds. Build the project `orchestrator.md` from this template. | `spec.md`, project `orchestrator.md`, `blockers.md` | kickoff → B |
| **B — Architect** | All brainstorming, planning, scaffolding, doc creation, trackers, architecture. | `briefs/`, `prd.json`, dependency map, trackers, design docs | kickoff → C |
| **C — Execute (lean)** | Dispatch subagents, integrate. Keep this window as empty as possible. **The core of this file.** | `<unit>.done.md`, unit branches, `integration` branch, `handoff.md` | kickoff → D |
| **D — Review & land** | Verify original ask is met, full code review, then commit/push/merge/prune. | review notes, merged trunk | — |

**Blockers gate C, not B.** B is pure thinking (no env needed). A lists everything the user must finish (secrets, accounts, infra, access, decisions) *before* C fans out.

**D treats C's work as claims, not gospel** — re-verifies against committed code (Safeguards).

## Model — terms used throughout

- **Wave** — a batch of units with no unmet deps, dispatched together. Foundation wave first; feature waves after its `.done.md` lands.
- **Dispatch** — C launches a **fresh subagent** per unit (general-purpose or a project-specific type). **Never fork** — a fork inherits C's context, defeating the thin window.
- **Integration model (default = local-branch-merge, no PRs needed).** A long-lived `integration` branch starts at `main`. **Each unit branches `<prefix>/<unit>` off the *current* `integration`** — so upstream *code* (not just `.done.md` notes) is already present for dependents. As a wave's units pass DoD, the integration subagent merges them into `integration` in dep order and runs full regression *there* (C holds only pass/fail, never the build output); the **next wave branches off the updated `integration`**. D fast-forwards `main` to the final green `integration`. Set `PR` in returns to null. Assumes the run owns `main` (freeze other merges, or rebase `integration` before the final ff). *PR-based variant:* agents open a PR per unit, C's integration agent uses `gh` to assemble, D merges PRs — pick one model project-wide, don't mix.

## Thinking budget — reason ∝ blast radius

The rule: spend thinking in proportion to **blast radius** = how many downstream units inherit the decision × how late/expensive the error surfaces. Max it where a *reasoning* error cascades and surfaces late; spend none where work is leaf-level or a test verifies it cheaply. Thinking helps reasoning failures (tradeoffs, subtle interactions, planning) — not knowledge gaps (retrieve) or mechanical slips (test). Orthogonal to caveman/ponytail (those cap *output*, this is *internal*): **think deep, output terse**; ponytail + ultrathink = reason hard for the *simplest correct* solution.

- **B architecture = `ultrathink`** — decomposition (unit seams), couple-vs-independent, dependency edges, foundation. Highest blast radius in the pipeline; errors invisible until integration, cascade at 15×.
- **Briefs scale with fan-out, not session** — `ultrathink` the foundation brief + any brief many units inherit (a bad brief = a wrong agent at 15×, the #1 driver of subagent failure); a leaf brief (no dependents) gets normal effort. Brief quality is the direct success-gate on every dispatched unit.
- **A = `think hard` on question selection + acceptance criteria** — the reasoning is "what don't I know yet?" and "how will D verify this?"; vague criteria → false "done." Synthesis itself is mechanical.
- **C main thread = none** (reflexive + thin). **Units = adaptive** (Run): none Haiku-trivial → high Opus-hard.
- **Integration = conditional** — clean ff-merge none; a conflict or red-trunk regression gets `think hard` to diagnose the cross-unit interaction.
- **D = high on the completeness gate** (last line vs shipping incomplete); review findings think per-difficulty, not blanket.

## Tiers — the whole mental model

| Tier | Holds | Rule |
|------|-------|------|
| Spec (1 file) | full detail | read once → generate artifacts; never re-read |
| Briefs + `<unit>.done.md` (disk) | per-unit detail + outcomes | agents only; never into main chat |
| Main chat (esp. C) | dependency map + short statuses | nothing else |

Skip a load-bearing tier → context leaks → the thin window collapses.

## Invariants — never break

1. **Role line (C).** "You are the orchestrator. Hold only the map + statuses. Never pull detail, file contents, build output, or note bodies into this chat."
2. **Return contract.** Every agent returns ONLY `id, status, branch, PR?, ≤2-line note` as a **JSON schema** (`PR` null in local-merge model — see Integration model). Malformed rejected at the boundary — a rejected return is a paid retry. Backstop: verbose return → summarize to one line, drop the rest.
3. **Cap every artifact.** Note ≤15 lines. Return ≤2 lines. Brief = one unit, **≤~150 lines / ~2k tok** (over → unit too big, split it). Uncapped = re-flood.
4. **Every session AND every subagent runs lean.** Not optional, not orchestrator-only. At the top of each session and in **every dispatched brief**: activate `/caveman:caveman ultra` (compress all prose/returns/notes), `/ponytail:ponytail ultra` (laziest diff that works), **RTK** (shell → `rtk`), **Serena/LSP** (symbolic nav over whole-file reads), and the whole [Efficiency layer](#efficiency-layer). Output styles (`learning`/`explanatory`) **off** — they multiply prose. This is the answer to "be less verbose": a standing constraint on producers, not advice. **Boundary:** caveman/ponytail govern *prose, returns, notes* — NOT code, commit messages, or PR bodies, which stay normal and complete (and carry no AI attribution).

---

# Session A — Intake

**Bootstrap (chat #1).** Easiest: fill `~/.claude/orchestrating/wishlist.md` and paste it (or type `Read ~/.claude/orchestrating/wishlist.md and run it`). Or paste this directly into a fresh chat in the repo:
```
Read ~/.claude/orchestrating/orchestrator.md and run Session A on the wishlist below.
Activate /caveman:caveman ultra + /ponytail:ponytail ultra + RTK + Serena. Output styles off.
First confirm this wishlist is big enough to warrant the orchestrator (§When to use) — if not, switch to ~/.claude/orchestrating/lite.md instead.
Wishlist:
<paste your wishlist here>
```

**Input:** the user's raw wishlist + this template.

0. **Set up** — create `.orchestrator/` at the project root; copy this template to `.orchestrator/orchestrator.md`. All artifacts below land in `.orchestrator/`.
0.5 **Survey the repo** — brownfield (existing code)? Map it first (Serena `get_symbols_overview` / LSP, README, build files) so questions are grounded and B doesn't rebuild what exists. Empty repo (greenfield)? Skip; the foundation unit establishes the toolchain.
1. **Batched scoping.** AskUserQuestion serves **max 4 questions per call** — a "round" is several back-to-back calls (~3–5 calls = ~12–20 questions), then you digest answers before the next round. **300 = hard ceiling, not a target** — most projects finish well under. Rounds narrow: goals → scope → stack → constraints → DoD → release policy. **Stop the moment answers stop changing the spec** (don't pad to 300).
2. **Write `spec.md`** — structured epics, each with acceptance criteria. Normalize the wishlist; don't carry a raw list forward.
3. **Fill the project `orchestrator.md`** — in the copy from step 0, fill the [Swap per project](#swap-per-project) blanks (spec path, DoD, secrets location, tool choices).
4. **Write `blockers.md`** — a **markdown checkbox list** of everything the user must complete before C: secrets provisioned, accounts/access granted, infra up, external decisions made. Each line `- [ ] <blocker> — <how to verify done>`. The user ticks each `- [x]` as they finish. C reads this file and **halts (does not fan out) if any box is unchecked**, printing which.

**A → B kickoff (copy-paste):**
```
Session B — Architecture. Read .orchestrator/orchestrator.md, .orchestrator/spec.md, .orchestrator/blockers.md.
Activate /caveman:caveman ultra + /ponytail:ponytail ultra + RTK + Serena. Output styles off.
Do Session B: brainstorm, plan, scaffold, write trackers + design docs, fan spec → .orchestrator/briefs/ + prd.json + depmap.md.
Read spec.md ONCE. Detail to disk only. End by printing the Session C kickoff prompt.
```

---

# Session B — Architecture

All design lives here so C stays empty. Read `spec.md` ONCE → artifacts; never re-read it.

- **Plan & split** — `superpowers:writing-plans` → units (epic/feature/module/endpoint per project). `ralph-skills:prd` → `ralph` → `prd.json` (machine task list).
  - **Minimal schema C reads:** each task `{id, brief (path), deps [ids], effort}`. Ralph's output is a superset — fine as long as those fields exist.
  - **Requires** the `ralph-loop` + `ralph-skills` + `superpowers` plugins (C drives `ralph-loop` on `prd.json`). Check at the start of B — missing → **fallback**: hand-write `prd.json` to the schema above; in C, dispatch units yourself in dep order with `dispatching-parallel-agents` (no ralph-loop). Same artifacts, manual driver.
- **Briefs** — `briefs/<unit>.md`, standalone. *Standalone test:* an agent given only its brief can finish. Needs the spec → brief is incomplete; fix it. **Smallest high-signal set** — a fat brief is *less* accurate (irrelevant context worsens hallucination) and costlier. Goldilocks: not brittle over-spec, not vague under-spec. **High-fan-out briefs → ultrathink** (Thinking budget); leaf briefs, normal effort.
- **Dependency map** — the one genuinely project-specific artifact; write it to `depmap.md` (the table below), since C reads it cold. Wrong edge → dependent runs blind. Unsure → **add the edge** (extra path is cheap; stale build is not).

  | Unit | Upstream `.done.md` to inject |
  |------|------------------------------|
  | auth-mw | — |
  | user-api | `auth-mw.done.md` |
  | billing | `auth-mw.done.md`, `user-api.done.md` |

- **Tracker** — seed `progress.md`: a `unit | status | branch` table (statuses ⏳→🔁→✅/⛔). C updates it as waves land; it's the at-a-glance state for resume + the Block-8 report.
- **Foundation-first** — epics share scaffolding (schema, shared types, design system, auth, config). Make it **unit #1** (map: all → foundation), run as the first wave; its `.done.md` carries shared decisions. Genuinely independent units skip it — don't invent a foundation. **Brownfield: existing shared code already IS the foundation** — point briefs at it (paths/symbols), don't rebuild; only add a foundation unit for *new* shared scaffolding.
- **`.done.md` contract** — every C agent writes this on finish (≤15 lines, caveman-compressed, disk only, pass the **path** not the body):
  ```
  # <unit>.done.md  (≤15 lines)
  shipped: <what>     files: <paths>
  decided: <non-obvious choices>
  gotchas: <traps for dependents>
  branch / PR
  ```

**B → C kickoff (copy-paste):**
```
Session C — Execution. You are the orchestrator: hold ONLY the dependency map + short statuses.
Activate /caveman:caveman ultra + /ponytail:ponytail ultra + RTK + Serena. Output styles off.
Read .orchestrator/orchestrator.md §"Session C" + .orchestrator/depmap.md. Work off depmap.md + prd.json + briefs only — do NOT open spec.md (detail is the agents' job).
GATE: read .orchestrator/blockers.md — if any box is unchecked, STOP and list them; do not fan out.
Then pre-flight budget, run waves off prd.json. Inject brief path + upstream .done.md paths into each dispatch — nothing else. End by printing the Session D kickoff prompt.
```

---

# Session C — Execution (the lean core)

Keep this window near-empty: map + statuses only. Everything else is a path.

## Pre-flight — budget & limits

Two 2026 ceilings: **5-hour rolling window** (resets +300 min from first prompt) and the **weekly cap** (7-day, shared across all Claude use — the hard ceiling). The agent reads budget autonomously via **`ccusage`** (Bash-runnable); `/usage` + `/stats` are the *user's* glance (user-typed slash commands the agent can't call).

- Estimate total cost vs remaining window + weekly: per unit ≈ **~15× its single-agent baseline** (multi-agent coordination overhead); baseline via `count_tokens` on the brief (free, on the *actual* model — new tokenizer counts ~30% more). Won't fit → wave it; don't start a run you can't finish.
- **Calibrate from wave 1** — the ~15× is a guess; after the foundation wave, read the actual `ccusage` delta and re-budget waves 2..N from real burn, not the heuristic.
- **Wave-pace to one rolling window** (foundation → feature waves); `.done.md` between waves so a reset loses nothing. Weekly cap = spread big runs across days.
- **No surge pricing** — peak = global **529 overload**, not cost. Schedule big independent waves off-peak (ScheduleWakeup/cron); set `fallbackModel` (≤3), exp backoff 30s → failover, stop after ~3×529. Batch API for latency-tolerant units (eval/doc/non-interactive) = flat 50% off.
- **Usage tracker as a PreToolUse hook** (`ccusage --once --output json`, 0 model tokens): **≥98% (exit 10) → handoff + clean stop**; limit-hit (11) → resume at reset; time-to-limit < wave est → finish in-flight unit, don't start next.

**Handoff file — clean stop at ≥98%** (don't grind to a hard freeze): finish or roll back the in-flight unit, write `handoff.md`, end session, schedule a wakeup for the reset. A fresh session resumes off the file (idempotent units make this safe).
```
# handoff.md  (resume checkpoint)
window resets: <time>     done: <units w/ .done.md>
in-flight: <unit + branch + committed? / rolled-back>
next wave: <units, dep order>     next-wave est: <count_tokens>
dep-map cursor: <stop point>     blockers: <unit: reason>     savings: <rtk gain>
```

**Resume kickoff (copy-paste into the fresh chat at reset):**
```
Session C — Execution, RESUMING. You are the orchestrator: map + statuses only.
Activate /caveman:caveman ultra + /ponytail:ponytail ultra + RTK + Serena. Output styles off.
Read .orchestrator/orchestrator.md §"Session C" + .orchestrator/handoff.md + .orchestrator/depmap.md.
Continue from the handoff's next wave. Don't re-run done units (idempotent — check .done.md first).
```

## Run

```
ralph-loop:ralph-loop on prd.json
  → dispatch per task (dispatching-parallel-agents = independent;
     subagent-driven-development = the coupled chain)
Each dispatch carries: brief path + upstream .done.md paths. Nothing else.
```

- **Over-decomposition guard** — ~15× cost is worth it *only* for truly independent units. A coupled cluster (B needs A mid-task) is cheaper as **one sequential agent** than N coordinating ones. Fan out independent; collapse coupled.
- **Right-size effort/model per unit** — `thinking:{type:adaptive}` + `output_config:{effort}` (not fixed `budget_tokens`); Haiku trivial → Sonnet default → Opus hard. Enforced by `$CLAUDE_EFFORT` hooks.

## Standing constraints (every agent)

- **DoD gate** — `<build>`+`<test>`+`<lint>` green before `.done.md` (`verification-before-completion`: evidence before done).
- **ponytail ladder** — exists? stdlib? native? one line? Ship minimum. Mark shortcuts `// ponytail:`. **TDD** for non-trivial logic.
- **Branch/commit** — one branch per unit `<prefix>/<unit>` off the current `integration` (Model); commit on DoD-green only; no AI attribution.
- **Ensure subagents work in isolated worktrees to avoid checkout conflicts.**
- **Secrets** — never commit; pull from `<secrets location>`; none in briefs/notes.

## Enforcement via hooks (0 model tokens — shell, fires free)

Move **deterministic** rules out of prompts into hookify; keep judgment in the prompt.
- Return-contract cap + verbose-output truncation (PostToolUse `updatedToolOutput`).
- Effort gates (`$CLAUDE_EFFORT`): PreToolUse blocks expensive Bash at low effort.
- RTK rewrite + block reads of files >N lines (force symbolic nav) and `.env`/secrets.

## Integration gate (before handoff)

Per-unit DoD is local: N green branches can sum to a red trunk. **Run it per wave, not once at the end** — as each wave's units pass DoD, **dispatch the integration subagent** (don't do it in C's window): it merges that wave into `integration` in dep order, runs the **full regression + integration/e2e suite + lint there** (not just per-unit), returns pass/fail only. Green-alone but red-together = cross-unit break → fix before the next wave branches off `integration`. C never sees the build output. Final wave green = `integration` is what D fast-forwards `main` to.

**C → D kickoff (copy-paste):**
```
Session D — Review & land. Read .orchestrator/orchestrator.md §"Session D", .orchestrator/spec.md, and every .orchestrator/<unit>.done.md (treat as CLAIMS, not truth — verify load-bearing ones against committed code).
Activate /caveman:caveman ultra + /ponytail:ponytail ultra + RTK + Serena. Output styles off.
Verify the original spec is fully met, run full code review across all changes, fix what's found. Then get explicit user go before merge/push/prune (irreversible); prune only merged <prefix>/<unit> branches.
```

---

# Session D — Review & land

C's notes are **claims, not gospel** — verify load-bearing ones against committed code.

1. **Completeness** — walk `spec.md` epics + acceptance criteria against the merged trunk. Anything unmet → list it; fix or flag.
2. **Full code review** — across all units (`code-review`/`pr-review-toolkit`): branch diff only, diff via `gh`/git not MCP, isolated subagents returning confidence-gated findings (small model for style, large for logic). Add a **producer-blind judge** where judgment matters; keep deterministic tests for exact correctness.
3. **Land** — `main` fast-forwards to C's already-regression-green `integration` branch (no re-merge). Irreversible + outward-facing: **show the user the plan and get an explicit go first** (what merges, what pushes, what gets deleted). On go: `merge --ff-only integration` into `main` → `push -q`. **Prune only the merged `<prefix>/<unit>` + `integration` branches** (`git branch -d` — safe-delete refuses unmerged; never `-D` blanket, never touch branches outside this run). Blocked/unmerged units stay. One clean trunk.
4. **Report** (caveman-terse, one line/unit):
   ```
   blockers: <unit: reason>     branches→PRs: <unit → PR>     savings: rtk gain
   ```
   **Partial-release policy** (decided in A, per unit): blocked unit → *ship-without* (drop + log) or *block-release* (hold version).

---

# Efficiency layer

Accuracy bar: every tactic drops **transcript bulk, never meaning**. Agent-facing — briefs reference it **by path** (`obey .orchestrator/orchestrator.md §Efficiency`); never paste these lines into a brief (the shared cached prefix already carries them).

## §1 Context management (platform)

| Feature | Do | Save | Risk |
|---------|-----|------|------|
| Prompt caching | cache `[system][spec][brief]`, order stable→volatile (live status last/uncached); 5-min TTL, 1-hr for long fan-outs | ~90% on hits | none — byte-identical replay |
| Context editing | `clear_tool_uses_20250919`, keep N recent (`context-management-2025-06-27`) | ~84% long runs | low — **write `.done.md` before results age out** |
| Memory tool | `.done.md` + briefs = the store; state in files outside the window | +39% w/ editing | none — files are source of truth |
| Shared base-prompt cache | **standardize the dispatch skeleton**: every wave's agents get a byte-identical prefix `[role + §Efficiency ref + DoD + integration model]`, breakpoint, then only `[brief path + upstream .done.md paths]` last | one write serves the whole fan-out (~90% off the prefix for agents 2..N) | none — vary nothing before the breakpoint |
| Semantic caching | reuse answers for *similar* subtasks via embedding match | skips repeat calls | **low–med — verify before trusting on a critical path** |
| Plan caching | cache + adapt execution-plan templates across runs | plan stage = most compute, often repeated | low |

**Token-efficient tool use** — on by default in Claude 4 (~14% output, up to 70%). Keep **consistent across cacheable requests** (selective use breaks caching); incompatible with `disable_parallel_tool_use`.

## §2 Retrieval & nav (load less)

- **JIT** — hold refs (paths/symbols/queries), fetch on demand; preload only the brief.
- **Overview** — Serena `get_symbols_overview` over hand-written headers (live → can't drift).
- **LSP** (`typescript-lsp`, `pyright-lsp`, `gopls-lsp`, `rust-analyzer-lsp`, `jdtls-lsp`, `ruby-lsp`, `clangd-lsp`, `csharp-lsp`, `swift-lsp`, `php-lsp`, `kotlin-lsp`, `lua-lsp`):
  - **Broad→narrow**: `documentSymbol` → `hover` → `definition` → `references`. ~500 tok vs 2k+ grep, type-aware.
  - **`diagnostics` = fast check, NOT the DoD gate** — keep the real build/test as the gate.
  - **Active language only.** Heavy servers (`pyright`, `rust-analyzer`) RAM-hungry → raise ceiling or `/plugin disable` → grep. Index warm-up worth it for multi-lookup units, not one-shots.

## §3 Edit & output (emit less)

- **Diff edits** — exact-match `str_replace`, keep syntactic units whole; smaller + more reliable than rewrites.
- **Structured returns** — JSON-schema (Invariant 2); malformed rejected at boundary.
- **Selective tool loading** — each agent gets only its unit's tools (schemas cost tokens every turn).
- **Git** — `commit -q`, `push -q`, `merge --quiet --no-edit --ff-only`; `status --porcelain`, `diff --stat`/`--name-only`; `--no-pager log --oneline -N`.
- **GitHub** — `gh --json <fields> --jq <filter>`; `gh run view --log-failed`; `gh` over GitHub MCP; pre-aggregate to a file the agent reads.
- **Bash** — cap dumps (`head`/`wc -l`, `find -maxdepth`); filter at source (`grep`/`jq`); exit codes over prose; chain `a && b && c`; redirect noise (`2>/dev/null`).

## §4 Browser & research units (Playwright MCP)

- **Pre-strip ingested content** — strip web pages to clean markdown before context (~94% fewer tokens; 38k→2.8k median). Never stream a raw page through the window.
- **Snapshot-default, vision per-task** — a11y snapshot (500–5k tok) over screenshots (10k–50k); `includeSnapshot:false` on non-interacting calls; `browser_evaluate` to extract fields not the tree.
- **Capture-to-disk** for heavy flows (file-as-memory, ~4× less). **`--isolated` + headless** = correct parallel runs.
- **Security:** never expose `browser_evaluate` to untrusted prompts (arbitrary in-page JS).

## §5 API-call construction

Output (output ≈ 5× input cost): **`max_tokens` tight** (ceiling not target); **`stop_sequences`** (4–6) halt after the return closes; **assistant prefill** (`{`) forces format + skips preamble (⊥ extended thinking — a thinking unit can't prefill; pick one); low temperature.

Caching: order `tools → system → messages`; `cache_control:{ephemeral}` on the **last static block** (≤4 breakpoints); **dynamic content (date/name/vars) → human turn or after a breakpoint** (one var busts the cache); reads 0.1× / writes 1.25×–2×, TTL refreshes on read. Cache tool defs; strip unneeded (§3) — keeps the prefix clean.

---

# Safeguards

Every efficiency tactic replays, drops, or compresses content — so each can propagate a wrong premise. These keep the fast pipeline from confidently shipping wrong.

- **Notes are claims, not gospel** — a wrong `.done.md` poisons every dependent (errors compound, they don't cancel). Dependents (and Session D) **verify load-bearing claims against committed code** (Serena/LSP), not the note alone.
- **Producer-blind judge gate** — isolated reviewer (separate context, hidden criteria) scores output; supplements the DoD, never replaces deterministic checks. Deterministic for exact (tests/schema/tool-correctness), judge only for judgment.
- **Inter-agent schema gates** — every handoff validates against expected structure before a downstream agent consumes it. Malformed/poisoned data blocked at the boundary.
- **Loop safeguards (C)** — auto-retry, but **kill + reassign after 3 stuck iterations**; per-unit token/iteration **budget guardrail** (15× cost runs away without one); circuit breaker + **human escalation** when agents converge on *unverified* info (agreement ≠ correctness).
- **Idempotent units + checkpoints** — re-running must not double-apply; `.done.md` is the checkpoint → a failure re-executes **one unit from its checkpoint, not the whole fan-out**.
- **Small bounded units** — fewer hallucinations than one big prompt; balance against the over-decomposition guard.

## Swap per project

Session A fills these placeholders in the project copy (search the literal `<...>` tokens):

- **`<build>` / `<test>` / `<lint>`** — exact DoD commands + stack security checks.
- **`<secrets location>`** — where agents pull secrets.
- **`<prefix>`** — branch namespace (`feat`, `epic`, project slug…).
- **Spec file + unit granularity** (epic/feature/module/endpoint).
- **Dependency map edges** — the real work; wrong edge → stale build.
- **Integration model** (local-merge default vs PR-based) + **reference sources, tool choices.**
- **Conditional plugins** (add only what your stack needs, used the efficient way): Language LSP (§2); `hookify` (deterministic → hooks); `code-review`/`pr-review-toolkit` (D, branch diff only); `commit-commands` (commit→push→PR batched); `security-guidance` (gated subagent on changed files at trust boundaries).

---

# PROJECT CONFIG (filled by Session A — authoritative overrides for the <...> tokens above)

- **Work root:** `frontend/`
- **`<build>`:** `cd frontend && npm run build`
- **`<test>`:** `cd frontend && npm run test`  (vitest; Seance/Mystery determinism+solvability tests gate)
- **`<lint>`:** `cd frontend && npm run lint`
- **DoD gate:** all three green before any `.done.md`.
- **`<secrets location>`:** `frontend/.env.local` (NOT needed this run — app runs offline/seed-bank).
- **`<prefix>`:** `ux` (branches `ux/<unit>` off `integration`).
- **Unit granularity:** epic -> feature units (E1..E6 split in briefs).
- **Integration model:** local-branch-merge (no PRs). `integration` off `main`; per-epic merge to `main` as reviewed (A1) OR one ff at D — B decides per A1.
- **Model routing (A2):** design/analysis/game-critique -> `model: fable`; implementation -> Opus; trivial mechanical -> Sonnet/Haiku.
- **Spec:** `.orchestrator/spec.md` (6 epics, AC).
- **Plugins:** typescript-lsp; code-review/pr-review-toolkit (D); gstack design-review/qa/browse + chrome-devtools lighthouse + playwright (E4/E6); frontend-design/ce-frontend-design (build).
- **Reference sites (E3.3):** wishlist item 3 ten links + existing DESIGN_SYSTEM refs.
