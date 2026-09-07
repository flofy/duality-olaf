import { describe, expect, it } from 'vitest';
import { teleporterTutorials } from '@duality/level-format';
import { LevelRunner } from './LevelRunner';
import { solveLevel } from './LevelSolver';

describe('teleporters', () => {
  it('teleports the active form when it lands on an entry', () => {
    const runner = new LevelRunner(teleporterTutorials[0]!);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball).toEqual({ x: 9, y: 8 });
  });

  it('collects a star at the teleporter exit', () => {
    const runner = new LevelRunner(teleporterTutorials[0]!);
    runner.move({ x: 1, y: 0 });
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().completed).toBe(true);
  });

  it('does not teleport into the other form', () => {
    const runner = new LevelRunner({ ...teleporterTutorials[0]!, square: { x: 9, y: 8 } });
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball).toEqual({ x: 5, y: 4 });
  });

  it('keeps all tutorial levels solver-valid', () => {
    for (const level of teleporterTutorials) expect(solveLevel(level).solvable).toBe(true);
  });
});
