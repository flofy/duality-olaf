import { describe, expect, it } from "vitest";
import { world5 } from "@duality/level-format";
import { estimateDifficulty } from "./LevelValidator";
import { solveLevel } from "./LevelSolver";
import {
  commandsToggleDoor,
  commandsWarp,
  existsSolutionUsingBothPads,
} from "./MechanicCoverage";

/**
 * World 5 introduces the doors and ends up combining the four elements:
 * level 01 is the ball + door tutorial, 02-04 add the square, then the
 * teleporters join in and the last levels keep all four elements.
 */
describe("World 5 — Portes puis combinaison finale", () => {
  it("opens with a ball-only door tutorial", () => {
    const first = world5[0]!;
    expect(first.doors?.length ?? 0).toBeGreaterThan(0);
    expect(first.switches?.length ?? 0).toBeGreaterThan(0);
    expect(first.square).toBeUndefined();
    expect(first.teleporters ?? []).toHaveLength(0);
  });

  it("adds the square before the teleporters", () => {
    for (const level of world5.slice(1, 4)) {
      expect(level.doors?.length ?? 0).toBeGreaterThan(0);
      expect(level.square).toBeDefined();
      expect(level.teleporters ?? []).toHaveLength(0);
    }
  });

  it("combines the four elements on the final levels", () => {
    for (const level of world5.slice(4)) {
      expect(level.ball).toBeDefined();
      expect(level.square).toBeDefined();
      expect(level.doors?.length ?? 0).toBeGreaterThan(0);
      expect(level.teleporters).toHaveLength(2);
    }
  });

  it(
    "operates the door in every optimal solution",
    { timeout: 180_000 },
    () => {
      for (const level of world5) {
        const result = solveLevel(level);
        expect(result.solvable).toBe(true);
        expect(commandsToggleDoor(level, result.commands)).toBe(true);
      }
    },
  );

  it(
    "warps on every level that ships a teleporter",
    { timeout: 180_000 },
    () => {
      for (const level of world5) {
        if ((level.teleporters ?? []).length === 0) continue;
        const result = solveLevel(level);
        expect(commandsWarp(level, result.commands)).toBe(true);
      }
    },
  );

  it("wires the teleporters both ways", { timeout: 300_000 }, () => {
    for (const level of world5) {
      if ((level.teleporters ?? []).length === 0) continue;
      expect(existsSolutionUsingBothPads(level)).toBe(true);
    }
  });

  it(
    "keeps every level solvable, easier to harder",
    { timeout: 180_000 },
    () => {
      const scores = world5.map((level) => {
        const difficulty = estimateDifficulty(solveLevel(level));
        expect(difficulty).not.toBeNull();
        return difficulty!.score;
      });
      for (let index = 1; index < scores.length; index += 1)
        expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1]!);
    },
  );
});
