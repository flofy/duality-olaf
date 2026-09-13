import { describe, expect, it } from "vitest";
import { world4 } from "@duality/level-format";
import { solveLevel } from "./LevelSolver";
import { commandsToggleDoor } from "./MechanicCoverage";

describe("World 4 — doors are structural", () => {
  it("uses the door in every optimal solution", () => {
    for (const level of world4) {
      expect(level.doors?.length ?? 0).toBeGreaterThan(0);
      expect(level.switches?.length ?? 0).toBeGreaterThan(0);
      const result = solveLevel(level);
      expect(result.solvable).toBe(true);
      // The intended path must actually operate the door/switch pair,
      // otherwise the mechanic is decorative.
      expect(commandsToggleDoor(level, result.commands)).toBe(true);
    }
  });
});
