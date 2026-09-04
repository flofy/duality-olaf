import { describe, expect, it } from 'vitest';
import { LevelRunner } from './LevelRunner';
import { solveLevel } from './LevelSolver';
import type { Level, Position } from '@duality/level-format';

function makeLevel(options: { ball?: Position; square?: Position; stars?: Position[]; innerWalls?: Position[] } = {}): Level {
  const width = 13; const height = 10;
  const tiles: Level['tiles'] = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => x === 0 || y === 0 || x === width - 1 || y === height - 1 ? ('wall' as const) : ('empty' as const)));
  for (const w of options.innerWalls ?? []) tiles[w.y][w.x] = 'wall';
  return { id: 'test', width, height, tiles, ball: options.ball ?? { x: 2, y: 2 }, square: options.square ?? { x: 4, y: 6 }, stars: options.stars ?? [{ x: 11, y: 8 }] };
}
const RIGHT = { x: 1 as const, y: 0 as const }; const LEFT = { x: -1 as const, y: 0 as const }; const UP = { x: 0 as const, y: -1 as const };
function press(runner: LevelRunner, dir: { x: -1 | 0 | 1; y: -1 | 0 | 1 }): void { runner.move(dir); }

describe('LevelRunner: cell-centred line/column sliding', () => {
  it('counts one move per press, not one per cell swept', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 }, square: { x: 2, y: 6 }, stars: [{ x: 11, y: 8 }] })); press(runner, RIGHT); expect(runner.getState().ball.x).toBe(11); expect(runner.getState().moves).toBe(1); });
  it('does not move on empty input', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); const before = runner.getState().ball; press(runner, { x: 0, y: 0 }); const after = runner.getState().ball; expect(after.x).toBe(before.x); expect(after.y).toBe(before.y); expect(runner.getState().moves).toBe(0); });
  it('is NOT born stuck against the border wall (can slide right)', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); press(runner, RIGHT); expect(runner.getState().ball.x).toBeGreaterThan(2); });
  it('always keeps the active form on integer cells (centres)', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); press(runner, RIGHT); press(runner, RIGHT); press(runner, UP); const ball = runner.getState().ball; expect(Number.isInteger(ball.x)).toBe(true); expect(Number.isInteger(ball.y)).toBe(true); });
  it('slides right and stops at the last free cell before the right border', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); press(runner, RIGHT); expect(runner.getState().ball).toEqual({ x: 11, y: 2 }); });
  it('stops at the last free cell before an inner wall', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 }, innerWalls: [{ x: 6, y: 2 }] })); press(runner, RIGHT); expect(runner.getState().ball.x).toBe(5); });
  it('does not move again when already pressed against a wall', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); press(runner, RIGHT); const movesBefore = runner.getState().moves; press(runner, RIGHT); expect(runner.getState().moves).toBe(movesBefore); });
  it('slides the ball back left after a flush', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 } })); press(runner, RIGHT); press(runner, LEFT); expect(runner.getState().ball).toEqual({ x: 1, y: 2 }); });
  it('slides the square along its own column', () => { const runner = new LevelRunner(makeLevel({ square: { x: 4, y: 6 } })); runner.switchForm(); press(runner, UP); expect(runner.getState().square).toEqual({ x: 4, y: 1 }); });
  it('stops at the last free cell before the other form', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 4 }, square: { x: 6, y: 4 } })); press(runner, RIGHT); expect(runner.getState().ball.x).toBe(5); });
  it('treats the other form as a deliberate blocking obstacle', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 4 }, square: { x: 5, y: 4 }, stars: [{ x: 10, y: 4 }] })); press(runner, RIGHT); expect(runner.getState().ball).toEqual({ x: 4, y: 4 }); });
  it('allows a temporary block to be cleared by switching forms', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 4 }, square: { x: 5, y: 4 }, stars: [{ x: 10, y: 4 }] })); press(runner, RIGHT); runner.switchForm(); press(runner, RIGHT); expect(runner.getState().square.x).toBe(11); });
  it('detects a permanently blocked level through the solver', () => { const level = makeLevel({ ball: { x: 1, y: 4 }, square: { x: 3, y: 4 }, stars: [{ x: 4, y: 4 }], innerWalls: [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 2, y: 4 }, { x: 5, y: 4 }] }); const result = solveLevel(level); expect(result.solvable).toBe(false); expect(result.moves).toBeNull(); });
  it('marks the level completed once the ball has collected every star', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 3, y: 2 }, stars: [{ x: 5, y: 2 }] })); press(runner, RIGHT); expect(runner.getState().completed).toBe(true); });
  it('collects every star swept along a single press', () => { const runner = new LevelRunner(makeLevel({ ball: { x: 2, y: 2 }, stars: [{ x: 3, y: 2 }, { x: 5, y: 2 }] })); press(runner, RIGHT); expect(runner.getState().stars).toHaveLength(0); });
});