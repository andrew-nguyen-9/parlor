import { afterEach, describe, expect, it } from "vitest";
// relative import: vitest does not resolve the @/ alias used in app code.
import {
  audio,
  startAmbient,
  stopAmbient,
  prefersReducedMotion,
  noteFreq,
  isMuted,
  setMuted,
  setMasterVolume,
  getMasterVolume,
  duck,
  playSfx,
  registerRoomAudio,
  getRoomAudio,
} from "./sound";

// Vitest runs in the "node" environment: no window, no AudioContext, no
// localStorage. These checks pin the SSR/no-DOM contract — the engine must be a
// silent no-op, never throw, so rooms can import and call it during a zero-env
// build/render. Because no AudioContext can exist here, these tests also prove the
// autoplay-unlock contract: NOTHING sounds before a context is created on a
// gesture-driven cue (the lazy `ac()` returns null off-DOM, so every path bails).

// Keep module state from leaking between the state-mutating tests below.
afterEach(() => {
  setMuted(false);
  setMasterVolume(0.7);
});

describe("audio manager — SSR / no-DOM safety (autoplay-unlock contract)", () => {
  it("prefersReducedMotion is false without a window", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it("every cue path is a silent no-op when no AudioContext exists", () => {
    expect(() => {
      startAmbient("board");
      audio.startAmbient("map");
      audio.sfx("place");
      audio.sfx("correct");
      audio.sfx("wrong");
      audio.sfx("hover");
      audio.sfx("place", "seance"); // room-scoped override path
      audio.event("seance", "spiritReveal"); // registered event path
      audio.stinger();
      audio.stinger("seance");
      audio.duck();
      duck();
      playSfx("/audio/cues/whatever.mp3", 0.4, () => {});
      stopAmbient();
      audio.stopAmbient();
    }).not.toThrow();
  });

  it("an unknown cue is ignored, not thrown", () => {
    // @ts-expect-error deliberately invalid cue id
    expect(() => audio.sfx("nope")).not.toThrow();
  });

  it("an unregistered room / event is a no-op, not a throw", () => {
    expect(() => {
      audio.event("no-such-room", "no-such-event");
      audio.sfx("place", "no-such-room");
      audio.stinger("no-such-room");
    }).not.toThrow();
  });

  it("isMuted returns a boolean on the server without throwing", () => {
    expect(typeof isMuted()).toBe("boolean");
  });
});

describe("global volume/mute gate (single audio authority)", () => {
  it("defaults to e0's DEFAULT_VOLUME (0.7) with no stored value", () => {
    expect(getMasterVolume()).toBeCloseTo(0.7);
  });

  it("setMasterVolume clamps to 0..1 and reflects the value", () => {
    setMasterVolume(2);
    expect(getMasterVolume()).toBe(1);
    setMasterVolume(-3);
    expect(getMasterVolume()).toBe(0); // 0 == silence subsumes mute
    setMasterVolume(0.42);
    expect(getMasterVolume()).toBeCloseTo(0.42);
  });

  it("NaN volume falls back to the default", () => {
    setMasterVolume(Number.NaN);
    expect(getMasterVolume()).toBeCloseTo(0.7);
  });

  it("setMuted toggles the shared authority (SoundToggle contract) without throwing", () => {
    setMuted(true);
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
  });

  it("volume changes across zero never throw (bed teardown/resume path)", () => {
    expect(() => {
      setMasterVolume(0);
      setMasterVolume(0.8);
      setMasterVolume(0);
    }).not.toThrow();
  });
});

describe("per-room cue registry (how a game registers cues)", () => {
  it("registerRoomAudio stores and merges a room's declared cues", () => {
    registerRoomAudio("seance", {
      ambientRoot: 87.31, // F2
      ambientAsset: "/audio/ambient-seance.mp3",
      cues: { place: () => {} },
      events: { candleSnuff: () => {} },
      stinger: () => {},
    });
    // a second call accumulates rather than clobbers
    registerRoomAudio("seance", { events: { spiritReveal: () => {} } });

    const cfg = getRoomAudio("seance");
    expect(cfg?.ambientRoot).toBeCloseTo(87.31);
    expect(cfg?.ambientAsset).toBe("/audio/ambient-seance.mp3");
    expect(Object.keys(cfg?.events ?? {})).toEqual(
      expect.arrayContaining(["candleSnuff", "spiritReveal"]),
    );
    expect(typeof cfg?.cues?.place).toBe("function");
    expect(typeof cfg?.stinger).toBe("function");
  });

  it("getRoomAudio is undefined for an unregistered room", () => {
    expect(getRoomAudio("never-registered")).toBeUndefined();
  });
});

describe("noteFreq (shared pitch helper)", () => {
  it("maps A4 to 440 Hz and rest/garbage to 0", () => {
    expect(Math.round(noteFreq("A4"))).toBe(440);
    expect(noteFreq("rest")).toBe(0);
    expect(noteFreq("")).toBe(0);
  });
});
