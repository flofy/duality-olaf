import type { Level, Position } from './index';

const p = (x: number, y: number): Position => ({ x, y });
const WIDTH = 13;
const HEIGHT = 10;

function makeLevel(number: number, ball: Position, square: Position, stars: Position[], walls: Position[] = []): Level {
  const tiles = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' as const : 'empty' as const,
    ),
  );
  for (const wall of walls) tiles[wall.y]![wall.x] = 'wall';
  return { id: `world-3-level-${String(number).padStart(2, '0')}`, width: WIDTH, height: HEIGHT, tiles, ball, square, stars };
}

/**
 * World 3 — Coordination.
 *
 * Each level introduces a different use of the other form as a movable obstacle:
 * mutual stops, false shortcuts, relay positions, shared corridors and finally
 * long asymmetric sequences. Layouts are intentionally not copies of Worlds 1/2.
 */
export const world3Refined: readonly Level[] = [
  // 01 — mutual stopping point
  makeLevel(1, p(4, 7), p(10, 1), [p(11, 4)], [p(6, 5), p(7, 5), p(8, 5), p(9, 5)]),
  // 02 — ball as obstacle / false shortcut
  makeLevel(2, p(11, 4), p(9, 6), [p(1, 4), p(3, 3)], [p(7, 3), p(7, 4), p(8, 6), p(8, 7), p(8, 8)]),
  // 03 — switch of responsibility through a vertical relay
  makeLevel(3, p(8, 1), p(6, 4), [p(3, 8), p(7, 5)], [p(5, 2), p(5, 3), p(5, 4), p(5, 5), p(6, 2), p(6, 3)]),
  // 04 — central interaction
  makeLevel(4, p(4, 7), p(10, 1), [p(11, 2), p(5, 1), p(5, 8)], [p(6, 5), p(6, 6), p(6, 7), p(7, 3), p(8, 3), p(9, 3), p(10, 3)]),
  // 05 — multi-step preparation
  makeLevel(5, p(11, 1), p(6, 8), [p(11, 5), p(1, 5), p(4, 6)], [p(4, 2), p(5, 2), p(6, 2), p(7, 3), p(8, 3), p(8, 6), p(8, 7), p(8, 8)]),
  // 06 — relay positioning
  makeLevel(6, p(3, 2), p(10, 4), [p(11, 7), p(5, 5), p(4, 4)], [p(4, 2), p(5, 2), p(6, 2), p(7, 6), p(7, 7), p(8, 5), p(8, 6), p(8, 7), p(8, 8)]),
  // 07 — shared corridor
  makeLevel(7, p(6, 4), p(5, 3), [p(8, 1), p(1, 6), p(2, 5), p(11, 4)], [p(4, 2), p(4, 3), p(4, 4), p(4, 5), p(6, 3), p(7, 3), p(8, 3), p(8, 4), p(8, 5), p(8, 6), p(8, 7), p(9, 2), p(10, 2), p(11, 2)]),
  // 08 — asymmetric double relay
  makeLevel(8, p(7, 6), p(11, 3), [p(2, 6), p(11, 8), p(6, 4), p(5, 6)], [p(5, 3), p(5, 4), p(8, 4), p(8, 7), p(8, 8), p(9, 2), p(9, 4), p(10, 2), p(10, 4), p(11, 2), p(11, 4)]),
  // 09 — prepare, switch, return
  makeLevel(9, p(5, 3), p(4, 6), [p(5, 4), p(11, 7), p(8, 2), p(6, 3)], [p(3, 5), p(3, 6), p(3, 7), p(4, 2), p(5, 2), p(6, 2), p(7, 2), p(7, 5), p(7, 6), p(7, 7)]),
  // 10 — multi-objective asymmetric route
  makeLevel(10, p(10, 1), p(5, 1), [p(4, 1), p(8, 3), p(11, 6), p(3, 2), p(10, 5)], [p(3, 4), p(4, 4), p(5, 4), p(5, 7), p(5, 8), p(6, 4), p(6, 5), p(6, 6), p(6, 7), p(6, 8), p(8, 2), p(9, 2), p(9, 6), p(9, 7), p(9, 8), p(10, 2)]),
  // 11 — finale: dense coordination and recovery planning
  makeLevel(11, p(5, 2), p(10, 3), [p(7, 3), p(5, 5), p(3, 1), p(3, 5), p(10, 5)], [p(2, 2), p(3, 2), p(5, 6), p(5, 7), p(6, 4), p(6, 7), p(6, 8), p(7, 4), p(8, 4), p(9, 4), p(10, 4), p(11, 4)]),
];
