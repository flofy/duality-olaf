import type { Level, Position } from '@duality/level-format';

export type GeneratorOptions = {
  seed: number;
  width: number;
  height: number;
  wallDensity: number;
  stars: number;
};

export type GeneratedLevel = Level & {
  seed: number;
};

class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = (seed | 0) || 1;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x | 0;
    return (x >>> 0) / 4294967296;
  }

  int(max: number): number {
    return Math.floor(this.next() * max);
  }
}

function emptyTiles(width: number, height: number): Level['tiles'] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => 'empty' as const));
}

function same(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function randomFreePosition(rng: Rng, width: number, height: number, occupied: Position[]): Position {
  for (let attempt = 0; attempt < width * height * 2; attempt += 1) {
    const position = { x: rng.int(width), y: rng.int(height) };
    if (!occupied.some((item) => same(item, position))) return position;
  }
  throw new Error('Unable to place generated object');
}

/** Generate one deterministic candidate. Validation/solvability is intentionally done by the caller. */
export function generateLevel(options: GeneratorOptions): GeneratedLevel {
  const rng = new Rng(options.seed);
  const tiles = emptyTiles(options.width, options.height);
  const occupied: Position[] = [];
  const ball = randomFreePosition(rng, options.width, options.height, occupied);
  occupied.push(ball);
  const square = randomFreePosition(rng, options.width, options.height, occupied);
  occupied.push(square);

  const wallCount = Math.round(options.width * options.height * options.wallDensity);
  for (let i = 0; i < wallCount; i += 1) {
    const position = randomFreePosition(rng, options.width, options.height, [...occupied]);
    if (same(position, ball) || same(position, square)) continue;
    tiles[position.y][position.x] = 'wall';
    occupied.push(position);
  }

  const stars: Position[] = [];
  for (let i = 0; i < options.stars; i += 1) {
    const position = randomFreePosition(rng, options.width, options.height, [...occupied, ...stars]);
    stars.push(position);
  }

  return {
    id: `generated-${options.seed}`,
    seed: options.seed,
    width: options.width,
    height: options.height,
    tiles,
    ball,
    square,
    stars,
  };
}

export function generateCandidates(options: GeneratorOptions, count = 8): GeneratedLevel[] {
  const candidates: GeneratedLevel[] = [];
  const seen = new Set<string>();
  let seed = options.seed | 0;
  let attempts = 0;

  while (candidates.length < count && attempts < count * 80) {
    const level = generateLevel({ ...options, seed });
    const signature = JSON.stringify([level.tiles, level.ball, level.square, level.stars]);
    if (!seen.has(signature)) {
      seen.add(signature);
      candidates.push(level);
    }
    seed = (seed + 0x6d2b79f5) | 0;
    attempts += 1;
  }

  return candidates;
}
