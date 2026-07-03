# qa-sweep backlog — big findings (not built; route | finding | suggested fix | effort)
- all rooms | raw emoji as icons (board category 🕵×5, gauntlet trials ⛓️⏳⚖️🗺️, mystery suspect avatars, overture header chip, thread 🧵) — rubric slop tell | one engraved/duotone motif set from the seal vocabulary (spade, eye, flame, glyph ring), swap per room | M
- site-wide | body text is default sans; DESIGN_SYSTEM wants readable companion serif for body/questions | pick serif (e.g. Source Serif/Newsreader), wire tailwind fontFamily.body, legibility regression pass | S-M
- /clock | native range slider: near-white track off-token both themes | styled track/thumb on line+brass tokens (accent-color or webkit-slider CSS) | S
- /map | raster hybrid basemap ocean = saturated atlas blue, off the jewel-ink palette | sepia/duotone filter on raster layer only (keep polygon fallback untouched) | S-M
- /seance /cold-case /ladder | dense-grid taps 24/28/31px <44 | spacing rework or tap-slop hit areas; e4 judged playability>pixel — revisit only w/ design pass | M
- home | deck cards h-scroll ticker at top duplicates footer data credits | fold into one credits surface | S
