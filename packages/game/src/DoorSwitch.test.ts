import { describe, expect, it } from 'vitest';
import { doorSwitchTutorials } from '@duality/level-format';
import { LevelRunner } from './LevelRunner';
import { solveLevel } from './LevelSolver';

describe('door and switch mechanics', () => {
  it('starts doors closed unless explicitly opened', () => {
    const runner = new LevelRunner(doorSwitchTutorials[0]!);
    expect(runner.getState().doors['door-a']).toBe(false);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().ball.x).toBe(5);
  });

  it('lets the configured form toggle a door', () => {
    const runner = new LevelRunner(doorSwitchTutorials[0]!);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().doors['door-a']).toBe(true);
  });

  it('does not let the wrong form activate a form-specific switch', () => {
    const runner = new LevelRunner(doorSwitchTutorials[1]!);
    runner.move({ x: 1, y: 0 });
    expect(runner.getState().doors['door-a']).toBe(false);
  });

  it('includes door state in solver exploration', () => {
    for (const level of doorSwitchTutorials) {
      expect(solveLevel(level).solvable).toBe(true);
    }
  });
});
