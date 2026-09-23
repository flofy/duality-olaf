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
    "keeps every world ordered from easier to harder",
    { timeout: 120_000 },
    () => {
      for (let index = 0; index < worlds.length; index += 1) {
        const worldScores = scores(index);
        for (let i = 1; i < worldScores.length; i += 1) {
          // Each world must ramp up: never a step backwards. The themed worlds
          // have overlapping global ranges (a hard positioning puzzle can
          // outrank an easy coordination one), so this is asserted per world.
          expect(worldScores[i]).toBeGreaterThanOrEqual(worldScores[i - 1]!);
        }
      }
    },
  );

  it("ramps up overall difficulty from world to world", () => {
    // Compare the *ends* of the worlds: each world must finish harder than the
    // previous one, even if their opening levels overlap.
    const lastScores = worlds.map((world, index) => {
      const worldScores = scores(index);
      return worldScores[worldScores.length - 1]!;
    });
    for (let index = 1; index < lastScores.length; index += 1)
      expect(lastScores[index]).toBeGreaterThan(lastScores[index - 1]!);
  });
});
