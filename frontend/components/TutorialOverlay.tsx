// First-play tutorial overlay + persistent help icon (F2 · North Star §Motion/§Floors).
// One per room, mounted by RoomShell from the tutorial registry.
//
// SSR-safe: server + first client paint render only the help icon (state starts
// closed on both), then a post-mount effect reads localStorage and opens the
// overlay if this room hasn't been seen — so there is NO hydration mismatch (the
// same pattern F4's CollapsiblePanel uses). Dismissal persists per room. Mobile:
// the sheet rises from the bottom and centres on `sm:`; every control clears the
// 44px touch floor. Reduced-motion: entrance transition is disabled via
// `motion-reduce:` so it appears instantly (a designed state, not a jump).
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Tutorial } from "@/lib/tutorials";
import SeanceTutorialDemo from "@/components/tutorial/SeanceTutorialDemo";

const SEEN_PREFIX = "parlor:tutorial-seen:";

export default function TutorialOverlay({ tutorial }: { tutorial: Tutorial }) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false); // drives the entrance transition
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const storageKey = SEEN_PREFIX + tutorial.href;
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* storage blocked → session-only; the help icon still reopens it */
    }
  }, [storageKey]);

  // First play: open after mount if this room is unseen. Running only on the
  // client keeps SSR output (help icon only) identical to first paint.
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) == null) setOpen(true);
    } catch {
      /* storage blocked → stay closed; the help icon still opens it */
    }
  }, [storageKey]);

  // While open: kick the entrance transition, focus the dialog, wire Escape.
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  // Category INK class (text-safe, AA both themes) — never the raw HEX fill.
  const accentInk = `text-${tutorial.accent}`;

  return (
    <>
      {/* Persistent help icon — replays this room's tutorial on demand. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`How to play — ${tutorial.title}`}
        className="microlabel fixed bottom-6 right-6 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2 backdrop-blur transition hover:border-brass"
      >
        <span aria-hidden className="text-base leading-none">
          ?
        </span>
        <span className="hidden sm:inline">How to play</span>
      </button>

      {open && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none sm:items-center ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl outline-none transition duration-200 motion-reduce:transition-none ${
              entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="microlabel">How to play</p>
                <h2 id={titleId} className={`display mt-1 text-2xl ${accentInk}`}>
                  {tutorial.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close tutorial"
                className="flex min-h-[44px] min-w-[44px] flex-none items-center justify-center rounded-full border border-line text-lg text-muted transition hover:border-brass hover:text-ink"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>

            {tutorial.tagline && (
              <p className="mt-3 text-base leading-relaxed text-muted">{tutorial.tagline}</p>
            )}

            {/* Séance ships an animated board-fill demo above its steps; gated by
                href so the overlay stays generic and no other room renders it. */}
            {tutorial.href === "/seance" && (
              <div className="mt-5">
                <SeanceTutorialDemo />
              </div>
            )}

            {tutorial.steps ? (
              // Animated icon+phrase steps (E8) — each reveals in turn once the
              // dialog has entered; `entered` is already SSR/hydration-safe
              // (only true post-mount), so the stagger never runs on the server.
              <ol className="mt-5 space-y-3">
                {tutorial.steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                    animate={
                      entered
                        ? { opacity: 1, x: 0 }
                        : { opacity: reduceMotion ? 1 : 0, x: 0 }
                    }
                    transition={{
                      delay: reduceMotion ? 0 : i * 0.08,
                      duration: reduceMotion ? 0 : 0.25,
                    }}
                    className="flex items-center gap-3"
                  >
                    <span
                      aria-hidden
                      className={`flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-lg ${accentInk}`}
                    >
                      {step.icon}
                    </span>
                    <span className="text-base leading-relaxed">{step.text}</span>
                  </motion.li>
                ))}
              </ol>
            ) : (
              <ol className="mt-5 space-y-3">
                {(tutorial.rules ?? []).map((rule, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line text-xs ${accentInk}`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-base leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-5 rounded-xl border border-line bg-bg/40 p-4">
              <p className="microlabel">Worked example</p>
              <p className="mt-2 text-base leading-relaxed">{tutorial.example.prompt}</p>
              <p className="mt-2 text-base leading-relaxed text-muted">
                <span aria-hidden className={accentInk}>
                  →{" "}
                </span>
                {tutorial.example.walkthrough}
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="microlabel mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full border border-brass bg-surface px-4 py-2 transition hover:bg-bg/40"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
