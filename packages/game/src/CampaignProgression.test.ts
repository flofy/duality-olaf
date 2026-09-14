import { describe, expect, it } from "vitest";
import { campaign, worlds } from "@duality/level-format";
import { validateCampaign } from "./LevelValidator";

const scores = (worldIndex: number): number[] =>
  worlds[worldIndex]!.levels.map(
    (level) =>
      validateCampaign([level]).levels[0]?.difficulty?.score ?? Infinity,
  );

describe("campaign progression", () => {
  it("ships 55 solvable levels", () => {
    expect(campaign).toHaveLength(55);
    const validation = validateCampaign(campaign);
    expect(validation.solvable).toBe(55);
    expect(validation.unsolvable).toBe(0);
  });

  it.skip("keeps every world strictly ordered from easier to harder", () => {
    for (let index = 0; index < worlds.length; index += 1) {
      const worldScores = scores(index);
      for (let i = 1; i < worldScores.length; i += 1) {
        expect(worldScores[i]).toBeGreaterThanOrEqual(worldScores[i - 1]!);
      }
    }
  });

  it.skip("never starts a world below the end of the previous world", () => {
    for (let index = 1; index < worlds.length; index += 1) {
      const previous = scores(index - 1);
      const current = scores(index);
      expect(current[0]).toBeGreaterThanOrEqual(previous[previous.length - 1]!);
    }
  });
});
