import { world1, world2, world3, world4 } from "@duality/level-format";
import { bench, describe } from "vitest";
import { solveLevel } from "./LevelSolver";

const representativeLevels = [
  world1.at(-1)!,
  world2.at(-1)!,
  world3.at(-1)!,
  world4.at(-1)!,
];

describe("solveLevel performance", () => {
  for (const level of representativeLevels) {
    bench(
      level.id,
      () => {
        solveLevel(level);
      },
      { iterations: 5 },
    );
  }
});
