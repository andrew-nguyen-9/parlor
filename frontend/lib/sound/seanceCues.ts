// The Séance cue map (E4-content) — the single place that names WHICH sound each
// séance game event makes. It only DECLARES cues into the shared engine
// (`lib/sound.ts`) via `registerRoomAudio`; the engine owns playback, gating and
// the master volume/mute bus. There is no second audio path and no per-room
// mixer — every cue below multiplies through the one authority, so global mute
// (or volume 0) silences all of it, and nothing sounds before the first user
// gesture unlocks the AudioContext (autoplay-safe).
//
// Design-intake spec: docs/planning/design-intake/seance.md §S6 "Audio content (E4)".
// Per-event picks are encoded here 1:1. Discrete SFX respect mute only (not
// reduced-motion — they are feedback, not motion); the looping ambient bed is
// reduced-motion-gated inside the engine.

// Relative (not "@/lib/sound") so this module is unit-testable under vitest,
// which does not resolve the app's "@/" alias.
import {
  registerRoomAudio,
  playSfx,
  sfxGlassClink,
  sfxWrong,
  sfxPianoChord,
} from "../sound";

const A = "/audio/seance"; // committed CC0 one-shots (see ./README.md)

// Register the séance voices ONCE at import time. `registerRoomAudio` shallow-
// merges, so re-import is idempotent. Asset-backed cues go through `playSfx`,
// which loads the committed file, falls back to the named synth (or silence)
// when it is absent/undecodable, and never bypasses the master gate.
let registered = false;

export function registerSeanceAudio(): void {
  if (registered) return;
  registered = true;
  registerRoomAudio("seance", {
    // A low, slow drone as the always-available bed baseline (C2). To upgrade to
    // a committed seamless loop, drop `/audio/ambient-seance.mp3` in AND add
    // `ambientAsset: "/audio/ambient-seance.mp3"` here (opt-in — the engine no
    // longer speculatively probes for it, which used to 404). Bed stays mute- AND
    // reduced-motion-gated by the engine.
    ambientRoot: 65.41,
    events: {
      // Snuff a candle (exclude): a soft, short, dry puff — quiet.
      snuff: () => playSfx(`${A}/snuff.ogg`, 0.16),
      // Bind a rune (confirm): glass resonance; synth glass-clink if absent.
      bind: () => playSfx(`${A}/bind.ogg`, 0.3, sfxGlassClink),
      // One gentle whisper for the whole auto-elimination sweep (not per cell).
      cascade: () => playSfx(`${A}/cascade.ogg`, 0.1),
      // Poltergeist Strike (wrong submit): a heavier, darker wood thud; synth
      // wrong-buzz if absent. Paired with the room-darken visual (felt, not a
      // jumpscare).
      strike: () => playSfx(`${A}/strike.ogg`, 0.4, sfxWrong),
      // Planchette glides across polished wood toward a hint (deliberate move
      // only, never the idle drift): a soft, very quiet wood slide.
      planchette: () => playSfx(`${A}/planchette.ogg`, 0.13),
    },
    // Banished / completion: keep the shared committed stinger and layer a soft
    // reverent piano chord under it (warm swell, no explosion). The engine ducks
    // the bed before this fires; the room also stops the bed for the
    // silence-then-swell beat at the call site.
    stinger: () => {
      playSfx("/audio/stinger.mp3", 0.5); // absent → the chord below is the swell
      sfxPianoChord();
    },
  });
}
