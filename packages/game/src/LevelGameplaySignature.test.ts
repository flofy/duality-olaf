import { describe, expect, it } from "vitest";
import { gameplaySignature } from "./LevelGameplaySignature";

describe("gameplaySignature", () => {
  it("ignores continuous slide distance", () => {
    const short = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
    ];
    const long = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
    ];

    expect(gameplaySignature(short)).toBe(gameplaySignature(long));
  });

  it("treats rotated solutions as equivalent", () => {
    const horizontal = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];
    const rotated = [
      { type: "move" as const, direction: { x: 0, y: 1 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: -1, y: 0 } },
    ];

    expect(gameplaySignature(horizontal)).toBe(gameplaySignature(rotated));
  });

  it("treats mirrored solutions as equivalent by default", () => {
    const original = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];
    const mirrored = [
      { type: "move" as const, direction: { x: -1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];

    expect(gameplaySignature(original)).toBe(gameplaySignature(mirrored));
  });

  it("can keep reflections distinct", () => {
    const original = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];
    const mirrored = [
      { type: "move" as const, direction: { x: -1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];

    expect(
      gameplaySignature(original, { includeReflections: false }),
    ).not.toBe(gameplaySignature(mirrored, { includeReflections: false }));
  });

  it("keeps different decision structures distinct", () => {
    const oneSwitch = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
    ];
    const twoSwitches = [
      { type: "move" as const, direction: { x: 1, y: 0 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: 0, y: 1 } },
      { type: "switch" as const },
      { type: "move" as const, direction: { x: -1, y: 0 } },
    ];

    expect(gameplaySignature(oneSwitch)).not.toBe(gameplaySignature(twoSwitches));
  });
});
