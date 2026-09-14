import { cloneLevel, type Level } from "@duality/level-format";
import type { Direction, GameState } from "./LevelRunner";
import { LevelRunner } from "./LevelRunner";

export type SolverCommand =
  | { type: "move"; direction: Direction }
  | { type: "switch" };

export type SolverResult =
  | {
      solvable: true;
      moves: number;
      commands: SolverCommand[];
      exploredStates: number;
    }
  | { solvable: false; moves: null; commands: []; exploredStates: number };

const DIRECTIONS: readonly Direction[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

type SearchNode = {
  state: GameState;
  parent: number | null;
  command: SolverCommand | null;
  depth: number;
};

function stateKey(state: GameState): string {
  const stars = state.stars
    .map((star) => `${star.x},${star.y}`)
    .sort()
    .join(";");
  const doors = Object.entries(state.doors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, open]) => `${id}:${open ? 1 : 0}`)
    .join(";");
  return [
    state.activeForm,
    `${state.ball.x},${state.ball.y}`,
    `${state.square.x},${state.square.y}`,
    stars,
    doors,
  ].join("|");
}

function reconstruct(
  nodes: readonly SearchNode[],
  index: number,
): SolverCommand[] {
  const commands: SolverCommand[] = [];
  let cursor: number | null = index;
  while (cursor !== null) {
    const node: SearchNode = nodes[cursor]!;
    if (node.command) commands.push(node.command);
    cursor = node.parent;
  }
  return commands.reverse();
}

function solveBfs(
  level: Level,
  options?: { maxDepth?: number },
): SolverResult {
  const maxDepth = options?.maxDepth ?? Number.POSITIVE_INFINITY;
  const initial = new LevelRunner(level).getState();
  if (initial.completed)
    return { solvable: true, moves: 0, commands: [], exploredStates: 1 };

  const nodes: SearchNode[] = [
    { state: initial, parent: null, command: null, depth: 0 },
  ];
  const visited = new Set<string>([stateKey(initial)]);
  let cursor = 0;
  let exploredStates = 0;
  const candidates: readonly SolverCommand[] = [
    ...DIRECTIONS.map((direction) => ({ type: "move" as const, direction })),
    { type: "switch" as const },
  ];

  while (cursor < nodes.length) {
    const nodeIndex = cursor++;
    const node: SearchNode = nodes[nodeIndex]!;
    exploredStates += 1;
    if (node.depth >= maxDepth) continue;

    for (const command of candidates) {
      const runner = LevelRunner.fromState(node.state);
      const after =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
      // Falling off the level is terminal: never part of a solution path.
      if (after.gameOver) continue;
      const key = stateKey(after);
      if (visited.has(key)) continue;

      const childIndex = nodes.length;
      nodes.push({
        state: after,
        parent: nodeIndex,
        command,
        depth: node.depth + 1,
      });
      visited.add(key);

      if (after.completed) {
        const commands = reconstruct(nodes, childIndex);
        return {
          solvable: true,
          moves: commands.length,
          commands,
          exploredStates,
        };
      }
    }
  }

  return { solvable: false, moves: null, commands: [], exploredStates };
}

function withoutAdvancedMechanics(level: Level): Level {
  const simplified = cloneLevel(level);
  simplified.doors = undefined;
  simplified.switches = undefined;
  simplified.teleporters = undefined;
  return simplified;
}

function replayOnLevel(
  level: Level,
  commands: readonly SolverCommand[],
): GameState {
  return replay(new LevelRunner(level), commands);
}

export function solveLevel(
  level: Level,
  options?: { maxDepth?: number },
): SolverResult {
  const hasAdvancedMechanics =
    (level.doors?.length ?? 0) > 0 || (level.teleporters?.length ?? 0) > 0;

  if (!hasAdvancedMechanics) return solveBfs(level, options);

  // First solve the geometric puzzle without advanced mechanics. This is a
  // much smaller search space for levels whose doors/teleporters are present
  // but are not actually required by the solution.
  const simpleResult = solveBfs(withoutAdvancedMechanics(level), options);
  if (!simpleResult.solvable) return solveBfs(level, options);

  // The simplified solution is only a candidate: mechanics can invalidate it
  // or provide a shorter route. Replay it against the real level first.
  if (replayOnLevel(level, simpleResult.commands).completed) {
    // Keep shortest-path semantics. The candidate gives us an upper bound, so
    // the full search only needs to look for a strictly shorter solution.
    const betterResult = solveBfs(level, {
      maxDepth: simpleResult.moves - 1,
    });
    if (betterResult.solvable) {
      return {
        ...betterResult,
        exploredStates:
          simpleResult.exploredStates + betterResult.exploredStates,
      };
    }

    return {
      ...simpleResult,
      exploredStates: simpleResult.exploredStates + betterResult.exploredStates,
    };
  }

  // The simplified path crossed a door or used a teleporter implicitly, so it
  // is not a valid solution for the real level. Fall back to the full model.
  return solveBfs(level, options);
}

export function replay(
  runner: LevelRunner,
  commands: readonly SolverCommand[],
): GameState {
  let state = runner.getState();
  for (const command of commands)
    state =
      command.type === "move"
        ? runner.move(command.direction)
        : runner.switchForm();
  return state;
}
