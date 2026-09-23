import { describe, expect, it } from "vitest";
import { world2, type Level } from "@duality/level-format";
import { estimateDifficulty } from "./LevelValidator";
import { existsSolutionWithoutMovingSquare } from "./MechanicCoverage";
import { solveLevel } from "./LevelSolver";

/**
 * World 2 introduces the square. It only has to *appear* here: the player is
 * not required to move it to finish a level (no switch gate), and fire joins
 * the toolbox at level 05.
 */
const FIRE_FROM_LEVEL = 5;

const fireCount = (level: Level): number =>
  level.tiles.flat().filter((tile) => tile === "spike").length;

describe("World 2 — Positionnement", () => {
  it("introduces the square on every level", () => {
    expect(world2).toHaveLength(11);
    for (const level of world2) expect(level.square).toBeDefined();
  });

  it("introduces fire at level 05 and keeps it afterwards", () => {
    world2.forEach((level, index) => {
      if (index + 1 < FIRE_FROM_LEVEL) expect(fireCount(level)).toBe(0);
      else expect(fireCount(level)).toBeGreaterThan(0);
    });
  });

  it(
    "can be finished without ever moving the square",
    { timeout: 180_000 },
    () => {
      for (const level of world2)
        expect(existsSolutionWithoutMovingSquare(level)).toBe(true);
    },
  );

  it(
    "keeps every level solvable, easier to harder",
    { timeout: 120_000 },
    () => {
      const scores = world2.map((level) => {
        const difficulty = estimateDifficulty(solveLevel(level));
        expect(difficulty).not.toBeNull();
        return difficulty!.score;
      });
      for (let index = 1; index < scores.length; index += 1)
        expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1]!);
    },
  );
});
