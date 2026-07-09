"use client";

import { useRef } from "react";

export type SuspectTag = "potential" | "prime" | "cleared" | undefined;

const ORDER: SuspectTag[] = [undefined, "potential", "prime", "cleared"];

const LABEL: Record<"potential" | "prime" | "cleared", string> = {
  potential: "POTENTIAL",
  prime: "PRIME",
  cleared: "CLEARED",
};

const STYLE: Record<"potential" | "prime" | "cleared", string> = {
  potential: "border-gold/55 text-gold bg-transparent",
  prime: "border-ember bg-ember/18 text-ink",
  cleared: "border-line text-muted bg-surface/85",
};

/** Cycles blank → potential → prime → cleared → blank. */
export function nextTag(tag: SuspectTag): SuspectTag {
  const i = ORDER.indexOf(tag);
  return ORDER[(i + 1) % ORDER.length];
}

/** Reverse cycle (C12): blank → cleared → prime → potential → blank — undoes an overshoot. */
export function prevTag(tag: SuspectTag): SuspectTag {
  const i = ORDER.indexOf(tag);
  return ORDER[(i - 1 + ORDER.length) % ORDER.length];
}

export default function MysteryStatusPill({
  tag,
  onCycle,
  onReverse,
}: {
  tag: SuspectTag;
  onCycle: () => void;
  onReverse?: () => void;
}) {
  // iOS Safari never fires contextmenu on long-press, so touch gets its own
  // 500ms hold timer (mouse keeps right-click; a held click is suppressed).
  const holdTimer = useRef<number>();
  const held = useRef(false);
  // Android fires contextmenu on long-press too — without this the hold timer
  // and contextmenu would both step back. Mouse-only contextmenu reverses.
  const mousePointer = useRef(true);
  return (
    <button
      onClick={(e) => {
        // row is now fully clickable (E6) — stop the bubble so a pill tap
        // doesn't also fire the row's own onClick and double-cycle.
        e.stopPropagation();
        if (held.current) {
          held.current = false;
          return;
        }
        onCycle();
      }}
      onPointerDown={
        onReverse
          ? (e) => {
              mousePointer.current = e.pointerType === "mouse";
              if (mousePointer.current) return;
              held.current = false;
              holdTimer.current = window.setTimeout(() => {
                held.current = true;
                onReverse();
              }, 500);
            }
          : undefined
      }
      onPointerUp={() => clearTimeout(holdTimer.current)}
      onPointerLeave={() => clearTimeout(holdTimer.current)}
      onPointerCancel={() => clearTimeout(holdTimer.current)}
      onContextMenu={
        onReverse
          ? (e) => {
              e.preventDefault();
              if (mousePointer.current) onReverse();
            }
          : undefined
      }
      style={{ touchAction: "manipulation", WebkitTouchCallout: "none" } as React.CSSProperties}
      title="tap to cycle · long-press / right-click to step back"
      className={`microlabel rounded-full border px-3 py-1 text-[10px] transition ${
        tag ? STYLE[tag] : "border-line text-muted hover:border-gold hover:text-gold"
      }`}
    >
      {tag ? LABEL[tag] : "—"}
    </button>
  );
}
