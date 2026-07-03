# e2-ui.done.md

shipped: E2.1 full-viewport board; E2.4 verdict names weapon + C11 date fix; E2.6 live timer/score chip, motive/weapon rack strikes, tag reverse-cycle (C12); intro previews 5 axes.
files: frontend/components/Mystery.module.css, MysteryInvestigate.tsx, MysteryVerdict.tsx, MysteryStatusPill.tsx, MysteryIntro.tsx.
decided: redesign (single-tab) + e2-engine weapon/motive were ALREADY in integration — most e2-ui scope pre-shipped; built only the delta. No MysteryAccusationForm.tsx (deleted in redesign; accusation inlined in MysteryInvestigate). Did NOT touch mysteryScore.ts (already gates won on motive/weapon).
gotchas: HARNESS Read TOOL SERVED STALE PRE-CHECKOUT FILES — trust Bash (dangerouslyDisableSandbox) for ground truth. Worktree had no node_modules; symlinked from main frontend to build/test. E2.1 full-bleed uses calc(50% - min(48rem,50vw-1rem)) to escape RoomShell max-w-5xl, only >=1088px. RoomShell untouched (shared).
branch: ux/e2-ui (off integration). Gate: npm run build OK + 122 vitest green.
