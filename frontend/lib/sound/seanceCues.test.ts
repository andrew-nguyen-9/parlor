import { afterEach, describe, expect, it } from "vitest";
// relative imports: vitest does not resolve the "@/" alias used in app code.
import { registerSeanceAudio } from "./seanceCues";
import { audio, getRoomAudio, setMuted, setMasterVolume } from "../sound";

// vitest runs in the "node" environment (no window / AudioContext), so every cue
// is a silent no-op here — these tests pin the CUE MAP (which event names WHICH
// sound) and the single-authority routing, without asserting on real playback.

afterEach(() => {
  setMuted(false);
  setMasterVolume(0.7);
});

describe("séance cue map (E4-content)", () => {
  it("registers the séance room with a low ambient root and every game event", () => {
    registerSeanceAudio();
    const cfg = getRoomAudio("seance");
    expect(cfg?.ambientRoot).toBeCloseTo(65.41); // C2 low drone baseline
    expect(Object.keys(cfg?.events ?? {})).toEqual(
      expect.arrayContaining(["snuff", "bind", "cascade", "strike", "planchette"]),
    );
    expect(typeof cfg?.stinger).toBe("function"); // Banished swell
  });

  it("firing each mapped event never throws (SSR / no-DOM no-op)", () => {
    registerSeanceAudio();
    expect(() => {
      audio.event("seance", "snuff");
      audio.event("seance", "bind");
      audio.event("seance", "cascade");
      audio.event("seance", "strike");
      audio.event("seance", "planchette");
      audio.stinger("seance");
    }).not.toThrow();
  });

  it("global mute silences every séance cue (single authority, no fork)", () => {
    registerSeanceAudio();
    setMuted(true);
    // Muted, every cue path must remain a silent no-op — the séance never opens a
    // second audio path around the master gate.
    expect(() => {
      audio.event("seance", "snuff");
      audio.event("seance", "bind");
      audio.event("seance", "strike");
      audio.stinger("seance");
      audio.startAmbient("seance");
    }).not.toThrow();
    setMuted(false);
  });

  it("is idempotent — re-registering does not multiply the event set", () => {
    registerSeanceAudio();
    registerSeanceAudio();
    const cfg = getRoomAudio("seance");
    expect(Object.keys(cfg?.events ?? {}).sort()).toEqual(
      ["bind", "cascade", "planchette", "snuff", "strike"],
    );
  });
});
