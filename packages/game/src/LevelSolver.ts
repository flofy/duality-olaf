import type { Direction, GameState } from './LevelRunner';
import { LevelRunner } from './LevelRunner';
import type { Level } from '@duality/level-format';

export type SolverCommand =
  | { type: 'move'; direction: Direction }
  | { type: 'switch' };

export type SolverResult =
  | { solvable: true; moves: number; commands: SolverCommand[]; exploredStates: number }
  | { solvable: false; moves: null; commands: []; exploredStates: number };

const DIRECTIONS: readonly Direction[] = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
];

type SearchNode = { state: GameState; parent: number | null; command: SolverCommand | null; depth: number };

function stateKey(state: GameState): string {
  const stars = state.stars.map((star) => `${star.x},${star.y}`).sort().join(';');
  const doors = Object.entries(state.doors).sort(([a], [b]) => a.localeCompare(b)).map(([id, open]) => `${id}:${open ? 1 : 0}`).join(';');
  return [state.activeForm, `${state.ball.x},${state.ball.y}`, `${state.square.x},${state.square.y}`, stars, doors].join('|');
}

function changed(before: GameState, after: GameState): boolean {
  return stateKey(before) !== stateKey(after);
}

function reconstruct(nodes: readonly SearchNode[], index: number): SolverCommand[] {
  const commands: SolverCommand[] = [];
  let cursor: number | null = index;
  while (cursor !== null) {
    const node = nodes[cursor]!;
    if (node.command) commands.push(node.command);
    cursor = node.parent;
  }
  return commands.reverse();
}

export function solveLevel(level: Level): SolverResult {
  const initial = new LevelRunner(level).getState();
  if (initial.completed) return { solvable: true, moves: 0, commands: [], exploredStates: 1 };

  const nodes: SearchNode[] = [{ state: initial, parent: null, command: null, depth: 0 }];
  const visited = new Set<string>([stateKey(initial)]);
  let cursor = 0;
  let exploredStates = 0;
  const candidates: readonly SolverCommand[] = [
    ...DIRECTIONS.map((direction) => ({ type: 'move' as const, direction })),
    { type: 'switch' as const },
  ];

  while (cursor < nodes.length) {
    const nodeIndex = cursor++;
    const node = nodes[nodeIndex]!;
    exploredStates += 1;
    for (const command of candidates) {
      const runner = LevelRunner.fromState(node.state);
      const before = runner.getState();
      const after = command.type === 'move' ? runner.move(command.direction) : runner.switchForm();
      if (!changed(before, after)) continue;
      const key = stateKey(after);
      if (visited.has(key)) continue;
      const childIndex = nodes.length;
      nodes.push({ state: after, parent: nodeIndex, command, depth: node.depth + 1 });
      visited.add(key);
      if (after.completed) {
        const commands = reconstruct(nodes, childIndex);
        return { solvable: true, moves: commands.length, commands, exploredStates };
      }
    }
  }

  return { solvable: false, moves: null, commands: [], exploredStates };
}

export function replay(runner: LevelRunner, commands: readonly SolverCommand[]): GameState {
  let state = runner.getState();
  for (const command of commands) state = command.type === 'move' ? runner.move(command.direction) : runner.switchForm();
  return state;
}
