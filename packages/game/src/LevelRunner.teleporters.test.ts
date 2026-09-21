import { describe, expect, it } from "vitest";
import type { Level, Position } from "@duality/level-format";
import { LevelRunner } from "./LevelRunner";

const RIGHT = { x: 1 as const, y: 0 as const };

function makeTeleporterLevel(options: {
  width?: number;
  ball?: Position;
  square?: Position;
  stars?: Position[];
  teleporters: NonNullable<Level["teleporters"]>;
  innerWalls?: Position[];
}): Level {
  const width = options.width ?? 13;
  const height = 5;
  const tiles: Level["tiles"] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || y === 0 || x === width - 1 || y === height - 1
        ? ("wall" as const)
        : ("empty" as const),
    ),
  );

  for (const wall of options.innerWalls ?? []) tiles[wall.y][wall.x] = "wall";

  return {
    id: "teleporter-test",
    width,
    height,
    tiles,
    ball: options.ball ?? { x: 2, y: 2 },
    square: options.square ?? { x: 2, y: 3 },
    stars: options.stars ?? [{ x: width - 2, y: 4 }],
    teleporters: options.teleporters,
  };
}

describe("LevelRunner: continuous movement through teleporters", () => {
  it("continues sliding in the same direction after a teleport", () => {
    const runner = new LevelRunner(
      makeTeleporterLevel({
        teleporters: [
          { id: "a", position: { x: 4, y: 2 }, targetId: "b" },
          { id: "b", position: { x: 7, y: 2 }, targetId: "a" },
        ],
        innerWalls: [{ x: 10, y: 2 }],
      }),
    );

    runner.move(RIGHT);
    const state = runner.getState();

    // 2 -> 4, teleport to 7, then keep sliding to 9 before the wall at 10.
    expect(state.ball).toEqual({ x: 9, y: 2 });
    expect(state.moves).toBe(1);
    expect(state.lastTeleport).toEqual({
      from: { x: 4, y: 2 },
      to: { x: 7, y: 2 },
    });
  });

  it("supports multiple teleports during one continuous move", () => {
    const runner = new LevelRunner(
      makeTeleporterLevel({
        width: 17,
        teleporters: [
          { id: "a", position: { x: 3, y: 2 }, targetId: "b" },
          { id: "b", position: { x: 5, y: 2 }, targetId: "c" },
          { id: "c", position: { x: 6, y: 2 }, targetId: "d" },
          { id: "d", position: { x: 8, y: 2 }, targetId: "e" },
          { id: "e", position: { x: 9, y: 2 }, targetId: "f" },
          { id: "f", position: { x: 11, y: 2 }, targetId: "e" },
        ],
        innerWalls: [{ x: 12, y: 2 }],
      }),
    );

    runner.move(RIGHT);
    const state = runner.getState();

    // 2 -> 3 -> 5 -> 6 -> 8 -> 9 -> 11, then the next cell is blocked.
    expect(state.ball).toEqual({ x: 11, y: 2 });
    expect(state.teleportsThisMove).toBe(3);
    expect(state.lastTeleport).toEqual({
      from: { x: 9, y: 2 },
      to: { x: 11, y: 2 },
    });
    expect(state.moves).toBe(1);
  });

  it("caps chained teleports at three per move without getting stuck in a loop", () => {
    const runner = new LevelRunner(
      makeTeleporterLevel({
        width: 17,
        teleporters: [
          { id: "a", position: { x: 3, y: 2 }, targetId: "b" },
          { id: "b", position: { x: 5, y: 2 }, targetId: "c" },
          { id: "c", position: { x: 6, y: 2 }, targetId: "d" },
          { id: "d", position: { x: 8, y: 2 }, targetId: "e" },
          { id: "e", position: { x: 9, y: 2 }, targetId: "f" },
          { id: "f", position: { x: 11, y: 2 }, targetId: "g" },
          { id: "g", position: { x: 12, y: 2 }, targetId: "h" },
          { id: "h", position: { x: 14, y: 2 }, targetId: "a" },
        ],
        innerWalls: [{ x: 15, y: 2 }],
      }),
    );

    runner.move(RIGHT);
    const state = runner.getState();

    // The fourth teleporter is intentionally not entered: the move stops
    // after three warps and the entity remains at the third destination.
    expect(state.teleportsThisMove).toBe(3);
    expect(state.ball).toEqual({ x: 11, y: 2 });
    expect(state.moves).toBe(1);
  });
});
