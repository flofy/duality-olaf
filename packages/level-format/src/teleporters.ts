import type { Level, Position } from './index';

const p = (x: number, y: number): Position => ({ x, y });
const WIDTH = 13;
const HEIGHT = 10;

function tutorial(id: string, ball: Position, square: Position, stars: Position[], teleporters: NonNullable<Level['teleporters']>, walls: Position[] = []): Level {
  const tiles = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' as const : 'empty' as const,
    ),
  );
  for (const wall of walls) tiles[wall.y]![wall.x] = 'wall';
  return { id, width: WIDTH, height: HEIGHT, tiles, ball, square, stars, teleporters };
}

export const teleporterTutorials: readonly Level[] = [
  tutorial(
    'tutorial-teleporter-01', p(2, 4), p(10, 7), [p(10, 8)],
    [{ id: 'a', position: p(5, 4), targetId: 'b' }, { id: 'b', position: p(9, 8), targetId: 'a' }],
    [p(6, 4)],
  ),
  tutorial(
    'tutorial-teleporter-02', p(2, 8), p(10, 2), [p(10, 8)],
    [{ id: 'a', position: p(2, 5), targetId: 'b' }, { id: 'b', position: p(10, 7), targetId: 'a' }],
    [p(2, 4)],
  ),
  tutorial(
    'tutorial-teleporter-03', p(2, 4), p(10, 7), [p(10, 2), p(10, 8)],
    [{ id: 'a', position: p(4, 4), targetId: 'b' }, { id: 'b', position: p(8, 2), targetId: 'a' }],
    [p(5, 4), p(6, 4), p(7, 4), p(8, 4)],
  ),
];
