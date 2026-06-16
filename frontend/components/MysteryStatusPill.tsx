"use client";

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

export default function MysteryStatusPill({
  tag,
  onCycle,
}: {
  tag: SuspectTag;
  onCycle: () => void;
}) {
  return (
    <button
      onClick={onCycle}
      className={`microlabel rounded-full border px-3 py-1 text-[10px] transition ${
        tag ? STYLE[tag] : "border-line text-muted hover:border-gold hover:text-gold"
      }`}
    >
      {tag ? LABEL[tag] : "—"}
    </button>
  );
}
