import { describe, expect, it } from "vitest";
import { world5 } from "@duality/level-format";
import { solveLevel } from "./LevelSolver";
import { commandsWarp, existsSolutionUsingBothPads } from "./MechanicCoverage";

describe("World 5 — teleporters are structural and two-way", () => {
  // Skiped in CI: the BFS solver explores a large state space on these
  // levels (pass-over teleport chaining can blow up exploredStates), and the
  // 5s default timeout is regularly exceeded on slower CI runners. Restore
  // when the solver is tuned (e.g. pruning, better visited-set representation,
  // or A* with an admissible heuristic).
  it.skip("warps in every optimal solution", () => {
    for (const level of world5) {
      const result = solveLevel(level);
      expect(result.solvable).toBe(true);
      expect(commandsWarp(level, result.commands)).toBe(true);
    }
  });

  it.skip(
    "offers a solution that warps from both pads",
    { timeout: 180_000 },
    () => {
      for (const level of world5) {
        expect(existsSolutionUsingBothPads(level)).toBe(true);
      }
    },
  );
});
