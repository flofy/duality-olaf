import { describe, expect, it } from "vitest";
import {
  campaign,
  challengeLevels,
  validateLevel as validateLevelStructure,
} from "@duality/level-format";

/**
 * Challenge levels live in `levels/challenges/*.json`. They are playable from
 * the Level Lab catalogue but deliberately kept out of the linear campaign so
 * the CI solver gate only ever runs on the 55 campaign levels.
 */
describe("challenge levels", () => {
  it("exposes at least one catalogue-only level", () => {
    expect(challengeLevels.length).toBeGreaterThan(0);
  });

  it.each(challengeLevels)("$id is structurally valid", (level) => {
    expect(() => validateLevelStructure(level)).not.toThrow();
  });

  it("never collides with a campaign id", () => {
    const campaignIds = new Set(campaign.map((level) => level.id));
    for (const level of challengeLevels) {
      expect(campaignIds.has(level.id)).toBe(false);
    }
  });

  it("keeps unique ids across the catalogue", () => {
    const ids = challengeLevels.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
