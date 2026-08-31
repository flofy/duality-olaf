import { describe, expect, it } from 'vitest';
import { createEmptyLevel } from '@duality/level-format';
import { solveLevel } from './LevelSolver';

describe('solveLevel', () => {
  it('solves a level by collecting a star', () => {
    const level = createEmptyLevel('solver-simple');
    level.ball = { x: 1, y: 1 };
    level.square = { x: 5, y: 5 };
    level.stars = [{ x: 3, y: 1 }];

    const result = solveLevel(level);

    expect(result.solvable).toBe(true);
    expect(result.moves).toBe(1);
    expect(result.commands).toHaveLength(1);
  });

  it('reports an already complete level', () => {
    const level = createEmptyLevel('solver-complete');
    level.stars = [];

    expect(solveLevel(level)).toMatchObject({
      solvable: true,
      moves: 0,
      commands: [],
    });
  });
});
