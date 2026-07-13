# `frontend/public/audio/`

All CC0 (public domain, no attribution required — though Kenney appreciates a
credit). No CDN, nothing here is fetched over the network; the Web Audio
engine (`frontend/lib/sound.ts`) synthesizes every sound procedurally by
default and *upgrades* to a bundled asset when one exists at the expected
path, so the app stays fully playable with this directory empty.

## Layout

- `kenney_*/` — 7 raw Kenney packs (587 files) as dropped, CC0. Source:
  https://kenney.nl/assets (each pack ships its own `License.txt`). Kept
  intact/untouched so any future unit can pull further cues without
  re-downloading.
- `cues/` — small **curated starter set** pulled from the raw packs above,
  renamed to intent-revealing names for easy reuse:
  - `cues/ui/` — click, confirm, error, select, tick, toggle (interface-sounds pack)
  - `cues/casino/` — card-flip, chip-lay (casino-audio pack; fits Board/Wedges)
  - `cues/voice/` — correct, wrong, game-over, you-win (voiceover-pack, Female)
  - Not wired into any component yet (out of this unit's boundary — game
    components are excluded); available for a future unit to import.
- `stinger.mp3` — transcoded (ffmpeg, libmp3lame) from
  `kenney_interface-sounds/Audio/confirmation_004.ogg`. This exact filename is
  already read by `lib/sound.ts`'s `audio.stinger()` (`loadBuffer("/audio/stinger.mp3")`),
  so it upgrades the room-completion flourish automatically — **no code
  change required**, zero-env builds still pass (absent-asset path was
  already the tested default).

## Missing cue types (fetch from opengameart.org)

The Kenney packs bundled here are all short one-shot SFX / voice lines — none
of them are seamless **ambient pad/drone loops**. `lib/sound.ts` looks for
`ambient-{room}.mp3` (`board`, `clock`, `wedges`, `streak`, `map`, `daily`) to
upgrade the procedural drone bed per room; none of those 6 files exist yet.
Search opengameart.org for CC0 "ambient pad" / "drone loop" / "background
music loop" tracks (~30–90s, seamlessly loopable, low-key/non-intrusive) and
drop them in at those exact filenames — the engine will pick them up with no
code change. Until then the procedural synth drone (already shipped) covers
every room.
