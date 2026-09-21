import { test } from "@playwright/test";
import { LevelRunner, solveLevel } from "@duality/game";
import { worlds } from "@duality/level-format";

const directions = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
] as const;

test("probe imports node", () => {
  const all = worlds.flatMap((world) => world.levels);
  console.log(
    "worlds:",
    worlds.map((world) => `${world.id}(${world.levels.length})`).join(" "),
  );
  console.log(
    "firstIds:",
    worlds.map((world) => world.levels[0]!.id).join(", "),
  );
  for (const level of worlds[0]!.levels.slice(0, 3)) {
    const result = solveLevel(level);
    console.log(
      "solve",
      level.id,
      "solvable",
      result.solvable,
      "moves",
      result.moves,
      JSON.stringify(result.commands),
    );
  }
  const gameOverLevels: string[] = [];
  for (const level of all) {
    for (const direction of directions) {
      if (new LevelRunner(level).move(direction).gameOver) {
        gameOverLevels.push(`${level.id}:${JSON.stringify(direction)}`);
        break;
      }
    }
  }
  console.log("gameOverLevels:", gameOverLevels.slice(0, 8).join(" | "));
  console.log("gameOverTotal:", gameOverLevels.length);
  console.log("campaignOrder:", all.map((level) => level.id).join(","));
});
