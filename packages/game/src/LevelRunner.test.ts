import { describe, expect, it } from 'vitest';
import { LevelRunner } from './LevelRunner';
import type { Level, Position } from '@duality/level-format';

/**
 * Builds a level that mirrors the real campaign geometry (13x10 with a solid
 * border wall) so the tests cover the situation that broke in practice.
 */
function makeLevel(options: {
  ball?: Position;
  square?: Position;
  stars?: Position[];
  innerWalls?: Position[];
} = {}): Level {
  const width = 13;
  const height = 10;
  const tiles: Level['tiles'] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || y === 0 || x === width - 1 || y === height - 1 ? ('wall' as const) : ('empty' as const),
    ),
  );
  for (const w of options.innerWalls ?? []) tiles[w.y][w.x] = 'wall';
  return {
    id: 'test',
    width,
    height,
    tiles,
    ball: options.ball ?? { x: 2, y: 2 },
    square: options.square ?? { x: 4, y: 6 },
    stars: options.stars ?? [{ x: 11, y: 8 }],
  };
}

const RIGHT = { x: 1 as const, y: 0 as const };
const LEFT = { x: -1 as const, y: 0 as const };
const UP = { x: 0 as const, y: -1 as const };
const DOWN = { x: 0 as const, y: 1 as const };

/** A single directional "press": slides to the first collision along the axis. */
function press(runner: LevelRunner, dir: { x: -1 | 0 | 1; y: -1 | 0 | 1 }): void {
  runner.move(dir);
}

describe('LevelRunner: cell-centred line/column sliding', () => {
  it('does not move on empty input', () => {
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    const before = runner.getState().ball;
    press(runner, { x: 0, y: 0 });
    const after = runner.getState().ball;
    expect(after.x).toBe(before.x);
    expect(after.y).toBe(before.y);
    expect(runner.getState().moves).toBe(0);
  });

  it('is NOT born stuck against the border wall (can slide right)', () => {
    // The ball is not born already colliding: a single press slides it right.
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    press(runner, RIGHT);
    const state = runner.getState();
    expect(state.ball.x).toBeGreaterThan(2); // moved rightwards
    expect(state.ball.y).toBe(2);
  });

  it('always keeps the active form on integer cells (centres)', () => {
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    press(runner, RIGHT);
    press(runner, RIGHT);
    press(runner, UP);
    const ball = runner.getState().ball;
    expect(Number.isInteger(ball.x)).toBe(true);
    expect(Number.isInteger(ball.y)).toBe(true);
  });

  it('slides right and stops at the last free cell before the right border', () => {
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    press(runner, RIGHT);
    const ball = runner.getState().ball;
    // Right border wall column is 12, so the ball settles on cell 11.
    expect(ball.x).toBe(11);
    expect(ball.y).toBe(2);
  });

  it('stops at the last free cell before an inner wall on a single press', () => {
    const runner = new LevelRunner(
      makeLevel({ ball: { x: 2, y: 2 }, innerWalls: [{ x: 6, y: 2 }] }),
    );
    press(runner, RIGHT);
    const ball = runner.getState().ball;
    expect(ball.x).toBe(5); // wall at 6 stops the slide
    expect(ball.y).toBe(2);
  });

  it('does not move again (nor count moves) when already pressed against a wall', () => {
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    press(runner, RIGHT);
    const settled = runner.getState();
    const movesBefore = settled.moves;
    press(runner, RIGHT); // same direction, already against the wall
    const after = runner.getState();
    expect(after.ball.x).toBe(settled.ball.x);
    expect(after.moves).toBe(movesBefore);
  });

  it('slides the ball back left after a flush (movement not lost, stays on cells)', () => {
    const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } }));
    press(runner, RIGHT);
    const flushRight = runner.getState().ball.x;
    press(runner, LEFT);
    const ball = runner.getState().ball;
    // Left border wall column is 0, so the ball settles on cell 1.
    expect(flushRight).toBe(11);
    expect(ball.x).toBe(1);
    expect(ball.y).toBe(2);
  });

  it('slides the square along its own column, staying on cells', () => {
    const runner = new LevelRunner(makeLevel({ square: { x: 4, y: 6 } }));
    runner.switchForm(); // activate the square
    press(runner, UP);
    const square = runner.getState().square;
    // Top border wall row is 0, so the square settles on row 1.
    expect(square.y).toBe(1);
    expect(square.x).toBe(4);
  });

  it('stops at the last free cell before the other form', () => {
    const runner = new LevelRunner(
      makeLevel({ ball: { x: 2, y: 4 }, square: { x: 6, y: 4 } }),
    );
    press(runner, RIGHT);
    const state = runner.getState();
    expect(state.ball.x).toBe(5); // square occupies 6, ball stops at 5
    expect(state.ball.x).toBeLessThan(state.square.x);
  });

  it('marks the level completed once the ball has collected every star', () => {
    const runner = new LevelRunner(
      makeLevel({ ball: { x: 3, y: 2 }, stars: [{ x: 5, y: 2 }] }),
    );
    expect(runner.getState().completed).toBe(false);
    press(runner, RIGHT);
    expect(runner.getState().completed).toBe(true);
    expect(runner.getState().stars).toHaveLength(0);
  });

  it('collects every star swept along a single press', () => {
    const runner = new LevelRunner(
      makeLevel({ ball: { x: 2, y: 2 }, stars: [{ x: 3, y: 2 }, { x: 5, y: 2 }] }),
    );
    press(runner, RIGHT); // slides through cells 3..11
    const state = runner.getState();
    expect(state.stars).toHaveLength(0);
    expect(state.completed).toBe(true);
  });
});