// settings.ts — the global SettingsHub store (unit e0-settings-foundation).
//
// THE public settings API every downstream visual/audio unit consumes. It follows
// the shipped idiom (see useTextSize.ts): NOT one React context, but a family of
// small localStorage-backed hooks + module-level getters, so:
//   • non-React callers (game loops, lib/sound.ts) read a plain getter, and
//   • the no-flash guarantee is preserved (values live in flat localStorage keys
//     the pre-paint inline scripts in layout.tsx can read synchronously).
//
// EXTENDS rather than duplicates: theme ↔ the layout no-flash script + <html
// data-theme>; text size ↔ useTextSize (re-exported verbatim); mute ↔ lib/sound
// (single audio authority — we never fork its `parlor:muted` flag). New settings
// (volume, calm mode, atmosphere/quality, high-contrast, haptics) get their own
// dotted `parlor.<setting>` keys and apply to <html data-*> attributes.
//
// SSR-safe: every getter/apply guards `typeof window/document`; importing this
// module and calling any getter on the server is a silent no-op that returns the
// default — never throws (pinned by settings.test.ts).
"use client";

import { useCallback, useEffect, useState } from "react";
import { isMuted as soundIsMuted, setMuted as soundSetMuted } from "./sound";
import { TEXT_SCALE, TEXT_SIZES, useTextSize, type TextSize } from "./useTextSize";

// ── keys (unified dotted `parlor.<setting>` namespace) ───────────────────────
// muted is DELEGATED to lib/sound.ts, which owns the legacy colon key; we read
// through its getter so there is exactly one mute authority (no divergence).
export const SETTINGS_KEYS = {
  theme: "parlor.theme", // "dark" | "light" ; ABSENT ⇒ follow OS ("system")
  textSize: "parlor.textsize", // "S" | "M" | "L"
  volume: "parlor.volume", // "0".."1" (master gain; consumed by e4-audio)
  muted: "parlor:muted", // OWNED BY lib/sound.ts — read via isMuted()/setMuted()
  calm: "parlor.calm", // "1" | "0" — Calm-mode motion override (OR'd with OS)
  quality: "parlor.quality", // "full" | "reduced" | "off" — atmosphere tier
  contrast: "parlor.contrast", // "1" | "0" — high-contrast modifier
  haptics: "parlor.haptics", // "1" | "0" — touch vibration (default on)
} as const;

export const DEFAULT_VOLUME = 0.7;

export { TEXT_SCALE, TEXT_SIZES, useTextSize };
export type { TextSize };

// ── low-level storage (SSR-safe, never throws) ───────────────────────────────
function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode / blocked — in-memory only */
  }
}

/** Subscribe a callback to cross-tab writes of a specific key (the `storage`
 *  event only fires in OTHER tabs, so same-tab state stays authoritative). */
function useStorageSync(key: string, onChange: () => void): void {
  useEffect(() => {
    function handle(e: StorageEvent) {
      if (e.key === key || e.key === null) onChange();
    }
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
    // onChange is a stable getter-driven callback from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

// ── theme (dark / light / system) ────────────────────────────────────────────
export type ThemeChoice = "dark" | "light" | "system";

function systemTheme(): "dark" | "light" {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** The concrete theme a choice paints (System resolves against the OS). */
export function resolveTheme(choice: ThemeChoice): "dark" | "light" {
  return choice === "system" ? systemTheme() : choice;
}

/** Current stored choice — absent key ⇒ "system" (the no-flash default). */
export function getThemeChoice(): ThemeChoice {
  const s = readStored(SETTINGS_KEYS.theme);
  return s === "dark" || s === "light" ? s : "system";
}

function applyTheme(choice: ThemeChoice): void {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolveTheme(choice);
  }
  // "system" clears the key so the pre-paint script falls back to the OS query.
  writeStored(SETTINGS_KEYS.theme, choice === "system" ? null : choice);
}

/** Persisted theme choice. Reads what the layout no-flash script already applied. */
export function useTheme(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => {
    setChoice(getThemeChoice());
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    function onOS() {
      if (getThemeChoice() === "system" && typeof document !== "undefined") {
        document.documentElement.dataset.theme = systemTheme();
      }
    }
    mq?.addEventListener?.("change", onOS);
    return () => mq?.removeEventListener?.("change", onOS);
  }, []);
  useStorageSync(SETTINGS_KEYS.theme, () => setChoice(getThemeChoice()));
  const set = useCallback((c: ThemeChoice) => {
    setChoice(c);
    applyTheme(c);
  }, []);
  return [choice, set];
}

// ── text size (reused verbatim from useTextSize) ─────────────────────────────
export function getTextSize(): TextSize {
  const s = readStored(SETTINGS_KEYS.textSize);
  return s === "S" || s === "M" || s === "L" ? s : "M";
}

// ── master volume + mute ─────────────────────────────────────────────────────
export function clampVolume(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_VOLUME;
}

/** Master gain 0..1. e4-audio multiplies synth/asset gain by this. */
export function getVolume(): number {
  const s = readStored(SETTINGS_KEYS.volume);
  return s === null ? DEFAULT_VOLUME : clampVolume(parseFloat(s));
}

function applyVolume(v: number): void {
  writeStored(SETTINGS_KEYS.volume, String(clampVolume(v)));
}

export function useVolume(): [number, (v: number) => void] {
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  useEffect(() => setVolume(getVolume()), []);
  useStorageSync(SETTINGS_KEYS.volume, () => setVolume(getVolume()));
  const set = useCallback((v: number) => {
    const c = clampVolume(v);
    setVolume(c);
    applyVolume(c);
  }, []);
  return [volume, set];
}

/** Mute is delegated to lib/sound.ts — the single audio authority. Re-exported
 *  so callers have one import for the whole settings surface. */
export const isMuted = soundIsMuted;

export function useMuted(): [boolean, (v?: boolean) => void] {
  const [muted, setMutedState] = useState(true); // SSR-safe: assume muted
  useEffect(() => setMutedState(soundIsMuted()), []);
  useStorageSync(SETTINGS_KEYS.muted, () => setMutedState(soundIsMuted()));
  const set = useCallback((v?: boolean) => {
    const next = v ?? !soundIsMuted();
    soundSetMuted(next); // silences/resumes the ambient bed at the source
    setMutedState(next);
  }, []);
  return [muted, set];
}

// ── Calm mode + effective reduced-motion ─────────────────────────────────────
export function osReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The stored in-app override alone (NOT OR'd with the OS). */
export function getCalmMode(): boolean {
  return readStored(SETTINGS_KEYS.calm) === "1";
}

/** Effective reduced-motion = Calm mode OR the OS preference (never "replace"). */
export function effectiveReducedMotion(calm: boolean, os: boolean): boolean {
  return calm || os;
}

/** THE value visual units gate motion on. `true` ⇒ skip / shorten animations. */
export function isReducedMotion(): boolean {
  return effectiveReducedMotion(getCalmMode(), osReducedMotion());
}

function applyCalm(calm: boolean): void {
  if (typeof document !== "undefined") {
    const on = effectiveReducedMotion(calm, osReducedMotion());
    if (on) document.documentElement.dataset.calm = "on";
    else delete document.documentElement.dataset.calm;
  }
  writeStored(SETTINGS_KEYS.calm, calm ? "1" : "0");
}

/** The Calm-mode override toggle (the stored flag, applied to <html data-calm>). */
export function useCalmMode(): [boolean, (v: boolean) => void] {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const stored = getCalmMode();
    setCalm(stored);
    applyCalm(stored);
  }, []);
  useStorageSync(SETTINGS_KEYS.calm, () => setCalm(getCalmMode()));
  const set = useCallback((v: boolean) => {
    setCalm(v);
    applyCalm(v);
  }, []);
  return [calm, set];
}

/** Live EFFECTIVE reduced-motion (Calm OR OS) — the read hook for consumers. */
export function useReducedMotion(): boolean {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const update = () => setRm(isReducedMotion());
    update();
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);
  useStorageSync(SETTINGS_KEYS.calm, () => setRm(isReducedMotion()));
  return rm;
}

// ── Atmosphere / visual-quality tier ─────────────────────────────────────────
export type Quality = "full" | "reduced" | "off";

export function parseQuality(raw: string | null): Quality {
  return raw === "reduced" || raw === "off" ? raw : "full";
}

/** Ambient richness tier. e2/e3 dial particle density / glows / beds off this. */
export function getQuality(): Quality {
  return parseQuality(readStored(SETTINGS_KEYS.quality));
}

function applyQuality(q: Quality): void {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.quality = q;
  }
  writeStored(SETTINGS_KEYS.quality, q);
}

export function useQuality(): [Quality, (q: Quality) => void] {
  const [quality, setQuality] = useState<Quality>("full");
  useEffect(() => {
    const stored = getQuality();
    setQuality(stored);
    applyQuality(stored);
  }, []);
  useStorageSync(SETTINGS_KEYS.quality, () => setQuality(getQuality()));
  const set = useCallback((q: Quality) => {
    setQuality(q);
    applyQuality(q);
  }, []);
  return [quality, set];
}

// ── high-contrast modifier ───────────────────────────────────────────────────
export function getHighContrast(): boolean {
  return readStored(SETTINGS_KEYS.contrast) === "1";
}

function applyContrast(on: boolean): void {
  if (typeof document !== "undefined") {
    if (on) document.documentElement.dataset.contrast = "on";
    else delete document.documentElement.dataset.contrast;
  }
  writeStored(SETTINGS_KEYS.contrast, on ? "1" : "0");
}

export function useHighContrast(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const stored = getHighContrast();
    setOn(stored);
    applyContrast(stored);
  }, []);
  useStorageSync(SETTINGS_KEYS.contrast, () => setOn(getHighContrast()));
  const set = useCallback((v: boolean) => {
    setOn(v);
    applyContrast(v);
  }, []);
  return [on, set];
}

// ── haptics (touch devices only) ─────────────────────────────────────────────
export function supportsHaptics(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/** Default ON where supported; absent key ⇒ on. */
export function getHaptics(): boolean {
  const s = readStored(SETTINGS_KEYS.haptics);
  return s === null ? true : s === "1";
}

export function useHaptics(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(getHaptics()), []);
  useStorageSync(SETTINGS_KEYS.haptics, () => setOn(getHaptics()));
  const set = useCallback((v: boolean) => {
    setOn(v);
    writeStored(SETTINGS_KEYS.haptics, v ? "1" : "0");
  }, []);
  return [on, set];
}

/** Fire a short vibration IF haptics are enabled + supported (safe no-op else). */
export function vibrate(pattern: number | number[] = 10): void {
  if (supportsHaptics() && getHaptics()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* not permitted — ignore */
    }
  }
}

// ── reset to defaults ────────────────────────────────────────────────────────
export function resetSettings(): void {
  applyTheme("system");
  writeStored(SETTINGS_KEYS.textSize, null);
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--text-scale", "1");
  }
  applyVolume(DEFAULT_VOLUME);
  soundSetMuted(true);
  applyCalm(false);
  applyQuality("full");
  applyContrast(false);
  writeStored(SETTINGS_KEYS.haptics, null);
}
