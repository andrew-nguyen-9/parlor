"use client";

import { useMemo, useRef, useState } from "react";
import { sfxCorrect, sfxGlassClink, sfxPianoChord, sfxWrong } from "@/lib/sound";
import { haptic } from "@/lib/haptics";
import { useProfile, type Achievement } from "@/lib/profile";
import type { MysteryCase } from "@/lib/mystery";
import { score, type MysteryAttempt, type MysteryScoreResult } from "@/lib/mysteryScore";
import MysteryEvidenceLog from "./MysteryEvidenceLog";
import MysteryTimelinePanel from "./MysteryTimelinePanel";
import MysteryAccusationForm from "./MysteryAccusationForm";
import MysteryDossierTable from "./MysteryDossierTable";
import MysteryDossierBook from "./MysteryDossierBook";
import { nextTag, type SuspectTag } from "./MysteryStatusPill";
import AchievementToast from "./AchievementToast";

export interface StoredMysteryAttempt {
  attempt: MysteryAttempt;
  result: MysteryScoreResult;
  at: number;
}

type ViewMode = "table" | "book";
type MobileTab = "suspects" | "evidence" | "timeline";

export default function MysteryInvestigate({
  mystery,
  onSolved,
}: {
  mystery: MysteryCase;
  onSolved: (stored: StoredMysteryAttempt) => void;
}) {
  const { record } = useProfile();
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [tags, setTags] = useState<Record<string, SuspectTag>>({});
  const [whereGuess, setWhereGuess] = useState<string | null>(null);
  const [whenGuess, setWhenGuess] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [mobileTab, setMobileTab] = useState<MobileTab>("suspects");
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const startedAt = useRef(Date.now());

  const whoGuess = useMemo(
    () => mystery.suspects.filter((s) => tags[s.id] === "prime").map((s) => s.id),
    [mystery.suspects, tags],
  );

  function cycleTag(id: string) {
    setTags((t) => ({ ...t, [id]: nextTag(t[id]) }));
    sfxGlassClink();
  }

  function revealNext() {
    setCluesRevealed((r) => Math.min(mystery.clues.length, r + 1));
    sfxPianoChord();
  }

  function submit() {
    const elapsedSeconds = Math.round((Date.now() - startedAt.current) / 1000);
    const attempt: MysteryAttempt = {
      whoGuess,
      whereGuess,
      whenGuess,
      cluesRevealed,
      elapsedSeconds,
      tableTags: tags,
    };
    const result = score(mystery, attempt);
    if (result.won) {
      sfxCorrect();
      haptic.win();
    } else {
      sfxWrong();
      haptic.wrong();
    }
    const unlocked = record({
      room: "mystery",
      score: result.total,
      correct: result.won ? 1 : 0,
      total: 1,
    });
    if (unlocked.length) setToasts(unlocked);
    onSolved({ attempt, result, at: Date.now() });
  }

  const suspectsPanel = (
    <div className="gilt-frame rounded-2xl bg-surface/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="microlabel text-gold">suspects</p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`microlabel rounded-full border px-3 py-1 ${
              viewMode === "table" ? "border-gold text-gold" : "border-line text-muted"
            }`}
          >
            table
          </button>
          <button
            onClick={() => setViewMode("book")}
            className={`microlabel rounded-full border px-3 py-1 ${
              viewMode === "book" ? "border-gold text-gold" : "border-line text-muted"
            }`}
          >
            book
          </button>
        </div>
      </div>
      {viewMode === "table" ? (
        <MysteryDossierTable
          mystery={mystery}
          cluesRevealed={cluesRevealed}
          tags={tags}
          onCycleTag={cycleTag}
        />
      ) : (
        <MysteryDossierBook mystery={mystery} cluesRevealed={cluesRevealed} />
      )}
    </div>
  );

  const evidencePanel = (
    <>
      <MysteryEvidenceLog mystery={mystery} cluesRevealed={cluesRevealed} onRevealNext={revealNext} />
      <MysteryAccusationForm
        mystery={mystery}
        whoGuess={whoGuess}
        whereGuess={whereGuess}
        whenGuess={whenGuess}
        onWhereChange={setWhereGuess}
        onWhenChange={setWhenGuess}
        onSubmit={submit}
      />
    </>
  );

  const timelinePanel = <MysteryTimelinePanel mystery={mystery} cluesRevealed={cluesRevealed} />;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-baseline justify-between">
        <h2 className="display gilt text-3xl">{mystery.title}</h2>
        <span className="microlabel text-brass">case #{mystery.caseNumber}</span>
      </div>

      {/* Desktop: 3 columns */}
      <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[1.1fr_1.3fr_1fr]">
        <div>{suspectsPanel}</div>
        <div className="flex flex-col gap-6">{evidencePanel}</div>
        <div>{timelinePanel}</div>
      </div>

      {/* Mobile: tabs */}
      <div className="mt-6 lg:hidden">
        <div className="mb-4 flex gap-2">
          {(["suspects", "evidence", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`microlabel flex-1 rounded-full border px-3 py-2 ${
                mobileTab === tab ? "border-gold text-gold" : "border-line text-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {mobileTab === "suspects" && suspectsPanel}
        {mobileTab === "evidence" && <div className="flex flex-col gap-6">{evidencePanel}</div>}
        {mobileTab === "timeline" && timelinePanel}
      </div>

      <AchievementToast queue={toasts} />
    </div>
  );
}
