shipped: E2.2 bracket WHEN clues + rebalance test; E2.5 prose banks (2nd rng stream); C1 ringleader-leak fix. E2.3 (weapon+motive pools, deduceMotive/deduceWeapon, 5-leg verifySolvable) was ALREADY in integration — kept green, not rebuilt.
files: frontend/lib/mystery.ts, frontend/lib/mysteryProse.ts (new), frontend/lib/mystery.test.ts.
e2-ui exports: solution axes on MysteryCase = c.scene, c.hourIndex, c.motive, c.weapon; c.motivePool / c.weaponPool (dropdown options); deduceMotive(c,n?) / deduceWeapon(c,n?). Score attempt already has optional motiveGuess/weaponGuess (mysteryScore.ts unchanged).
clue-types: 9 staged clues — 1 WHEN-alive-bracket, 2 WHERE-room, 3 WHEN-found-bracket, 4 WHERE-room, 5/7 motive-elim, 6/8 weapon-elim, 9 WHO-corroboration.
decided: kept integration's pool-based motive/weapon + checkpoint grid (NOT proposal's kind-bijection/unclaimed-room WHERE) — those would regress deductionMatrix/checkpoints/verify. WHEN got real bracket inference; WHERE stays forensic-elim. mysteryScore rewrite (drop tableBonus) SKIPPED — conflicts with integration's kept model, owned by score/UI side.
gotchas: proposal's "unclaimed-room invariant holds" is FALSE at 6 rooms (2 unclaimed for culpritCount 1-2) — no deduceScene. Prose MUST use proseRnd (seed ^ 0x9e3779b9). hourIndex stays 1..3.
branch: ux/e2-engine (off integration). Gate: build + 122 vitest green.
