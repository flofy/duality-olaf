import type { Level, Tile } from '@duality/level-format';

const WIDTH = 13;
const HEIGHT = 10;

function makeLevel(id: string, ball: [number, number], square: [number, number], stars: Array<[number, number]>, walls: Array<[number, number]> = []): Level {
  const tiles: Tile[][] = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' : 'empty',
    ),
  );
  for (const [x, y] of walls) tiles[y][x] = 'wall';
  return {
    id,
    width: WIDTH,
    height: HEIGHT,
    tiles,
    ball: { x: ball[0], y: ball[1] },
    square: { x: square[0], y: square[1] },
    stars: stars.map(([x, y]) => ({ x, y })),
  };
}

export const campaign: Level[] = [
  makeLevel('world-1-01', [1, 1], [3, 1], [[10, 1], [10, 8]]),
  makeLevel('world-1-02', [1, 8], [2, 8], [[11, 1], [6, 4]], [[4, 2], [4, 3], [4, 4], [8, 5], [8, 6], [8, 7]]),
  makeLevel('world-1-03', [1, 1], [2, 2], [[11, 1], [11, 8], [1, 8]], [[3, 3], [4, 3], [5, 3], [7, 6], [8, 6], [9, 6]]),
  makeLevel('world-1-04', [11, 8], [9, 8], [[1, 1], [6, 2], [6, 7]], [[3, 2], [3, 3], [3, 4], [9, 5], [9, 6], [9, 7]]),
  makeLevel('world-1-05', [1, 1], [11, 8], [[11, 1], [1, 8], [6, 5]], [[5, 2], [6, 2], [7, 2], [5, 7], [6, 7], [7, 7]]),
  makeLevel('world-1-06', [1, 4], [11, 4], [[3, 1], [6, 8], [10, 1]], [[2, 3], [3, 3], [4, 3], [8, 6], [9, 6], [10, 6]]),
  makeLevel('world-1-07', [2, 8], [2, 1], [[10, 8], [10, 1], [6, 5]], [[4, 2], [5, 2], [6, 2], [6, 7], [7, 7], [8, 7]]),
  makeLevel('world-1-08', [1, 1], [1, 8], [[11, 1], [11, 8], [6, 4], [6, 6]], [[3, 4], [4, 4], [5, 4], [7, 5], [8, 5], [9, 5]]),
  makeLevel('world-1-09', [11, 8], [11, 1], [[1, 8], [1, 1], [6, 2], [6, 7]], [[2, 2], [2, 3], [2, 4], [10, 5], [10, 6], [10, 7]]),
  makeLevel('world-1-10', [1, 1], [3, 8], [[11, 1], [11, 8], [6, 3], [6, 6]], [[4, 3], [5, 3], [7, 3], [8, 3], [4, 6], [5, 6], [7, 6], [8, 6]]),
  makeLevel('world-1-11', [1, 8], [11, 1], [[1, 1], [11, 8], [6, 4], [6, 7]], [[3, 2], [3, 3], [3, 6], [3, 7], [9, 2], [9, 3], [9, 6], [9, 7]]),
];

export const worldCount = 5;
export const levelsPerWorld = 11;
export const totalLevelCount = worldCount * levelsPerWorld;

export function levelLabel(index: number): string {
  return `Niveau ${String(index + 1).padStart(2, '0')}`;
}
