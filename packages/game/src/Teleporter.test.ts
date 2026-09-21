import { describe, expect, it } from "vitest";
import { teleporterTutorials, type Level } from "@duality/level-format";
import { LevelRunner } from "./LevelRunner";
import { solveLevel } from "./LevelSolver";

describe("teleporters", () => {
  it("teleports the active form when it lands on an entry", () => {
    const runner = new LevelRunner(teleporterTutorials[0]!);
    runner.move({ x: 1, y: 0 });
    // Slides over pad A at (5,4), warps onto pad B at (9,8), then keeps
    // sliding until the border wall stops it at (11,8).
    expect(runner.getState().ball).toEqual({ x: 11, y: 8 });
    expect(runner.getState().lastTeleport).toEqual({
      from: { x: 5, y: 4 },
      to: { x: 9, y: 8 },
    });
  });

  it("collects a star at the teleporter exit", () => {
    const runner = new LevelRunner(teleporterTutorials[0]!);
    runner.move({ x: 1, y: 0 });
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().completed).toBe(true);
  });

  it("does not teleport into the other form", () => {
    const runner = new LevelRunner({
      ...teleporterTutorials[0]!,
      square: { x: 9, y: 8 },
    });
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball).toEqual({ x: 5, y: 4 });
  });

  it("teleports when sliding over a pad, not only when stopping on it", () => {
    const level: Level = {
      id: "teleporter-pass-over",
      width: 13,
      height: 10,
      tiles: Array.from({ length: 10 }, (_, y) =>
        Array.from({ length: 13 }, (_, x) =>
          x === 0 || y === 0 || x === 12 || y === 9
            ? ("wall" as const)
            : ("empty" as const),
        ),
      ),
      ball: { x: 1, y: 2 },
      square: { x: 2, y: 8 },
      stars: [{ x: 9, y: 7 }],
      teleporters: [
        { id: "a", position: { x: 5, y: 2 }, targetId: "b" },
        { id: "b", position: { x: 9, y: 7 }, targetId: "a" },
      ],
    };

    // Nothing blocks row 2 after the pad: under stop-only semantics the ball
    // would glide to (11,2). Passing over pad A warps it onto pad B and the
    // slide continues along row 7 until the border wall stops it at (11,7).
    const runner = new LevelRunner(level);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball).toEqual({ x: 11, y: 7 });
    expect(runner.getState().lastTeleport).toEqual({
      from: { x: 5, y: 2 },
      to: { x: 9, y: 7 },
    });
  });

  it("continues sliding when the warp destination is blocked", () => {
    const level: Level = {
      id: "teleporter-blocked-destination",
      width: 13,
      height: 10,
      tiles: Array.from({ length: 10 }, (_, y) =>
        Array.from({ length: 13 }, (_, x) =>
          x === 0 || y === 0 || x === 12 || y === 9
            ? ("wall" as const)
            : ("empty" as const),
        ),
      ),
      ball: { x: 1, y: 2 },
      square: { x: 9, y: 7 },
      stars: [{ x: 11, y: 2 }],
      teleporters: [
        { id: "a", position: { x: 5, y: 2 }, targetId: "b" },
        { id: "b", position: { x: 9, y: 7 }, targetId: "a" },
      ],
    };

    // Pad B is occupied by the square: the ball is not warped and keeps
    // sliding along row 2 until the border wall stops it.
    const runner = new LevelRunner(level);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball).toEqual({ x: 11, y: 2 });
    expect(runner.getState().lastTeleport).toBeNull();
  });

  it("keeps all tutorial levels solver-valid", () => {
    for (const level of teleporterTutorials)
      expect(solveLevel(level).solvable).toBe(true);
  });
});
