import path from "node:path";
import { test } from "@playwright/test";

const gameEntry = `/@fs${path.resolve(
  import.meta.dirname,
  "../../../packages/game/src/index.ts",
)}`;

test("probe browser solve", async ({ page }) => {
  await page.goto("/");
  const out = await page.evaluate(async (entry) => {
    const lf = await import(/* @vite-ignore */ "/src/levels/campaign.ts");
    const game = await import(/* @vite-ignore */ entry);
    const firstWithSquare = lf.campaign
      .filter((level) => Boolean(level.square))
      .slice(0, 3)
      .map((level) => {
        const started = performance.now();
        const result = game.solveLevel(level);
        return {
          id: level.id,
          stars: level.stars.length,
          doors: level.doors?.length ?? 0,
          moves: result.solvable ? result.moves : null,
          usesSwitch: result.solvable
            ? result.commands.some((command) => command.type === "switch")
            : null,
          ms: Math.round(performance.now() - started),
        };
      });
    return {
      world1: lf.campaign.slice(0, 11).map((level) => ({
        id: level.id,
        stars: level.stars.length,
        hasSquare: Boolean(level.square),
        moves: game.solveLevel(level).moves,
      })),
      firstWithSquare,
    };
  }, gameEntry);
  console.log(JSON.stringify(out, null, 2));
});
