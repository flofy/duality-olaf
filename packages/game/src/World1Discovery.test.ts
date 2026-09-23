import { describe, expect, it } from "vitest";
import { world1, type Level } from "@duality/level-format";
import { estimateDifficulty } from "./LevelValidator";
import { solveLevel } from "./LevelSolver";

/** World 1 teaches movement alone; fire arrives at level 05. */
const FIRE_FROM_LEVEL = 5;

const fireCount = (level: Level): number =>
  level.tiles.flat().filter((tile) => tile === "spike").length;

describe("World 1 — Découverte", () => {
  it("is ball-only: no level ships a square", () => {
    expect(world1).toHaveLength(11);
    for (const level of world1) expect(level.square).toBeUndefined();
  });

  it("introduces fire at level 05 and keeps it afterwards", () => {
    world1.forEach((level, index) => {
      if (index + 1 < FIRE_FROM_LEVEL) expect(fireCount(level)).toBe(0);
      else expect(fireCount(level)).toBeGreaterThan(0);
    });
  });

  it(
    "keeps every level solvable, easier to harder",
    { timeout: 120_000 },
    () => {
      const scores = world1.map((level) => {
        const difficulty = estimateDifficulty(solveLevel(level));
        expect(difficulty).not.toBeNull();
        return difficulty!.score;
      });
      for (let index = 1; index < scores.length; index += 1)
        expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1]!);
    },
  );
});
