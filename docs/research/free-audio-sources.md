# Free audio sources — research (E9)

PARLOR ships zero required audio: `frontend/lib/sound.ts` synthesizes every
SFX/ambient bed/stinger procedurally via Web Audio on first use, and
"upgrades" to a bundled file under `frontend/public/audio/` when one exists
at an expected path (`404`/decode-failure → remembered as absent, falls back
silently, never blocks render — see `bufferCache` in `sound.ts`). Any asset
added here must satisfy all four:

1. **CC0 / public domain** (or a license so permissive it needs no runtime
   attribution UI) — no CC-BY chains to track, no paid tiers.
2. **Offline-bundle-able** — downloaded once, committed to the repo, served
   from `frontend/public/audio/`. The app must stay playable from a clone
   with zero env vars and zero network (`CLAUDE.md` "Offline mode").
3. **CSP-safe** — same-origin static file, no `<script>` tag, no remote
   `connect-src`/`media-src` exception needed.
4. **No CDN** — never referenced by URL to a third party at runtime (rules
   out Freesound's API, Zapsplat's hosted player, YouTube Audio Library's
   web player, etc.). Download once, commit the bytes.

## Sources evaluated

| Source | License | Verdict |
|---|---|---|
| **Kenney.nl** (kenney.nl/assets) | CC0 (`http://creativecommons.org/publicdomain/zero/1.0/`), explicit per-pack `License.txt` | **Used.** 7 packs already committed under `frontend/public/audio/kenney_*/` (casino, digital, impact, interface, sci-fi, voiceover ×2). Zip download, no attribution required, no account/API key. |
| **OpenGameArt.org** | Mixed — filter by CC0 explicitly (site lets you facet by license) | **Recommended for the gap below.** No bundled ambient/drone loops exist in the Kenney packs; OGA has CC0 ambient-pad/drone-loop tracks suited to a game backdrop. Manual download + license-file check per track (license is per-submission, not per-site). |
| **Freesound.org** | Mixed (CC0, CC-BY, CC-BY-NC, Sampling+) — must filter to CC0 explicitly and download the actual file (not link) | Usable **only** filtered to CC0; requires a free account to download at all, and each pull needs its `License.txt`/credit line kept even for CC0 (courtesy, not required) since attribution needs vary per-file. No CDN embed — only a one-time authenticated download, then bundle. |
| **Zapsplat.com** | Free tier requires attribution or paid tier for royalty-free; player is CDN-hosted | **Rejected** — free tier isn't CC0 (attribution/registration required), hosted player is CDN-shaped. |
| **YouTube Audio Library** | Some CC0-equivalent, some requires on-video attribution; distribution is via YouTube's own downloader, terms tuned for video, not app-bundling | **Rejected** — licensing intent is per-video, ambiguous for embedding in a shipped web app; skip. |
| **Sonniss GDC bundles** | CC0, huge (multi-GB) yearly bundles | **Rejected for now** — legit CC0 but massive downloads for a handful of cues; revisit only if a big sound-design pass is scoped. |

## Recommendation

- Keep Kenney as the primary/only source for one-shot SFX and voice lines —
  already covers casino/interface/impact/sci-fi/digital/voiceover needs.
- For the one open gap — **looping ambient pad/drone beds**, one per room
  (`ambient-board.mp3`, `ambient-clock.mp3`, `ambient-wedges.mp3`,
  `ambient-streak.mp3`, `ambient-map.mp3`, `ambient-daily.mp3`, per the
  filenames `lib/sound.ts` already looks for) — pull explicitly CC0-tagged
  loops from OpenGameArt.org, verify the per-submission license text, and
  drop them at those exact paths. No code change needed; `sound.ts`'s
  `loadBuffer()` upgrade path picks them up automatically, and the shipped
  procedural drone (`startDrone()`) already covers the gap gracefully in the
  meantime.
- Never add a source that requires a live network fetch at runtime (rules
  out YouTube/Zapsplat's hosted players and any "embed via URL" service) —
  bundle-then-commit only, per the offline/CSP mandate above.

See `frontend/public/audio/README.md` for the curated starter cue set pulled
from the Kenney packs and the exact missing-filename list.
