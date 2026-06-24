# HANDOFF → homepage session (from 2.12 — The Gauntlet)

2.12 deliberately did **not** touch `app/page.tsx` / `components/Deck.tsx` / the
`GAMES` array, to avoid colliding with the concurrent homepage rework. Apply
these home-surface edits in the homepage branch:

- The Daily is reframed as **The Gauntlet**. Point its deck card at **`/gauntlet`**
  (the old `/daily` now 307-redirects there, so nothing breaks in the meantime).
- **Deck position = slot 9.**
- Card copy: an Indiana-Jones treasure run — timed, hints cost time. Emblem **𖣘**,
  accent `wildcard`.
- **Retire the Blitz card** when convenient: Blitz's sprint is folded into the
  Gauntlet (continuous clock). Its route/component (`app/blitz`, `BlitzGame.tsx`)
  can be deleted once the card is gone — left intact for now so the live deck
  link doesn't 404.

(2.11 left a companion handoff for the Mystery top-billing ask — apply both.)
