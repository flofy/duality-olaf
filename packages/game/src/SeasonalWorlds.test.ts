import { describe, expect, it } from "vitest";
import {
  christmas,
  halloween,
  isSeasonalEventAvailable,
  validateLevel as validateLevelStructure,
  type Level,
} from "@duality/level-format";
import { estimateDifficulty, validateLevel } from "./LevelValidator";
import { LevelRunner, type Direction, type GameState } from "./LevelRunner";

const seasonalEvents = [halloween, christmas];
const seasonalLevels = seasonalEvents.flatMap((event) => event.levels);

/**
 * The mask levels (bat/tree shapes) hold ~40 stars, far beyond the exact
 * solver: tracking every star subset explodes the search space. A greedy
 * planner proves completability instead: repeatedly find the shortest engine
 * trajectory (positions + form only) that collects at least one star.
 */
type PlannerAction =
  | { type: "move"; direction: Direction }
  | { type: "switch" };

type PlannerNode = {
  parent: PlannerNode | null;
  action: PlannerAction | null;
  state: GameState;
};

const DIRECTIONS: readonly Direction[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function jointKey(state: GameState): string {
  return [
    state.activeForm,
    `${state.ball.x},${state.ball.y}`,
    `${state.square.x},${state.square.y}`,
  ].join("|");
}

function collectNextStar(
  start: GameState,
): { actions: PlannerAction[]; state: GameState } | null {
  const root: PlannerNode = { parent: null, action: null, state: start };
  const nodes: PlannerNode[] = [root];
  const visited = new Set([jointKey(start)]);
  let cursor = 0;

  while (cursor < nodes.length) {
    const node = nodes[cursor]!;
    cursor += 1;
    const candidates: PlannerAction[] = [
      ...DIRECTIONS.map((direction) => ({ type: "move" as const, direction })),
      { type: "switch" as const },
    ];

    for (const action of candidates) {
      const runner = LevelRunner.fromState(node.state);
      const before = runner.getState();
      const after =
        action.type === "move"
          ? runner.move(action.direction)
          : runner.switchForm();
      if (jointKey(before) === jointKey(after)) continue;
      const key = jointKey(after);
      if (visited.has(key)) continue;
      visited.add(key);
      const child: PlannerNode = { parent: node, action, state: after };
      nodes.push(child);
      if (after.stars.length < before.stars.length) {
        const actions: PlannerAction[] = [];
        let step: PlannerNode | null = child;
        while (step?.action) {
          actions.push(step.action);
          step = step.parent;
        }
        actions.reverse();
        return { actions, state: after };
      }
    }
  }

  return null;
}

function planFullCollection(level: Level): PlannerAction[] {
  const actions: PlannerAction[] = [];
  let state = new LevelRunner(level).getState();

  while (state.stars.length > 0) {
    const segment = collectNextStar(state);
    if (!segment) {
      throw new Error(
        `${level.id}: ${state.stars.length} star(s) unreachable by the ball`,
      );
    }
    actions.push(...segment.actions);
    state = segment.state;
  }

  return actions;
}

function replay(level: Level, actions: readonly PlannerAction[]): GameState {
  const runner = new LevelRunner(level);
  let state = runner.getState();
  for (const action of actions) {
    state =
      action.type === "move"
        ? runner.move(action.direction)
        : runner.switchForm();
  }
  return state;
}

describe("seasonal worlds", () => {
  it("exposes stable event and level identifiers", () => {
    expect(halloween.id).toBe("seasonal-halloween");
    expect(christmas.id).toBe("seasonal-christmas");
    expect(new Set(halloween.levels.map((level) => level.id)).size).toBe(
      halloween.levels.length,
    );
    expect(new Set(christmas.levels.map((level) => level.id)).size).toBe(
      christmas.levels.length,
    );
  });

  it.each(seasonalLevels)("$id is structurally valid", (level) => {
    expect(() => validateLevelStructure(level)).not.toThrow();
  });

  it.each(seasonalLevels)("$id is completable on the grid", (level) => {
    const actions = planFullCollection(level);
    expect(actions.length).toBeGreaterThan(0);

    const state = replay(level, actions);
    expect(state.completed).toBe(true);
    expect(state.gameOver).toBe(false);
  });

  // Small seasonal levels stay within reach of the exact solver.
  const solverLevels = seasonalLevels.filter(
    (level) => level.stars.length <= 8,
  );

  it.each(solverLevels)("$id stays solver-valid", (level) => {
    const validation = validateLevel(level);
    expect(validation.result.solvable).toBe(true);
    expect(estimateDifficulty(validation.result)).not.toBeNull();
  });

  it("supports recurring cross-year Christmas availability", () => {
    expect(
      isSeasonalEventAvailable(christmas, new Date("2026-12-24T12:00:00Z")),
    ).toBe(true);
    expect(
      isSeasonalEventAvailable(christmas, new Date("2027-01-05T12:00:00Z")),
    ).toBe(true);
    expect(
      isSeasonalEventAvailable(christmas, new Date("2027-02-01T12:00:00Z")),
    ).toBe(false);
  });

  it("keeps Halloween outside its event window", () => {
    expect(
      isSeasonalEventAvailable(halloween, new Date("2026-10-19T12:00:00Z")),
    ).toBe(false);
    expect(
      isSeasonalEventAvailable(halloween, new Date("2026-10-31T12:00:00Z")),
    ).toBe(true);
    expect(
      isSeasonalEventAvailable(halloween, new Date("2026-11-04T12:00:00Z")),
    ).toBe(false);
  });
});
