"use client";

// SettingsHub — the ONE global settings surface (unit e0-settings-foundation).
// A single gear trigger (mounted in RoomShell's header) opens an edge sheet with
// every game-agnostic preference. Controls apply live via the lib/settings hooks
// (localStorage-backed, SSR-safe). Folds in the old ThemeToggle / TextSizeControl
// / SoundToggle pills. Dialog a11y: role=dialog + aria-modal, focus trap + return,
// Esc/backdrop close, polite aria-live announcements. Its own slide honors Calm.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  resetSettings,
  supportsHaptics,
  TEXT_SIZES,
  useCalmMode,
  useHaptics,
  useHighContrast,
  useMuted,
  useQuality,
  useReducedMotion,
  useTextSize,
  useTheme,
  useVolume,
  type Quality,
  type TextSize,
  type ThemeChoice,
} from "@/lib/settings";

interface Opt<T extends string> {
  value: T;
  label: string;
}

const THEME_OPTS: Opt<ThemeChoice>[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];
const TEXT_OPTS: Opt<TextSize>[] = TEXT_SIZES.map((s) => ({
  value: s,
  label: ({ S: "Small", M: "Medium", L: "Large" } as Record<TextSize, string>)[s],
}));
const QUALITY_OPTS: Opt<Quality>[] = [
  { value: "full", label: "Full" },
  { value: "reduced", label: "Reduced" },
  { value: "off", label: "Off" },
];

/** Segmented radio-group: shows every option, ≥44px targets, arrow-key nav. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
}) {
  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = options[(i + dir + options.length) % options.length];
    onChange(next.value);
  }
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-lg border border-line bg-bg/40 p-1"
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(o.value)}
          className={`min-h-11 flex-1 rounded-md px-3 py-1.5 text-sm transition ${
            value === o.value
              ? "bg-brass/25 text-ink shadow-inner"
              : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Labelled switch row for the boolean settings. */
function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-line bg-bg/40 px-3 py-2 text-left transition hover:border-brass"
    >
      <span className="flex flex-col">
        <span className="text-sm text-ink">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          on ? "bg-brass" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all ${
            on ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="microlabel text-brass">{title}</h3>
      {children}
    </section>
  );
}

export default function SettingsHub() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [announce, setAnnounce] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const [theme, setTheme] = useTheme();
  const [textSize, setTextSize] = useTextSize();
  const [volume, setVolume] = useVolume();
  const [muted, setMuted] = useMuted();
  const [calm, setCalm] = useCalmMode();
  const [quality, setQuality] = useQuality();
  const [contrast, setContrast] = useHighContrast();
  const [haptics, setHaptics] = useHaptics();
  const reduced = useReducedMotion();
  const [hasHaptics, setHasHaptics] = useState(false);
  useEffect(() => setHasHaptics(supportsHaptics()), []);

  const say = useCallback((msg: string) => setAnnounce(msg), []);

  const close = useCallback(() => {
    setOpen(false);
    setConfirmReset(false);
    triggerRef.current?.focus();
  }, []);

  // Animate-in after mount; instant for reduced motion.
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, [open]);

  // Focus into the panel on open.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Esc closes; Tab is trapped within the panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(focusable).filter((el) => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  function doReset() {
    resetSettings();
    setTheme("system");
    setTextSize("M");
    setVolume(0.7);
    setMuted(true);
    setCalm(false);
    setQuality("full");
    setContrast(false);
    setHaptics(true);
    setConfirmReset(false);
    say("Settings reset to defaults");
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Settings"
        title="Settings"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface/70 text-lg text-muted transition hover:border-brass hover:text-ink"
      >
        <span aria-hidden>⚙</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop: dim + blur, tap to dismiss */}
          <button
            type="button"
            aria-label="Close settings"
            onClick={close}
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Edge sheet: right rail on lg+, bottom sheet on phone */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`absolute flex flex-col gap-5 overflow-y-auto border-line bg-surface p-5 outline-none
              inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t
              lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[380px] lg:rounded-none lg:border-l lg:border-t-0
              ${reduced ? "" : "transition-transform duration-300 ease-out"}
              ${shown ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"}`}
          >
            <header className="flex items-center justify-between">
              <h2 id={titleId} className="font-display text-lg text-ink">
                Settings
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close settings"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition hover:text-ink"
              >
                <span aria-hidden>✕</span>
              </button>
            </header>

            <Section title="Appearance">
              <Segmented
                label="Theme"
                value={theme}
                options={THEME_OPTS}
                onChange={(v) => {
                  setTheme(v);
                  say(`${THEME_OPTS.find((o) => o.value === v)?.label} theme`);
                }}
              />
              <ToggleRow
                label="High contrast"
                hint="Thicker borders, stronger text"
                on={contrast}
                onChange={(v) => {
                  setContrast(v);
                  say(v ? "High contrast on" : "High contrast off");
                }}
              />
              <Segmented
                label="Text size"
                value={textSize}
                options={TEXT_OPTS}
                onChange={(v) => {
                  setTextSize(v);
                  say(`${TEXT_OPTS.find((o) => o.value === v)?.label} text`);
                }}
              />
            </Section>

            <Section title="Motion">
              <ToggleRow
                label="Calm mode"
                hint="Reduce animation (adds to your OS setting)"
                on={calm}
                onChange={(v) => {
                  setCalm(v);
                  say(v ? "Calm mode on" : "Calm mode off");
                }}
              />
              <Segmented
                label="Atmosphere"
                value={quality}
                options={QUALITY_OPTS}
                onChange={(v) => {
                  setQuality(v);
                  say(`Atmosphere ${v}`);
                }}
              />
            </Section>

            <Section title="Sound">
              <div className="flex items-center gap-3 rounded-lg border border-line bg-bg/40 px-3 py-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={muted}
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => {
                    setMuted(!muted);
                    say(muted ? "Sound on" : "Sound muted");
                  }}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-lg text-muted transition hover:text-ink"
                >
                  <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  disabled={muted}
                  aria-label="Volume"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (muted && v > 0) setMuted(false);
                  }}
                  className="h-11 flex-1 accent-brass disabled:opacity-40"
                />
              </div>
              {hasHaptics && (
                <ToggleRow
                  label="Haptics"
                  hint="Vibration on confirms"
                  on={haptics}
                  onChange={(v) => {
                    setHaptics(v);
                    say(v ? "Haptics on" : "Haptics off");
                  }}
                />
              )}
            </Section>

            <div className="mt-auto pt-2">
              {confirmReset ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-bg/40 px-3 py-2">
                  <span className="text-sm text-muted">Reset all settings?</span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="min-h-11 rounded-md px-3 text-sm text-muted transition hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={doReset}
                      className="min-h-11 rounded-md bg-brass/25 px-3 text-sm text-ink transition hover:bg-brass/40"
                    >
                      Reset
                    </button>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="microlabel min-h-11 w-full rounded-lg border border-line text-muted transition hover:border-brass hover:text-ink"
                >
                  Reset to defaults
                </button>
              )}
            </div>
          </div>

          {/* Polite live region for assistive tech (visually hidden). */}
          <div aria-live="polite" role="status" className="sr-only">
            {announce}
          </div>
        </div>
      )}
    </>
  );
}
