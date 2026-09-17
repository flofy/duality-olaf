import { describe, expect, it } from "vitest";
import { levelEditorTools } from "./LevelEditorTools";

describe("levelEditorTools", () => {
  it("defines each editor tool exactly once", () => {
    const ids = levelEditorTools.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "empty",
      "wall",
      "star",
      "ball",
      "square",
      "door",
      "switch",
      "teleporter",
    ]);
  });
});
