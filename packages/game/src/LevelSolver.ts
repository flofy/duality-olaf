import type { Direction, GameState } from './LevelRunner';
import { LevelRunner } from './LevelRunner';
import type { Level } from '@duality/level-format';

export type SolverCommand =
  | { type: 'move'; direction: Direction }
  | { type: 'switch' };

export type SolverResult =
  | { solvable: true; moves: number; commands: SolverCommand[]; exploredStates: number }
  | { solvable: false; moves: null; commands: []; exploredStates: number };

const DIRECTIONS: Direction[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

type Node = {
  state: GameState;
  commands: SolverCommand[];
};

function stateKey(state: GameState): string {
  const stars = state.stars
    .map((star) => `${star.x},${star.y}`)
    .sort()
    .join(';');

  return [
    state.activeForm,
    `${state.ball.x},${state.ball.y}`,
    `${state.square.x},${state.square.y}`,
    stars,
  ].join('|');
}

function changed(before: GameState, after: GameState): boolean {
  return stateKey(before) !== stateKey(after);
}

/**
 * Breadth-first solver for the current deterministic LevelRunner rules.
 * Commands are expanded uniformly, so the first solution found has the
 * minimum number of player commands.
 */
export function solveLevel(level: Level): SolverResult {
  const initialRunner = new LevelRunner(level);
  const initial = initialRunner.getState();

  if (initial.completed) {
    return { solvable: true, moves: 0, commands: [], exploredStates: 1 };
  }

  const queue: Node[] = [{ state: initial, commands: [] }];
  const visited = new Set<string>([stateKey(initial)]);
  let exploredStates = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    exploredStates += 1;

    const candidates: SolverCommand[] = [
      ...DIRECTIONS.map((direction) => ({ type: 'move' as const, direction })),
      { type: 'switch' },
    ];

    for (const command of candidates) {
      const runner = new LevelRunner(level);
      replay(runner, node.commands);

      const before = runner.getState();
      const after =
        command.type === 'move'
          ? runner.move(command.direction)
          : runner.switchForm();

      if (!changed(before, after)) continue;

      const commands = [...node.commands, command];

      if (after.completed) {
        return {
          solvable: true,
          moves: commands.filter((item) => item.type === 'move').length,
          commands,
          exploredStates,
        };
      }

      const key = stateKey(after);
      if (visited.has(key)) continue;

      visited.add(key);
      queue.push({ state: after, commands });
    }
  }

  return { solvable: false, moves: null, commands: [], exploredStates };
}

export function replay(runner: LevelRunner, commands: SolverCommand[]): GameState {
  let state = runner.getState();

  for (const command of commands) {
    state =
      command.type === 'move'
        ? runner.move(command.direction)
        : runner.switchForm();
  }

  return state;
}
