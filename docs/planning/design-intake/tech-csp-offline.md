# tech-csp-offline — CSP / offline integration intake

> **For the USER to fill in.** This questionnaire decides how the Content-Security-Policy
> and the offline/no-CDN posture are wired **into each game**, not what CSP *is*.
> The floors are LOCKED and NOT on the ballot: every room's seed-bank / no-network /
> no-JS / reduced-motion frame renders complete on its own (`design/INDEX.md` §Floors);
> THE MAP's vector land-polygon fallback (`components/WorldMap.tsx`) must always work
> with zero network; no new CDN / tile-server dependency beyond the ONE sanctioned
> exception (the env-gated keyless raster basemap). Your answers pick the CHOICES
> *within* those floors — per game where it varies.
>
> **Games:** clock (Chronos) · streak (Ignite) · map (Atlas) · mystery (Sanctum) ·
> wedges (Fractures) · thread (Thread) · seance (Seance).
> **Orphan rooms:** board · daily · gauntlet · ladder.
>
> **Grounding read:** `CLAUDE.md` (THE MAP + offline rules), `design/INDEX.md` (§Floors),
> `frontend/next.config.mjs` (image `remotePatterns` allowlist — the current remote-host
> surface), `frontend/components/WorldMap.tsx` (raster-basemap exception, hotlinked from
> `upload.wikimedia.org`), `frontend/app/layout.tsx` (`next/font/google` Cinzel — built
> self-hosted, no runtime font CDN), `frontend/public/` (bundled assets:
> `seed-questions.json`, `mansion-map.jpg`, `star-catalog.json`, `overture-melodies.json`,
> `audio/`, logos).

---

## A. CSP header posture (global shape, per-route exceptions)

### Q1. There is no CSP header today (`next.config.mjs` sets only image `remotePatterns`). Where should the policy live?
- [x] A) One static CSP header in `next.config.mjs` `headers()` for all routes
- [ ] B) Static baseline + per-route relaxations via middleware (looser only where a room needs it)
- [ ] C) Nonce-based CSP via middleware (strict, per-request nonce injected into scripts)
- [ ] Other: __________________________________________
> USER NOTES:

### Q2. `script-src` strictness — the 3D/motion rooms (Chronos/Atlas/Ignite three.js, Framer Motion, Phaser) may need looser rules than static rooms. Pick the floor:
- [ ] A) `'self'` only everywhere — refactor any inline script out (strictest, no `unsafe-inline`)
- [ ] B) `'self'` + nonce for the framework's injected bootstrap; no `unsafe-inline`
- [x] C) Allow `'unsafe-inline'`/`'unsafe-eval'` ONLY on the WebGL/Phaser routes, strict elsewhere
- [ ] Other: __________________________________________
> USER NOTES (per game if it varies — which rooms genuinely need eval):

### Q3. `style-src` — Framer Motion, `styled-jsx`, and inline animation styles inject runtime `<style>`/attributes. How strict?
- [x] A) `'self' 'unsafe-inline'` globally (pragmatic — inline styles are unavoidable with the current stack)
- [ ] B) `'self'` + nonce/hash, refactor inline styles out where feasible
- [ ] C) Strict `'self'` on static rooms, `'unsafe-inline'` only on animated rooms
- [ ] Other: __________________________________________
> USER NOTES:

---

## B. Remote images vs bundled assets (`img-src` — the real per-game surface)

### Q4. `next.config.mjs` allowlists 5 remote image hosts (wikimedia, dzcdn, tmdb, espncdn, flagcdn). CSP `img-src` should mirror this — but which games actually pull remote images?
| game | remote image use (best guess) | keep remote / bundle / N/A |
|------|-------------------------------|----------------------------|
| clock (Chronos) | event/photo thumbnails? | keep remote |
| streak (Ignite) | comparison item images? | keep remote |
| map (Atlas) | flags (flagcdn), raster basemap (wikimedia) | keep remote |
| mystery (Sanctum) | TMDB posters / stills | keep remote |
| wedges (Fractures) | category art? | keep remote |
| thread (Thread) | — | keep remote |
| seance (Seance) | — | keep remote |
| board/daily/gauntlet/ladder | mixed clue media | keep remote |
- [x] A) `img-src 'self' data:` + the exact 5 allowlisted hosts, everywhere
- [ ] B) Per-route `img-src`: only the hosts a given room can render (map gets flagcdn+wikimedia, mystery gets tmdb, etc.)
- [ ] C) `'self' data:` only — no remote images at all; bundle/proxy every clue image locally
- [ ] Other: __________________________________________
> USER NOTES:

### Q5. When a remote clue image is blocked/offline, what does each game show? (floor: the frame must stay complete without it)
- [ ] A) A bundled placeholder card (suit glyph + category color) — image is pure garnish
- [x] B) Reflow to text-only question, no image slot at all
- [ ] C) Per-game: Sanctum/Atlas degrade to placeholder art; others were text-only anyway
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q6. Should remote clue images be proxied/cached through the app (same-origin) instead of hotlinked, to shrink `img-src` toward `'self'`?
- [ ] A) No — hotlink via `next/image` from the allowlisted hosts (current approach)
- [x] B) Yes for the nightly-forged bank — snapshot images into `public/` at forge time, serve `'self'`
- [ ] C) Only for the daily/board hero clue; hotlink the rest
- [ ] Other: __________________________________________
> USER NOTES:

---

## C. THE MAP raster-basemap exception (the one sanctioned tile-dep)

### Q7. The raster basemap is hotlinked from `upload.wikimedia.org` and probed with fallback (`WorldMap.tsx`). Is Atlas the ONLY room allowed this exception?
- [ ] A) Yes — Atlas only; no other room may add a remote-media progressive upgrade
- [ ] B) Extend the same pattern to any room with a "postcard" hero (Sanctum locale shots), same rules (keyless, probed, degrades)
- [ ] C) Atlas only, AND vendor the raster locally (see Q8) so even it needs no remote host
- [ ] Other: N/A, No more map tiles.
> USER NOTES:

### Q8. Keep the raster hotlinked, or bundle it into `public/` for a fully offline upgrade?
- [ ] A) Keep hotlinked from wikimedia (zero repo weight, needs network + `img-src` host)
- [ ] B) Vendor a compressed equirectangular JPG into `public/` — upgrade works offline, `img-src 'self'`
- [ ] C) Bundle a low-res version locally, hotlink a hi-res upgrade when reachable
- [ ] Other: N/A, No more map tiles.
> USER NOTES:

### Q9. The raster probe issues a network request (`img.src` timeout). Should CSP `connect-src`/`img-src` gate that probe, and should it be env-flagged off?
- [ ] A) Probe always on; `img-src` allows wikimedia; no env flag
- [ ] B) Keep the existing env gate; probe only when the basemap flag is set (offline builds never reach out)
- [ ] C) Probe on but `connect-src 'self'` — rely on the `<img>` load, no `fetch` HEAD probe
- [ ] Other: N/A, No more map tiles.
> USER NOTES:

---

## D. Offline / bundled-asset scope per game

### Q10. `public/` already bundles the offline lifeblood (`seed-questions.json`, `star-catalog.json`, `mansion-map.jpg`, `overture-melodies.json`, `audio/`). Which games depend on a bundled asset to render their FLOOR frame?
| game | bundled dep it needs offline | confirm / add / none |
|------|------------------------------|----------------------|
| map (Atlas) | world-atlas polygons + `star-catalog.json` | confirm |
| clock (Chronos) | seed bank only | confirm |
| streak (Ignite) | seed bank only | confirm |
| mystery (Sanctum) | seed bank (+ any locale art?) | confirm/add |
| seance (Seance) | seed bank only | confirm |
| overture / home | `mansion-map.jpg`, `overture-melodies.json` | confirm/add |
- [ ] A) The current bundle is exactly right — no game needs more
- [x] B) Add a specific per-game bundled asset (name it in notes)
- [ ] Other: __________________________________________
> USER NOTES (which asset, which game): maybe more art for sanctum and overture/home

### Q11. `world-atlas` land polygons are lazy-fetched at runtime (`WorldMap.tsx`, ~50–80 KB). For a true zero-network Atlas floor, keep lazy or inline?
- [ ] A) Keep lazy-fetched from same-origin `public/` (already `'self'`, fine offline after first load)
- [ ] B) Import at build so it ships in the JS bundle (no fetch at all, bigger bundle)
- [ ] C) Lazy, but precache via service worker so repeat offline visits never miss
- [ ] Other: N/A, No more map tiles.
> USER NOTES:

### Q12. Should there be a service worker / offline cache, and if so scoped to which rooms?
- [ ] A) None — rely on the seed bank + bundled `public/` assets; app is already zero-env playable
- [x] B) SW that precaches the app shell + `seed-questions.json` so all rooms work fully offline after first visit
- [x] C) SW scoped to the asset-heavy rooms only (Atlas polygons/star-catalog, overture melodies)
- [ ] Other: __________________________________________
> USER NOTES (per game if scoped):

---

## E. Fonts, media, and third-party CSP surface

### Q13. Cinzel loads via `next/font/google` (downloaded at build, self-hosted). Confirm `font-src` posture and any per-room display font:
- [x] A) `font-src 'self'` only — all fonts self-hosted at build, no runtime font CDN (matches current)
- [ ] B) Same, plus `data:` for any inline-encoded icon font
- [ ] C) A room wants a distinct display face — name it, still self-hosted
- [ ] Other: __________________________________________
> USER NOTES (per game if a room adds a face):

### Q14. `media-src` — audio beds/SFX live in `public/audio/` (same-origin). Any game that would stream audio from a remote host?
- [x] A) `media-src 'self'` everywhere — all audio bundled, no exceptions
- [x] B) `'self' data:` (for any base64/procedural-synth blobs)
- [ ] C) A specific room streams remote audio — name it and its host
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q15. `frame-src` / `object-src` / embeds — does any game embed third-party content (YouTube clue, map iframe, tweet)?
- [x] A) No embeds anywhere — `frame-src 'none'`, `object-src 'none'` (strictest, matches current design)
- [ ] B) One room needs an embed (name room + host) — allowlist just that host on just that route
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q16. `connect-src` — the read-only Neon DB call and any client fetch. What's allowed?
- [x] A) `'self'` only — all data server-fetched; client never calls out (map probe uses `<img>`, not fetch)
- [x] B) `'self'` + the Neon serverless host (if any client-side query exists)
- [ ] C) `'self'` + analytics/telemetry host (name it)
- [ ] Other: __________________________________________
> USER NOTES:

---

## F. Enforcement, reporting, degradation

### Q17. Roll out CSP in report-only first, or enforce immediately?
- [x] A) `Content-Security-Policy-Report-Only` first, watch violations, then flip to enforcing
- [ ] B) Enforce immediately — the app is small and self-contained, violations are known
- [ ] C) Report-only on the WebGL/motion rooms (highest inline-risk), enforce on static rooms
- [ ] Other: __________________________________________
> USER NOTES:

### Q18. If CSP blocks an optional asset (remote image, raster basemap), the room must still be complete (floor). Which failure mode is acceptable per game?
- [x] A) Silent degrade to the bundled floor frame — no console error surfaced to player
- [ ] B) Silent degrade + a dev-only warning (only in `NODE_ENV=development`)
- [x] C) Per game: Atlas silently drops the raster; Sanctum swaps to placeholder art; others unaffected
- [ ] Other: __________________________________________
> USER NOTES (per game):

### Q19. Other CSP/offline security headers to ship alongside (integration-wide, not per-game)?
- [x] A) Add `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`
- [ ] B) Just the CSP for now, add the rest later
- [x] C) CSP + `Permissions-Policy` locking down camera/mic/geolocation (no room needs them)
- [ ] Other: __________________________________________
> USER NOTES:
