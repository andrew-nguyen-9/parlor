# /ui-qa /map — 2026-07-02 · 1280x800 + 360x800
functionality
- 🟢 click → pin, LOCK IT IN enables and scores — 0 errors; offline polygon fallback untouched
aesthetics
- 🟡 FIXED: Indus Valley chip glyph was 卐 (reads as swastika out of context) — `lib/civilizations.ts:154` — now ≋ river glyph w/ comment
- 🟡 raster basemap's saturated blue ocean is the least PARLOR surface in the app — fix: sepia/duotone CSS filter on the raster layer (backlog, S-M)
mobile
- 🟢 0 h-scroll, lock CTA ≥44px
verdict: ship (after fix)
