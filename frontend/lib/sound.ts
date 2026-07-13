// Web Audio sound engine — every sound is synthesized at runtime, so PARLOR
// ships zero audio assets and stays playable from a clone. A single shared
// AudioContext is lazily created on first user gesture (browser autoplay rules).
//
// ── THE audio authority (single source of truth) ──────────────────────────────
// Two module-level gates, ONE multiply each, applied on ONE master GainNode every
// source routes through (no source connects to `destination` directly):
//   • `muted`  — the binary panic-off, persisted to `parlor:muted` (legacy key).
//   • `volume` — the C1 SettingsHub master level 0..1, READ from `parlor.volume`
//                (e0-settings owns the WRITE; we never fork it — one authority).
// Effective master gain = muted ? 0 : volume, so `volume === 0` subsumes mute and
// there is exactly one place that silences everything. Beds route through an extra
// `bedGain` sub-bus so a stinger can briefly duck the atmosphere without touching
// the one-shots. Every path bails SSR / no-context / inaudible (never throws).

import type { Note } from "./types";

const MUTE_KEY = "parlor:muted";
const VOLUME_KEY = "parlor.volume"; // e0 SETTINGS_KEYS.volume — same key, read-only here
const DEFAULT_VOLUME = 0.7; // mirrors e0 DEFAULT_VOLUME (no divergence)
const BREATH_MS = 140; // silence between room beds — a deliberate scene change

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null; // the ONE volume/mute multiply
let bedGain: GainNode | null = null; // duckable sub-bus for the ambient bed
let muted = false;
let volume = DEFAULT_VOLUME;

/** Read the master volume from storage (same key e0 writes). SSR/absent → default. */
function readVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const s = localStorage.getItem(VOLUME_KEY);
    if (s === null) return DEFAULT_VOLUME;
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

if (typeof window !== "undefined") {
  muted = localStorage.getItem(MUTE_KEY) === "1";
  volume = readVolume();
  // Cross-tab sync: another tab's slider/mute write live-updates this tab's bus.
  window.addEventListener("storage", (e) => {
    if (e.key !== VOLUME_KEY && e.key !== MUTE_KEY && e.key !== null) return;
    volume = readVolume();
    muted = localStorage.getItem(MUTE_KEY) === "1";
    applyMasterGain(true);
    if (!audible()) teardownAmbient();
    else if (ambientDesiredRoom) startAmbient(ambientDesiredRoom);
  });
}

/** The master multiply: 0 when muted, else the stored volume. */
function effectiveVolume(): number {
  return muted ? 0 : volume;
}

/** True when audio should actually make sound (single cheap gate for callers). */
function audible(): boolean {
  return !muted && volume > 0;
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

/** The master bus every one-shot connects through. Re-reads volume each access so
 *  same-tab slider writes reach the next cue (and any live bed) without a listener. */
function master(a: AudioContext): GainNode {
  volume = readVolume();
  if (!masterGain) {
    masterGain = a.createGain();
    masterGain.connect(a.destination);
  }
  masterGain.gain.value = effectiveVolume();
  return masterGain;
}

/** The duckable bed sub-bus (bed → bedGain → master → destination). */
function bedOut(a: AudioContext): GainNode {
  const m = master(a);
  if (!bedGain) {
    bedGain = a.createGain();
    bedGain.gain.value = 1;
    bedGain.connect(m);
  }
  return bedGain;
}

/** Push the current effective volume onto the live master gain (smooth = ramp). */
function applyMasterGain(smooth = false): void {
  if (!ctx || !masterGain) return;
  const target = effectiveVolume();
  const t = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(t);
  if (smooth) {
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), t);
    masterGain.gain.linearRampToValueAtTime(Math.max(target, 0.0001), t + 0.08);
  } else {
    masterGain.gain.setValueAtTime(target, t);
  }
}

/** Set the master volume live (0..1). e0's slider persists via `parlor.volume`; call
 *  this too for an immediate bed response. Crossing 0 tears down / resumes the bed. */
export function setMasterVolume(v: number): void {
  const prev = volume;
  volume = Math.min(1, Math.max(0, Number.isFinite(v) ? v : DEFAULT_VOLUME));
  applyMasterGain(true);
  if (volume <= 0 && prev > 0) teardownAmbient();
  else if (volume > 0 && prev <= 0 && !muted && ambientDesiredRoom) {
    startAmbient(ambientDesiredRoom);
  }
}

/** Current master volume 0..1 (module state; reflects the last read/set). */
export function getMasterVolume(): number {
  return volume;
}

/** Briefly duck the ambient bed under a milestone cue, then restore it. */
export function duck(depth = 0.35, ms = 450): void {
  if (!ctx || !bedGain) return;
  const t = ctx.currentTime;
  bedGain.gain.cancelScheduledValues(t);
  bedGain.gain.setValueAtTime(bedGain.gain.value, t);
  bedGain.gain.linearRampToValueAtTime(depth, t + 0.06);
  bedGain.gain.linearRampToValueAtTime(1, t + ms / 1000);
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean): void {
  muted = v;
  if (typeof window !== "undefined") {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  }
  // Mute is the single audio authority: muting drops the master multiply to 0 at
  // once (silencing in-flight sound too) and tears down the bed; unmuting resumes
  // whichever room bed the last mounted room asked for.
  applyMasterGain(true);
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
  if (!a || !audible() || freq <= 0) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return { stop: () => {} };
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
      osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return;
  for (const freq of [261.63, 329.63, 392.0]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return;
  for (const { freq, t } of [
    { freq: 523.25, t: 0 },
    { freq: 783.99, t: 0.12 },
  ]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.connect(g).connect(master(a));
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
  if (!a || !audible()) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.connect(g).connect(master(a));
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

function playBuffer(
  buf: AudioBuffer,
  gain: number,
  loop = false,
  dest?: AudioNode,
): AudioBufferSourceNode | null {
  const a = ac();
  if (!a || !audible()) return null;
  const src = a.createBufferSource();
  const g = a.createGain();
  src.buffer = buf;
  src.loop = loop;
  g.gain.value = gain;
  src.connect(g).connect(dest ?? master(a));
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

// ── per-room cue registry ─────────────────────────────────────────────────────
// Cues are DECLARED DATA resolved by room key (extends AMBIENT_ROOTS/CUE). A game
// unit (e.g. e4-audio-content for the Séance) registers its bed pitch/asset, any
// per-room interaction overrides, named milestone/event cues, and a custom stinger
// ONCE (module import time), then drives them through the `audio` singleton. Every
// registered cue is a plain `() => void`; write asset-backed ones with `playSfx`
// so they inherit the master-bus gating + upgrade-or-synth fallback for free.
export interface RoomAudioConfig {
  /** Procedural drone pitch (Hz) for the room's ambient bed. */
  ambientRoot?: number;
  /** Committed `/audio/*.mp3` bed that upgrades the drone when present. */
  ambientAsset?: string;
  /** Per-room overrides for the shared interaction cues. */
  cues?: Partial<Record<SfxCue, () => void>>;
  /** Named milestone/event cues, played via `audio.event(room, name)`. */
  events?: Record<string, () => void>;
  /** Room-specific completion stinger (falls back to the default arpeggio). */
  stinger?: () => void;
}

const roomAudio = new Map<string, RoomAudioConfig>();

/** Register (or merge into) a room's audio config. Idempotent-friendly: later
 *  calls shallow-merge, so `cues`/`events` accumulate rather than clobber. */
export function registerRoomAudio(room: string, config: RoomAudioConfig): void {
  const prev = roomAudio.get(room) ?? {};
  roomAudio.set(room, {
    ...prev,
    ...config,
    cues: { ...prev.cues, ...config.cues },
    events: { ...prev.events, ...config.events },
  });
}

/** The registered config for a room (undefined if none registered). */
export function getRoomAudio(room: string): RoomAudioConfig | undefined {
  return roomAudio.get(room);
}

// ── per-cue throttle ──────────────────────────────────────────────────────────
// A min-gap per cue key so a rapid burst (combo climb, tick storm) never piles
// into a harsh wall of overlapping voices.
const CUE_MIN_GAP_MS = 45;
const lastCueAt = new Map<string, number>();
function throttled(key: string): boolean {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const last = lastCueAt.get(key) ?? -Infinity;
  if (now - last < CUE_MIN_GAP_MS) return true;
  lastCueAt.set(key, now);
  return false;
}

/** Play a committed one-shot asset, falling back to `fallback` (or silence) when
 *  the asset is absent/undecodable. Gated by the master authority; use this for
 *  asset-backed registered cues so they never bypass volume/mute. */
export function playSfx(url: string, gain = 0.4, fallback?: () => void): void {
  if (!audible()) return;
  const cached = bufferCache.get(url);
  if (cached) {
    playBuffer(cached, gain);
  } else if (cached === null) {
    fallback?.(); // known-absent → instant, no refetch
  } else {
    void loadBuffer(url).then((buf) => (buf ? playBuffer(buf, gain) : fallback?.()));
  }
}

/** Warm procedural pad: two detuned voices + a fifth, low-passed with a slow LFO
 *  drift. Continuous ⇒ seamless loop. Returns a fade-out stop handle. */
function startDrone(a: AudioContext, root: number): { stop: () => void } {
  const t0 = a.currentTime;
  const bedMaster = a.createGain();
  bedMaster.gain.setValueAtTime(0.0001, t0);
  bedMaster.gain.exponentialRampToValueAtTime(0.06, t0 + 1.5); // slow fade-in
  bedMaster.connect(bedOut(a)); // → bedGain (duckable) → master (volume/mute)
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 650;
  filter.connect(bedMaster);

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
      bedMaster.gain.cancelScheduledValues(t);
      bedMaster.gain.setValueAtTime(Math.max(bedMaster.gain.value, 0.0001), t);
      bedMaster.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
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
  if (!audible() || prefersReducedMotion()) {
    teardownAmbient();
    return;
  }
  const a = ac();
  if (!a) return; // SSR / no Web Audio
  if (ambientRoom === room && ambientHandle) return;
  const switching = ambientRoom !== null && ambientRoom !== room;
  teardownAmbient();
  ambientRoom = room;

  const cfg = roomAudio.get(room);
  const root = cfg?.ambientRoot ?? AMBIENT_ROOTS[room] ?? 110.0;
  const asset = cfg?.ambientAsset ?? `/audio/ambient-${room}.mp3`;

  const rise = () => {
    if (ambientRoom !== room) return; // room changed during the breath
    // Synth immediately (zero latency); upgrade to a bundled loop if one exists.
    ambientHandle = startDrone(a, root);
    void loadBuffer(asset).then((buf) => {
      if (!buf || ambientRoom !== room) return; // no asset, or room changed
      ambientHandle?.stop();
      const src = playBuffer(buf, 0.25, true, bedOut(a));
      if (src) ambientHandle = { stop: () => { try { src.stop(); } catch { /* stopped */ } } };
    });
  };

  // Cross-room handoff is a breath of silence, then the new bed rises; a first
  // bed (no prior room) starts at once.
  if (switching) window.setTimeout(rise, BREATH_MS);
  else rise();
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

/** Decorative cues trimmed under reduced-motion (result cues stay audible). */
const DECORATIVE_CUES: ReadonlySet<SfxCue> = new Set(["hover"]);

/** The one manager rooms import. Every method is a no-op when inaudible/off-DOM. */
export const audio = {
  startAmbient,
  stopAmbient,
  /** Fire a one-shot interaction cue. `room` selects a registered per-room voice
   *  (falls back to the shared cue). Decorative cues drop under reduced-motion;
   *  repeats of the same cue are throttled so bursts never pile up. */
  sfx(cue: SfxCue, room?: string): void {
    if (prefersReducedMotion() && DECORATIVE_CUES.has(cue)) return;
    if (throttled(`sfx:${room ?? ""}:${cue}`)) return;
    const override = room ? roomAudio.get(room)?.cues?.[cue] : undefined;
    (override ?? CUE[cue] ?? (() => {}))();
  },
  /** Play a registered named milestone/event cue for a room (no-op if unknown). */
  event(room: string, name: string): void {
    const fn = roomAudio.get(room)?.events?.[name];
    if (!fn) return;
    if (throttled(`evt:${room}:${name}`)) return;
    fn();
  },
  /** Room-completion stinger — briefly ducks the bed, then plays the room's custom
   *  stinger, else the bundled asset, else the procedural synth. */
  stinger(room?: string): void {
    if (!audible()) return;
    duck();
    const custom = room ? roomAudio.get(room)?.stinger : undefined;
    if (custom) {
      custom();
      return;
    }
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
  duck,
  setMasterVolume,
  getMasterVolume,
  registerRoomAudio,
  prefersReducedMotion,
};
