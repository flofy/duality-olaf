import { describe, expect, it } from "vitest";
import { world3, type Level } from "@duality/level-format";
import { estimateDifficulty } from "./LevelValidator";
import { existsSolutionWithoutMovingSquare } from "./MechanicCoverage";
import { solveLevel } from "./LevelSolver";

/**
 * World 3 is where the square stops being decoration: every level must require
 * an actual ball/square interaction (the level is not solvable with the ball
 * alone), and fire joins the toolbox at level 05.
 */
const FIRE_FROM_LEVEL = 5;

const fireCount = (level: Level): number =>
  level.tiles.flat().filter((tile) => tile === "spike").length;

function withoutSquare(level: Level): Level {
  const clone = structuredClone(level) as Level;
  delete clone.square;
  return clone;
}

describe("World 3 — Coordination", () => {
  it("gives every level a square", () => {
    expect(world3).toHaveLength(11);
    for (const level of world3) expect(level.square).toBeDefined();
  });

  it("requires the square to finish every level", { timeout: 120_000 }, () => {
    for (const level of world3) {
      expect(solveLevel(level).solvable).toBe(true);
      expect(solveLevel(withoutSquare(level)).solvable).toBe(false);
    }
  });

  it("introduces fire at level 05 and keeps it afterwards", () => {
    world3.forEach((level, index) => {
      if (index + 1 < FIRE_FROM_LEVEL) expect(fireCount(level)).toBe(0);
      else expect(fireCount(level)).toBeGreaterThan(0);
    });
  });

  it(
    "requires moving the square, not only its presence",
    { timeout: 180_000 },
    () => {
      // The dual of World 2: no level may be finishable while the square keeps
      // its starting cell — every puzzle needs real ball/square interaction.
      for (const level of world3)
        expect(existsSolutionWithoutMovingSquare(level)).toBe(false);
    },
  );

  it(
    "keeps every level solvable, easier to harder",
    { timeout: 120_000 },
    () => {
      const scores = world3.map((level) => {
        const difficulty = estimateDifficulty(solveLevel(level));
        expect(difficulty).not.toBeNull();
        return difficulty!.score;
      });
      for (let index = 1; index < scores.length; index += 1)
        expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1]!);
    },
  );
});
