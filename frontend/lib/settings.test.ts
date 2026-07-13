import { describe, expect, it } from "vitest";
// relative import: vitest does not resolve the @/ alias used in app code.
import {
  SETTINGS_KEYS,
  DEFAULT_VOLUME,
  clampVolume,
  effectiveReducedMotion,
  parseQuality,
  resolveTheme,
  getThemeChoice,
  getTextSize,
  getVolume,
  getQuality,
  getCalmMode,
  getHighContrast,
  getHaptics,
  isReducedMotion,
  isMuted,
  osReducedMotion,
  supportsHaptics,
  vibrate,
} from "./settings";

// Vitest runs in the "node" environment (no window/document/localStorage). These
// pin the SSR/no-DOM contract: every getter returns its default and never throws,
// so downstream units can import the settings API during a zero-env build/render.
describe("settings — SSR / no-DOM safety", () => {
  it("every getter returns its documented default without a window", () => {
    expect(getThemeChoice()).toBe("system");
    expect(getTextSize()).toBe("M");
    expect(getVolume()).toBe(DEFAULT_VOLUME);
    expect(getQuality()).toBe("full");
    expect(getCalmMode()).toBe(false);
    expect(getHighContrast()).toBe(false);
    expect(getHaptics()).toBe(true);
    expect(typeof isMuted()).toBe("boolean");
  });

  it("motion + haptics environment probes are false/no-throw off-DOM", () => {
    expect(osReducedMotion()).toBe(false);
    expect(isReducedMotion()).toBe(false);
    expect(supportsHaptics()).toBe(false);
    expect(() => vibrate()).not.toThrow();
    expect(() => vibrate([10, 20, 10])).not.toThrow();
  });
});

describe("settings — pure helpers", () => {
  it("resolveTheme: system falls back to dark off-DOM; explicit passes through", () => {
    expect(resolveTheme("system")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("effectiveReducedMotion ORs Calm mode with the OS preference", () => {
    expect(effectiveReducedMotion(false, false)).toBe(false);
    expect(effectiveReducedMotion(true, false)).toBe(true);
    expect(effectiveReducedMotion(false, true)).toBe(true);
    expect(effectiveReducedMotion(true, true)).toBe(true);
  });

  it("clampVolume constrains to 0..1 and defaults on garbage", () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(-3)).toBe(0);
    expect(clampVolume(9)).toBe(1);
    expect(clampVolume(NaN)).toBe(DEFAULT_VOLUME);
  });

  it("parseQuality accepts the tier vocabulary, else falls back to full", () => {
    expect(parseQuality("full")).toBe("full");
    expect(parseQuality("reduced")).toBe("reduced");
    expect(parseQuality("off")).toBe("off");
    expect(parseQuality(null)).toBe("full");
    expect(parseQuality("garbage")).toBe("full");
  });

  it("keys use the unified dotted namespace (mute delegated to lib/sound)", () => {
    expect(SETTINGS_KEYS.theme).toBe("parlor.theme");
    expect(SETTINGS_KEYS.calm).toBe("parlor.calm");
    expect(SETTINGS_KEYS.quality).toBe("parlor.quality");
    expect(SETTINGS_KEYS.muted).toBe("parlor:muted"); // owned by lib/sound.ts
  });
});
