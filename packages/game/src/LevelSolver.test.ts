import { describe, expect, it } from "vitest";
import {
  createEmptyLevel,
  type Level,
  world1,
  world4,
} from "@duality/level-format";
import { LevelRunner } from "./LevelRunner";
import { solveLevel } from "./LevelSolver";

describe("solveLevel", () => {
  it("solves a level by collecting a star", () => {
    const level = createEmptyLevel("solver-simple");
    level.ball = { x: 1, y: 1 };
    level.square = { x: 5, y: 5 };
    level.stars = [{ x: 3, y: 1 }];
    // Walls stop the sliding ball on the star row
    level.tiles[1][0] = "wall";
    level.tiles[1][11] = "wall";

    const result = solveLevel(level);

    expect(result.solvable).toBe(true);
    expect(result.moves).toBe(1);
    expect(result.commands).toHaveLength(1);
  });

  it("replays the solver solution of world-1-level-02 through the runner", () => {
    const level2 = world1.find((level) => level.id === "world-1-level-02");
    expect(level2).toBeDefined();

    const result = solveLevel(level2!);
    expect(result.solvable).toBe(true);

    // The solver's own command list must be a valid human replay: applying
    // it through the LevelRunner completes the level.
    const runner = new LevelRunner(level2!);
    let state = runner.getState();
    for (const command of result.commands) {
      state =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
    }

    expect(state.completed).toBe(true);
    expect(state.moves).toBe(
      result.commands.filter((command) => command.type === "move").length,
    );
    expect(result.moves).toBe(result.commands.length);
    expect(result.moves).toBeGreaterThan(0);
  });

  it("falls back to the full model when a door is required", () => {
    const level = world4[0];
    expect(level).toBeDefined();

    const result = solveLevel(level!);

    expect(result.solvable).toBe(true);
    const runner = new LevelRunner(level!);
    let state = runner.getState();
    for (const command of result.commands) {
      state =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
    }

    expect(state.completed).toBe(true);
    expect(state.moves).toBe(
      result.commands.filter((command) => command.type === "move").length,
    );
    expect(result.moves).toBe(result.commands.length);
  });

  it("reports an already complete level", () => {
    const level = createEmptyLevel("solver-complete");
    level.stars = [];

    expect(solveLevel(level)).toMatchObject({
      solvable: true,
      moves: 0,
      commands: [],
    });
  });

  it("honors an explicit maximum depth", () => {
    const level = createEmptyLevel("solver-depth");
    level.ball = { x: 1, y: 1 };
    level.square = { x: 5, y: 5 };
    level.stars = [{ x: 3, y: 1 }];
    level.tiles[1][0] = "wall";
    level.tiles[1][11] = "wall";

    const result = solveLevel(level, { maxDepth: 0 });

    expect(result.solvable).toBe(false);
  });

  it("never treats falling off the board as part of a solution path", () => {
    // A single open row: collecting the star requires sliding past the edge,
    // which is game over — the solver must terminate as unsolvable instead
    // of drifting the fallen form ever further outside the board.
    const level: Level = {
      id: "solver-open",
      width: 3,
      height: 1,
      tiles: [["empty", "empty", "empty"]],
      ball: { x: 1, y: 0 },
      square: { x: 2, y: 0 },
      stars: [{ x: 0, y: 0 }],
    };

    const result = solveLevel(level);
    expect(result.solvable).toBe(false);
    expect(result.exploredStates).toBeLessThan(50);
  });
});
