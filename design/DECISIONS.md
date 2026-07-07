# DECISIONS — append-only

challenge-by = decision date + one INDEX cadence interval, unless the decider sets
longer. Cadence is `each release` → challenge-by = `next release` (not a duration).
Tags in the decision cell: `wildcard:<FILE>`, `trial`, `defaulted`.

| date | decision | why | challenge-by |
|------|----------|-----|--------------|
| 2026-07-06 | Extract-mode North Star: codify the shipped "haunted Victorian mansion" system as-is; rejected inventing a new look, rejected a from-scratch rebrand | brief F1 = aggregate the existing site, never invent; tokens are frozen (`STYLING.md`) | next release |
| 2026-07-06 | Direction = one, codified from `docs/v2/DESIGN_SYSTEM.md` + `globals.css` + `lib/types.ts`; light theme is a semantic-role remap, not a brand swap | dark and light already ship from one token set; a second direction would contradict shipped code | next release |
| 2026-07-06 | Category is two-tier: `CATEGORY_HEX` FILL (theme-invariant) vs `--cat-*` INK (text-safe, per-theme); text via HEX is a bug | several fills fail AA as text; preserves the shipped `types.ts` contract | next release |
| 2026-07-06 | Full specs for 8 core shells only; game-room components stay one-line `live` rows | 40 full specs exceed UI-KIT's 250-line cap; rooms self-document in code + PATTERNS | next release |
| 2026-07-06 | Floors adopt the shipped project constraints (Q&A legibility over effects; zero-JS/seed-bank frame is the design; ≤1 loop/viewport; one light source; category never color-alone) as hard floors | these are already enforced in `globals.css`/CLAUDE.md; the North Star records them so no future unit regresses them | next release |

## Drift — shipped code vs system (Extract findings; append resolutions, never rewrite rows)
| where | code says | system says | resolved |
|-------|-----------|-------------|----------|
| `components/CardFace.tsx` | card text uses literal hex (`#43141f`, `#5a2230`) inline | tokens-only, EXCEPT theme-invariant deck/share-card faces | not-drift — sanctioned exemption (FOUNDATIONS §5); documented, no change |
| Button / CTA | no shared component; each room re-does the pill in Tailwind | UI-KIT specs one Button shell | open — extract a shared `Button` (Update unit); until then follow the specced pattern |
| Inputs (text/select) | per-room ad hoc, no shared spec | core-tier component, `planned` | open — spec on first Update that touches a form |
| `lib/games.ts` | still lists `cold-case` (rank 11) | F1 catalogs 11 rooms AFTER cold-case retirement | open — retirement owned by a separate unit; PATTERNS catalog excludes it |
| `frontend/CLAUDE.md` line | not yet added | north-star.md wants a `Design: design/INDEX.md …` findability line in CLAUDE.md | open — F1 owns `design/**` only; flagged for the owner of root docs to add |
