import { describe, expect, it } from "vitest";
// relative import: vitest does not resolve the @/ alias used in app code.
import { audio, startAmbient, stopAmbient, prefersReducedMotion, noteFreq, isMuted } from "./sound";

// Vitest runs in the "node" environment: no window, no AudioContext. These
// checks pin the SSR/no-DOM contract — the manager must be a silent no-op, never
// throw, so rooms can import and call it during a zero-env build/render.
describe("audio manager — SSR / no-DOM safety", () => {
  it("prefersReducedMotion is false without a window", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it("ambient/sfx/stinger are silent no-ops when no AudioContext exists", () => {
    expect(() => {
      startAmbient("board");
      audio.startAmbient("map");
      audio.sfx("place");
      audio.sfx("correct");
      audio.sfx("wrong");
      audio.sfx("hover");
      audio.stinger();
      stopAmbient();
      audio.stopAmbient();
    }).not.toThrow();
  });

  it("an unknown cue is ignored, not thrown", () => {
    // @ts-expect-error deliberately invalid cue id
    expect(() => audio.sfx("nope")).not.toThrow();
  });

  it("isMuted returns a boolean on the server without throwing", () => {
    expect(typeof isMuted()).toBe("boolean");
  });
});

describe("noteFreq (shared pitch helper)", () => {
  it("maps A4 to 440 Hz and rest/garbage to 0", () => {
    expect(Math.round(noteFreq("A4"))).toBe(440);
    expect(noteFreq("rest")).toBe(0);
    expect(noteFreq("")).toBe(0);
  });
});
