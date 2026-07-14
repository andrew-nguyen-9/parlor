# PARLOR — CORE Design-Intake Questionnaire (game-agnostic)

> **For the USER to review.** This is the **reusable CORE** questionnaire — settings, motion, audio,
> performance/delivery, mobile, premium polish — shared verbatim by every future PARLOR game glow-up.
> Each question is pre-filled with my **recommended `[x]` pick** (bold, v4-led, Apple-fy), a `> WHY:`
> rationale, and a blank `> USER NOTES:` line. **The recommended picks ARE the assumed spec.** Accept all →
> zero re-brief; override any via its notes line → re-briefs only the affected unit. Authoring rules +
> doctrine + Floors: `docs/planning/design-intake/AUTHORING.md`.
>
> **~280 questions**, 6 sections. Format/doctrine: see AUTHORING.md.

## Contents
- **C1 · Settings & the SettingsHub** — the global settings surface (E0 drives this)
- **C2 · Motion & Animation** — motion budget, easing, reduced-motion
- **C3 · Audio system** — beds, SFX, stingers, volume/mute, autoplay
- **C4 · Performance & Delivery** — render strategy, Vercel meters, caching (E5-delivery)
- **C5 · Mobile & Responsive** — breakpoints, targets, drawers, safe-areas
- **C6 · Premium polish & Apple-fy** — depth, spacing, type, color grading

---

## C1 · Settings & the SettingsHub

> **Game-agnostic CORE.** Today PARLOR scatters three separate fixed pills — `ThemeToggle` (bottom-right,
> dark/light), `TextSizeControl` (bottom-left, S/M/L), and an unmounted `SoundToggle` (mute-only) — plus a
> per-game `useBoardSettings` blob (`parlor.board.settings`: textSize + reducedMotion + hints) that duplicates
> two of them. This section designs the single **SettingsHub** every future game reuses: one trigger, one
> surface, one persistence contract, folding the loose toggles in rather than adding a fifth control. Answer in
> `> USER NOTES:`; every question already carries the recommended pick.

---

## The SettingsHub surface

### Q: Where does the settings trigger live?
- [ ] A) Keep the scattered corner pills; no consolidated hub
- [x] B) One gear icon in the `RoomShell` header, top-right beside the rank badge (with a matching mount in the lobby header)
- [ ] C) A floating action button pinned to a screen corner, above the "Lobby" link
- [ ] Other: __________________________________________
> WHY: Apple-fy = restraint — one deliberate control in the engraved nameplate row reads as chrome, not clutter, and `RoomShell` already owns that header for every room, so one edit covers all 11 games.
> USER NOTES:

### Q: What glyph marks the trigger?
- [x] A) A gear/cog ⚙ — the universally-read "settings" affordance
- [ ] B) Sliders/faders icon (hints at the mixer inside)
- [ ] C) A themed brass medallion unique per skin
- [ ] Other: __________________________________________
> WHY: Discoverability beats cleverness for a utility control; a per-skin glyph would fight the "instantly findable" job. The brass tone comes free from the existing header styling.
> USER NOTES:

### Q: Is the trigger present everywhere, or only inside game rooms?
- [x] A) Global — mounted in `RoomShell` (all rooms) AND the lobby/home header, same position
- [ ] B) Rooms only; the lobby keeps the old corner pills
- [ ] C) Rooms only; no settings on the lobby at all
- [ ] Other: __________________________________________
> WHY: Theme/text-size/contrast are app-wide preferences a returning player expects to set from the front door; one consistent anchor across surfaces is the Apple pattern and avoids two competing settings UIs.
> USER NOTES:

### Q: What form does the hub take when opened?
- [ ] A) Centered modal dialog over a scrim
- [x] B) An edge sheet — right-side drawer on `lg:`+, bottom sheet on phone (responsive to the same breakpoint the app already uses)
- [ ] C) Full-screen takeover page
- [ ] Other: __________________________________________
> WHY: A sheet keeps the room visible behind it (settings apply live against real content) and matches platform muscle memory — right rail on desktop, thumb-reachable bottom sheet on mobile-first PARLOR. Full-screen is heavier than these few controls warrant.
> USER NOTES:

### Q: How much of the viewport does the panel occupy?
- [x] A) A restrained fixed-width panel (~360–400px desktop; ~85vh capped bottom sheet on phone) — never edge-to-edge on desktop
- [ ] B) Half the viewport width
- [ ] C) Auto-sized to content, floating card
- [ ] Other: __________________________________________
> WHY: Restraint + a stable measure; a narrow column keeps control rows scannable and leaves the room readable behind the scrim (one light source, generous spacing). A fixed width also stops layout reflow as sections expand.
> USER NOTES:

### Q: How does the hub open and close?
- [x] A) Slide in from its edge with a fading scrim, finite ≤300ms on the skin's motion curve; reverse on close
- [ ] B) Instant appear/disappear, no transition
- [ ] C) Scale-and-fade from the gear's position
- [ ] Other: __________________________________________
> WHY: A slow deliberate slide is the Apple-fy material read; ≤300ms honors the finite-motion budget and reuses `--skin-motion-duration`/`-ease`. Calm mode collapses it to a plain fade (see the a11y section) so the effect is optional garnish.
> USER NOTES:

### Q: What does the backdrop behind the sheet do?
- [x] A) Dim the room and apply a light backdrop-blur, dismissing on tap
- [ ] B) Fully opaque overlay (room hidden)
- [ ] C) No scrim — the room stays fully lit and interactive
- [ ] Other: __________________________________________
> WHY: Dim + blur focuses attention on the panel while keeping the room legible for live preview, reinforcing the single-light-source depth language; tap-to-dismiss is the expected sheet gesture. Opaque would hide the very content the settings are previewing.
> USER NOTES:

### Q: Which close affordances does the hub offer?
- [x] A) All of: an explicit ✕ button, `Esc` key, backdrop tap, and swipe-down on the mobile bottom sheet
- [ ] B) ✕ button only
- [ ] C) Backdrop tap only (no visible ✕)
- [ ] Other: __________________________________________
> WHY: Redundant, conventional exits are an accessibility and forgiveness baseline (keyboard `Esc`, pointer ✕, touch swipe) — no single required gesture. This is one coherent affordance set, not four competing ideas.
> USER NOTES:

---

## What the hub holds

### Q: How is the theme control presented?
- [x] A) A three-way segmented control: Dark · Light · System (System = follow OS, the current no-flash default)
- [ ] B) Keep the two-state Dark/Light toggle only
- [ ] C) A per-skin theme picker with more than two palettes
- [ ] Other: __________________________________________
> WHY: The no-flash script in `layout.tsx` already resolves `stored → system → dark`, but `ThemeToggle` never exposed "System" — adding it is the v4-led upgrade that lets the app track a player's OS light/dark schedule. Extra palettes belong to the skin layer, not user settings.
> USER NOTES:

### Q: How many text-size steps, and what range?
- [x] A) Keep the existing three S/M/L (0.9 / 1.0 / 1.15 `--text-scale`) — reuse `useTextSize` verbatim
- [x] B) Add an XL step (~1.3) for a four-way control
- [ ] C) A continuous slider
- [x] Other: Add an XS step as well
> WHY: S/M/L already ships with a synced no-flash script and covers the practical legibility range; discrete steps are more predictable than a slider and avoid re-authoring the pre-paint mirror. XL can be added later without changing the hub's shape.
> USER NOTES:

### Q: Does sound get a volume control, or stay mute-only?
- [x] A) A master volume slider plus a mute toggle (mute overrides; the slider remembers its level)
- [ ] B) Mute-only, exactly as `SoundToggle` today
- [ ] C) Off / Quiet / Full three-step, no continuous slider
- [ ] Other: __________________________________________
> WHY: The v4 audio ambition (beds + synthesized SFX) deserves level control, not a binary; `lib/sound.ts` already centralizes mute state so adding a gain multiplier is cheap and asset-free. Mute stays as the fast panic-off.
> USER NOTES:

### Q: One master level, or split music vs SFX?
- [x] A) A single master level (+ mute) — one fader
- [ ] B) Separate Music and SFX faders
- [ ] C) Master + a music-only mute
- [ ] Other: __________________________________________
> WHY: Restraint — most players want one "quieter/louder," and the synthesized engine is small; a split mixer is complexity the audio design doesn't yet earn. Can subdivide later behind the same row.
> USER NOTES:

### Q: Is there an explicit reduced-motion override ("Calm mode")?
- [x] A) Yes — a global Calm mode toggle that OR's with the OS `prefers-reduced-motion` (default: follow OS)
- [ ] B) No — rely solely on the OS media query
- [ ] C) Calm mode replaces, rather than OR's with, the OS setting
- [ ] Other: __________________________________________
> WHY: `useBoardSettings.reducedMotion` already proves the OR-with-OS pattern per-game; promoting it to a global gives players who can't change their OS setting an in-app escape hatch — accessible by construction. OR (never replace) so the OS preference can only ever *add* calm.
> USER NOTES:

### Q: Is there an atmosphere / visual-quality control for ambient effects?
- [x] A) Yes — an Atmosphere tier: Full · Reduced · Off (dials particle density, glows, ambient beds; default Full)
- [ ] B) No such control; atmosphere is fixed per room
- [ ] C) Fold it entirely into Calm mode
- [ ] Other: __________________________________________
> WHY: v4 wants full-bleed immersion by default (bold), but a low-power/low-distraction escape valve keeps the 3D/WebGL rooms comfortable and battery-kind. It's a lever the seed-bank frame ignores, so the offline floor is untouched.
> USER NOTES:

### Q: Are Atmosphere and Calm mode separate controls, or one combined dial?
- [x] A) Separate — Calm governs *motion*; Atmosphere governs *visual/audio richness* (two independent axes)
- [ ] B) One combined "Immersion" dial
- [ ] C) Only Calm mode; no separate Atmosphere
- [ ] Other: __________________________________________
> WHY: They answer different needs — a vestibular-sensitive player wants motion killed but may keep rich static atmosphere; a low-end device wants effects thinned but not motion frozen. Conflating them removes valid combinations.
> USER NOTES:

### Q: Is there a high-contrast toggle?
- [x] A) Yes — a high-contrast mode that thickens borders and raises text/UI contrast within both themes (default off)
- [ ] B) No; rely on the AA-computed tokens alone
- [ ] C) A separate high-contrast *theme* rather than a modifier
- [ ] Other: __________________________________________
> WHY: The AA contrast Floor is the baseline, not the ceiling; an opt-in AAA-leaning mode serves low-vision players. As a modifier (not a third theme) it composes with Dark/Light and stays inside the skin-seam model rather than forking palettes.
> USER NOTES:

### Q: Is there a haptics toggle for touch devices?
- [x] A) Yes — a haptic-feedback toggle (default on where the device supports vibration), shown only on touch capable devices
- [ ] B) No haptics control
- [ ] C) Haptics always on, no toggle
- [ ] Other: __________________________________________
> WHY: Subtle vibration on confirms/wrong-answers deepens the tactile ritual on mobile-first PARLOR, but some players find it intrusive — a toggle respects both. Hiding it on non-touch devices keeps the hub uncluttered.
> USER NOTES:

### Q: Do changes apply instantly, or on an "Apply"/"Save" press?
- [x] A) Instantly and live — the room behind the scrim updates as you move each control
- [ ] B) Batched behind an explicit Apply button
- [ ] C) Instant for visual settings, Apply for audio
- [ ] Other: __________________________________________
> WHY: Live preview is the whole reason to keep the room visible behind the sheet; immediate feedback is the modern, Apple-fy expectation and matches how `ThemeToggle`/`TextSizeControl` already behave. No Apply step to forget.
> USER NOTES:

### Q: What affordance do the discrete controls (theme, text, atmosphere) use?
- [x] A) Segmented button-groups (radio semantics) — the pattern `TextSizeControl` already uses
- [ ] B) Native `<select>` dropdowns
- [ ] C) Cycle buttons (tap to advance through states)
- [ ] Other: __________________________________________
> WHY: Segmented groups show all states at once (no hidden options), give each a ≥44px hit target, and carry clean radio keyboard semantics — consistent with the shipped text-size control. Dropdowns hide choices; cycle buttons obscure the current position.
> USER NOTES:

### Q: How are the controls grouped inside the sheet?
- [x] A) Into labelled sections — Appearance (theme, contrast, text) · Motion (calm, atmosphere) · Sound (volume, haptics)
- [ ] B) One flat ungrouped list
- [ ] C) Tabs, one section per tab
- [ ] Other: __________________________________________
> WHY: A few clearly-titled groups aid scanning and screen-reader navigation without the overhead of tabs (which hide controls). Grouping also future-proofs the hub as games contribute rows. Restraint: sections, not chrome.
> USER NOTES:

---

## Reconciling the existing toggles

### Q: What happens to the three scattered corner pills?
- [x] A) Fold ThemeToggle, TextSizeControl, and SoundToggle into the hub and remove the loose fixed pills
- [ ] B) Keep the pills AND add the hub (both entry points)
- [ ] C) Keep the pills; the hub only adds the *new* controls
- [ ] Other: __________________________________________
> WHY: Two settings surfaces is the anti-pattern this section exists to fix; one hub is less chrome and frees the fixed corners (the "Lobby" link and rank badge already live there). v4-led consolidation over incremental accretion.
> USER NOTES:

### Q: Extend the existing modules or write a fresh settings store?
- [x] A) Extend — reuse `theme.ts` no-flash contract, `useTextSize`, and `lib/sound.ts`; add new hooks alongside
- [ ] B) A single new `useSettings` store that replaces all of them
- [ ] C) A runtime context/provider holding all settings in React state
- [ ] Other: __________________________________________
> WHY: The shipped modules already solve the hard parts (pre-paint hydration, synced multipliers, module-level mute flag for game loops); rewriting risks reintroducing flash. A React-only provider would break the no-flash guarantee. Extend, don't duplicate.
> USER NOTES:

### Q: The per-game `boardSettings.textSize` duplicates the global text size. Resolve how?
- [x] A) Deprecate the per-game copy — Board reads the global text size; one source of truth
- [ ] B) Keep both; per-game overrides global when set
- [ ] C) Keep per-game only for Board, global for everything else
- [ ] Other: __________________________________________
> WHY: Two text-size values for the same eyes is confusing and violates single-source discipline; text size is a person-level accessibility preference, not a per-game taste. Migrate Board to `useTextSize` and drop the field.
> USER NOTES:

### Q: `boardSettings.reducedMotion` is a per-game motion override. Resolve how?
- [x] A) Migrate it to the global Calm mode (delete the per-game flag; games read the global)
- [ ] B) Keep per-game motion overrides in addition to global Calm
- [ ] C) Global Calm plus an optional per-game "extra effects" opt-in
- [ ] Other: __________________________________________
> WHY: Reduced-motion is an accessibility need that spans the whole app, not one room; a single global Calm (OR'd with OS) is easier to reason about and guarantees no room can silently re-enable motion a player disabled.
> USER NOTES:

### Q: `boardSettings.hints` (blurred-image clues / extra help) is genuinely game-specific. Where does it belong?
- [x] A) Stays a per-game setting, NOT in the core hub — the core hub holds only game-agnostic prefs
- [ ] B) Promote it to a generic "Hints" toggle in the global hub
- [ ] C) Add a per-game section inside the hub for room-specific toggles
- [ ] Other: __________________________________________
> WHY: A blurred-image hint means nothing to Séance or Chronos; forcing it global would pollute the reusable hub. Keeping the CORE hub strictly game-agnostic is the whole point of C1 — per-game toggles live in their own room UI.
> USER NOTES:

### Q: localStorage keys are inconsistent (`parlor.theme`, `parlor.textsize` dot-style vs `parlor:muted` colon-style). Unify?
- [x] A) Standardize on the dotted `parlor.<setting>` namespace; new keys follow it
- [ ] B) Standardize on the colon `parlor:<setting>` form
- [ ] C) Leave each as-is; no convention
- [ ] Other: __________________________________________
> WHY: Two of three keys already use dots and the no-flash scripts read them; picking the majority form minimizes churn and gives future settings a predictable prefix. `parlor:muted` becomes `parlor.muted` under a one-time migration (next question).
> USER NOTES:

### Q: How are old/renamed keys handled for returning players?
- [x] A) One-time silent migration on first load (copy old key → new, keep reading old as a fallback), no data loss
- [ ] B) Hard cut — ignore old keys; returning players reset to defaults
- [ ] C) Read both key forms indefinitely, never migrate
- [ ] Other: __________________________________________
> WHY: A returning player shouldn't lose their theme/mute choice to a refactor; a guarded copy-forward is invisible and cheap. Reading the old key as a fallback covers the migration edge with zero flash.
> USER NOTES:

### Q: Volume/mute currently has no global mount (`SoundToggle` is unmounted). Where does audio control live now?
- [x] A) The hub is the sole home for volume + mute; no separate global sound pill
- [ ] B) Re-mount `SoundToggle` as a corner pill in addition to the hub
- [ ] C) Per-room sound toggles instead of a global one
- [ ] Other: __________________________________________
> WHY: Consolidation is consistent with folding the other pills in; `lib/sound.ts` mute state is already global, so the hub row drives it directly. One audio control, discoverable in the same place as everything else.
> USER NOTES:

---

## Persistence, hydration & first-run

### Q: How is settings state stored?
- [x] A) Flat, individually-namespaced keys (`parlor.theme`, `parlor.textsize`, `parlor.muted`, `parlor.calm`, …)
- [ ] B) One JSON blob under a single `parlor.settings` key
- [ ] C) A blob for new settings, flat keys for the legacy three
- [ ] Other: __________________________________________
> WHY: The pre-paint no-flash inline scripts must read values with a tiny synchronous `localStorage.getItem` before React exists — flat keys keep those one-liners trivial, whereas a blob would force JSON-parsing in the critical pre-paint path. Matches the shipped pattern.
> USER NOTES:

### Q: Which settings get a pre-paint no-flash inline script in `layout.tsx`?
- [x] A) Everything that affects first paint — theme, text size, high-contrast, and Calm mode — each applied to `<html>` before render
- [ ] B) Only theme (as today)
- [ ] C) None — hydrate all settings in React after mount
- [ ] Other: __________________________________________
> WHY: Any setting that changes the initial visual (contrast class, calm-mode data attribute, text scale) must resolve before paint or it flashes — the exact flash Floor the theme script already prevents. Volume/atmosphere/haptics don't touch first paint and can hydrate late.
> USER NOTES:

### Q: First-run default for theme?
- [x] A) System (follow OS light/dark), falling back to Dark — the current no-flash default
- [ ] B) Always Dark
- [ ] C) Always Light
- [ ] Other: __________________________________________
> WHY: Preserves today's resolution order and respects the player's device preference on first contact; Dark remains the fallback that matches PARLOR's candlelit anchor when no OS signal exists.
> USER NOTES:

### Q: First-run default for sound?
- [x] A) Muted (matches `lib/sound.ts` default and browser autoplay rules)
- [ ] B) Unmuted at full volume
- [ ] C) Unmuted at a low default level
- [ ] Other: __________________________________________
> WHY: Browsers block autoplay and an unexpected sound is hostile; muted-by-default is both the shipped behavior and the courteous one. Self-consistency: no section elsewhere may assume an ambient bed autoplays.
> USER NOTES:

### Q: First-run defaults for Calm mode and Atmosphere?
- [x] A) Calm = follow OS (no forced override); Atmosphere = Full — bold immersion out of the box
- [ ] B) Calm on and Atmosphere Reduced by default (conservative)
- [ ] C) Calm off (ignore OS) and Atmosphere Full
- [ ] Other: __________________________________________
> WHY: v4-led — a new player should meet the full-bleed premium experience, while OS-driven Calm still protects motion-sensitive players automatically without opting everyone into a thinner default.
> USER NOTES:

### Q: Is there a "Reset to defaults" action?
- [x] A) Yes — a clearly-labelled reset at the bottom of the hub
- [ ] B) No reset action
- [ ] C) Reset only reachable via a hidden/long-press gesture
- [ ] Other: __________________________________________
> WHY: A one-tap escape from a confusing state is basic forgiveness; placing it last keeps it out of the way of everyday toggles. Discoverable, not hidden.
> USER NOTES:

### Q: What is the scope of a reset?
- [x] A) Resets all core settings at once, with a brief inline confirm ("Reset all settings?") to prevent accidents
- [ ] B) Per-section resets (reset just Appearance, just Sound, …)
- [ ] C) All at once, no confirmation
- [ ] Other: __________________________________________
> WHY: A single all-settings reset is the mental model players expect; a lightweight confirm guards the destructive tap without a heavy modal. Per-section resets add UI for a rare need.
> USER NOTES:

### Q: Do settings sync across open tabs?
- [x] A) Yes — listen for the `storage` event so a change in one tab updates others live
- [ ] B) No cross-tab sync; each tab reads on load only
- [ ] C) Sync on next navigation, not live
- [ ] Other: __________________________________________
> WHY: The `storage` event is free and keeps a multi-tab player consistent (theme flipped in one tab shouldn't leave another stale). Cheap craft, no dependency, and it composes with the existing localStorage writes.
> USER NOTES:

---

## Accessibility of the hub

### Q: What dialog semantics does the sheet carry?
- [x] A) `role="dialog"` + `aria-modal="true"` + `aria-labelledby` the panel title; focus trapped inside; focus returns to the gear on close
- [ ] B) A plain `<div>` overlay with no dialog role
- [ ] C) Dialog role but no focus trap or focus return
- [ ] Other: __________________________________________
> WHY: A modal surface must announce itself, contain focus, and restore it on dismiss or keyboard users get lost behind the scrim — standard dialog a11y. This is table stakes for any overlay in the app.
> USER NOTES:

### Q: What keyboard model does the hub support?
- [x] A) `Esc` closes; `Tab`/`Shift+Tab` cycle within the trap; arrow keys move within each segmented group
- [ ] B) `Tab` navigation only, no `Esc`
- [ ] C) Mouse/touch only
- [ ] Other: __________________________________________
> WHY: Full keyboard operability is required for the hub to be usable without a pointer; arrow-within-group is the correct radio-group interaction for the segmented controls. `Esc` mirrors the close-affordance set.
> USER NOTES:

### Q: Are applied changes announced to assistive tech?
- [x] A) Yes — a polite `aria-live` region confirms each change ("Light theme", "Sound muted")
- [ ] B) No live announcement; the control's pressed state is enough
- [ ] C) Announce only theme changes
- [ ] Other: __________________________________________
> WHY: With live-apply, a screen-reader user needs confirmation the setting took effect since the visual result is invisible to them; a polite region announces without interrupting. Low cost, real inclusion.
> USER NOTES:

### Q: Does the hub's own open/close animation respect reduced motion?
- [x] A) Yes — Calm mode / OS `prefers-reduced-motion` collapses the slide to a plain instant/opacity change
- [ ] B) The sheet always slides regardless of motion settings
- [ ] C) The sheet has no animation for anyone
- [ ] Other: __________________________________________
> WHY: Every named animation needs a reduced-motion variant (Floor); the settings surface is where a motion-sensitive player goes, so it must itself be calm-aware. Consistent with the room animations it governs.
> USER NOTES:

### Q: How is each control labelled for screen readers?
- [x] A) Every control has a visible text label associated to its group (`aria-labelledby`/`aria-label`), and each segmented option a descriptive name ("Dark theme")
- [ ] B) Icon-only rows with terse `aria-label`s
- [ ] C) Visible labels but no programmatic association
- [ ] Other: __________________________________________
> WHY: Visible + programmatically-associated labels serve everyone and satisfy group semantics; the shipped `TextSizeControl` already labels each option this way, so it's the established pattern to extend.
> USER NOTES:

---

## Discoverability, iconography & labelling

### Q: Does a first-time visitor get a hint pointing at the gear?
- [x] A) A subtle one-time nudge (a small pulse or a dismissible "Settings" tooltip) on first visit, then never again
- [ ] B) No hint — rely on the gear's inherent recognizability
- [ ] C) A full coach-mark overlay walking through each control
- [ ] Other: __________________________________________
> WHY: A gear is discoverable enough that a coach-mark would be overkill (and fights restraint), but a one-time whisper helps returning players find the consolidated home of the toggles they used to see in the corners. Fires once, respects Calm mode.
> USER NOTES:

### Q: Is the trigger icon-only or labelled?
- [x] A) Icon-only in the header with an `aria-label`/tooltip "Settings"
- [ ] B) Icon + visible "Settings" text
- [ ] C) Text-only "Settings" link
- [ ] Other: __________________________________________
> WHY: The header row is tight and the gear is self-evident; an icon keeps the nameplate uncluttered while the `aria-label` and hover title preserve clarity. Matches the icon-forward treatment of the existing header controls.
> USER NOTES:

### Q: What voice do the control labels use?
- [x] A) Plain functional nouns ("Theme", "Text size", "Sound", "Motion") with luxe flavor reserved for option *values* ("Candlelight" / "Daylit tour")
- [ ] B) Fully themed labels throughout ("Ambience", "Illumination", "The Séance's hush")
- [ ] C) Terse system labels, no flavor anywhere
- [ ] Other: __________________________________________
> WHY: Settings are utility — clarity wins for the labels — but the existing theme values already carry PARLOR's voice ("candlelight"/"daylit tour" in `ThemeToggle`'s title), so flavor lives at the value level without sacrificing scannability. Elegant, not campy.
> USER NOTES:

### Q: Do control rows carry per-row icons or text alone?
- [x] A) A small leading glyph per row (☀/☾, A, ♪, ✦) beside the text label
- [ ] B) Text labels only, no row icons
- [ ] C) Icons only, no text
- [ ] Other: __________________________________________
> WHY: A leading glyph speeds scanning and gives each group an anchor, while the text label keeps it unambiguous — icon + label together (never icon alone), consistent with the app's category triple-encoding instinct.
> USER NOTES:

### Q: Does the trigger show when a non-default setting is active?
- [x] A) A subtle indicator dot on the gear when any setting differs from its default
- [ ] B) No indicator — the gear looks identical always
- [ ] C) A count badge of how many settings changed
- [ ] Other: __________________________________________
> WHY: A quiet dot reassures a player their preferences are applied and hints the hub is "theirs" without shouting; a numeric count is noise for a personal-preference surface. Subtle, in keeping with restraint.
> USER NOTES:

### Q: How is grouping expressed visually inside the sheet?
- [x] A) Titled sections separated by hairline `brass-rule` dividers (reusing the header's existing rule treatment)
- [ ] B) A flat list with no dividers
- [ ] C) Cards, one per group
- [ ] Other: __________________________________________
> WHY: Hairline dividers with small section titles read as engraved structure, not boxed chrome, and reuse the `brass-rule` already in `RoomShell` — depth through material, consistent with the mansion anchor. Cards would over-compartmentalize a short list.
> USER NOTES:

## C2 · Motion & Animation

> **For the USER to fill in.** Game-agnostic motion doctrine for every PARLOR room —
> philosophy, easing/durations, micro-interactions, page/modal/loading transitions,
> reduced-motion, and performance degrade. Every question already carries my recommended
> pick (`[x]`, v4-led: cinematic but disciplined). Accept it (zero re-brief) or override on
> the `> USER NOTES:` line. Combine only where options genuinely compose.
>
> **Locked floors — never a vote** (`design/INDEX.md §Floors`, `design/PATTERNS.md §Motion`):
> ≤1 infinite/looping animation per viewport · everything else finite ≤600ms · every named
> animation has a reduced-motion variant · animate only `transform`/`opacity`/`filter` (no
> layout/box-shadow thrash) · two easing curves only, no new ones · one light source
> (`--gold-sheet`) + max one cursor-tracked element (Streak's candle is the sanctioned second) ·
> the reduced-motion / no-JS / seed-bank frame renders complete on its own · SSR-safe (no
> `Math.random()` in render). Picks choose WITHIN these floors, never relax them.

## Philosophy — purpose, budget, character

### Q: What is PARLOR's overall motion character?
- [ ] A) Snappy/utilitarian everywhere — fast, minimal, gets out of the way
- [x] B) Tiered: slow-deliberate-cinematic for spatial & ceremonial moments (deal, flip, reveal, results); snappy (≤150ms) for feedback (press/hover/state)
- [x] C) Cinematic everywhere — every transition is a slow, weighty moment
- [ ] Other: __________________________________________
> WHY: v4's "slow deliberate cinematic" ceremony + Apple-fy restraint, but micro-feedback must feel instant — motion is purposeful, tiered by role, never uniformly slow.
> USER NOTES:

### Q: Policy on purely decorative motion (neither diegetic nor feedback)?
- [ ] A) Cut it — every animation is either the room's diegetic signature or it's feedback; anything else is removed
- [x] B) Allow tasteful ambient decoration (drifting particles, breathing surfaces) as garnish
- [ ] C) Allow it only on the home/lobby, not inside rooms
- [ ] Other: __________________________________________
> WHY: PATTERNS §Motion — "decorative motion that is neither diegetic nor feedback is cut"; protects the ≤1-loop budget.
> USER NOTES:

### Q: The one permitted looping animation per viewport — who owns it?
- [x] A) Reserved for the room's diegetic signature (flame/eye-glow/gears/stars); global chrome (nav, toasts, buttons) never loops
- [ ] B) Chrome may run a subtle ambient loop; rooms then go static
- [ ] C) Split the budget — a faint chrome loop plus a fainter room loop
- [ ] Other: __________________________________________
> WHY: budget is ≤1 loop per viewport (INDEX §Floors); the room signature is the sanctioned one, chrome stays finite.
> USER NOTES:

### Q: Which CSS properties may animate (GPU-cheap constraint)?
- [x] A) `transform` / `opacity` / `filter` only — never `width`/`height`/`top`/`left`/`box-shadow`/layout properties
- [x] B) Add animated `box-shadow`/`background-position` for richer material glints
- [x] C) Allow layout animation (height/margin) for accordions and reflow
- [ ] Other: __________________________________________
> WHY: perf floor (PATTERNS §Motion) — compositor-only props avoid layout thrash; gilt glints come from the fixed `--gold-sheet`, not animated shadows.
> USER NOTES:

### Q: Should motion actively direct attention (wayfinding / hierarchy)?
- [x] A) Yes — motion earns its place by guiding the eye to the state change and the next action; nothing gratuitous
- [ ] B) No — motion is atmosphere only; wayfinding is layout/color's job
- [ ] C) Only for errors and required next steps
- [ ] Other: __________________________________________
> WHY: purposeful-motion doctrine — an animation that doesn't clarify state or guide the next tap has no reason to exist.
> USER NOTES:

### Q: The first-load "wow" moment vs restraint?
- [x] A) One choreographed entrance per screen (deck deal-in / room settle), then calm — no repeated flourishes
- [x] B) A richer multi-beat opening sequence on every screen
- [ ] C) No entrance choreography — content just appears
- [ ] Other: __________________________________________
> WHY: Apple-fy = restraint + depth; the deck deal-in is the established single first-impression, and calm follows (no confetti-spam).
> USER NOTES:

### Q: Motion consistency across rooms vs per-room character?
- [x] A) Shared core vocabulary (durations, the two curves, reduced-motion path) is house-wide; each room adds exactly ONE signature within it
- [x] B) Fully per-room — each game invents its own timing/feel
- [ ] C) Fully uniform — no per-room signature motion at all
- [ ] Other: __________________________________________
> WHY: skins may declare a signature motion, but the Floors and easing/duration vocabulary are shared (PATTERNS §Skins/§Motion) — one system, one flourish each.
> USER NOTES:

## Easing curves & durations

### Q: The easing palette — how many curves?
- [x] A) Exactly two: entrances/exits `cubic-bezier(0.22,1,0.36,1)`; flips/3D `cubic-bezier(0.2,0.8,0.2,1)` — no new curves
- [x] B) Add a bouncy/overshoot curve for playful celebrations
- [x] C) Per-room custom curves declared via `--skin-motion-ease`
- [ ] Other: __________________________________________
> WHY: PATTERNS §Motion — "the only two, no new curves"; a shared curve pair is what makes rooms feel like one system.
> USER NOTES:

### Q: Standard transition length for state/color/opacity changes?
- [x] A) 200–350ms (default ~250ms)
- [ ] B) 100–150ms — near-instant everywhere
- [ ] C) 350–500ms — slower, more deliberate
- [ ] Other: __________________________________________
> WHY: PATTERNS duration bands — "transition 200–350ms"; ~250ms reads as intentional without feeling sluggish.
> USER NOTES:

### Q: Micro / press feedback duration?
- [x] A) 100–150ms
- [ ] B) <80ms (imperceptible, effectively instant)
- [ ] C) 200ms
- [ ] Other: __________________________________________
> WHY: PATTERNS bands — "micro/press 100–150ms"; PATTERNS interaction rule wants press perceived ≤150ms.
> USER NOTES:

### Q: Spatial moves (deal / flip / zoom / route) duration?
- [x] A) 300–500ms
- [ ] B) 200ms — keep even big moves fast
- [ ] C) 500–800ms for a truly cinematic weight
- [ ] Other: __________________________________________
> WHY: PATTERNS bands — "spatial 300–500ms"; the cinematic weight lives here, but stays under the 600ms finite ceiling.
> USER NOTES:

### Q: Spring physics vs tokened ease for interactive motion?
- [x] A) Tokened cubic-bezier ease for deterministic transitions; Framer spring ONLY for gesture-driven leaves (planchette/drag), always settling ≤600ms
- [x] B) Spring everywhere for a lively feel
- [ ] C) Ease everywhere, never spring
- [ ] Other: __________________________________________
> WHY: spring belongs to physical, pointer-weighted gesture; deterministic transitions use the shared curves; either way the finite-≤600ms floor holds.
> USER NOTES:

### Q: Stagger cadence for list/grid/reveal sequences?
- [x] A) 40–60ms per item, total sequence capped ≤600ms (overlap or cut when many items)
- [ ] B) 80–120ms per item for a slower, more theatrical cascade
- [ ] C) No stagger — all items appear together
- [ ] Other: __________________________________________
> WHY: a readable cascade that still obeys the finite-≤600ms floor; long lists compress rather than blow the budget.
> USER NOTES:

### Q: Entrance vs exit symmetry?
- [x] A) Exits ~0.7× the entrance duration, same curve — graceful arrival, snappy dismissal
- [ ] B) Perfectly symmetric enter/exit timing
- [ ] C) Exits instant (no exit animation)
- [ ] Other: __________________________________________
> WHY: faster exits read as responsive (the Apple pattern) without losing the composed arrival; reuses the shared curve.
> USER NOTES:

## Micro-interactions

### Q: Press / tap feedback?
- [x] A) Instant CSS press-state (scale/opacity shift, ≤150ms perceived)
- [ ] B) Delayed/eased press for a softer feel
- [ ] C) No visible press-state; rely on the result state only
- [ ] Other: __________________________________________
> WHY: PATTERNS interaction rules — "instant CSS press-state (≤150ms perceived)"; touch needs immediate acknowledgement.
> USER NOTES:

### Q: Hover feedback on desktop?
- [x] A) Subtle lift/tilt/sheen via `transform`+`filter`, gated to `@media (hover:hover)`; touch gets the pressed state instead
- [ ] B) Bold hover animation (color shift + scale + glow) on all pointers
- [ ] C) No hover feedback at all
- [ ] Other: __________________________________________
> WHY: PATTERNS §Mobile — hover is garnish, never information; tilt/lift only where a real hover exists, everything also reachable by tap/focus.
> USER NOTES:

### Q: Focus feedback for keyboard/AT users?
- [x] A) The one global `--c-focus` ring (2px + 2px offset); components thicken, never recolor; no motion required
- [ ] B) An animated pulsing focus ring
- [ ] C) A per-room colored focus treatment
- [ ] Other: __________________________________________
> WHY: focus Floor — one global ring, thicken never recolor; a static ring is the accessible, non-distracting default.
> USER NOTES:

### Q: Button shimmer / gilt sheen — looping or one-shot?
- [x] A) One-shot sheen on hover/press (finite ≤600ms), lit by the fixed `--gold-sheet` — never a continuous loop
- [ ] B) A slow continuous shimmer loop on primary CTAs
- [ ] C) No sheen — flat plates only
- [ ] Other: __________________________________________
> WHY: one light source + ≤1-loop budget — a continuous shimmer would spend the viewport's only loop on chrome; a triggered sheen keeps the loop for the room signature.
> USER NOTES:

### Q: Ripple-on-tap (material style) or a plate press?
- [x] A) No ripple — a restrained scale/opacity press fits the engraved brass-plate language
- [ ] B) Material-style expanding ripple from the tap point
- [ ] C) Ripple only on the primary CTA
- [ ] Other: __________________________________________
> WHY: Apple-fy restraint over material campiness (shape language: engraved plate = action); the plate press reads premium, the ripple reads templated.
> USER NOTES:

### Q: State-change transitions (selected / correct / wrong)?
- [x] A) Triple-encoded (color + shape/border + glyph/text) with a ≤300ms transition — never color-alone, never motion-only
- [ ] B) Color-only change, animated
- [ ] C) Instant swap, no transition
- [ ] Other: __________________________________________
> WHY: category/result triple-encode Floor — the meaning must survive with color vision differences AND reduced-motion; the ≤300ms ease is polish on top.
> USER NOTES:

### Q: Correct-answer celebration?
- [x] A) Restrained — a brief glyph bloom + the room's diegetic accent; confetti reserved for run/results moments only and reduced-motion-gated
- [ ] B) Confetti burst on every correct answer
- [ ] C) No celebration — just the correct state
- [ ] Other: __________________________________________
> WHY: Apple-fy "no confetti-spam"; celebration escalates only at genuine milestones, and even then degrades under reduced-motion.
> USER NOTES:

### Q: Wrong-answer feedback?
- [x] A) Short emphasis shake ≤300ms + ember-encoded message; reduced-motion → static ember state, no shake
- [ ] B) Long/large shake for stronger punishment feel
- [ ] C) No motion — color/text only
- [ ] Other: __________________________________________
> WHY: `ember` is the one danger token (paired icon/word at small size); the shake is finite and has its mandated reduced-motion static variant.
> USER NOTES:

### Q: List / grid entrance?
- [x] A) Staggered fade + rise (`opacity` + `translateY`), 40–60ms cadence, capped ≤600ms; reduced-motion → all appear at once, static
- [ ] B) Each item slides in from the side
- [ ] C) No entrance — items render in place
- [ ] Other: __________________________________________
> WHY: transform/opacity-only + stagger + finite floors; the reduced-motion collapse to a static grid is the designed fallback.
> USER NOTES:

### Q: Toggle / switch actuation?
- [x] A) Physical rounded-full switch slide (`transform`), 150–200ms ease
- [ ] B) Instant flip, no slide
- [ ] C) Bouncy overshoot on the knob
- [ ] Other: __________________________________________
> WHY: shape language round = switch (FOUNDATIONS §Shape); a short slide sells the physical switch without a new curve.
> USER NOTES:

## Page / modal / loading transitions

### Q: Route / page transitions?
- [x] A) Brief cross-fade + slight `translate`/`scale` settle (300–400ms) — not a hard cut, not a heavy full-screen slide
- [ ] B) Full directional page slide (like native stack navigation)
- [ ] C) Hard cut, no transition
- [ ] Other: __________________________________________
> WHY: spatial band + Apple calm; a soft settle keeps continuity, stays transform/opacity-only, and is SSR-safe.
> USER NOTES:

### Q: Entering a room from the deck?
- [x] A) The card zooms/settles into the RoomShell doorway (shared-element continuity), 300–500ms
- [ ] B) A generic page fade — no card→room link
- [ ] C) The card flips over into the room
- [ ] Other: __________________________________________
> WHY: hub-and-spoke deck→room model (PATTERNS §Navigation) — the shared-element move makes the deck feel like a real doorway, within the spatial band.
> USER NOTES:

### Q: Modal / dialog open-close?
- [x] A) Scale-up from ~0.96 + fade, backdrop dims; 250–300ms open, faster close
- [ ] B) Slide down from the top
- [ ] C) Instant appear
- [ ] Other: __________________________________________
> WHY: transition band + overlay rules (Esc/backdrop close, focus trap, return focus); scale+fade is the calm, transform-only entrance.
> USER NOTES:

### Q: Bottom sheet (mobile) open-close?
- [x] A) Slide up from the bottom edge (`translateY`) with a dim backdrop, ~300ms; drag-to-dismiss on touch
- [ ] B) Fade in centered like a desktop modal
- [ ] C) Full-screen takeover, no sheet
- [ ] Other: __________________________________________
> WHY: mobile-first sheet convention (PATTERNS §Mobile), transform-only, with a touch-native dismissal gesture.
> USER NOTES:

### Q: Backdrop / scrim behind overlays?
- [x] A) Fade a dim scrim (`opacity`) — no full-viewport blur >120px, no new `backdrop-filter` beyond the deck zoom
- [ ] B) Heavy blurred glass backdrop on every overlay
- [ ] C) No scrim — overlay floats over live content
- [ ] Other: __________________________________________
> WHY: perf floor (PATTERNS §Motion) — a fading scrim is compositor-cheap; large backdrop blurs are reserved and metered.
> USER NOTES:

### Q: Loading / skeleton motion?
- [x] A) Skeleton placeholders with a single subtle shimmer sweep (this counts as the viewport's one loop while loading); resolves to content with a fade
- [ ] B) A spinner over an empty screen
- [ ] C) Static skeleton, no shimmer at all
- [ ] Other: __________________________________________
> WHY: the shimmer is the only loop present pre-content, so it stays within budget; reduced-motion drops it to a static skeleton.
> USER NOTES:

### Q: Skeletons vs spinners as the default wait state?
- [x] A) Skeletons matching the final layout (no layout shift); a spinner only for indeterminate leaf waits
- [ ] B) Spinners everywhere — simpler
- [ ] C) Blank screen until content is ready
- [ ] Other: __________________________________________
> WHY: layout-matched skeletons improve perceived performance and avoid CLS; the seed-bank frame already renders complete, so waits are brief.
> USER NOTES:

### Q: In-screen content swap (tab / step / question change)?
- [x] A) Cross-fade + slight directional slide (≤300ms), `AnimatePresence` for the exit
- [ ] B) Instant swap
- [ ] C) Full slide carousel between steps
- [ ] Other: __________________________________________
> WHY: transition band; a small directional hint conveys forward/back without a heavy carousel, and the outgoing content exits cleanly.
> USER NOTES:

## Reduced-motion & calm mode

### Q: What does each animated effect degrade to under `prefers-reduced-motion`?
- [x] A) A designed static frame (loops freeze at a composed state) + instant state changes; essential feedback (focus/press/result) survives as non-moving
- [ ] B) Everything simply removed / blanked
- [ ] C) Everything slowed down instead of removed
- [ ] Other: __________________________________________
> WHY: reduced-motion is a designed state, not an afterthought (PATTERNS §Motion lusion rule) — freeze to a composed frame, keep the meaning.
> USER NOTES:

### Q: Reduced-motion authoring order?
- [x] A) Design the static frame FIRST, then animate on top; every room ships a composed still (Streak flame freezes mid-brightness, gears at their notch, stars still)
- [ ] B) Build the animation first, add a reduced-motion patch later
- [ ] C) Rely solely on the global `globals.css` kill-list
- [ ] Other: __________________________________________
> WHY: PATTERNS §Motion + FOUNDATIONS §3D — the static frame is the primary artifact; animation is the garnish over an already-complete still.
> USER NOTES:

### Q: An in-app "calm mode" toggle, independent of the OS setting?
- [x] A) Yes — an in-app calm-mode that forces the reduced-motion path, OR-ed with the OS setting (either one enables it)
- [ ] B) No — respect only the OS `prefers-reduced-motion`
- [ ] C) Yes, but it OVERRIDES the OS (can force motion back on)
- [ ] Other: __________________________________________
> WHY: accessibility by construction — users who can't change an OS flag (shared/kiosk devices) still get relief; OR-ing never lets an app setting re-enable motion the OS suppressed.
> USER NOTES:

### Q: Default state of calm mode?
- [x] A) Off by default; follows OS `prefers-reduced-motion` until manually set, then persisted (localStorage)
- [ ] B) On by default for everyone
- [ ] C) Session-only, never persisted
- [ ] Other: __________________________________________
> WHY: mirrors the theme-toggle pattern (system default + persisted manual override, SSR-safe); scores/settings live in localStorage, frontend never writes the DB.
> USER NOTES:

### Q: What survives reduced-motion (the essential-feedback list)?
- [x] A) Press / selected / focus / result state changes remain (as instant, non-animated); only decorative, looping, and spatial motion is removed
- [ ] B) Nothing — fully static, feedback is text-only
- [ ] C) Keep small animations, remove only big spatial ones
- [ ] Other: __________________________________________
> WHY: essential feedback must survive (a player still needs to see a tap registered and a result); results stay triple-encoded regardless of motion.
> USER NOTES:

### Q: Signature loops under reduced-motion?
- [x] A) Freeze at a designed frame (candle steady, gears at the notch, starfield still) — not paused mid-tween, not deleted
- [ ] B) Removed entirely (blank where the effect was)
- [ ] C) Slowed to a crawl but still looping
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §3D — reduced-motion renders one still frame, not a paused loop; the room still looks intentional and complete.
> USER NOTES:

### Q: Confetti / particles under reduced-motion?
- [x] A) Suppressed entirely; replaced by a static celebratory glyph/state
- [ ] B) Kept but with fewer particles
- [ ] C) Kept as-is
- [ ] Other: __________________________________________
> WHY: reduced-motion + no-spam — particle bursts are the archetypal motion to drop; a static glyph preserves the "you won" signal.
> USER NOTES:

### Q: Route / modal transitions under reduced-motion?
- [x] A) Instant opacity swap (no `translate`/`scale`); overlays appear/dismiss without spatial motion
- [ ] B) Keep the spatial move but faster
- [ ] C) Hard cut with no fade at all
- [ ] Other: __________________________________________
> WHY: kill-list behavior — remove the spatial component, keep a gentle opacity change so the swap still reads without disorienting motion.
> USER NOTES:

### Q: Does calm mode also touch audio / autoplay (cross-consistency)?
- [x] A) No — calm mode is motion-only; audio has its own mute (default muted), keep the two concerns separate
- [ ] B) Yes — calm mode also mutes all audio
- [ ] C) Calm mode enables audio (compensate for lost motion)
- [ ] Other: __________________________________________
> WHY: self-consistency (AUTHORING doctrine 5) — coupling unrelated settings surprises users; audio is already muted-by-default with its own toggle.
> USER NOTES:

## Performance auto-degrade & quality

### Q: Auto-degrade motion on weak devices?
- [x] A) Yes — detect low-end (DPR cap, `hardwareConcurrency` heuristics, dropped-frame monitor) and shed particle/shader budget first, then loops
- [ ] B) No — ship the same motion everywhere, trust the browser
- [ ] C) Only degrade the WebGL rooms, never the CSS ones
- [ ] Other: __________________________________________
> WHY: perf floor + GPU-cheap constraint; WebGL rooms already cap DPR ≤2 (FOUNDATIONS §3D), so extending graceful degradation to weak devices is consistent.
> USER NOTES:

### Q: What degrades first under a perf budget?
- [x] A) Order: particle count → shader/filter richness → the signature loop → down to the static frame
- [ ] B) Cut interactivity/feedback first, keep the ambiance
- [ ] C) Drop everything to static at the first dropped frame
- [ ] Other: __________________________________________
> WHY: garnish sheds first, legibility and feedback last — the static frame is the floor everything degrades toward, never a crash.
> USER NOTES:

### Q: A user-facing quality toggle?
- [x] A) Yes — a High / Balanced / Calm control (Calm == the reduced-motion path); default Balanced with auto-detect
- [ ] B) No control — fully automatic
- [ ] C) A single on/off "effects" switch
- [ ] Other: __________________________________________
> WHY: user control + auto-degrade compose — auto-detect picks a sensible tier, the toggle lets a user override up or down, and Calm reuses the reduced-motion machinery.
> USER NOTES:

### Q: Frame-rate target and response to sustained drops?
- [x] A) Target 60fps; on sustained drops, automatically step down one quality tier (never below the static-frame floor)
- [ ] B) Target 30fps to save battery
- [ ] C) No monitoring — render at whatever the device manages
- [ ] Other: __________________________________________
> WHY: GPU-cheap constraint — a dropped-frame monitor that steps tiers keeps the experience smooth and never white-screens the route.
> USER NOTES:

### Q: Particle / shader budget ceiling?
- [x] A) Hard per-room caps (e.g. Map ~1400 stars, DPR ≤2, one shared RAF loop); auto-reduce below the cap on weak devices
- [ ] B) Uncapped — let each room use as much as it wants
- [ ] C) A single global particle cap shared across all rooms
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §3D caps (DPR ≤2, one `requestAnimationFrame` loop, full disposal on unmount) are the established ceilings; per-room caps respect each room's design.
> USER NOTES:

### Q: WebGL / renderer failure path (ties to the Floor)?
- [x] A) Guarded renderer creation (try/catch) → accessible static / DOM-HUD fallback, never a white-screen (Streak's Phaser-degrade is the template)
- [ ] B) Show an error message and block the room
- [ ] C) Retry the renderer until it works
- [ ] Other: __________________________________________
> WHY: WebGL-degrade Floor (INDEX §Floors, FOUNDATIONS §3D) — no-WebGL, renderer error, and reduced-motion all resolve to a usable static/DOM surface, never a crash.
> USER NOTES:

## C3 · Audio system

> **For the USER to fill in.** Game-agnostic decisions for how PARLOR makes sound:
> the cue architecture, how the C1 SettingsHub volume gates everything, autoplay/unlock
> policy, asset strategy, SFX design, and the accessibility interplay. Tick one box per
> question (the pre-ticked `[x]` is my recommended spec); override via `> USER NOTES:`.
>
> **Grounding (already true — do not re-decide):**
> - `frontend/lib/sound.ts` — synth-first engine: ONE lazy `AudioContext`, ONE `muted`
>   authority (`localStorage "parlor:muted"`), the `audio` singleton
>   (`startAmbient/stopAmbient`, `sfx(cue)`, `stinger()`), named `sfx.*` one-shots, and
>   themed ceremony cues. Every path bails SSR / no-context / muted (never throws).
> - Assets are an **upgrade, never a requirement**: `/audio/*.mp3` is fetched, decoded,
>   and cached; a 404/decode-fail is remembered as a permanent miss and the procedural
>   synth covers it. App plays fully from a clone with `public/audio/` empty.
> - Committed, CC0, same-origin: 7 `kenney_*` packs + a curated `cues/` set + `stinger.mp3`.
>   **No `ambient-<room>.mp3` beds exist yet.** `startAmbient` already bails under
>   reduced-motion.
> - **Locked Floors (NOT a vote):** NO runtime CDN (bundle-then-commit only, CSP/offline);
>   exactly ONE mute/volume authority; ≤1 infinite/looping animation per viewport; audio is
>   never the sole feedback channel; zero-env build stays green.

## C3 · Audio architecture & cue registration

### Q: What is the canonical audio API a game room drives?
- [ ] A) A new React AudioProvider / context wrapping every room
- [x] B) **Keep the shipped `audio` singleton (`startAmbient`/`stopAmbient`/`sfx`/`stinger`) as the ONE import every room drives imperatively**
- [ ] C) Per-game bespoke audio modules, no shared surface
- [ ] Other: __________________________________________
> WHY: One imperative singleton over a single shared `AudioContext` + single mute authority is already SSR-safe and zero-dep; v4 depth comes from richer cues behind the same seam, not a new architecture (rich but disciplined — no new runtime dep).
> USER NOTES:

### Q: Keep the three-tier model — ambient bed (loop) · one-shot SFX (interaction) · event stinger (milestone) — as distinct layers?
- [x] A) **Yes — three named layers with distinct lifecycles (bed = mount/unmount, SFX = per-gesture, stinger = per-milestone)**
- [ ] B) Collapse to two (loops + one-shots); a stinger is just a louder one-shot
- [ ] C) One flat "play cue" call, no layer distinction
- [ ] Other: __________________________________________
> WHY: The three layers already exist and mix cleanly; the split maps to how a player perceives sound (atmosphere vs feedback vs ceremony) and lets each layer duck/gate independently.
> USER NOTES:

### Q: How does a game declare which cues it uses?
- [x] A) **A central per-room cue registry (extend the `CUE` map / `AMBIENT_ROOTS`) — cues are declared data, resolved by room key**
- [ ] B) Each component calls raw `blip`/`sfx.*` inline wherever it needs a sound
- [ ] C) A JSON cue manifest loaded at runtime per room
- [ ] Other: __________________________________________
> WHY: A data registry keeps cue choices reviewable in one place, keyed by room, and matches the existing `AMBIENT_ROOTS`/`CUE` pattern — no scattered magic calls, no runtime manifest fetch.
> USER NOTES:

### Q: Should all sources route through one shared master GainNode (rather than each connecting straight to `destination`)?
- [x] A) **Yes — introduce ONE master bus (bed + SFX + stinger connect through it); the C1 volume is a single multiply, and it's the hook for global ducking**
- [ ] B) No — keep each source connecting directly to `a.destination` (status quo)
- [ ] C) Two buses only (music vs effects), no single master
- [ ] Other: __________________________________________
> WHY: Today sources hit `a.destination` directly, so there's no single place to apply volume or duck; one master bus is the clean, zero-dep anchor for the C1 slider and stinger-ducking.
> USER NOTES:

### Q: How many ambient loops may sound at once, app-wide?
- [x] A) **Exactly one — switching rooms tears down the prior bed before starting the next (one `ambientHandle`, status quo)**
- [ ] B) Allow a lobby bed + a room bed to overlap briefly
- [ ] C) Stack layered loops per room for depth
- [ ] Other: __________________________________________
> WHY: One concurrent loop honors the ≤1-infinite-loop-per-viewport Floor and the shipped single-handle design; depth comes from voicing the one bed well, not stacking loops.
> USER NOTES:

### Q: Event stinger source — bundled `/audio/stinger.mp3` upgrade with a procedural fallback?
- [x] A) **Keep upgrade-or-synth: play the committed `stinger.mp3` when present, else the procedural arpeggio; never block on the asset**
- [ ] B) Require the sampled stinger (no synth fallback)
- [ ] C) Procedural stinger only; drop the asset
- [ ] Other: __________________________________________
> WHY: The absent-asset path is the tested default and keeps the zero-env build green; the committed `stinger.mp3` already upgrades it with no code change.
> USER NOTES:

### Q: Cross-room bed handoff on navigation?
- [ ] A) Crossfade — old bed fades out as the new fades in
- [x] B) **A brief silence ("a breath") between rooms, then the new bed starts**
- [ ] C) Hard cut — stop old, start new instantly
- [ ] Other: __________________________________________
> WHY: A short silence reads as a deliberate scene change (Apple-fy restraint / slow deliberate transitions) and sidesteps the complexity of a true dual-bed crossfade.
> USER NOTES:

### Q: Concurrency guard when many one-shots fire in a burst?
- [x] A) **Throttle repeats of the same cue (a min-gap per cue) so rapid fire never piles into a harsh wall**
- [ ] B) Do nothing — the short blips already decay fast enough
- [ ] C) Hard voice cap (steal the oldest voice) across all cues
- [ ] Other: __________________________________________
> WHY: A per-cue min-gap is the cheapest way to keep combo/tick storms clean without a voice-management layer; matches the tech-web-audio SFX intent.
> USER NOTES:

## C3 · Global volume, mute & remembered state

### Q: How does the C1 SettingsHub master volume gate audio?
- [x] A) **A continuous 0–100 that maps to the master-bus gain and gates ALL audio (beds, SFX, stingers); 0 == silence**
- [ ] B) Volume slider for SFX only; beds keep their own fixed low level
- [ ] C) Discrete steps (off / low / full), no continuous slider
- [ ] Other: __________________________________________
> WHY: v4 wants a real volume, not just on/off; one 0→1 multiply on the master bus is the single authority, and 0 subsumes the current binary mute so there is still exactly ONE gate.
> USER NOTES:

### Q: Relationship between the binary `muted`/SoundToggle and the new volume slider?
- [x] A) **Fold mute into volume: mute remembers the level and drops to 0; unmute restores it; SoundToggle becomes the mute/unmute shortcut for the slider**
- [ ] B) Keep them independent (a separate boolean mute AND a volume)
- [ ] C) Drop the SoundToggle entirely; the slider is the only control
- [ ] Other: __________________________________________
> WHY: Two independent gates invite contradiction (muted but volume up?); folding mute into "remember-and-zero" keeps a single source of truth while preserving the one-tap mute affordance.
> USER NOTES:

### Q: Where is volume/mute persisted?
- [x] A) **localStorage (extend `parlor:muted` → `parlor:volume`), read on mount, SSR-safe default of silent**
- [ ] B) A cookie so SSR can read it
- [ ] C) In-memory only — resets every visit
- [ ] Other: __________________________________________
> WHY: Scores/prefs already live in localStorage and the frontend never writes the DB; a persisted volume with a silent SSR default keeps hydration flash-free and honors the last choice.
> USER NOTES:

### Q: First-ever-visit default level?
- [x] A) **Silent (volume 0 / muted) until the user opts in; then remember it**
- [ ] B) A low non-zero default (audible but quiet) on first visit
- [ ] C) Full volume by default
- [ ] Other: __________________________________________
> WHY: Autoplay policy + Apple restraint — never make sound unbidden; the current engine already boots muted, and a remembered opt-in respects the returning user.
> USER NOTES:

### Q: Global vs per-room mute memory?
- [x] A) **One global volume/mute governs the whole app; no per-room mute memory**
- [ ] B) Remember a mute preference per room
- [ ] C) Global for SFX, per-room memory for beds
- [ ] Other: __________________________________________
> WHY: A single authority is the stated design and prevents the "muted here, loud there" confusion; per-room memory is complexity users rarely want.
> USER NOTES:

### Q: A separate ambient-bed on/off, distinct from the master volume?
- [x] A) **One master volume PLUS a simple "ambient bed" on/off toggle (no second slider) — some players want SFX without the drone**
- [ ] B) Master volume only; no way to silence just the bed
- [ ] C) Two full sliders (music vs effects)
- [ ] Other: __________________________________________
> WHY: A bed on/off is the one commonly-wanted split (background music aversion) and is cheap; a full second slider is more mixing UI than a trivia app earns.
> USER NOTES:

### Q: On unmute / raising volume from 0, what resumes?
- [x] A) **Resume the bed of whichever room is currently mounted (the `ambientDesiredRoom` intent survives the mute), SFX resume naturally**
- [ ] B) Nothing auto-resumes; the next cue/room start re-arms audio
- [ ] C) Replay the last stinger as a confirmation
- [ ] Other: __________________________________________
> WHY: The engine already tracks desired-room intent across a mute; resuming the live room's bed is the least surprising behavior and needs no new state.
> USER NOTES:

### Q: Where does the volume control live in the UI?
- [x] A) **Primary control in the C1 SettingsHub; keep the lightweight SoundToggle as an always-visible one-tap mute**
- [ ] B) Only in SettingsHub (remove the floating toggle)
- [ ] C) Only the floating toggle (no SettingsHub audio panel)
- [ ] Other: __________________________________________
> WHY: SettingsHub is the home for the full slider + bed toggle; a persistent quick-mute is the affordance players reach for mid-game without opening settings.
> USER NOTES:

## C3 · Autoplay policy & first-interaction unlock

### Q: What plays before any user interaction?
- [x] A) **Nothing — the `AudioContext` stays uncreated/suspended until a user gesture (browser autoplay policy, status quo)**
- [ ] B) Start a quiet bed on load and let the browser suspend it
- [ ] C) A one-time intro sound on first paint
- [ ] Other: __________________________________________
> WHY: Silent-until-gesture is both the browser rule and the polite default; the lazy `ac()` already defers context creation to the first cue.
> USER NOTES:

### Q: Default posture — muted-by-default vs an opt-in soundscape?
- [x] A) **Muted by default, with a subtle, dismissible "enable sound" invitation (never a blocking modal)**
- [ ] B) Opt-in via a modal the user must accept/decline before playing
- [ ] C) Sound on by default once a gesture unlocks the context
- [ ] Other: __________________________________________
> WHY: Apple restraint — respect the silent-by-default expectation and invite rather than impose; a modal gate is friction a trivia app doesn't need.
> USER NOTES:

### Q: How is the first-interaction unlock handled technically?
- [x] A) **Lazy `ac()` creates + resumes the context on the first gesture-driven cue; no global document listener required**
- [ ] B) A global `document` pointerdown listener that pre-warms the context
- [ ] C) A dedicated "tap to start audio" gate screen
- [ ] Other: __________________________________________
> WHY: The shipped lazy-resume is the minimal correct pattern (context born on the first cue, which is inside a gesture); a global listener or gate screen is extra surface for no gain.
> USER NOTES:

### Q: If the user previously opted into sound (stored volume > 0), do we still wait for a gesture this session?
- [x] A) **Yes — always wait for the first in-page gesture to create/resume the context, then honor the stored volume**
- [ ] B) Try to resume the context on load (may be blocked)
- [ ] C) Assume prior opt-in means we can autoplay a bed immediately
- [ ] Other: __________________________________________
> WHY: Autoplay compliance is per-session; honoring stored volume only after the first gesture avoids a blocked-context flash and a console warning.
> USER NOTES:

### Q: Which gesture arms audio?
- [x] A) **Any user gesture unlocks the shared context (current) — games don't each need bespoke unlock code**
- [ ] B) Only each game's primary action (place tile / start timer) arms it
- [ ] C) Only the explicit "enable sound" control
- [ ] Other: __________________________________________
> WHY: Unlocking on any gesture is simplest and most robust; the explicit invitation (see the opt-in question) is the discoverable path, not the only one.
> USER NOTES:

### Q: A one-time "sound recommended" nudge in the immersive/ceremony rooms?
- [ ] A) No nudge anywhere — the global toggle is enough
- [x] B) **A one-time, dismissible nudge in signature rooms only (e.g. séance / thread) where audio carries the mood**
- [ ] C) Nudge in every room on first entry
- [ ] Other: __________________________________________
> WHY: The atmosphere rooms are where muted audio is a real loss; a single dismissible nudge there (not everywhere) respects restraint while surfacing the value.
> USER NOTES:

### Q: If context creation / autoplay is blocked or fails, what happens?
- [x] A) **Silent, non-throwing no-op — every path already bails when there's no AudioContext; never block render or error**
- [ ] B) Show an error/toast that audio is unavailable
- [ ] C) Retry context creation on a timer
- [ ] Other: __________________________________________
> WHY: Audio is garnish; a failure must degrade to silence invisibly (Floor: effects are optional, the frame renders complete on its own).
> USER NOTES:

## C3 · Asset strategy (committed, CC0, no CDN)

### Q: Primary sourcing posture for any audio the games need?
- [x] A) **Reuse the committed `kenney_*` packs + `cues/` first; add small committed CC0 assets only for a genuine gap — never a runtime CDN**
- [ ] B) Add fresh sampled assets liberally for a premium feel
- [ ] C) Stay 100% procedural; add no new assets at all
- [ ] Other: __________________________________________
> WHY: The packs already cover interface/impact/casino/voice one-shots; reuse-first is zero new cost and the no-CDN/offline Floor forbids runtime fetches from third parties.
> USER NOTES:

### Q: The one real gap is seamless ambient loops (no `ambient-<room>.mp3` yet) — fill it or stay procedural?
- [x] A) **Fill only the signature rooms with committed CC0 loops; procedural drone everywhere else and as the universal fallback**
- [ ] B) Source a bespoke loop for every room
- [ ] C) Stay fully procedural — commit no bed assets
- [ ] Other: __________________________________________
> WHY: Signature rooms earn a real bed; the procedural drone is seamless-by-construction and already covers the rest gracefully — sample where it matters, synth the tail.
> USER NOTES:

### Q: File format for committed cues/beds?
- [x] A) **mp3 (like the existing `stinger.mp3`) for broad cross-browser decode; leave the raw `kenney_*` packs as their original `.ogg`, untouched**
- [ ] B) ogg everywhere (smaller, CC0-native) even for new committed cues
- [ ] C) wav for quality, accept the size
- [ ] Other: __________________________________________
> WHY: `decodeAudioData` + Safari are most reliable on mp3; the stinger is already mp3, so one format keeps the loader path uniform while the pristine packs stay intact for future pulls.
> USER NOTES:

### Q: Preload budget — how eagerly are assets loaded?
- [x] A) **Lazy per-room on mount via `loadBuffer`, cache the decoded buffer, remember a 404/decode-fail as a permanent miss (status quo)**
- [ ] B) Preload all audio in the app shell up front
- [ ] C) Preload a room's audio on hover of its home-page card
- [ ] Other: __________________________________________
> WHY: The shipped lazy-load-and-cache keeps first paint light and never refetches a known-absent asset; eager preloading spends bandwidth on sounds the player may never trigger.
> USER NOTES:

### Q: Total committed audio-asset weight ceiling?
- [x] A) **Tight — procedural default; sample at most 1–2 signature beds + the stinger, target < ~150 KB each**
- [ ] B) Moderate — a handful of compressed loops across rooms
- [ ] C) Generous — sample every bedded room, size is acceptable
- [ ] Other: __________________________________________
> WHY: The repo is the database in DB-less mode; audio weight is committed bytes, so premium-via-craft (procedural + a couple of hero samples) beats a heavy asset pile.
> USER NOTES:

### Q: Curating more one-shots from the raw packs into the intent-named `cues/` set?
- [x] A) **Yes — pull + rename from the already-committed raw packs as needed (no new download); keep the raw packs intact**
- [ ] B) Only use what's already in `cues/`; don't add more
- [ ] C) Download new packs when a cue is missing
- [ ] Other: __________________________________________
> WHY: The raw packs are committed precisely so future units can pull cues without re-downloading; renaming to intent-revealing names keeps the wiring readable, zero new cost.
> USER NOTES:

### Q: Any in-app attribution/credits UI for the audio assets?
- [x] A) **None at runtime — all assets are CC0/public-domain; keep a repo-level credits note (the packs' `License.txt`) only**
- [ ] B) A visible credits screen listing sound sources
- [ ] C) Per-cue attribution metadata surfaced somewhere
- [ ] Other: __________________________________________
> WHY: CC0 needs no runtime attribution UI (that's the whole point of the sourcing Floor); a repo note satisfies courtesy without shipping a credits surface.
> USER NOTES:

## C3 · SFX design & mixing

### Q: Interaction-feedback cues (click / select / bind) — which voice per room?
- [x] A) **A rich, themed pair where the room's mood calls for it; the generic `sfx.select`/`sfx.tick` elsewhere**
- [ ] B) The single generic set everywhere (cheapest, uniform)
- [ ] C) A unique bespoke cue for every interaction in every room
- [ ] Other: __________________________________________
> WHY: Themed cues in signature rooms give each a memorable identity while the generic set keeps utility rooms cheap — richness where it pays, restraint elsewhere.
> USER NOTES:

### Q: Success / failure stingers — plain `sfx.correct/wrong` vs the richer `sfxCorrect/sfxWrong`?
- [x] A) **The rich pair everywhere (longer, warmer tones read as more premium)**
- [ ] B) Plain pair for fast games, rich pair only for slow/ceremony rooms
- [ ] C) Plain pair everywhere
- [ ] Other: __________________________________________
> WHY: v4-led — the richer correct/wrong cues feel better at negligible cost and unify the result-feedback voice across rooms.
> USER NOTES:

### Q: Error / invalid-action feedback — distinct from a "wrong answer"?
- [x] A) **Yes — a soft, distinct "nope" cue for invalid input, separate from the answer-wrong stinger (error ≠ failure)**
- [ ] B) Reuse the wrong-answer cue for invalid input too
- [ ] C) No sound on invalid input — visual shake only
- [ ] Other: __________________________________________
> WHY: Conflating "you can't do that" with "you got it wrong" mis-signals; a gentler distinct cue keeps the feedback honest (and pairs with a visual, per accessibility).
> USER NOTES:

### Q: Should the single ambient bed carry any pulse, or stay a pure sustained pad?
- [x] A) **A subtle pulse only where it fits the game (e.g. a clock tick, a heartbeat in a timed room); pure pad elsewhere**
- [ ] B) All beds strictly non-rhythmic pads, no pulse anywhere
- [ ] C) Every bed carries a tempo
- [ ] Other: __________________________________________
> WHY: A pulse earns its place only in tension/timed rooms; forcing rhythm everywhere fights focus, and no rhythm at all leaves the timed rooms flat.
> USER NOTES:

### Q: Ducking — when a stinger or result cue fires, what happens to the bed?
- [x] A) **Briefly duck the bed's gain under the cue, then restore (via the master/bed bus)**
- [ ] B) Nothing — bed and cue simply sum (status quo)
- [ ] C) Fully pause the bed for the cue, resume after
- [ ] Other: __________________________________________
> WHY: A short duck makes the milestone read clearly over the atmosphere without the abruptness of a full pause; the master bus makes it a one-line gain automation.
> USER NOTES:

### Q: Spatialization / stereo panning of cues?
- [x] A) **Skip it — mono/center everything; a PannerNode adds cost and complexity for no gameplay value**
- [ ] B) Pan cues to match on-screen position (e.g. a left-side tile pans left)
- [ ] C) Full 3D positional audio for immersive rooms
- [ ] Other: __________________________________________
> WHY: 2D trivia boards gain nothing from positional audio; Apple restraint says spend nothing on 3D sound that players won't consciously notice.
> USER NOTES:

### Q: Rapid-fire cues (combo climb, ticking, speed rounds) — how far does e.g. `combo(level)` climb?
- [x] A) **Cap the pitch rise so it never gets shrill, and rate-limit repeats (min gap ms)**
- [ ] B) Uncapped rise (current) — let it keep climbing with the streak
- [ ] C) Replace the rising combo with one fixed "streak up" blip
- [ ] Other: __________________________________________
> WHY: An uncapped rise turns fatiguing/harsh on long streaks; a capped, throttled climb keeps the escalation satisfying without piercing.
> USER NOTES:

### Q: A single signature interaction cue per room (the sound a player remembers)?
- [x] A) **Yes — one memorable signature cue per room (I'll propose sensible defaults per room)**
- [ ] B) No signatures — every room uses the shared generic set
- [ ] C) The USER specifies each signature cue by hand
- [ ] Other: __________________________________________
> WHY: A signature cue is cheap identity — it's what makes a room's feedback feel designed rather than stock; proposing defaults keeps the USER's review light.
> USER NOTES:

## C3 · Reduced-motion, quiet interplay & accessibility

### Q: Reduced-motion currently silences the ambient bed. Keep that coupling?
- [x] A) **Yes — reduced-motion suppresses the looping bed (it's motion-adjacent atmosphere); event SFX stay audible**
- [ ] B) Decouple — reduced-motion should not affect audio at all
- [ ] C) Reduced-motion silences ALL audio
- [ ] Other: __________________________________________
> WHY: A perpetual drone is the audio analogue of an infinite animation; suppressing it under reduced-motion is consistent, and the shipped `startAmbient` already does this.
> USER NOTES:

### Q: Does reduced-motion also trim event SFX?
- [ ] A) No — SFX aren't motion; leave every cue fully audible
- [ ] B) Yes — reduced-motion trims cue density in the busiest rooms
- [x] C) **Drop decorative cues (hover / combo) but keep result cues (correct / wrong)**
- [ ] Other: __________________________________________
> WHY: Result cues are feedback (keep); hover/combo chatter is the audio equivalent of decorative motion (trim) — the split respects the preference without hiding outcomes.
> USER NOTES:

### Q: Is any game state EVER signaled by sound alone?
- [x] A) **Never — every audio cue has a concurrent visual (and, where relevant, text) equivalent; audio is redundant reinforcement only**
- [ ] B) Some subtle states may be audio-only for immersion
- [ ] C) Audio-only allowed if the game warns the user up front
- [ ] Other: __________________________________________
> WHY: Floor — accessible by construction; just as category is color + glyph + label (never color alone), feedback is never audio alone (Deaf/HoH + muted-default users must lose nothing).
> USER NOTES:

### Q: A separate "quiet mode" preset distinct from full mute?
- [x] A) **No separate preset — the volume slider IS the quiet mode; lower it (and the bed toggle handles the drone)**
- [ ] B) Add a "quiet" preset that keeps only essential cues at low gain
- [ ] C) Three presets: full / quiet / off
- [ ] Other: __________________________________________
> WHY: A continuous slider already spans loud→quiet→off; a named preset is redundant UI over the one authority.
> USER NOTES:

### Q: Screen-reader / assistive-tech coordination with cues?
- [x] A) **Cues are decorative — none are marked essential, no `aria-live` is tied to audio, so SR users lose nothing by muting**
- [ ] B) Mirror key cues into an `aria-live` announcement
- [ ] C) Provide an SR-only audio-transcript of game events
- [ ] Other: __________________________________________
> WHY: Because every state also has a visual/text signal (see above), audio needs no ARIA bridge; adding `aria-live` tied to sounds would double-announce what the DOM already conveys.
> USER NOTES:

### Q: A visual indicator for the win / completion moment (Deaf/HoH, muted, or reduced-motion users)?
- [x] A) **Yes — the win/complete moment always carries a visual flourish; the stinger is garnish layered on top, never the sole signal**
- [ ] B) The stinger alone marks completion; visual is optional
- [ ] C) Only a text "complete" line, no flourish
- [ ] Other: __________________________________________
> WHY: The most important moment must be seen, not just heard (Floor: the no-audio frame is complete on its own); the stinger enriches an already-visible celebration.
> USER NOTES:

## C4 · Performance & Delivery

Game-agnostic performance, delivery, and Vercel-meter posture. Floors are LOCKED
and not on the ballot: the seed-bank / no-network / no-JS / reduced-motion frame
renders complete on its own; zero-env build stays green; the frontend never
writes the DB and reads through a cached once-a-day path (`revalidate = 86400`).
These questions pick the CHOICES within those floors. Cost note: image-opt sits
at **4K of 5K** (near limit), functions 103K/1M, ISR 38K/1M, edge 120K/1M, Fluid
CPU 1h17m/4h — every recommended pick adds **nothing** to the metered surfaces.

### Render strategy — SSG / SSR / ISR per route

#### Q: What is the default render mode for a route that reads only the committed seed bank (board, most game shells, home)?
- [ ] A) SSR on every request (`dynamic = "force-dynamic"`)
- [x] B) Fully static (SSG) — the seed bank is a build-time import, so the page is a static asset with zero runtime function
- [ ] C) ISR with a short revalidate window
- [ ] Other: __________________________________________
> WHY: seed-bank data is baked into the bundle at build; a static page invokes no function, bills no ISR read, and serves from the edge cache — the cheapest and fastest option, doctrine "keep functions cold."
> USER NOTES:

#### Q: For the date-seeded puzzle rooms (Séance/Ladder/Mystery/Chronos/Ignite/Atlas) that read a nightly-archived Neon row, what render policy?
- [ ] A) `force-dynamic` — fetch the row on every request
- [x] B) ISR with `revalidate = 86400` (one read/day, matching the archive cadence and the existing `unstable_cache` window)
- [ ] C) SSG only — bake today's puzzle at build, never refresh
- [ ] Other: __________________________________________
> WHY: puzzles are deterministic per UTC day and archived nightly; a 24h revalidate collapses the whole day's traffic to a single Neon read + one function run, then serves cached — matches `queries.ts` `revalidate: 86_400` exactly.
> USER NOTES:

#### Q: How should `export const dynamic` / `export const revalidate` be declared across routes?
- [ ] A) Leave everything on Next's defaults and hope the inference is right
- [x] B) Explicit per-route: static routes assert nothing (default static), puzzle routes set `revalidate = 86400` — declared intent, no accidental `force-dynamic`
- [ ] C) One global `revalidate` in the root layout
- [ ] Other: __________________________________________
> WHY: explicit per-route policy prevents a stray `cookies()`/`headers()`/`no-store` call from silently opting a whole route into per-request SSR (a function-invocation and Fluid-CPU leak); intent is auditable in the file.
> USER NOTES:

#### Q: What guards against a route accidentally becoming dynamic (a `Date.now()`, `headers()`, or uncached `fetch` flipping it to SSR)?
- [x] A) Treat "dynamic = ƒ" in `next build` output as a regression — CI/PR check that the static/ISR route set hasn't grown
- [ ] B) Rely on manual review of build logs
- [ ] C) No guard — accept whatever Next infers
- [ ] Other: __________________________________________
> WHY: the build already prints each route's render mode; asserting the expected shape catches a cold→warm regression before it ships and starts billing functions, cheap insurance for the meter budget.
> USER NOTES:

#### Q: Where should per-day puzzle date resolution happen so a route can stay static/ISR rather than dynamic?
- [x] A) Resolve "today" inside the cached data function (keyed by the `day` string, as `cachedSeance(day)` already does) so the route renders from cache, not from a request-time clock
- [ ] B) Read the date from request headers at the top of the page (forces dynamic)
- [ ] C) Client-side date fetch after hydration
- [ ] Other: __________________________________________
> WHY: keying the cache by an explicit `day` argument (existing pattern) keeps the render deterministic and cacheable; reading the clock in the render path is what forces `force-dynamic` and a function per hit.
> USER NOTES:

#### Q: Archive-browsing a past date (`?date=YYYY-MM-DD`) — how is that rendered without spawning a function per unique date?
- [ ] A) Dynamic route, one function invocation per requested date
- [x] B) On-demand ISR: cache each date page on first hit, serve cached thereafter (one read per date ever, not per request)
- [ ] C) Pre-render every historical date at build (bundle grows unbounded)
- [ ] Other: __________________________________________
> WHY: past puzzles never change, so first-hit-caches-forever is correct and bounds cost to distinct-dates-actually-viewed; unbounded pre-render bloats build, per-request dynamic bloats functions.
> USER NOTES:

#### Q: Should any route opt into the Edge runtime rather than Node?
- [ ] A) Move puzzle routes to Edge for lower latency
- [x] B) Keep Node runtime everywhere — Neon serverless + `unstable_cache` are Node-tuned, and static pages don't run either way; Edge would add edge-request meter pressure for no user-visible win
- [ ] C) Edge for static routes only
- [ ] Other: __________________________________________
> WHY: the win from Edge is TTFB on dynamic work, but our data path is cached to once-a-day; static pages serve from CDN regardless. Staying on Node avoids churning the edge-request meter (120K/1M) and keeps the DB driver on its supported runtime.
> USER NOTES:

#### Q: Streaming SSR (`loading.tsx` / Suspense) for the puzzle rooms?
- [ ] A) No Suspense — block on the full page
- [x] B) Add a lightweight `loading.tsx` skeleton so the shell paints instantly while the (cached) data resolves — perceived-perf win at zero extra cost
- [ ] C) Client-side spinner after hydration only
- [ ] Other: __________________________________________
> WHY: a static skeleton streams first paint immediately and the cached data fills in; it improves LCP/perceived speed without changing render mode or adding a function — pure craft, no spend (doctrine: premium via craft).
> USER NOTES:

### Vercel meter discipline — add nothing new to metered surfaces

#### Q: image-opt is at 4K of 5K. What is the standing policy for `next/image` optimization?
- [ ] A) Keep using optimized `next/image` freely; we have headroom
- [x] B) Add ZERO new optimized-image transforms — new imagery ships as pre-sized committed static assets or CSS/SVG; any `next/image` use sets `unoptimized`
- [ ] C) Raise the Vercel plan limit
- [ ] Other: __________________________________________
> WHY: the meter is 80% consumed; every distinct optimized source×size×format is a billable transform. Committing already-sized assets and using `unoptimized` serves them straight from the CDN with no transform — the only safe posture near the ceiling.
> USER NOTES:

#### Q: Target ceiling for serverless function invocations (currently 103K/1M)?
- [x] A) Hold well under ~200K/mo by keeping game routes static/ISR — a function fires only on cache-miss (≈once/day/puzzle) not per visit
- [ ] B) No target; let it float
- [ ] C) Accept per-request SSR and monitor
- [ ] Other: __________________________________________
> WHY: with static+24h-ISR, invocations scale with distinct-cache-keys-per-day (a handful of rooms × dates), not with pageviews — that keeps us an order of magnitude under limit even at high traffic.
> USER NOTES:

#### Q: Edge-middleware requests meter (120K/1M) — how much middleware do we run?
- [x] A) No middleware in the hot path (or none at all) — static security headers via `next.config.mjs` `headers()`, which don't bill the edge-request meter
- [ ] B) Middleware on every route for header injection
- [ ] C) Middleware only on puzzle routes
- [ ] Other: __________________________________________
> WHY: `headers()` in config are applied at the CDN without an edge-function invocation; middleware runs (and bills) on every matched request. Static headers give the same security posture with no meter cost.
> USER NOTES:

#### Q: ISR read meter (38K/1M) — how do we keep it flat?
- [x] A) One ISR entity per (room × day) with 24h revalidate — reads scale with days-served, not visitors; well under limit
- [ ] B) Short revalidate (minutes) for "freshness"
- [ ] C) Per-request revalidation
- [ ] Other: __________________________________________
> WHY: puzzles change once a night, so a 24h window is the correct freshness and it caps ISR reads to roughly rooms×active-days; sub-hour windows would multiply reads for zero content change.
> USER NOTES:

#### Q: Fluid CPU (1h17m of 4h) — what bounds compute per request?
- [x] A) Keep the pure puzzle generators (`generate*`) as the only real CPU, and only on cache-miss; no per-request heavy work in render
- [ ] B) Do image processing / heavy transforms server-side per request
- [ ] C) Run generators on every request (skip the cache)
- [ ] Other: __________________________________________
> WHY: the generators are the only meaningful CPU and they run once per cache-miss (≈once/day/room); everything else is static serving. That keeps CPU-hours proportional to puzzle-generation, not traffic — comfortably within budget.
> USER NOTES:

#### Q: When a new feature would touch a metered surface (a transform, a function, an edge call), what's the default?
- [x] A) Default to NO — find a static/CSS/SVG/committed-asset path first; only spend meter if there is no craft alternative and the user signs off
- [ ] B) Spend freely if it improves UX
- [ ] C) Spend, then optimize later if a meter alerts
- [ ] Other: __________________________________________
> WHY: doctrine — "premium via craft, not spend"; near the image-opt ceiling especially, the conservative default protects the free-tier posture that keeps the whole app zero-cost to run.
> USER NOTES:

#### Q: Do we ship any client-side telemetry / analytics / Speed Insights beacon?
- [ ] A) Yes — Vercel Analytics + Speed Insights on every page
- [x] B) No third-party beacon by default — it adds JS weight, an edge/analytics request per view, and a privacy surface; measure with Lighthouse/local tooling instead
- [ ] C) Analytics only on the home page
- [ ] Other: __________________________________________
> WHY: a per-view beacon bills a metered request and ships client JS for data we can get from local Lighthouse runs; keeping it off protects both the JS budget and the request meters. Add later only if the user wants field data.
> USER NOTES:

### Image & static-asset strategy — no per-render transforms

#### Q: Decorative/atmosphere visuals (glows, gradients, textures, suit glyphs, star fields) — image or code?
- [x] A) CSS gradients / SVG / inline glyphs wherever possible — GPU-cheap, resolution-independent, zero bytes over the wire beyond CSS, no image-opt
- [ ] B) Raster PNG/JPG backgrounds served via `next/image`
- [ ] C) Remote-hosted decorative images
- [ ] Other: __________________________________________
> WHY: atmosphere is CSS/GPU-cheap by doctrine; vector/CSS scales crisply on every DPR, avoids the image-opt meter entirely, and keeps payload tiny — the premium-via-craft path.
> USER NOTES:

#### Q: For a genuinely photographic asset that must ship (e.g. `mansion-map.jpg`), how is it delivered?
- [x] A) Pre-optimized and committed to `public/`, served static (plain `<img>` or `next/image unoptimized`) — no runtime transform
- [ ] B) Full-res original through `next/image` on-the-fly optimization
- [ ] C) Hotlinked from a remote host
- [ ] Other: __________________________________________
> WHY: sizing/compressing once at author time and committing the result means the CDN serves bytes directly with no billable transform — the only image posture that respects the 4K/5K ceiling.
> USER NOTES:

#### Q: When `next/image` IS used (layout/`srcset` ergonomics), what's the config?
- [x] A) `unoptimized` (or a loader that returns the committed asset) so it never hits Vercel's optimizer — still get layout stability, skip the meter
- [ ] B) Default optimized loader
- [ ] C) Ban `next/image` entirely, always plain `<img>`
- [ ] Other: __________________________________________
> WHY: `next/image` gives width/height/`sizes` for CLS control, but the default loader is the metered transform; `unoptimized` keeps the ergonomics and serves the committed file directly — best of both near the ceiling.
> USER NOTES:

#### Q: Remote clue images (TMDB posters, flags, thumbnails) when present — optimize or pass through?
- [x] A) Pass through as plain `<img>` from the allowlisted hosts (or snapshot into `public/` at forge time) — never route remote images through the on-the-fly optimizer
- [ ] B) `next/image` optimized (each remote source×size = a transform)
- [ ] C) Proxy + re-optimize server-side per request
- [ ] Other: __________________________________________
> WHY: optimizing remote images is the fastest way to blow the image-opt meter (unbounded distinct sources); a plain `<img>` or a forge-time local snapshot serves them with zero transform, and the frame degrades to text if one fails to load (Floor).
> USER NOTES:

#### Q: Every image needs intrinsic dimensions to avoid CLS. How enforced?
- [x] A) Explicit `width`/`height` (or aspect-ratio CSS box) on every image, static or remote — CLS is a Lighthouse-scored regression
- [ ] B) Let images reflow naturally
- [ ] C) Only size above-the-fold images
- [ ] Other: __________________________________________
> WHY: unsized images cause layout shift that tanks the CLS metric and feels cheap; reserving the box is free and directly protects the perceived-quality and Lighthouse targets.
> USER NOTES:

#### Q: Icon and glyph delivery (category glyphs, suit marks, UI icons)?
- [x] A) Inline SVG / CSS — no icon-font CDN, no sprite request, tree-shakeable per component
- [ ] B) An icon-font webfont
- [ ] C) Individual PNG icons via `next/image`
- [ ] Other: __________________________________________
> WHY: inline SVG paints with the HTML (no extra request), respects `currentColor` for theming, scales on every DPR, and adds nothing to any meter — the standard for a static-first app.
> USER NOTES:

#### Q: Should any large media asset be lazy-loaded rather than blocking first paint?
- [x] A) Yes — `loading="lazy"` / below-the-fold defer for anything not needed for LCP; the LCP element itself is eager
- [ ] B) Load everything eagerly
- [ ] C) Lazy-load everything including the hero (risks LCP)
- [ ] Other: __________________________________________
> WHY: deferring off-screen media shrinks the critical path and improves LCP/TTI for free, while keeping the LCP element eager so the headline visual isn't delayed — textbook, zero-cost.
> USER NOTES:

### JS bundle & client budget — `"use client"` minimalism

#### Q: How aggressively is `"use client"` scoped?
- [x] A) Server Components by default; `"use client"` only on the leaf that needs interactivity (game canvas, toggles) — keep shells, layout, and data fetching on the server
- [ ] B) Client-render whole pages for convenience
- [ ] C) A global client boundary near the root
- [ ] Other: __________________________________________
> WHY: every client boundary ships its subtree's JS to the browser; scoping it to interactive leaves keeps the shipped bundle minimal, which is the single biggest lever on TTI/TBT — matches the house convention in `queries.ts`/CLAUDE.md.
> USER NOTES:

#### Q: Heavy per-game engines (three.js / Phaser / Framer-heavy rooms) — how are they loaded?
- [x] A) `next/dynamic` with `ssr: false`, code-split per room so the engine downloads only when that room is opened
- [ ] B) Imported at the top level / in shared layout (ships to every route)
- [ ] C) Bundled into one big client chunk for all rooms
- [ ] Other: __________________________________________
> WHY: a WebGL/game engine is hundreds of KB; dynamic-importing it per room keeps it out of the home/board bundles entirely, so a visitor only pays for the room they enter — the biggest bundle win available.
> USER NOTES:

#### Q: Atmosphere layers (particle fields, ambient shaders, animated backdrops) — when do they load?
- [x] A) Deferred/lazy after the interactive frame is ready (or behind reduced-motion/idle), never blocking first paint or hydration
- [ ] B) Loaded synchronously with the room
- [ ] C) Preloaded on the home page for all rooms
- [ ] Other: __________________________________________
> WHY: atmosphere is optional garnish (Floor: the frame is complete without it); deferring it until after TTI means the playable UI is fast and the polish streams in — and reduced-motion users skip the payload entirely.
> USER NOTES:

#### Q: Audio (beds/SFX) delivery and loading?
- [x] A) Lazy — no audio file fetched until the user unmutes/interacts; SFX loaded on demand, bundled in `public/audio/` served static
- [ ] B) Preload all audio on page load
- [ ] C) Autoplay an ambient bed on mount
- [ ] Other: __________________________________________
> WHY: audio starts muted (self-consistency with the audio floors) and browsers block autoplay anyway; deferring the fetch until interaction saves bytes on every visit and avoids wasted download for the muted majority.
> USER NOTES:

#### Q: Third-party runtime dependencies added for a feature — what's the bar?
- [x] A) Very high — prefer a small hand-rolled/CSS solution over a new dep; a new runtime dep must earn its KB and is disallowed if it duplicates something we have
- [ ] B) Add libraries freely for developer convenience
- [ ] C) Add, then tree-shake later
- [ ] Other: __________________________________________
> WHY: doctrine forbids picks that need a new runtime dep for atmosphere; every dep is bundle weight and a supply-chain/CSP surface. Craft over spend keeps the JS budget and the offline posture intact.
> USER NOTES:

#### Q: Shared client state / providers at the root?
- [x] A) Minimal — no heavy global provider tree; per-room state stays local, theme/skin via CSS vars not a JS runtime theming layer (Floor)
- [ ] B) A large global context/store wrapping the whole app
- [ ] C) Redux-style store hydrated on every page
- [ ] Other: __________________________________________
> WHY: a root provider forces a client boundary high in the tree and ships its JS everywhere; CSS-variable theming (`applySkin`) needs no runtime and keeps the render server-side — smaller bundle, flash-free toggle (Floor).
> USER NOTES:

#### Q: How is the seed bank (~232 KB JSON) kept out of client bundles?
- [x] A) Import it only in Server Components / server helpers; board arrangement lives in a seed-free `lib/board.ts` so client components never pull it (existing pattern)
- [ ] B) Import the seed JSON into client components as needed
- [ ] C) Ship the seed bank to the client for offline play
- [ ] Other: __________________________________________
> WHY: `queries.ts` already notes the board helper is split out precisely so clients don't pull the 232 KB seed; keeping the bank server-side is a large, already-won bundle saving that must not regress.
> USER NOTES:

#### Q: Is there a per-route JS-size budget that's enforced?
- [x] A) Yes — track first-load JS per route from `next build` output; a route growing materially is a reviewable regression
- [ ] B) No budget; ship whatever the build produces
- [ ] C) One global budget for the whole app
- [ ] Other: __________________________________________
> WHY: the build already reports first-load KB per route; treating a jump as a regression catches an accidental heavy import (or a client-boundary creep) before it degrades TTI in production.
> USER NOTES:

### Caching & data reuse — the seed bank IS the cache

#### Q: HTTP cache headers for static assets in `public/` (seed JSON, images, audio, catalogs)?
- [x] A) Long-lived immutable caching (fingerprinted assets `max-age=31536000, immutable`; content assets a sane TTL) so repeat visits and CDN edges never re-fetch
- [ ] B) Default/no explicit cache headers
- [ ] C) `no-cache` to always get fresh
- [ ] Other: __________________________________________
> WHY: these assets change only on deploy (fingerprinted) or nightly; aggressive immutable caching makes repeat loads and CDN hits nearly free, cutting origin bandwidth and improving warm-load speed at no cost.
> USER NOTES:

#### Q: The cached Neon read — keep the `unstable_cache` + 24h `revalidate` wrapper as the standard?
- [x] A) Yes — one DB read per (room × day), re-served from Next's data cache all day; a real DB error is NOT cached (so it retries), only successful reads are
- [ ] B) Fetch per request with no cache
- [ ] C) Cache indefinitely with no revalidate
- [ ] Other: __________________________________________
> WHY: this is the existing, deliberate `cachedSeance`/`cachedLadder` design — it collapses reads to once/day, and by throwing on hiccups it avoids poisoning the cache with a transient failure. Reuse it verbatim for new rooms.
> USER NOTES:

#### Q: Client-side re-fetching / polling for "fresh" data within a session?
- [ ] A) Poll the server periodically for updates
- [x] B) None — content is per-day static; the page a visitor loads is valid for the whole day, no client re-fetch, scores live in localStorage
- [ ] C) Re-fetch on window focus
- [ ] Other: __________________________________________
> WHY: nothing changes intra-day, so polling would only burn requests/bandwidth for identical data; the frontend never writes the DB and scores are local — there is simply nothing to re-fetch.
> USER NOTES:

#### Q: Expensive pure computations in render (board arrangement, puzzle shaping, RNG-seeded layouts)?
- [x] A) Compute once via the date-seeded deterministic path and let Next's cache reuse it; memoize within a render pass where a value is derived repeatedly
- [ ] B) Recompute on every render/interaction
- [ ] C) Push all computation to the client
- [ ] Other: __________________________________________
> WHY: the layouts are deterministic per day (`lib/rng.ts`), so caching the computed result is correct and free; recomputation wastes CPU (Fluid meter) and risks SSR/client divergence the seeded PRNG exists to prevent.
> USER NOTES:

#### Q: Does the app rely on the seed bank as a de-facto cache / CDN for question data?
- [x] A) Yes — the committed `seed-questions.json` IS the served bank (not Neon); it ships static, caches at the edge, and needs no DB call at all for the question rooms
- [ ] B) Query Neon for questions on each request
- [ ] C) Cache Neon question rows with a TTL
- [ ] Other: __________________________________________
> WHY: `queries.ts` deliberately serves questions from the seed bank, not Neon (Neon rows would be stale); the seed file is effectively a build-baked cache — zero DB reads, zero functions, fully offline for the entire question surface.
> USER NOTES:

#### Q: Cache-key hygiene for the puzzle wrappers — what goes into the key?
- [x] A) Only the `day` string (as today), so identical requests share one cache entry; no request-specific or volatile value in the key
- [ ] B) Include request headers / a timestamp (fragments the cache)
- [ ] C) A random or per-session key
- [ ] Other: __________________________________________
> WHY: the existing wrappers key on `day` alone, which is exactly the granularity at which the data varies; adding anything volatile would shatter the cache into per-request entries and multiply reads/functions.
> USER NOTES:

### Measurement & regression gates

#### Q: What Lighthouse performance score is the standing target for the game routes?
- [x] A) Performance ≥ 90 (green) on mobile, with LCP < 2.5s, CLS < 0.1, TBT low — the ui-qa Lighthouse pass is the gate
- [ ] B) No numeric target; "feels fast"
- [ ] C) Desktop-only scoring
- [ ] Other: __________________________________________
> WHY: mobile-90 with good Core Web Vitals is the industry bar and the `/ui-qa` skill already runs Lighthouse per route; a concrete threshold makes "fast" checkable rather than subjective.
> USER NOTES:

#### Q: What does "not regressed" mean for a change that touches a route?
- [x] A) First-load JS, LCP, CLS, and render mode (static/ISR/dynamic) for the affected route are no worse than the pre-change baseline — captured before/after
- [ ] B) It builds and the page looks the same
- [ ] C) No measurement; trust review
- [ ] Other: __________________________________________
> WHY: a change can pass build+lint yet quietly add 200 KB or flip a route to dynamic; pinning the four load-bearing numbers (bundle, LCP, CLS, render mode) makes regression objective and ties directly to the meter budget.
> USER NOTES:

#### Q: What's the before/after projection format when a change is expected to affect perf or cost?
- [x] A) A small table: metric | before | after | delta — for first-load JS, LCP, and any metered surface touched (transforms, functions, ISR reads)
- [ ] B) A prose paragraph estimate
- [ ] C) No projection; measure only after merge
- [ ] Other: __________________________________________
> WHY: a metric|before|after|delta table makes the trade legible to the user reviewing the intake and forces the author to actually check the meter impact before shipping — consistent with the repo's projection discipline.
> USER NOTES:

#### Q: When are perf numbers captured — build-time output only, or a real page run?
- [x] A) Both: `next build` for render mode + first-load JS, and a Lighthouse run (via `/ui-qa`) on the actual rendered route for LCP/CLS/TBT
- [ ] B) Build output only
- [ ] C) Lighthouse only
- [ ] Other: __________________________________________
> WHY: build output shows bundle/render mode but not runtime vitals; Lighthouse shows vitals but not chunk sizes — you need both to know a change is truly neutral, and both are already available locally at zero cost.
> USER NOTES:

#### Q: Is accessibility scored alongside performance as part of "delivery quality"?
- [x] A) Yes — the Lighthouse a11y pass runs with perf (contrast/target/focus Floors are non-negotiable); a perf win that breaks a Floor is not shipped
- [ ] B) Perf only; a11y reviewed separately/later
- [ ] C) Neither scored automatically
- [ ] Other: __________________________________________
> WHY: the Floors (contrast, 44px targets, one focus ring) are LOCKED; `/ui-qa` already scores a11y with perf, so gating on both prevents a fast-but-inaccessible regression and keeps the two quality axes in one check.
> USER NOTES:

#### Q: How is the cost side (meters) monitored over time?
- [x] A) Track the five meters (image-opt, functions, edge, ISR reads, Fluid CPU) against their limits; a change's projected meter delta is part of its review, and image-opt near 4K/5K is a hard "no new transforms" line
- [ ] B) Wait for Vercel to email a limit warning
- [ ] C) Don't track; assume free tier is fine
- [ ] Other: __________________________________________
> WHY: image-opt is already at 80%; passive monitoring means discovering the overage after it bills. Making meter-delta a review input keeps the app on the free-tier posture the whole architecture is built to preserve.
> USER NOTES:

### Offline / zero-env completeness as a perf & resilience property

#### Q: Is "renders complete with zero env vars / zero network" treated as a performance property, not just a fallback?
- [x] A) Yes — the offline path (seed bank + bundled `public/` + pure generators) is the fast path: no DB round-trip, no external fetch, everything from the bundle/CDN
- [ ] B) Offline is only an emergency degradation, not a perf goal
- [ ] C) Treat DB-connected as the "real" fast path
- [ ] Other: __________________________________________
> WHY: because the DB path is cached to once-a-day and questions serve from the seed bank, the zero-env path is essentially what most requests already hit; framing it as the fast path (not a fallback) aligns perf and resilience — and keeps the zero-env build green (Floor).
> USER NOTES:

#### Q: When Neon is unreachable, what's the latency/behavior contract?
- [x] A) No user-visible slowdown — puzzle rooms run the pure `generate*` inline (offline ⇒ generate, never dark), a DB hiccup falls to the same generated/seed path without a hang
- [ ] B) Show a spinner and retry the DB
- [ ] C) Block the page until the DB responds or times out
- [ ] Other: __________________________________________
> WHY: `queries.ts` already returns `generateSeance(...)` when there's no DB and catches hiccups to a dark/generated state — never throwing, never hanging; the offline path is instant because it's pure computation from bundled data.
> USER NOTES:

#### Q: Does the no-JS / server-rendered frame count toward the perf contract?
- [x] A) Yes — the seed-bank / no-JS / reduced-motion frame must paint complete and correct on its own; JS/atmosphere are progressive enhancement layered on a fast static base
- [ ] B) The app assumes JS; no-JS isn't a target
- [ ] C) No-JS shows a "please enable JS" wall
- [ ] Other: __________________________________________
> WHY: the Floor requires the static frame to be complete without effects; building on a server-rendered base means first paint is fast and resilient, and the client JS only enhances — the opposite of a JS-blocked blank screen.
> USER NOTES:

#### Q: Should the offline/zero-env build be exercised in CI as a perf/resilience gate?
- [x] A) Yes — the DoD already requires build+test+lint with zero env vars; keep that green so the fast offline path can never silently break
- [ ] B) Only test the DB-connected build
- [ ] C) Test offline manually, occasionally
- [ ] Other: __________________________________________
> WHY: the canonical DoD mandates a zero-env green build (seed-bank fallback); making it a CI gate guarantees the offline fast path — the one most requests use — stays working and performant on every change.
> USER NOTES:

#### Q: Bundled offline assets (seed JSON, catalogs, map polygons, melodies) — sized for perf, not just presence?
- [x] A) Yes — keep each bundled asset compact (compacted seed, minified catalogs, lazy-fetched polygons) so "works offline" doesn't mean "ships a huge payload"
- [ ] B) Bundle full-fidelity assets regardless of size
- [ ] C) Inline everything into the JS bundle for guaranteed offline
- [ ] Other: __________________________________________
> WHY: offline completeness and payload size can conflict; compacting the bronze-forged seed and lazy-loading heavier assets (map polygons) keeps the zero-network guarantee without bloating first-load — resilience and speed together.
> USER NOTES:

## C5 · Mobile & Responsive

> **For the USER to fill in.** Game-agnostic CORE section: how EVERY PARLOR room
> behaves on a phone. PARLOR is mobile-first / pointer-enhanced — the base styles
> ARE the phone; `lg:`/1024px only adds density (`--d-*`). Each question already
> carries my recommended `[x]` (bold, v4-led, Apple-fy / native-feeling); accept
> it or override on the `> USER NOTES:` line. Every option here stays **within**
> the Floors — none of them is a vote.
>
> **Locked Floors — NOT up for a vote** (`design/INDEX.md §Floors`,
> `design/PATTERNS.md §Mobile`, `design/FOUNDATIONS.md §Breakpoints`):
> ≥44×44px touch target for EVERY interactive unit incl. in-game grid/board cells
> & chips (pointer ≥24) · a dense board redesigns its density before any cell
> shrinks below the floor · horizontal scroll only INSIDE a component with a
> visible affordance, never the page · Q&A ≥1rem / line-height ≥1.5, never inside
> gilt/gradient/flame · the seed-bank / no-network / no-JS / reduced-motion frame
> renders complete on its own (imagery is optional garnish) · ≤1 looping animation
> per viewport, everything else finite ≤600ms · one global focus ring · category
> triple-encoded (color + glyph + label) · SSR-safe (no `Math.random()` in render).
> Your picks choose the APPROACH inside those floors — never relax them.

---

## C5.1 · Breakpoint strategy

### Q: Where is the canonical base layer authored — phone or desktop?
- [ ] A) Desktop-first, scaled down with `max-width` queries
- [x] B) Mobile-first: base styles ARE the phone; only `lg:`/1024px adds density via the `--d-*` block (nothing is desktop-only content)
- [ ] C) Two separate layouts (mobile site + desktop site) swapped at 1024px
- [ ] Other: __________________________________________
> WHY: PATTERNS §Mobile + FOUNDATIONS §Breakpoints — mobile-first, pointer-enhanced; desktop is garnish/density over the phone base, never a second app.
> USER NOTES:

### Q: How many breakpoints does CORE commit to?
- [ ] A) Base + `lg:`(1024) only
- [x] B) Base + `sm:`(640, tap-pill floor) + `lg:`(1024, `--d-*` density) — the two shipped stops, no more
- [ ] C) A full 5-stop scale (sm/md/lg/xl/2xl)
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Breakpoints ships exactly `sm` + `lg`; more stops fragment testing for no design payoff.
> USER NOTES:

### Q: Tablet (768–1023px) — which layer does it get?
- [x] A) The phone/base layer, comfortably stretched — density arrives only at `lg:`; tablet reads as a large phone
- [ ] B) Its own `md:` breakpoint with intermediate density
- [ ] C) The desktop `lg:` layout early, at 768
- [ ] Other: __________________________________________
> WHY: no `md:` stop is shipped; treating tablet as a large phone until the pointer-density `lg:` threshold avoids a third layout to maintain.
> USER NOTES:

### Q: Landscape phone / orientation handling for tall play surfaces?
- [x] A) Portrait-first; landscape supported but never required — a board that must fit portrait measures its OWN footprint (`ResizeObserver`), never forces rotation
- [ ] B) Prompt "rotate your device" for the densest rooms
- [ ] C) Lock the app to portrait
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §3D/Stage is portrait-first; Séance rotates its matrix via a measured footprint below `lg` — a rotate-wall is a completeness regression.
> USER NOTES:

### Q: Does any room ever gate CONTENT behind desktop width?
- [x] A) Never — every room is fully playable at the min width; desktop adds only garnish/density (completeness Floor)
- [ ] B) Complex rooms may show a "best on desktop" notice but stay playable
- [ ] C) A couple of rooms are desktop-only
- [ ] Other: __________________________________________
> WHY: completeness Floor — the seed-bank / no-JS / mobile frame renders complete; nothing is desktop-only content, only desktop-only garnish.
> USER NOTES:

### Q: Minimum supported viewport width?
- [x] A) 320px (iPhone SE / small Android) — no horizontal PAGE scroll at 320
- [ ] B) 360px
- [ ] C) 375px
- [ ] Other: __________________________________________
> WHY: 320 is the practical small-phone floor; PATTERNS §Mobile allows horizontal scroll only inside a component, never the page.
> USER NOTES:

---

## C5.2 · Touch targets & fat-finger tolerance

### Q: When a dense board has more cells than fit at ≥44px, what gives?
- [x] A) The board redesigns its density (fewer cells per view / paginate a section) BEFORE any cell shrinks below 44 — the floor holds
- [ ] B) Cells stay visually small but each keeps a ≥44 invisible hit area via padding
- [ ] C) The board scales to fit and the player pinch-zooms to enlarge cells
- [ ] Other: __________________________________________
> WHY: PATTERNS §Mobile — a dense board redesigns its density before it shrinks below the floor; all three honor ≥44, A is the cleanest.
> USER NOTES:

### Q: Visual size vs hit area — may a compact chip carry a bigger tap target?
- [x] A) Yes — visual can be compact for density, but the tappable area stays ≥44 via padding/pseudo-element, and spacing is measured against the REAL hit area
- [ ] B) Visual size and hit area must match exactly (both ≥44)
- [ ] C) Everything is visually ≥44 as well (no compact glyphs)
- [ ] Other: __________________________________________
> WHY: the floor governs the hit target, not the ink; a 44px hit area under a smaller glyph keeps density AND the floor.
> USER NOTES:

### Q: Minimum gap between two adjacent hit areas (fat-finger separation)?
- [x] A) ≥8px gap, so two 44px targets never share an edge — dense grids use a hairline gutter that is also dead-space
- [ ] B) Targets may abut edge-to-edge (44px each is enough)
- [ ] C) A 4px gap
- [ ] Other: __________________________________________
> WHY: adjacent 44px targets still mis-tap without a gutter; 8px is the comfortable minimum that needs no redesign.
> USER NOTES:

### Q: The most destructive tap (submit answer / lock a guess) — fat-finger handling?
- [x] A) Extra spacing + a distinct engraved plate, never adjacent to a common tap — separation, not interruption
- [ ] B) A confirm dialog on every submit
- [ ] C) Same treatment as any other button
- [ ] Other: __________________________________________
> WHY: the cost of a mis-tap is highest on irreversible actions; separation beats a modal (Apple-fy restraint — fewer interruptions).
> USER NOTES:

### Q: Primary CTA size & placement on phone?
- [x] A) Full-width (or near) engraved plate anchored in the thumb zone, ≥44 tall, generous — one clear action per state
- [ ] B) A small right-aligned button (desktop proportion)
- [ ] C) A floating action button over the content
- [ ] Other: __________________________________________
> WHY: Apple-fy — one prominent, thumb-reachable action; plate = action in the shape language (FOUNDATIONS §Shape).
> USER NOTES:

### Q: Icon-only controls (mute, theme, back) footprint on phone?
- [x] A) A 44×44 tap target with the glyph (~20px) centered — padding carries the floor
- [ ] B) Group them into an overflow / settings sheet to reduce chrome count
- [ ] C) Extra-generous 56px targets
- [ ] Other: __________________________________________
> WHY: Floor — icon buttons reach 44 via padding; the persistent Lobby pill is the shipped ≥44 bar (PATTERNS §Nav).
> USER NOTES:

---

## C5.3 · Navigation & chrome on mobile

### Q: The persistent "← Lobby" affordance on phone?
- [x] A) A bottom-left pill ≥44px, thumb-reachable, always one tap to the lobby (shipped `RoomShell`), padded clear of the home indicator
- [ ] B) A top-left back chevron (iOS convention)
- [ ] C) Behind a hamburger drawer
- [ ] Other: __________________________________________
> WHY: PATTERNS §Nav — the persistent bottom-left Lobby pill; bottom-left is thumb-friendly and clears the gesture bar with a safe-area inset.
> USER NOTES:

### Q: Where do secondary game controls (settings, hints, legend) live on phone?
- [ ] A) A top bar (desktop parity)
- [x] B) A bottom sheet the player pulls up — controls sit in the thumb arc, dismiss by swipe-down / backdrop
- [ ] C) A left slide-in drawer
- [ ] Other: __________________________________________
> WHY: a bottom sheet keeps controls in the thumb zone and is the native idiom (Apple-fy); backdrop + Esc dismiss per PATTERNS overlay rules.
> USER NOTES:

### Q: Clue / prompt panels that sit in a desktop side-rail — mobile placement?
- [x] A) A collapsible drawer/bar ABOVE the play surface (the rail collapses to a bar), expandable — matches shipped Séance mobile
- [ ] B) Below the board, always-expanded inline
- [ ] C) On a separate tab/screen
- [ ] Other: __________________________________________
> WHY: the shipped Séance pattern — rail → drawer above the grid keeps clues glanceable without stealing board height.
> USER NOTES:

### Q: Sticky chrome (nameplate header / action footer) on scroll?
- [x] A) A minimal sticky FOOTER for the primary action; the header may scroll away — reclaim vertical space for play, respect safe-area insets
- [ ] B) Both header and footer sticky at all times
- [ ] C) Nothing sticky
- [ ] Other: __________________________________________
> WHY: phone height is scarce; one sticky action footer in the thumb zone beats double-sticky chrome eating the viewport.
> USER NOTES:

### Q: Thumb-reach doctrine — where does the interactive weight sit?
- [x] A) The bottom two-thirds (the natural thumb arc) holds actions; the top is reserved for read-only status / nameplate
- [ ] B) Top-anchored controls (a desktop mirror)
- [ ] C) Center-anchored
- [ ] Other: __________________________________________
> WHY: one-handed reach — actions in the thumb arc, glanceable status up top; native-feeling ergonomics.
> USER NOTES:

### Q: One house idiom for on-demand panels — drawer vs sheet vs bar?
- [x] A) A bottom SHEET for on-demand panels (settings/legend) + a collapsible BAR for persistent-but-compact rails (clues) — no left/hamburger drawers
- [ ] B) A hamburger drawer for everything
- [ ] C) Center modal dialogs
- [ ] Other: __________________________________________
> WHY: two thumb-zone, native idioms; drawers/hamburgers hide game controls behind an extra tap and read as SaaS chrome (not-like).
> USER NOTES:

### Q: Modal / overlay dismissal on phone (results, deck zoom)?
- [x] A) Swipe-down + backdrop + Esc all dismiss; focus trapped and returned to the opener; a full-height sheet on phone
- [ ] B) Backdrop + Esc + an X button (no swipe-down gesture)
- [ ] C) Backdrop + Esc only (minimal)
- [ ] Other: __________________________________________
> WHY: PATTERNS overlays close on Esc + backdrop with focus-return; adding swipe-down gives the native sheet feel. All three keep the a11y baseline.
> USER NOTES:

---

## C5.4 · Safe areas & keyboard

### Q: Notch / Dynamic Island / status-bar insets on top chrome?
- [x] A) Respect `env(safe-area-inset-top)` on any top chrome; the full-bleed background bleeds UNDER it, content never hides beneath
- [ ] B) Add a fixed 44px top pad everywhere
- [ ] C) Ignore it — let Safari handle layout
- [ ] Other: __________________________________________
> WHY: `env(safe-area-inset-*)` keeps content clear of the notch while the immersive candlelit ground extends under it (Apple-fy full-bleed).
> USER NOTES:

### Q: Home-indicator / gesture-bar inset for the Lobby pill & action footer?
- [x] A) Pad the bottom chrome by `env(safe-area-inset-bottom)` so the pill/footer clears the home indicator
- [ ] B) A fixed 34px bottom pad
- [ ] C) No bottom inset
- [ ] Other: __________________________________________
> WHY: `safe-area-inset-bottom` is device-correct; the persistent Lobby pill and sticky footer must not collide with the gesture bar.
> USER NOTES:

### Q: How far does the immersive background reach on phone?
- [x] A) Edge-to-edge UNDER the notch and home indicator; only interactive/text content honors the insets
- [ ] B) Inset the whole app frame (letterbox the background inside the safe area)
- [ ] C) No full-bleed on mobile
- [ ] Other: __________________________________________
> WHY: v4 full-bleed immersion — the candlelit ground fills the screen; insets guard only content, per Apple's edge-to-edge guidance.
> USER NOTES:

### Q: On-screen keyboard avoidance (text-entry rooms — daily / overture guesses)?
- [x] A) The active input scrolls into view above the keyboard; the sticky submit rides above the keyboard inset — the field is never trapped underneath
- [ ] B) Fixed layout; the player scrolls manually
- [ ] C) Push the whole page up by the keyboard height
- [ ] Other: __________________________________________
> WHY: keyboard-avoidance keeps input + submit visible together; a trapped field is the classic mobile-form failure.
> USER NOTES:

### Q: Viewport unit for full-height frames (the iOS URL-bar jump)?
- [x] A) `dvh`/`svh` (dynamic/small viewport height) for full-height frames — no content clipped as Safari's chrome collapses
- [ ] B) `100vh` everywhere
- [ ] C) A JS-measured pixel height
- [ ] Other: __________________________________________
> WHY: `dvh`/`svh` track the visible viewport as the URL bar collapses; `100vh` over-shoots and clips bottom content.
> USER NOTES:

---

## C5.5 · Layout adaptation & reflow

### Q: How does a dense desktop grid (Board 5×5, Séance matrix) reflow on phone?
- [x] A) Reflow to fit width via the room's OWN measured footprint (`FluidStage` / `ResizeObserver`) — cells stay ≥44, the board scales as a unit, no page x-scroll
- [ ] B) A fixed-size grid with horizontal PAGE scroll
- [ ] C) Stack every cell into a single column
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §3D/Stage — `FluidStage` fills width and dense boards measure their footprint; the ≥44 floor and no-page-x-scroll both hold.
> USER NOTES:

### Q: Scroll vs paginate for long content (category lists, results, many clues)?
- [x] A) Vertical scroll by default; paginate ONLY a genuine multi-round sequence (Gauntlet) — never horizontal page scroll
- [ ] B) Paginate everything into swipeable pages
- [ ] C) Infinite horizontal carousels
- [ ] Other: __________________________________________
> WHY: vertical scroll is the native mobile grain; horizontal is reserved for inside-component affordances only (PATTERNS §Mobile).
> USER NOTES:

### Q: What COLLAPSES first as width shrinks?
- [x] A) Decorative garnish and multi-column rails collapse first (into a bar/sheet); the play surface + primary action are the last to yield
- [ ] B) Shrink the play surface to keep the chrome intact
- [ ] C) Hide the primary action into a menu
- [ ] Other: __________________________________________
> WHY: completeness Floor — content/play is sacred and garnish is optional; chrome yields before the game does.
> USER NOTES:

### Q: A multi-column desktop layout (board + rail + status) on phone?
- [x] A) Reflow to a single vertical stack in reading order: status → play → controls (controls in the thumb zone)
- [ ] B) Keep the columns, shrink each
- [ ] C) Horizontal swipe between the columns
- [ ] Other: __________________________________________
> WHY: a single-column stack is the mobile grain, and source order = reading order keeps SR / no-JS coherent (completeness Floor).
> USER NOTES:

### Q: Play-surface gutter on phone — full-bleed or keep the desktop margin?
- [x] A) The play surface goes near full-bleed (minimal `--d-gutter` 1.25rem) to maximize board size; chrome keeps the gutter
- [ ] B) Keep the desktop 2.5rem gutter on the board too
- [ ] C) Zero gutter — cells touch the screen edge
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS `--d-gutter` is 1.25rem mobile vs 2.5 desktop by design — the phone reclaims width for the board while keeping a hairline breathing edge.
> USER NOTES:

### Q: How many columns does the deck / lobby card grid reflow to on phone?
- [x] A) `.density-grid` auto-fills at `--d-card-min` 15rem → ~1–2 columns on phone, growing with width; no fixed column count
- [ ] B) A fixed single column on phone
- [ ] C) A fixed 2 columns
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS `.density-grid` is `auto-fill minmax(--d-card-min,1fr)` — intrinsic and responsive without breakpoint math.
> USER NOTES:

### Q: The result / share card on phone?
- [x] A) A full-height sheet over a dimmed backdrop; the share line of squares wraps; one "Share" action in the thumb zone
- [ ] B) Inline below the board
- [ ] C) Auto-redirect to a separate results page
- [ ] Other: __________________________________________
> WHY: PATTERNS result archetype — a card over a dimmed backdrop; a full-height sheet is the native mobile presentation.
> USER NOTES:

---

## C5.6 · Gestures

### Q: The primary answer / selection gesture?
- [x] A) A single tap with an instant CSS press-state (≤150ms) — the one universal, discoverable gesture; result triple-encoded
- [ ] B) Tap-and-hold to confirm
- [ ] C) Swipe to select
- [ ] Other: __________________________________________
> WHY: PATTERNS interaction — instant press-state on tap; tap is the most discoverable, lowest-error gesture (accessible by construction).
> USER NOTES:

### Q: May any core action REQUIRE a swipe or long-press (no tap alternative)?
- [x] A) No — every gesture has a tap/button equivalent; swipe/long-press are optional accelerators only
- [ ] B) Long-press required for destructive actions
- [ ] C) Swipe required to advance a round
- [ ] Other: __________________________________________
> WHY: a required gesture is undiscoverable and inaccessible; the accessible-by-construction Floor — a hidden gesture never gates content.
> USER NOTES:

### Q: A multi-state cell (e.g. Séance blank → exclude → confirm) — touch gesture model?
- [x] A) Single-tap cycles all states (the shipped, frozen model) — predictable, one gesture; long-press optional as a shortcut-to-confirm
- [ ] B) Tap = exclude, long-press = confirm (two required gestures)
- [ ] C) Swipe left/right between states
- [ ] Other: __________________________________________
> WHY: Séance logic is frozen (presentation only); the single-tap cycle is the shipped, learnable model — no required second gesture.
> USER NOTES:

### Q: Preventing accidental triggers when tappable cells live inside a scroll area?
- [x] A) Distinguish tap from scroll/drag (a movement threshold + `touch-action`) so a scroll-swipe never fires a cell; cancel on drag-away
- [ ] B) Add a confirm step to every cell tap
- [ ] C) Disable scrolling on boards
- [ ] Other: __________________________________________
> WHY: `touch-action` + a movement threshold is the native fix; a confirm step taxes every interaction (anti-Apple-fy).
> USER NOTES:

### Q: Discoverability of any optional gesture (swipe-to-dismiss, long-press hint)?
- [x] A) Always signal it — a grabber handle on sheets, a subtle first-encounter hint — AND always keep the visible button too
- [ ] B) Leave gestures undocumented (a power-user reward)
- [ ] C) A one-time tutorial that lists every gesture up front
- [ ] Other: __________________________________________
> WHY: affordances must be visible (grabber + button); an undocumented gesture is invisible and fails accessibility.
> USER NOTES:

### Q: Pinch-zoom inside the map / starfield rooms?
- [x] A) Room-local pinch/zoom INSIDE the play surface (with a reset), native PAGE zoom left untouched
- [ ] B) No in-room zoom — the view fits the viewport; native page zoom is the only zoom
- [ ] C) A +/− zoom-button control (no gesture) for discoverability
- [ ] Other: __________________________________________
> WHY: in-component zoom aids a dense starfield while native page zoom stays available for accessibility (never `user-scalable=no`).
> USER NOTES:

---

## C5.7 · Mobile typography & density

### Q: Long question text that won't fit — what yields, given Q&A stays ≥1rem / ≥1.5?
- [x] A) The layout reflows/scrolls and text never drops below 1rem (Floor holds); measure stays 45–75ch
- [ ] B) Tighten container padding/gutter to buy width; text size unchanged
- [ ] C) Clamp to N lines with a "read more" expand
- [ ] Other: __________________________________________
> WHY: Floor — Q&A ≥1rem / ≥1.5 is inviolable; reflow, never shrink, to fit.
> USER NOTES:

### Q: Text-input font-size on phone (the iOS focus-zoom trap)?
- [x] A) ≥16px on every text input so Safari never auto-zooms on focus
- [ ] B) Smaller inputs, accept the focus-zoom
- [ ] C) Suppress the zoom via a `maximum-scale` viewport lock
- [ ] Other: __________________________________________
> WHY: inputs under 16px trigger Safari's jarring auto-zoom; 16px is the clean fix and keeps user zoom enabled (accessibility).
> USER NOTES:

### Q: Display / nameplate type (Fraunces) scaling on phone?
- [x] A) Fluid `clamp()` down to the legible floor (display-only ≥18px), never below; body stays fixed ≥1rem
- [ ] B) Fixed desktop display sizes (may overflow)
- [ ] C) Keep the size and truncate/wrap long names rather than shrink
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Type — display-only ≥18px; `clamp` keeps the engraved voice without overflow or illegibility.
> USER NOTES:

### Q: Density on phone — comfortable or dense?
- [x] A) Comfortable base (generous spacing, base `--d-*` values); density (tighter gutters/gaps) is the `lg:` add-on only
- [ ] B) Dense everywhere to fit more content
- [ ] C) Extra-comfortable (oversized spacing) on phone
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS density is comfortable→dense with `lg:` stepping up; the phone stays comfortable for reach + legibility.
> USER NOTES:

### Q: The `viewport` meta configuration?
- [x] A) `width=device-width, initial-scale=1, viewport-fit=cover` — enables `env()` insets for full-bleed; user zoom stays enabled
- [ ] B) `width=device-width, initial-scale=1` only — simpler, but no safe-area insets for full-bleed
- [ ] C) A JS-set viewport height instead of the meta tag
- [ ] Other: __________________________________________
> WHY: `viewport-fit=cover` unlocks `env()` insets for edge-to-edge immersion, and keeping user zoom is an accessibility requirement.
> USER NOTES:

---

## C5.8 · Mobile performance (device-class)

### Q: Motion budget on low-end phones?
- [x] A) The same ≤1 looping-animation/viewport Floor; the signature loop is GPU-cheap (`transform`/`opacity`/`filter`) — reduced-motion is the escape hatch, no device-sniffing
- [ ] B) Detect low-end devices and disable all motion
- [ ] C) Full motion regardless of device
- [ ] Other: __________________________________________
> WHY: PATTERNS §Motion — one compositor-only loop is affordable on phones; reduced-motion (user/OS) is the designed opt-out, not fragile device detection.
> USER NOTES:

### Q: WebGL / canvas rooms (Clock, Map, Streak) on phones?
- [x] A) DPR≤2, one shared RAF loop, portrait-first framing, full disposal on unmount (FOUNDATIONS §3D); degrade to a static frame on low-mem / no-WebGL
- [ ] B) The same budget but also thin the scene (fewer stars/particles) below `lg:` for headroom
- [ ] C) A static frame on phones; WebGL only on desktop
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §3D — DPR≤2 + shared RAF + disposal is the shipped mobile budget, and the static degrade is a Floor.
> USER NOTES:

### Q: How do mobile sheets/overlays get depth, given no NEW `backdrop-filter` beyond the deck zoom?
- [x] A) Solid `--c-surface` + hairline/gilt border + drop-shadow (the shipped depth language) — no blur
- [ ] B) A dimmed opaque scrim behind the sheet (no blur); the sheet sits on a solid surface
- [ ] C) Reuse only the existing deck-zoom `backdrop-filter`, nowhere new
- [ ] Other: __________________________________________
> WHY: PATTERNS perf floor — depth via shadow/border/material, not new `backdrop-filter` (the mobile frame-rate killer); all three avoid new blur.
> USER NOTES:

### Q: Atmosphere / imagery weight on mobile data?
- [x] A) Atmosphere stays CSS/SVG/GPU garnish — zero raster on the critical path; the seed/CSS frame is complete without it (Floor)
- [ ] B) One small optimized (AVIF/WebP) accent image per room, lazy-loaded below the fold
- [ ] C) Rich per-room raster atmosphere, lazy-loaded
- [ ] Other: __________________________________________
> WHY: completeness Floor + "premium via craft, not spend" — CSS atmosphere is cheap and offline; raster stays minimal and optional.
> USER NOTES:

### Q: First-load payload target on a mid-tier phone / 4G?
- [x] A) Server Components by default, `"use client"` only for interactivity — ship minimal JS; the static frame is meaningful before hydration
- [ ] B) Client-render the whole app for snappiness after load
- [ ] C) No explicit target
- [ ] Other: __________________________________________
> WHY: CLAUDE.md — App Router Server Components by default, client only for game interactivity; smallest JS-to-interactive on phones.
> USER NOTES:

## C6 · Premium polish & Apple-fy

> Game-agnostic. The "make it feel expensive" dimension — depth, material, spacing rhythm,
> type scale, color grading, finish, and cohesion. Apple-fy here means **restraint + depth**:
> fewer, better elements; real material; slow, deliberate polish — never more effects. Every
> pick holds the §Floors (AA contrast, ≥44px targets, one focus ring, ≥1rem Q&A, ≤1 loop/viewport,
> zero-env render). Accept the pre-picked spec, or override in `> USER NOTES:`.

## Depth & material — elevation, shadow, engraving & one light source

### Q: What is the elevation vocabulary for panels and cards across every room?
- [ ] A) Flat surfaces separated by hairline borders only — no shadow language
- [x] B) The FOUNDATIONS 3-level depth ladder: (1) hairline `line`/`brass`, (2) `.gilt-frame` soft brass box-shadow on `surface`, (3) drop-shadow bloom — never a 4th level
- [ ] C) Heavy multi-layer Material-style shadows with several elevation tiers
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS caps depth at ≤3 levels; a fixed ladder reads as one crafted room, not stacked SaaS cards.
> USER NOTES:

### Q: When a panel must feel raised, does it lift by border or by shadow?
- [ ] A) A thicker/brighter border draws the edge
- [x] B) Shadow + elevation does the lifting; the hairline `line` stays DECORATIVE engraving, never the affordance
- [ ] C) Both border and shadow at full strength on every raised panel
- [ ] Other: __________________________________________
> WHY: Color-role law — `line` is decorative; depth comes from the shadow ladder, so raised ≠ louder outline (light lifts by line+shadow with no hue shift).
> USER NOTES:

### Q: How is "one light source" enforced across gilt, gold-text, and specular highlights?
- [x] A) A single viewport-fixed `--gold-sheet` specular spot lights every `.gilt`/`.gold-text` from one static angle — no second light
- [ ] B) Each component carries its own local highlight direction
- [ ] C) A moving/animated highlight that tracks the cursor
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS one-light-source rule (haunted-mansion anchor: one candle); a single static sheet is GPU-free and unmistakably intentional.
> USER NOTES:

### Q: What color is a drop-shadow bloom in each theme?
- [ ] A) Neutral black at low alpha in both themes
- [x] B) Dark = warm candle bloom; light = soft UMBER `rgba(58,26,32,…)`, never black
- [ ] C) A cool gray shadow shared by both themes
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Shape — black shadows read as generic UI; warm bloom / umber keeps the candlelit-parchment mood in both themes.
> USER NOTES:

### Q: Should headers and CTAs carry a carved / engraved treatment?
- [x] A) Yes — the engraved plate: brass hairline + 1px gilt inset shadow, so the surface reads as carved metal/card
- [ ] B) No engraving; flat fills with a colored label
- [ ] C) Deep bevels and embossed 3D chrome on every control
- [ ] Other: __________________________________________
> WHY: UI-KIT Button plate + FOUNDATIONS engraved-plate radius 4; the inset gilt is the "engraved playing card" anchor, restrained not skeuomorphic.
> USER NOTES:

### Q: How wide is the material vocabulary (glass / velvet / brass / parchment)?
- [ ] A) Introduce frosted-glass panels broadly as the primary surface
- [x] B) Brass + parchment + velvet-shadow as the core; glass/translucency only as a rare accent
- [ ] C) Mix many materials freely per room for variety
- [ ] Other: __________________________________________
> WHY: INDEX anchor (brass, velvet, parchment, candle-glow); a tight material set is what makes it read luxe rather than a theme-pack.
> USER NOTES:

### Q: Keep the frozen grain texture (`--tex-grain`) as the base material?
- [x] A) Yes — the FROZEN inline-SVG `feTurbulence` grain, ≤3% opacity over `bg` ONLY, never behind Q&A/panels; static, zero-network
- [ ] B) Remove it — keep grounds perfectly flat
- [ ] C) Add animated/per-render grain for a living film-grain effect
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §material (TRIAL T3) — a static ≤3% grain kills sterile-vector banding and strengthens the parchment anchor at zero cost; animated/random grain breaks SSR + the ≤1-loop floor.
> USER NOTES:

### Q: How consistent is corner radius across shapes (shape language)?
- [ ] A) One shared radius on everything for uniformity
- [x] B) Shape-coded: deck-frame radius for cards/panels, engraved-plate radius 4 for CTAs, `rounded-full` for toggles/switches
- [ ] C) Radius chosen ad hoc per component
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS challenge T2 — round=switch, plate=action; a consistent shape grammar is a premium tell and removes guesswork per room.
> USER NOTES:

## Spacing rhythm & density — the 8pt breath and alignment

### Q: What spacing scale governs padding, gaps, and stacks?
- [x] A) The FOUNDATIONS 4/8/12/16/24/32/48/64 ramp (4px base, 8pt-ish); within a block, multiples of 0.25rem — no ad hoc values
- [ ] B) Free-form pixel values chosen per component
- [ ] C) A denser 2px-base scale for tighter layouts
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Space; a single quantized ramp is the invisible backbone of "expensive" — every edge lands on the grid.
> USER NOTES:

### Q: What is the default density before the desktop step-up?
- [x] A) Comfortable on phone base; density steps up at `lg:` (1024px) via the `--d-*` tokens (gutter/maxw/gap/track/stack)
- [ ] B) Dense everywhere, including phone
- [ ] C) Comfortable everywhere, no desktop step-up
- [ ] Other: __________________________________________
> WHY: INDEX slider (dense 3/5, comfortable→dense) + FOUNDATIONS §Space; generous mobile breath then earned desktop density is the Apple-fy read.
> USER NOTES:

### Q: How much breathing room surrounds a hero / nameplate moment?
- [ ] A) Tight — pack supporting elements close to fill the space
- [x] B) Generous negative space; fewer elements, the nameplate stands alone with air around it
- [ ] C) Fill margins with decorative filigree
- [ ] Other: __________________________________________
> WHY: Apple-fy = restraint; whitespace around one focal element signals confidence, clutter signals a template.
> USER NOTES:

### Q: What governs the rhythm between stacked content blocks?
- [x] A) The `--d-stack` token as the single vertical rhythm between blocks (steps 1.25→1.75rem at `lg:`)
- [ ] B) Each block sets its own top/bottom margin
- [ ] C) A fixed pixel gap that never changes across breakpoints
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Layout-density; one shared rhythm token keeps every room on the same cadence — rooms never invent their own grid.
> USER NOTES:

### Q: How strict is edge alignment across a room's elements?
- [x] A) Strict shared-grid alignment (gutter/maxw/gap from `--d-*`); optical alignment only for display caps and glyphs
- [ ] B) Loose — elements align "close enough" per section
- [ ] C) Center-everything with no consistent left edge
- [ ] Other: __________________________________________
> WHY: Alignment discipline is the cheapest luxury tell; the `--d-*` grid gives every room the same load-bearing edges.
> USER NOTES:

### Q: How does page side padding (gutter) behave across breakpoints?
- [x] A) `--d-gutter` steps 1.25rem → 2.5rem at `lg:` — never a hardcoded gutter
- [ ] B) A single fixed gutter at all sizes
- [ ] C) Full-bleed to the viewport edge on mobile
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Layout-density; a token-driven gutter keeps content off the edges on phone and opens up on desktop, consistently.
> USER NOTES:

### Q: What caps content width and reading measure?
- [x] A) `--d-maxw` (64→80rem) for room width; prose/Q&A held to a 45–75ch measure
- [ ] B) Full viewport width regardless of line length
- [ ] C) A narrow fixed column that wastes desktop space
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Type measure + §Layout-density; 45–75ch is the legibility sweet spot and a bounded max-width reads composed, not stretched.
> USER NOTES:

### Q: How dense may in-game grids/boards get before they feel cramped?
- [x] A) Cells honor the ≥44×44px target with `--d-col-gap` breathing room; density added by more columns at `lg:`, not tighter cells
- [ ] B) Shrink cells below comfortable size to fit more on screen
- [ ] C) Fixed cell size that ignores breakpoint
- [ ] Other: __________________________________________
> WHY: Target floor covers in-game cells/chips; density comes from the responsive grid, never from squeezing tap targets.
> USER NOTES:

## Typography scale — display, body, numerals & the legibility floor

### Q: What is the display / body face pairing?
- [x] A) Fraunces (`--font-display`, engraved old-style serif, opsz+WONK) for nameplates/headers over a system-sans stack for body and all Q&A
- [ ] B) Fraunces everywhere including body and questions
- [ ] C) A single geometric sans for both display and body
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Type — engraved period display over a maximally-legible neutral body; the Victorian voice never taxes reading.
> USER NOTES:

### Q: How many distinct type sizes should a room use?
- [x] A) A small modular ramp — few deliberate sizes (display / heading / body / microlabel), reused everywhere
- [ ] B) Many bespoke sizes tuned per element
- [ ] C) Two sizes only (one big, one small)
- [ ] Other: __________________________________________
> WHY: Apple-fy = fewer better elements; a tight size ramp is what makes the hierarchy read as designed rather than accreted.
> USER NOTES:

### Q: What letter-spacing distinguishes display vs signage?
- [x] A) `.display` at 0.04em (UPPERCASE, line-height 0.92); `.microlabel` at 0.22em — signage is the widely-tracked tier
- [ ] B) Default tracking on everything
- [ ] C) Wide tracking on body text for an "airy" look
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Type; the tracking contrast (tight display, wide microlabel) is a signature — wide-tracked body would break the reading measure/floor.
> USER NOTES:

### Q: Use a drop-initial / drop-cap as a decorative flourish?
- [x] A) Yes — a Fraunces drop-initial on intro blurbs / card cartouches / opening narration, DECORATIVE only, never on Q&A or answers
- [ ] B) No drop-initials anywhere
- [ ] C) Drop-initials on every paragraph including questions
- [ ] Other: __________________________________________
> WHY: A period drop-cap sells the engraved-book anchor; confining it to chrome respects VOICE (theatre in chrome, plain in trivia) and the Q&A-legibility floor.
> USER NOTES:

### Q: How are numerals (scores, timers, ranks) set?
- [x] A) Tabular/lining figures, plain digits, no theatre inside the readout — flourish lives in the surrounding frame
- [ ] B) Proportional figures that shift width as numbers change
- [ ] C) Stylized numerals inside a gilt/gradient treatment
- [ ] Other: __________________________________________
> WHY: VOICE numbers rule + legibility floor; tabular figures stop score/timer jitter and gilt-on-digits would break the "never inside gilt/gradient" floor.
> USER NOTES:

### Q: What baseline body size sits above the ≥1rem floor?
- [x] A) 1rem baseline with line-height ≥1.5, stepping to ~1.0625–1.125rem for primary reading blocks — comfortable, never sub-1rem
- [ ] B) Exactly 1rem everywhere, no comfort step
- [ ] C) A 1.25rem base that crowds dense boards
- [ ] Other: __________________________________________
> WHY: Floor is ≥1rem/1.5; a modest step up for prose reads generous while dense boards stay at the 1rem floor — both legible.
> USER NOTES:

### Q: Where is UPPERCASE permitted?
- [x] A) Reserved for `.display` nameplates and `.microlabel` signage only — never body or Q&A
- [ ] B) Uppercase section intros and some body for emphasis
- [ ] C) All headings uppercase regardless of tier
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Type; uppercase is engraved-signage language — uppercase body hurts legibility and reads shouty, not luxe.
> USER NOTES:

### Q: How wide is the font-weight range?
- [x] A) Restrained — display 700, body regular/medium; avoid a spread of weights
- [ ] B) Many weights (light→black) for expressive contrast
- [ ] C) One weight for everything
- [ ] Other: __________________________________________
> WHY: Apple-fy restraint; hierarchy from size/tracking/color, not a ladder of weights, keeps the type system quiet and cohesive.
> USER NOTES:

## Color grading — gradients, tonal cohesion, parity & jewel accents

### Q: Gradients vs flat fills — how are grounds finished?
- [x] A) Subtle tonal gradients / soft radial glows on grounds & materials; flat surfaces behind text — no hard color blocks
- [ ] B) Flat fills everywhere, no gradients
- [ ] C) Bold multi-stop gradients as decorative backgrounds
- [ ] Other: __________________________________________
> WHY: Soft tonal grading removes the sharp edges that read as SaaS-flat, while text stays on flat surfaces for AA — gradient behind Q&A is a floor break.
> USER NOTES:

### Q: How are category presences rendered on a surface?
- [x] A) Soft radial `.glow` blooms (dark = bloom, light = pigment) behind content — not hard-edged color rectangles
- [ ] B) Solid category-colored panels/blocks
- [ ] C) Category color only as a thin top border
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §glow + RoomShell drifting glow; a diffuse bloom keeps color atmospheric and edge-free, the opposite of stock category chips.
> USER NOTES:

### Q: What keeps color tonally cohesive across a room?
- [x] A) Everything keyed to the candle/brass/parchment token palette; no off-palette or new hex literals in components
- [ ] B) Rooms free to introduce fresh accent hexes as needed
- [ ] C) A high-saturation accent added per room for energy
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS color-role law (no new hex in components) + tokens-only; a closed palette is the single biggest driver of "this looks expensive."
> USER NOTES:

### Q: How faithful is dark/light parity?
- [x] A) Full parity — light is a ROLE REMAP of the same house ("curtains drawn"), nothing repainted; every token computed AA both themes
- [ ] B) Light mode is a separate, lighter visual treatment
- [ ] C) Ship dark only; light is a rough afterthought
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Color + Floors; role-remap parity means one design in two lights, and AA-both-themes is non-negotiable.
> USER NOTES:

### Q: How is category color applied to TEXT vs fills/glyphs?
- [x] A) Colored TEXT uses the `--cat-*` INK tokens (≥4.5:1 both themes); FILL/`CATEGORY_HEX` only for glyphs, glows, wedges, pins — never colored text
- [ ] B) Use `CATEGORY_HEX` for both text and fills
- [ ] C) Only ever use category color on non-text marks
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Category jewels — two-tier single source; `CATEGORY_HEX` text fails contrast, INK is the text-safe tier.
> USER NOTES:

### Q: How strong / saturated is the category color-coding?
- [x] A) Jewel-toned (rich but not neon), always triple-encoded color + glyph + label — identity, not decoration
- [ ] B) Bright saturated colors to maximize distinction
- [ ] C) Very muted, near-monochrome category tints
- [ ] Other: __________________________________________
> WHY: INDEX (jewel-ink, never neon-nightlife) + category-triple-encode floor; jewel saturation reads luxe and the glyph+label carry meaning without loud color.
> USER NOTES:

### Q: How many accent colors act as the interactive "highlight"?
- [x] A) One brass/gold accent as the universal interactive highlight; category color signals identity only, not interactivity
- [ ] B) Each category color doubles as its own interactive accent
- [ ] C) Multiple accent colors mixed per screen
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Color-role; a single interactive accent keeps affordances legible and the palette disciplined — category ≠ button color.
> USER NOTES:

### Q: How is the room background composed (compose the material)?
- [x] A) `bg` token + static `--tex-grain` grain AND one soft radial candle glow — panels stay clean `surface` on top
- [ ] B) A busy patterned or illustrated background
- [ ] C) A pure flat fill with no material at all
- [ ] Other: __________________________________________
> WHY: These two layers compose one atmospheric, zero-network ground (grain kills banding, one glow gives the single light) while keeping content surfaces clean — honors the ≤1-loop and one-light rules.
> USER NOTES:

## Micro-delight & finish — hover, focus, states, transitions, restraint

### Q: What happens on hover (pointer devices)?
- [x] A) A subtle gilt-sheet / border shimmer garnish — pointer-only (`@media(hover:hover)`), finite ≤600ms, never load-bearing
- [ ] B) A pronounced scale/glow pop on every hover
- [ ] C) No hover feedback at all
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS + Motion floor; a restrained gilt shimmer rewards without breaking calm — hover is garnish, so touch users lose nothing.
> USER NOTES:

### Q: How is focus polish handled?
- [x] A) One global `--c-focus` ring (2px + 2px offset, radius 4) on every interactive element; components thicken, never re-color
- [ ] B) A custom focus style per component/room
- [ ] C) A colored glow that changes hue by category
- [ ] Other: __________________________________________
> WHY: Focus floor — one ring everywhere is both an a11y guarantee and a consistency tell; recoloring per component breaks the system.
> USER NOTES:

### Q: What does an empty / first-run state look like?
- [x] A) A mansion-voice invitation with a clear next action ("The table is set. Choose a card.") — calm, never a dead end
- [ ] B) A blank area with a generic "No data" line
- [ ] C) An illustration-heavy empty state with no next action
- [ ] Other: __________________________________________
> WHY: VOICE empty-states (poolsuite rule — voice reaches every surface); an in-character invitation with a next action is the premium finish.
> USER NOTES:

### Q: What is the loading treatment?
- [x] A) A designed candlelight skeleton / gentle shimmer in-voice; reduced-motion → a static designed frame (single loop max)
- [ ] B) A generic spinner
- [ ] C) A blocking full-screen loader
- [ ] Other: __________________________________________
> WHY: Apple-fy finish + Motion floor; a themed skeleton keeps the ritual unbroken and the reduced-motion static frame keeps it accessible — a spinner reads as stock UI.
> USER NOTES:

### Q: How does an error read?
- [x] A) In-character but clear — names what happened + the way forward, and states the seed-bank fallback ("The archive is unreachable; the house has laid out last night's cards instead")
- [ ] B) A raw error message / stack trace
- [ ] C) A generic "Something went wrong" with no path forward
- [ ] Other: __________________________________________
> WHY: VOICE errors; naming the fallback in the mansion voice turns a failure into part of the ritual — never blame the player, never a stack trace.
> USER NOTES:

### Q: What is the transition character between states?
- [x] A) Slow, deliberate entrances on the `cubic-bezier(0.22,1,0.36,1)` curve, finite ≤600ms, ≤1 looping animation per viewport
- [ ] B) Fast snappy transitions under 150ms everywhere
- [ ] C) Multiple simultaneous looping animations for liveliness
- [ ] Other: __________________________________________
> WHY: UI-KIT Toast curve + Motion floor; slow deliberate motion is the cinematic-ceremony read, and the ≤1-loop cap keeps it calm not busy.
> USER NOTES:

### Q: What is the Apple-fy rule when a screen feels unfinished?
- [x] A) Remove/merge elements and add space & material — fewer, better parts
- [ ] B) Add more decorative effects, glows, and motion to fill it
- [ ] C) Add more content blocks to reduce whitespace
- [ ] Other: __________________________________________
> WHY: Apple-fy doctrine = restraint + depth; the fix for "flat" is subtraction plus material, never a pile of effects.
> USER NOTES:

### Q: What does press / active feedback feel like?
- [x] A) Instant CSS press (≤150ms) on engraved plates — a physical, immediate depress
- [ ] B) A delayed animated bounce on release
- [ ] C) No active state; only hover and focus
- [ ] Other: __________________________________________
> WHY: UI-KIT Button active state; an instant press reads as a real physical control (the engraved plate), where slow bounces feel gimmicky.
> USER NOTES:

### Q: How are transient notices (achievements, confirmations) finished?
- [x] A) Reuse the `AchievementToast` shell — `role="status"` polite live region, enter ≤600ms, crossfade (no slide) under reduced-motion
- [ ] B) A bespoke toast style per notice type
- [ ] C) A modal that interrupts play
- [ ] Other: __________________________________________
> WHY: UI-KIT Toast; one reused shell keeps finish consistent and the polite-live-region + reduced-motion variant hold the a11y floors.
> USER NOTES:

## Cohesion — one system, nothing looks like standard UI

### Q: What keeps a single room internally consistent?
- [x] A) Shared shells (`RoomShell`, `.gilt-frame`, plate/switch shapes) + exactly ONE signature loop per room — no bespoke chrome per component
- [ ] B) Each component styled independently for variety
- [ ] C) Multiple competing signature animations in one room
- [ ] Other: __________________________________________
> WHY: UI-KIT shells + Motion floor (≤1 loop/viewport); reusing the core shells is what makes a room read as one designed space.
> USER NOTES:

### Q: How high is the "nothing looks like standard UI" (v4) bar?
- [x] A) Every control is a themed engraved plate / physical switch — no default browser widgets, no flat SaaS buttons/inputs
- [ ] B) Themed hero elements but default controls elsewhere
- [ ] C) Standard UI kit with a themed color palette on top
- [ ] Other: __________________________________________
> WHY: v4 "nothing looks like standard UI" + INDEX not-like (flat SaaS dashboards); themed-to-the-controls is the difference between luxe and a reskin.
> USER NOTES:

### Q: How is spookiness handled — atmosphere vs camp?
- [x] A) Elegant restraint — mood from light, material, and voice; NO clip-art ghosts/skulls/cobwebs or stock Halloween imagery
- [ ] B) Lean into playful Halloween iconography for fun
- [ ] C) Photoreal horror imagery for intensity
- [ ] Other: __________________________________________
> WHY: v4 "avoid stereotypical Halloween visuals" + INDEX feels-like (mysterious/luxe, never templated); the haunt is atmospheric, engraved, and dry-witted.
> USER NOTES:

### Q: How is SaaS-flat avoided without tipping into skeuomorphic overload?
- [x] A) Real but restrained depth + material (the 3-level ladder, one light, one grain) — enough to feel physical, never heavy bevels/textures everywhere
- [ ] B) Fully flat, minimal-material design
- [ ] C) Maximal skeuomorphism — leather, deep bevels, heavy drop shadows
- [ ] Other: __________________________________________
> WHY: Apple-fy = restraint + depth; a disciplined amount of material reads engraved-card premium, while overload reads dated and the ladder cap prevents it.
> USER NOTES:

### Q: How may rooms differ from one another while staying one family?
- [x] A) Per-room skins vary palette / material / motion / type via the `--skin-*` seams; shape language, focus ring, `CATEGORY_HEX`, and all §Floors stay shared
- [ ] B) Each room a fully independent visual system
- [ ] C) Every room identical, no per-room character
- [ ] Other: __________________________________________
> WHY: INDEX design-model (skins over locked floors); variation in the non-floor seams gives each room a signature while the floors keep the family intact.
> USER NOTES:

### Q: What iconography / glyph style unifies the rooms?
- [x] A) The category suit glyphs (♦♥♣♠✦✧) + restrained line-mark icons, consistent stroke and weight across rooms — always paired with a label
- [ ] B) A mixed icon set chosen per room
- [ ] C) Emoji or stock icon packs for speed
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS §Category jewels + category-triple-encode floor; one glyph vocabulary at a consistent weight is a cohesion tell and never color-alone.
> USER NOTES:

### Q: When a new element has no obvious precedent, what governs its look?
- [x] A) Derive from tokens + the nearest UI-KIT shell first; only add a new token/pattern as a deliberate, documented system change
- [ ] B) Design it fresh in isolation to fit the moment
- [ ] C) Copy a pattern from an external UI library
- [ ] Other: __________________________________________
> WHY: FOUNDATIONS (tokens are the only source; new token = a globals change) + UI-KIT; defaulting to the system is what keeps polish cohesive as the app grows.
> USER NOTES:
