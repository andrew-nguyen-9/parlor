import { describe, expect, it } from "vitest";
import {
  CHECKPOINTS,
  HOURS,
  type Mark,
  ROOMS,
  correctEliminations,
  deduceCulprits,
  deduceMotive,
  deduceWeapon,
  deductionMatrix,
  freeCluesEarned,
  generateCase,
  minCluesToSolve,
  verifySolvable,
} from "./mystery";

const datesFrom = (start: number, n: number) =>
  Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 0, 1) + (start + i) * 86400000).toISOString().slice(0, 10),
  );

describe("generateCase", () => {
  it("is deterministic for a given date", () => {
    const a = generateCase("2026-06-16");
    const b = generateCase("2026-06-16");
    expect(a).toEqual(b);
  });

  it("produces a verifiably solvable case for 200 consecutive days", () => {
    const start = Date.UTC(2026, 0, 1);
    for (let i = 0; i < 200; i++) {
      const date = new Date(start + i * 86400000).toISOString().slice(0, 10);
      const c = generateCase(date);
      expect(verifySolvable(c)).toBe(true);
    }
  });

  it("never names any solution axis in the opening prose", () => {
    for (const date of datesFrom(0, 30)) {
      const c = generateCase(date);
      expect(c.opening).not.toContain(c.scene);
      expect(c.opening).not.toContain(HOURS[c.hourIndex]);
      expect(c.opening).not.toContain(c.motive);
      expect(c.opening).not.toContain(c.weapon);
    }
  });
});

describe("clue-first solvability (5.7–5.9)", () => {
  it("no innocent ever lies: claimed === trueLocation, only culprits diverge (and only at the fatal hour)", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      for (const s of c.suspects) {
        const d = c.dossiers[s.id];
        const liesAt = d.claimed
          .map((room, h) => (room !== d.trueLocation[h] ? h : -1))
          .filter((h) => h >= 0);
        if (c.culprits.includes(s.id)) {
          expect(liesAt).toEqual([c.hourIndex]); // killer lies exactly once, at the fatal hour
          expect(d.trueLocation[c.hourIndex]).toBe(c.scene); // ...and was truly at the scene
        } else {
          expect(liesAt).toEqual([]); // innocents never lie
          expect(d.trueLocation[c.hourIndex]).not.toBe(c.scene); // innocents weren't at the murder
        }
      }
    }
  });

  it("requires more than one clue to solve (no single clue hands over an axis)", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      expect(minCluesToSolve(c)).toBeGreaterThan(1);
      // the WHERE/WHEN grid never confirms off a single clue either
      expect(deductionMatrix(c, 1).flat().filter((x) => x === "confirmed").length).toBe(0);
    }
  });

  it("motive and weapon are present and each uniquely deducible from the clues", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      expect(c.motivePool).toContain(c.motive);
      expect(c.weaponPool).toContain(c.weapon);
      expect(deduceMotive(c)).toBe(c.motive);
      expect(deduceWeapon(c)).toBe(c.weapon);
      // not revealed by the first clue alone
      expect(deduceMotive(c, 1)).toBeNull();
      expect(deduceWeapon(c, 1)).toBeNull();
    }
  });
});

describe("checkpoints / free clues (5.11–5.12)", () => {
  const blank = (): Mark[][] => ROOMS.map(() => HOURS.map(() => "unknown" as Mark));

  it("awards a free clue at each threshold, deterministically", () => {
    const c = generateCase("2026-06-16");
    const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
    const marks = blank();
    expect(freeCluesEarned(c, marks)).toBe(0);

    // cross out cells one at a time (skipping the solution cell) and watch the
    // free-clue count step up exactly at each CHECKPOINTS threshold.
    let crossed = 0;
    for (let r = 0; r < ROOMS.length; r++) {
      for (let h = 0; h < HOURS.length; h++) {
        if (r === sceneIdx && h === c.hourIndex) continue;
        marks[r][h] = "ruled-out";
        crossed++;
        expect(correctEliminations(c, marks)).toBe(crossed);
        expect(freeCluesEarned(c, marks)).toBe(CHECKPOINTS.filter((t) => crossed >= t).length);
      }
    }
    expect(freeCluesEarned(c, marks)).toBe(CHECKPOINTS.length); // all earned
  });

  it("crossing out the true scene/hour cell never counts as progress", () => {
    const c = generateCase("2026-06-16");
    const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
    const marks = blank();
    marks[sceneIdx][c.hourIndex] = "ruled-out";
    expect(correctEliminations(c, marks)).toBe(0);
    expect(freeCluesEarned(c, marks)).toBe(0);
  });
});

describe("WHERE/WHEN rebalance (E2.2)", () => {
  it("splits each axis across >=2 clues — no single clue determines WHERE or WHEN", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      const hourClues = c.clues.filter((cl) => cl.eliminatesHours.length > 0);
      const roomClues = c.clues.filter((cl) => cl.eliminatesRooms.length > 0);
      expect(hourClues.length).toBeGreaterThanOrEqual(2);
      expect(roomClues.length).toBeGreaterThanOrEqual(2);
      // no single clue crosses off all-but-one on its axis
      for (const cl of hourClues) expect(cl.eliminatesHours.length).toBeLessThan(HOURS.length - 1);
      for (const cl of roomClues) expect(cl.eliminatesRooms.length).toBeLessThan(ROOMS.length - 1);
      // ...but the union still leaves exactly the true hour and true scene
      const elimH = new Set(hourClues.flatMap((cl) => cl.eliminatesHours));
      const elimR = new Set(roomClues.flatMap((cl) => cl.eliminatesRooms));
      expect(elimH.has(c.hourIndex)).toBe(false);
      expect(elimH.size).toBe(HOURS.length - 1);
      const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
      expect(elimR.has(sceneIdx)).toBe(false);
      expect(elimR.size).toBe(ROOMS.length - 1);
    }
  });

  it("frames WHEN as brackets straddling the murder hour (1..3, both bounds present)", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      expect(c.hourIndex).toBeGreaterThanOrEqual(1);
      expect(c.hourIndex).toBeLessThanOrEqual(3);
      const before = new Set<number>();
      const after = new Set<number>();
      for (const cl of c.clues)
        for (const h of cl.eliminatesHours) (h < c.hourIndex ? before : after).add(h);
      expect(before.size).toBeGreaterThan(0); // "last seen alive" bracket
      expect(after.size).toBeGreaterThan(0); // "found cold by" bracket
    }
  });
});

describe("relationship red herrings (C1)", () => {
  it("ties >=3 suspects to the victim so dossiers can't fingerprint the ringleader", () => {
    for (const date of datesFrom(0, 200)) {
      const c = generateCase(date);
      const tiedToVictim = c.suspects.filter((s) =>
        c.dossiers[s.id].relationships.some((r) => r.to === c.victim.id),
      );
      expect(tiedToVictim.length).toBeGreaterThanOrEqual(3); // ringleader + 2 herrings
      // WHO stays uniquely deducible off the alibi grid regardless of ties
      const deduced = new Set(deduceCulprits(c));
      expect(deduced.size).toBe(c.culprits.length);
      for (const id of c.culprits) expect(deduced.has(id)).toBe(true);
    }
  });
});

describe("prose diversity (E2.5)", () => {
  it("varies titles and openings across days from the second rng stream", () => {
    const dates = datesFrom(0, 40);
    const titles = new Set(dates.map((d) => generateCase(d).title));
    const openings = new Set(dates.map((d) => generateCase(d).opening));
    expect(titles.size).toBeGreaterThan(10);
    expect(openings.size).toBeGreaterThan(10);
  });

  it("re-derives identical prose for the same date (deterministic)", () => {
    const a = generateCase("2026-03-09");
    const b = generateCase("2026-03-09");
    expect(a.title).toBe(b.title);
    expect(a.opening).toBe(b.opening);
  });
});

describe("deduceCulprits", () => {
  it("matches the generated culprit set exactly", () => {
    const c = generateCase("2026-06-16");
    const deduced = new Set(deduceCulprits(c));
    expect(deduced.size).toBe(c.culprits.length);
    for (const id of c.culprits) expect(deduced.has(id)).toBe(true);
  });

  it("never flags an innocent suspect", () => {
    const c = generateCase("2026-06-16");
    const deduced = new Set(deduceCulprits(c));
    for (const s of c.suspects) {
      if (!c.culprits.includes(s.id)) expect(deduced.has(s.id)).toBe(false);
    }
  });

  it("makes WHO a visible corroboration puzzle: culprits alone, innocents paired", () => {
    // The day's logic: at the murder hour, every innocent shares their claimed
    // room with >=1 other suspect; every culprit is the lone occupant of theirs.
    for (let i = 0; i < 200; i++) {
      const date = new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString().slice(0, 10);
      const c = generateCase(date);
      const h = c.hourIndex;
      const tally = new Map<string, number>();
      for (const s of c.suspects) {
        const room = c.dossiers[s.id].claimed[h];
        tally.set(room, (tally.get(room) ?? 0) + 1);
        expect(room).not.toBe(c.scene); // nobody claims the scene at the fatal hour
      }
      for (const s of c.suspects) {
        const alone = tally.get(c.dossiers[s.id].claimed[h]) === 1;
        expect(alone).toBe(c.culprits.includes(s.id));
      }
    }
  });
});

describe("deductionMatrix", () => {
  it("has exactly one confirmed cell once all clues are revealed, at the true scene/hour", () => {
    const c = generateCase("2026-06-16");
    const m = deductionMatrix(c, c.clues.length);
    let confirmed = 0;
    for (const row of m) for (const cell of row) if (cell === "confirmed") confirmed++;
    expect(confirmed).toBe(1);
    const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
    expect(m[sceneIdx][c.hourIndex]).toBe("confirmed");
  });

  it("has no confirmed cells before any clue is revealed", () => {
    const c = generateCase("2026-06-16");
    const m = deductionMatrix(c, 0);
    for (const row of m) for (const cell of row) expect(cell).not.toBe("confirmed");
  });

  it("only ever produces ruled-out, unknown, or confirmed cells", () => {
    const c = generateCase("2026-06-16");
    for (let n = 0; n <= c.clues.length; n++) {
      const m = deductionMatrix(c, n);
      for (const row of m) {
        for (const cell of row) {
          expect(["ruled-out", "unknown", "confirmed"]).toContain(cell);
        }
      }
    }
  });
});
