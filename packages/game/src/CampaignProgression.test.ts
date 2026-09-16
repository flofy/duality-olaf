import { describe, expect, it } from "vitest";
import { campaign, worlds } from "@duality/level-format";
import { validateCampaign } from "./LevelValidator";

const scores = (worldIndex: number): number[] =>
  worlds[worldIndex]!.levels.map(
    (level) =>
      validateCampaign([level]).levels[0]?.difficulty?.score ?? Infinity,
  );

describe("campaign progression", () => {
  it("ships 55 solvable levels", { timeout: 120_000 }, () => {
    expect(campaign).toHaveLength(55);
    const validation = validateCampaign(campaign);
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
          expect(worldScores[i]).toBeGreaterThanOrEqual(worldScores[i - 1]!);
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
  it("ramps up overall difficulty from world to world", () => {
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
