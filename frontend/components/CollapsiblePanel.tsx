// Reusable collapsible left/right rail (F4 · North Star §Mobile). Side-rail rooms
// (Sanctum, Séance, Climb, Chronos) mount one of these into a RoomShell rail slot.
// SSR-safe (server renders `defaultOpen`; localStorage is read after mount, so no
// hydration mismatch — the panel is interactive chrome, not content), keyboard +
// touch (a real <button> header ≥44px, aria-expanded/aria-controls), and
// reduced-motion aware (the open/close grid animation is disabled via
// `motion-reduce:` so the freeze is a designed state, not a jump).
"use client";

import { useEffect, useId, useState } from "react";

export default function CollapsiblePanel({
  side = "left",
  title,
  storageKey,
  defaultOpen = true,
  accent,
  children,
}: {
  /** Which rail this mounts into — informs the collapse chevron direction. */
  side?: "left" | "right";
  /** Engraved header label (also the collapsed panel's accessible name). */
  title: string;
  /** localStorage key; when set, the open/closed state is remembered per rail. */
  storageKey?: string;
  /** SSR + first-paint state. Rooms pass `false` to start collapsed on mobile. */
  defaultOpen?: boolean;
  /** Optional category hex for the header label ink. */
  accent?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  // Hydrate the remembered state after mount (client only).
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null) setOpen(raw === "1");
    } catch {
      /* storage blocked/corrupt → keep the default */
    }
  }, [storageKey]);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next ? "1" : "0");
        } catch {
          /* storage blocked → in-memory only */
        }
      }
      return next;
    });
  }

  return (
    <section
      data-side={side}
      className="collapsible-panel overflow-hidden rounded-2xl border border-line bg-surface/70"
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-2 text-left"
      >
        <span className="microlabel" style={accent ? { color: accent } : undefined}>
          {title}
        </span>
        <span
          aria-hidden
          className="text-[0.7rem] opacity-60 transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
      </button>

      {/* grid-rows 1fr↔0fr = the modern height-agnostic collapse; the inner
          overflow-hidden wrapper is what actually clips as the rows shrink. */}
      <div
        id={bodyId}
        role="region"
        aria-label={title}
        aria-hidden={!open}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
