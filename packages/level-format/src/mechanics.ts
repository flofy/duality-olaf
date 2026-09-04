import type { Level, Position } from './index';

const p = (x: number, y: number): Position => ({ x, y });
const WIDTH = 13;
const HEIGHT = 10;

function tutorial(id: string, ball: Position, square: Position, stars: Position[], doors: NonNullable<Level['doors']>, switches: NonNullable<Level['switches']>): Level {
  const tiles = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' as const : 'empty' as const,
    ),
  );
  return { id, width: WIDTH, height: HEIGHT, tiles, ball, square, stars, doors, switches };
}

/** Small isolated levels used to teach the mechanic before it enters campaign content. */
export const doorSwitchTutorials: readonly Level[] = [
  tutorial(
    'tutorial-door-switch-01',
    p(2, 4), p(10, 7), [p(10, 4)],
    [{ id: 'door-a', position: p(6, 4) }],
    [{ id: 'switch-a', position: p(4, 4), form: 'ball', toggles: ['door-a'] }],
  ),
  tutorial(
    'tutorial-door-switch-02',
    p(2, 7), p(10, 2), [p(10, 7)],
    [{ id: 'door-a', position: p(6, 7) }],
    [{ id: 'switch-a', position: p(4, 7), form: 'square', toggles: ['door-a'] }],
  ),
];
