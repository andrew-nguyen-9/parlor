// Web Audio sound engine — every sound is synthesized at runtime, so PARLOR
// ships zero audio assets and stays playable from a clone. A single shared
// AudioContext is lazily created on first user gesture (browser autoplay rules).
// Mute state persists to localStorage and is mirrored to a module-level flag so
// non-React callers (game loops) can check it cheaply.

import type { Note } from "./types";

const MUTE_KEY = "parlor:muted";

let ctx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  muted = localStorage.getItem(MUTE_KEY) === "1";
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean): void {
  muted = v;
  if (typeof window !== "undefined") {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  }
  // Mute is the single audio authority: muting silences the ambient bed at once;
  // unmuting resumes whichever room bed the last mounted room asked for.
  if (v) teardownAmbient();
  else if (ambientDesiredRoom) startAmbient(ambientDesiredRoom);
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  if (!muted) blip(660, 0.07, "triangle", 0.2); // confirmation chirp on unmute
  return muted;
}

/** Scientific pitch → frequency (Hz). "rest" or unknown → 0 (silence). */
export function noteFreq(name: string): number {
  if (!name || name === "rest") return 0;
  const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(name.trim());
  if (!m) return 0;
  const steps: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let semis = steps[m[1].toUpperCase()];
  if (m[2] === "#") semis += 1;
  if (m[2] === "b") semis -= 1;
  const octave = parseInt(m[3], 10);
  const midi = semis + (octave + 1) * 12; // MIDI note number
  return 440 * Math.pow(2, (midi - 69) / 12); // A4 = 69 = 440 Hz
}

/** One short tone. Internal building block for every SFX. */
function blip(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.25,
  when = 0,
): void {
  const a = ac();
  if (!a || muted || freq <= 0) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// ── named SFX ────────────────────────────────────────────────────────────────
export const sfx = {
  tick: () => blip(440, 0.04, "square", 0.08),
  select: () => blip(520, 0.06, "triangle", 0.18),
  correct: () => {
    blip(660, 0.1, "triangle", 0.25, 0);
    blip(880, 0.14, "triangle", 0.25, 0.09);
  },
  wrong: () => {
    blip(200, 0.18, "sawtooth", 0.22, 0);
    blip(150, 0.22, "sawtooth", 0.22, 0.12);
  },
  combo: (level: number) => blip(523 + level * 70, 0.08, "square", 0.2),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      blip(f, 0.18, "triangle", 0.28, i * 0.11),
    );
  },
  lose: () => {
    [392, 330, 262].forEach((f, i) => blip(f, 0.25, "sawtooth", 0.22, i * 0.16));
  },
  countdown: () => blip(880, 0.12, "square", 0.22),
};

/**
 * Play a melody (Jukebox offline mode). Returns a stop() handle. Tempo in BPM;
 * each Note.d is a beat count. Uses a plucky triangle voice with light vibrato.
 */
export function playMelody(
  melody: Note[],
  bpm = 120,
): { stop: () => void } {
  const a = ac();
  if (!a || muted) return { stop: () => {} };
  const spb = 60 / bpm; // seconds per beat
  const start = a.currentTime + 0.05;
  let cursor = start;
  const stops: OscillatorNode[] = [];

  for (const note of melody) {
    const dur = note.d * spb;
    const freq = noteFreq(note.n);
    if (freq > 0) {
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, cursor);
      g.gain.setValueAtTime(0.0001, cursor);
      g.gain.exponentialRampToValueAtTime(0.3, cursor + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, cursor + dur * 0.95);
      osc.connect(g).connect(a.destination);
      osc.start(cursor);
      osc.stop(cursor + dur);
      stops.push(osc);
    }
    cursor += dur;
  }
  return {
    stop: () => stops.forEach((o) => { try { o.stop(); } catch {} }),
  };
}

// ── speakeasy ceremony SFX (Phase 5–7 redesign) ──────────────────────────────
// Richer, themed one-shots used by The Thread, The Séance, and The Ladder. They
// share the module's AudioContext and respect the same mute flag as everything
// above.

/** Door latch/creak: sawtooth frequency sweep down with a metallic tail. */
export function sfxDoorLatch(): void {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(a.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(600, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, a.currentTime + 0.18);
  g.gain.setValueAtTime(0.12, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.22);
  osc.start();
  osc.stop(a.currentTime + 0.22);
}

/** Glass clink: high sine ping with quick decay. */
export function sfxGlassClink(): void {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(a.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, a.currentTime + 0.04);
  g.gain.setValueAtTime(0.18, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.5);
  osc.start();
  osc.stop(a.currentTime + 0.5);
}

/** Soft piano chord (C–E–G): three stacked sine oscillators, gentle attack. */
export function sfxPianoChord(): void {
  const a = ac();
  if (!a || muted) return;
  for (const freq of [261.63, 329.63, 392.0]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.connect(g).connect(a.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, a.currentTime);
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.linearRampToValueAtTime(0.07, a.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.2);
    osc.start();
    osc.stop(a.currentTime + 1.2);
  }
}

/** Correct answer: ascending two-note chime. */
export function sfxCorrect(): void {
  const a = ac();
  if (!a || muted) return;
  for (const { freq, t } of [
    { freq: 523.25, t: 0 },
    { freq: 783.99, t: 0.12 },
  ]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.connect(g).connect(a.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, a.currentTime + t);
    g.gain.setValueAtTime(0.14, a.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.5);
    osc.start(a.currentTime + t);
    osc.stop(a.currentTime + t + 0.5);
  }
}

/** Wrong answer: descending minor-second buzz. */
export function sfxWrong(): void {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(a.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(220, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, a.currentTime + 0.15);
  g.gain.setValueAtTime(0.08, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.2);
  osc.start();
  osc.stop(a.currentTime + 0.2);
}

// ── unified room audio manager (ambient bed + SFX + stinger) ──────────────────
// One imperative singleton every room drives: `audio.startAmbient(room)` on
// mount, `audio.stopAmbient()` on unmount, `audio.sfx(cue)` for interactions,
// `audio.stinger()` on completion. Everything shares the module AudioContext and
// the single `muted` authority above. No React context, no CDN, SSR-safe (every
// path bails when there is no window / AudioContext). Bundled assets under
// /audio/ upgrade the synth when present; absent → procedural synth (green with
// public/audio/ empty). Assets are a blockers.md upgrade, not a requirement.

/** True only in a browser that reports a reduced-motion preference. SSR → false. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Optional asset loading — a decode failure/404 is remembered as a permanent
// miss so we synth instead and never refetch. undefined = untried, null = known
// absent, AudioBuffer = present.
const bufferCache = new Map<string, AudioBuffer | null>();

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(url);
  if (cached !== undefined) return cached;
  const a = ac();
  if (!a) return null; // server / no Web Audio — do not poison the cache
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const buf = await a.decodeAudioData(await res.arrayBuffer());
    bufferCache.set(url, buf);
    return buf;
  } catch {
    bufferCache.set(url, null);
    return null;
  }
}

function playBuffer(buf: AudioBuffer, gain: number, loop = false): AudioBufferSourceNode | null {
  const a = ac();
  if (!a || muted) return null;
  const src = a.createBufferSource();
  const g = a.createGain();
  src.buffer = buf;
  src.loop = loop;
  g.gain.value = gain;
  src.connect(g).connect(a.destination);
  src.start();
  return src;
}

// Per-room ambient root (Hz). Deterministic, offline; a continuous drone loops
// seamlessly by construction (no sample seam). Unknown room → a neutral A2 pad.
const AMBIENT_ROOTS: Record<string, number> = {
  board: 110.0,   // A2
  clock: 146.83,  // D3
  wedges: 130.81, // C3
  streak: 164.81, // E3
  map: 98.0,      // G2
  daily: 123.47,  // B2
};

let ambientDesiredRoom: string | null = null; // intent, survives a mute
let ambientRoom: string | null = null;        // what is actually sounding
let ambientHandle: { stop: () => void } | null = null;

/** Warm procedural pad: two detuned voices + a fifth, low-passed with a slow LFO
 *  drift. Continuous ⇒ seamless loop. Returns a fade-out stop handle. */
function startDrone(a: AudioContext, room: string): { stop: () => void } {
  const root = AMBIENT_ROOTS[room] ?? 110.0;
  const t0 = a.currentTime;
  const master = a.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.06, t0 + 1.5); // slow fade-in
  master.connect(a.destination);
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 650;
  filter.connect(master);

  const oscs: OscillatorNode[] = [];
  for (const [mult, detune, level] of [
    [1, -5, 0.6],
    [1, 6, 0.6],
    [1.5, 0, 0.35], // a fifth for body
  ] as const) {
    const osc = a.createOscillator();
    osc.type = "sine";
    osc.frequency.value = root * mult;
    osc.detune.value = detune;
    const vg = a.createGain();
    vg.gain.value = level;
    osc.connect(vg).connect(filter);
    osc.start();
    oscs.push(osc);
  }
  // gentle cutoff movement — audible life, still seamless
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = a.createGain();
  lfoDepth.gain.value = 220;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  return {
    stop: () => {
      const t = a.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      [...oscs, lfo].forEach((o) => {
        try {
          o.stop(t + 0.7);
        } catch {
          /* already stopped */
        }
      });
    },
  };
}

function teardownAmbient(): void {
  ambientHandle?.stop();
  ambientHandle = null;
  ambientRoom = null;
}

/** Start (or switch to) a room's looping ambient bed. Idempotent per room.
 *  Silent under mute or reduced-motion; remembers intent so unmute can resume. */
export function startAmbient(room: string): void {
  ambientDesiredRoom = room;
  if (muted || prefersReducedMotion()) {
    teardownAmbient();
    return;
  }
  const a = ac();
  if (!a) return; // SSR / no Web Audio
  if (ambientRoom === room && ambientHandle) return;
  teardownAmbient();
  ambientRoom = room;
  // Synth immediately (zero latency); upgrade to a bundled loop if one exists.
  ambientHandle = startDrone(a, room);
  void loadBuffer(`/audio/ambient-${room}.mp3`).then((buf) => {
    if (!buf || ambientRoom !== room) return; // no asset, or room changed
    ambientHandle?.stop();
    const src = playBuffer(buf, 0.25, true);
    if (src) ambientHandle = { stop: () => { try { src.stop(); } catch { /* stopped */ } } };
  });
}

/** Stop the ambient bed and clear intent (call on room unmount). */
export function stopAmbient(): void {
  ambientDesiredRoom = null;
  teardownAmbient();
}

/** Room-completion flourish: ascending arpeggio + shimmer, or /audio/stinger.mp3. */
function stingerSynth(): void {
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
    blip(f, 0.22, "triangle", 0.26, i * 0.08),
  );
  blip(2093, 0.4, "sine", 0.1, 5 * 0.08); // shimmer top
}

export type SfxCue = "place" | "correct" | "wrong" | "hover";

const CUE: Record<SfxCue, () => void> = {
  place: sfx.select,
  correct: sfx.correct,
  wrong: sfx.wrong,
  hover: sfx.tick,
};

/** The one manager rooms import. Every method is a no-op when muted or off-DOM. */
export const audio = {
  startAmbient,
  stopAmbient,
  /** Fire a one-shot interaction cue (no stacking beyond the shared context). */
  sfx(cue: SfxCue): void {
    (CUE[cue] ?? (() => {}))();
  },
  /** Room-completion stinger — bundled asset if present, else procedural synth. */
  stinger(): void {
    if (muted) return;
    const url = "/audio/stinger.mp3";
    const cached = bufferCache.get(url);
    if (cached) {
      playBuffer(cached, 0.5);
    } else if (cached === null) {
      stingerSynth(); // known-absent → instant, no refetch
    } else {
      void loadBuffer(url).then((buf) => (buf ? playBuffer(buf, 0.5) : stingerSynth()));
    }
  },
  prefersReducedMotion,
};
