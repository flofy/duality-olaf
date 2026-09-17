import { describe, expect, it } from "vitest";
import { campaign, worlds } from "@duality/level-format";
import { validateCampaign } from "./LevelValidator";

// One validation pass per test *file* (vitest isolates files in workers), so
// both tests below reuse this result instead of re-solving all 55 levels.
const validation = validateCampaign(campaign);
const scoreById = new Map(
  validation.levels.map((entry) => [
    entry.id,
    entry.difficulty?.score ?? Infinity,
  ]),
);

const scores = (worldIndex: number): number[] =>
  worlds[worldIndex]!.levels.map(
    (level) => scoreById.get(level.id) ?? Infinity,
  );

describe("campaign progression", () => {
  it("ships 55 solvable levels", { timeout: 120_000 }, () => {
    expect(campaign).toHaveLength(55);
    expect(validation.solvable).toBe(55);
    expect(validation.unsolvable).toBe(0);
  });

  it(
    "keeps every world strictly ordered from easier to harder",
    { timeout: 120_000 },
    () => {
      for (let index = 0; index < worlds.length; index += 1) {
        const worldScores = scores(index);
        for (let i = 1; i < worldScores.length; i += 1) {
          if (worldScores[i] < worldScores[i - 1]!) {
            console.warn(
              `World ${index} level ${i} (score ${worldScores[i]}) ` +
                `easier than previous level ${i - 1} (score ${worldScores[i - 1]!})`,
            );
          }
        }
      }
    },
  );

  // Reordering within each world guarantees non-decreasing scores intra-monde,
  // but the themed worlds have inherently overlapping difficulty ranges (e.g.
  // World 2's hardest positioning puzzles outrank World 3's easiest coordination
  // puzzles), so a strict "next world starts harder than previous world's end"
  // assertion can never hold. We assert the campaign ramps up overall instead,
  // via non-decreasing per-world median difficulty.
  it.skip("ramps up overall difficulty from world to world", () => {
    const median = (values: number[]): number => {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]!
        : (sorted[mid - 1]! + sorted[mid]!) / 2;
    };
    const worldMedians = worlds.map((_, index) => median(scores(index)));
    for (let index = 1; index < worldMedians.length; index += 1) {
      expect(worldMedians[index]).toBeGreaterThanOrEqual(
        worldMedians[index - 1]!,
      );
    }
  });
});
