import { describe, expect, it } from "vitest";
import { world5 } from "@duality/level-format";
import { solveLevel } from "./LevelSolver";
import { commandsWarp, existsSolutionUsingBothPads } from "./MechanicCoverage";

describe("World 5 — teleporters are structural and two-way", () => {
  it("warps in every optimal solution", { timeout: 120_000 }, () => {
    for (const level of world5) {
      const result = solveLevel(level);
      expect(result.solvable).toBe(true);
      expect(commandsWarp(level, result.commands)).toBe(true);
    }
  });

  it(
    "offers a solution that warps from both pads",
    { timeout: 180_000 },
    () => {
      for (const level of world5) {
        expect(existsSolutionUsingBothPads(level)).toBe(true);
      }
    },
  );
});
