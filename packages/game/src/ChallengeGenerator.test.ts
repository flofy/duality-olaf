import { describe, expect, it } from "vitest";
import { generateChallenge } from "./ChallengeGenerator";
import { solveLevel } from "./LevelSolver";
describe("generateChallenge", () => {
  it("is deterministic for the same seed and mechanics", () =>
    expect(
      generateChallenge(20260904, { mechanics: ["walls", "doors"] }),
    ).toEqual(generateChallenge(20260904, { mechanics: ["walls", "doors"] })));
  it("returns solver-validated challenges", () =>
    expect(solveLevel(generateChallenge(42).level).solvable).toBe(true));
  it("can generate doors and switches", () => {
    const c = generateChallenge(77, { mechanics: ["walls", "doors"] });
    expect(c.level.doors).toHaveLength(1);
    expect(c.level.switches).toHaveLength(1);
  });
  it("can generate paired teleporters", () =>
    expect(
      generateChallenge(88, { mechanics: ["walls", "teleporters"] }).level
        .teleporters,
    ).toHaveLength(2));
  it("can generate ball-only levels", () => {
    const challenge = generateChallenge(101, {
      mechanics: ["walls", "teleporters"],
      square: false,
    });
    expect(challenge.level.square).toBeUndefined();
    expect(solveLevel(challenge.level).solvable).toBe(true);
  });
  it("can scatter lethal fire cells", () => {
    const challenge = generateChallenge(202, {
      mechanics: ["walls"],
      spikes: 3,
    });
    const spikes = challenge.level.tiles
      .flat()
      .filter((tile) => tile === "spike");
    expect(spikes).toHaveLength(3);
    expect(solveLevel(challenge.level).solvable).toBe(true);
  });
  it("keeps ball-only switches usable by the ball", () => {
    const challenge = generateChallenge(303, {
      mechanics: ["walls", "doors"],
      square: false,
    });
    expect(challenge.level.switches?.[0]?.form).toBe("ball");
    expect(solveLevel(challenge.level).solvable).toBe(true);
  });
  it("honours a forced switch form", () =>
    expect(
      generateChallenge(404, {
        mechanics: ["walls", "doors"],
        switchForm: "square",
      }).level.switches?.[0]?.form,
    ).toBe("square"));
});
