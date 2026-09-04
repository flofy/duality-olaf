import type { Level, Position } from '@duality/level-format';
import { solveLevel } from './LevelSolver';

export type Challenge = {
  seed: number;
  level: Level;
  moves: number;
  exploredStates: number;
  score: number;
};

export type ChallengeGeneratorOptions = {
  width?: number;
  height?: number;
  stars?: number;
  wallCount?: number;
  maxAttempts?: number;
};

const DEFAULTS: Required<ChallengeGeneratorOptions> = {
  width: 13,
  height: 10,
  stars: 3,
  wallCount: 8,
  maxAttempts: 64,
};

function nextRandom(state: { value: number }): number {
  state.value |= 0;
  state.value = (state.value + 0x6d2b79f5) | 0;
  let t = Math.imul(state.value ^ (state.value >>> 15), 1 | state.value);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick<T>(items: readonly T[], state: { value: number }): T {
  return items[Math.floor(nextRandom(state) * items.length)]!;
}

function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function createCandidate(seed: number, options: Required<ChallengeGeneratorOptions>, attempt: number): Level {
  const random = { value: (seed ^ Math.imul(attempt + 1, 0x45d9f3b)) | 0 };
  const cells: Position[] = [];
  for (let y = 1; y < options.height - 1; y += 1) {
    for (let x = 1; x < options.width - 1; x += 1) cells.push({ x, y });
  }

  const ball = pick(cells, random);
  const remaining = cells.filter((cell) => positionKey(cell) !== positionKey(ball));
  const square = pick(remaining, random);
  const occupied = new Set([positionKey(ball), positionKey(square)]);
  const walls: Position[] = [];

  for (let i = 0; i < options.wallCount; i += 1) {
    const candidates = remaining.filter((cell) => !occupied.has(positionKey(cell)) && !walls.some((wall) => positionKey(wall) === positionKey(cell)));
    if (candidates.length === 0) break;
    const wall = pick(candidates, random);
    walls.push(wall);
    occupied.add(positionKey(wall));
  }

  const starCells = cells.filter((cell) => !occupied.has(positionKey(cell)));
  const stars: Position[] = [];
  for (let i = 0; i < Math.min(options.stars, starCells.length); i += 1) {
    const candidates = starCells.filter((cell) => !stars.some((star) => positionKey(star) === positionKey(cell)));
    if (candidates.length === 0) break;
    stars.push(pick(candidates, random));
  }

  const tiles: Level['tiles'] = Array.from({ length: options.height }, (_, y) =>
    Array.from({ length: options.width }, (_, x) =>
      x === 0 || y === 0 || x === options.width - 1 || y === options.height - 1 ? 'wall' as const : 'empty' as const,
    ),
  );
  for (const wall of walls) tiles[wall.y]![wall.x] = 'wall';

  return {
    id: `challenge-${seed}-${attempt}`,
    width: options.width,
    height: options.height,
    tiles,
    ball,
    square,
    stars,
  };
}

/**
 * Generate a deterministic challenge and publish only the first solver-validated
 * candidate. Impossible candidates are discarded before they become visible.
 */
export function generateChallenge(seed: number, overrides: ChallengeGeneratorOptions = {}): Challenge {
  const options = { ...DEFAULTS, ...overrides };
  if (options.stars < 1) throw new Error('Challenge must contain at least one star');

  for (let attempt = 0; attempt < options.maxAttempts; attempt += 1) {
    const level = createCandidate(seed, options, attempt);
    const result = solveLevel(level);
    if (!result.solvable) continue;

    const exploration = Math.round(Math.log2(Math.max(1, result.exploredStates)));
    return {
      seed,
      level,
      moves: result.moves,
      exploredStates: result.exploredStates,
      score: result.moves * 10 + exploration,
    };
  }

  throw new Error(`Unable to generate a solvable challenge for seed ${seed}`);
}
