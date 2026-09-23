import { describe, expect, it } from "vitest";
import { world4 } from "@duality/level-format";
import { estimateDifficulty } from "./LevelValidator";
import { solveLevel } from "./LevelSolver";
import { commandsWarp, existsSolutionUsingBothPads } from "./MechanicCoverage";

/**
 * World 4 introduces the teleporters: one ball-only tutorial level, then the
 * square joins in, then the layouts get more complex. Every level must need a
 * warp, and every teleporter pair must work in both directions.
 */
describe("World 4 — Téléporteurs", () => {
  it("gives every level a paired teleporter", () => {
    expect(world4).toHaveLength(11);
    for (const level of world4) expect(level.teleporters).toHaveLength(2);
  });

  it("keeps level 01 ball-only, then adds the square", () => {
    expect(world4[0]!.square).toBeUndefined();
    for (const level of world4.slice(1)) expect(level.square).toBeDefined();
  });

  it("warps in every optimal solution", { timeout: 180_000 }, () => {
    for (const level of world4) {
      const result = solveLevel(level);
      expect(result.solvable).toBe(true);
      expect(commandsWarp(level, result.commands)).toBe(true);
    }
  });

  it(
    "offers a solution that warps from both pads",
    { timeout: 300_000 },
    () => {
      for (const level of world4)
        expect(existsSolutionUsingBothPads(level)).toBe(true);
    },
  );

  it(
    "keeps every level solvable, easier to harder",
    { timeout: 180_000 },
    () => {
      const scores = world4.map((level) => {
        const difficulty = estimateDifficulty(solveLevel(level));
        expect(difficulty).not.toBeNull();
        return difficulty!.score;
      });
      for (let index = 1; index < scores.length; index += 1)
        expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1]!);
    },
  );
});
