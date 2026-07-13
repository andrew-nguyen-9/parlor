# Séance audio (E4-content)

Committed one-shot SFX for The Séance, mapped to game events by
`frontend/lib/sound/seanceCues.ts` and played through the single `lib/sound.ts`
master bus (the global volume/mute authority). No CDN, no runtime fetch cost.

| file | event | source (CC0) |
|---|---|---|
| `snuff.ogg` | cell excluded (snuff a candle) | Kenney Impact Sounds — `impactSoft_medium` |
| `bind.ogg` | cell bound (glowing rune) | Kenney Impact Sounds — `impactGlass_light` |
| `cascade.ogg` | auto-elimination sweep after a bind | Kenney Impact Sounds — `impactSoft_heavy` |
| `strike.ogg` | Poltergeist Strike (wrong submit) | Kenney Impact Sounds — `impactWood_heavy` |
| `planchette.ogg` | planchette glide to a hint | Kenney Impact Sounds — `footstep_wood` |

The Banished / completion swell keeps the shared `/audio/stinger.mp3` layered
with a synth piano chord (see `seanceCues.ts`). The ambient bed is the engine's
procedural drone at a low séance root, auto-upgrading to `/audio/ambient-seance.mp3`
if a committed seamless loop is ever dropped in.

All samples are from Kenney's CC0 packs (see `../kenney_impact-sounds/License.txt`)
— public domain, no attribution required, redistributable.
