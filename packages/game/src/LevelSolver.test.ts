import { describe, expect, it } from "vitest";
import {
  createEmptyLevel,
  type Level,
  world1,
  world4,
} from "@duality/level-format";
import { LevelRunner } from "./LevelRunner";
import { solveLevel } from "./LevelSolver";

const COMMANDS = [
  { type: "move" as const, direction: { x: 1 as const, y: 0 as const } },
  { type: "move" as const, direction: { x: -1 as const, y: 0 as const } },
  { type: "move" as const, direction: { x: 0 as const, y: 1 as const } },
  { type: "move" as const, direction: { x: 0 as const, y: -1 as const } },
  { type: "switch" as const },
];

function stateKey(state: ReturnType<LevelRunner["getState"]>): string {
  return [
    state.activeForm,
    state.ball.x,
    state.ball.y,
    state.square.x,
    state.square.y,
    state.stars.map((star) => `${star.x},${star.y}`).join(";"),
  ].join("|");
}

function referenceBfs(level: Level): number | null {
  const initial = new LevelRunner(level).getState();
  if (initial.completed) return 0;

  const queue = [{ state: initial, depth: 0 }];
  const visited = new Set([stateKey(initial)]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const { state, depth } = queue[cursor]!;
    for (const command of COMMANDS) {
      const runner = LevelRunner.fromState(state);
      const after =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
      if (after.gameOver) continue;
      if (after.completed) return depth + 1;

      const key = stateKey(after);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ state: after, depth: depth + 1 });
    }
  }

  return null;
}

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

  it("collects a star swept before the final stop", () => {
    const level: Level = {
      id: "solver-swept-star",
      width: 5,
      height: 1,
      tiles: [["wall", "empty", "empty", "empty", "wall"]],
      ball: { x: 1, y: 0 },
      square: { x: 3, y: 0 },
      stars: [{ x: 2, y: 0 }],
    };

    const result = solveLevel(level);

    expect(result.solvable).toBe(true);
    expect(result.moves).toBe(1);
    expect(result.commands).toEqual([
      { type: "move", direction: { x: 1, y: 0 } },
    ]);
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

  it("keeps A* optimal on small reference levels", () => {
    const levels: Level[] = [];

    const direct = createEmptyLevel("solver-reference-direct");
    direct.ball = { x: 1, y: 1 };
    direct.square = { x: 5, y: 5 };
    direct.stars = [{ x: 3, y: 1 }];
    direct.tiles[1][0] = "wall";
    direct.tiles[1][11] = "wall";
    levels.push(direct);

    const swept = {
      id: "solver-reference-swept",
      width: 5,
      height: 1,
      tiles: [["wall", "empty", "empty", "empty", "wall"]] as Level["tiles"],
      ball: { x: 1, y: 0 },
      square: { x: 3, y: 0 },
      stars: [{ x: 2, y: 0 }],
    };
    levels.push(swept);

    for (const level of levels) {
      const expected = referenceBfs(level);
      const result = solveLevel(level);
      expect(result.solvable).toBe(expected !== null);
      expect(result.moves).toBe(expected);
    }
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
