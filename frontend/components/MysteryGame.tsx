"use client";

import { useEffect, useState } from "react";
import type { MysteryCase } from "@/lib/mystery";
import MysteryIntro from "./MysteryIntro";
import MysteryInvestigate, { type StoredMysteryAttempt } from "./MysteryInvestigate";
import MysteryVerdict from "./MysteryVerdict";

function loadAttempt(date: string): StoredMysteryAttempt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`parlor:mystery:${date}`);
    return raw ? (JSON.parse(raw) as StoredMysteryAttempt) : null;
  } catch {
    return null;
  }
}

function saveAttempt(date: string, stored: StoredMysteryAttempt): void {
  try {
    localStorage.setItem(`parlor:mystery:${date}`, JSON.stringify(stored));
  } catch {
    /* private mode — keep playing in-memory */
  }
}

export default function MysteryGame({ mystery }: { mystery: MysteryCase }) {
  const [stage, setStage] = useState<"intro" | "investigate" | "results">("intro");
  const [stored, setStored] = useState<StoredMysteryAttempt | null>(null);

  // Already played today? Jump straight to the verdict.
  useEffect(() => {
    const prior = loadAttempt(mystery.date);
    if (prior) {
      setStored(prior);
      setStage("results");
    }
  }, [mystery.date]);

  function handleSolved(s: StoredMysteryAttempt) {
    saveAttempt(mystery.date, s);
    setStored(s);
    setStage("results");
  }

  if (stage === "intro") {
    return <MysteryIntro mystery={mystery} onBegin={() => setStage("investigate")} />;
  }
  if (stage === "results" && stored) {
    return <MysteryVerdict mystery={mystery} attempt={stored.attempt} result={stored.result} />;
  }
  return <MysteryInvestigate mystery={mystery} onSolved={handleSolved} />;
}
