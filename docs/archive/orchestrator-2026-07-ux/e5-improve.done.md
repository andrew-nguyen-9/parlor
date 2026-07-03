# e5-improve.done.md

shipped: all 15 chosen-set items (board x2, clock x2, wedges x2, streak x2, map, thread x2, gauntlet, ladder, overture, cold-case). Backlog untouched.
files: components/{Board,Clock,Wedges,Streak,Map,Thread,Gauntlet,Ladder,AudioRoom,WeeklyCase}Game.tsx; lib/wedges.ts + wedges.test.ts
decided:
- gauntlet records under "blitz" room key (Gauntlet folds in Blitz; mirrors Overture->jukebox) -- NO shared profile.ts edit
- wedges bonus cap via new PER_CATEGORY_BONUS=2; updated "remainder" test to per-category cap assertion (legit expectation change)
- replay guards: firstRun refs (wedges/streak); recorded.current=true on restart (clock); map persists only when !practiceMode
gotchas:
- overture: fixed onClick={play} -> ()=>play() (event leaked in as new force arg); victory playback effect keyed on [solved,failed]
- ladder: only SequenceRung has rule; flash-on-Lock + Summit list use type guard
- determinism preserved (day-seeded builds untouched; free shuffles only in click handlers/effects)
DoD: build OK, test 122/122 OK (lint pre-existing repo-wide fail, ignored)
branch: ux/e5-improve (off integration), commit 35a855f
