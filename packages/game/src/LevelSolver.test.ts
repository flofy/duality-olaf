import { describe, expect, it } from 'vitest';
import { createEmptyLevel, world1 } from '@duality/level-format';
import { LevelRunner } from './LevelRunner';
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

  it('replays the human Level 6 solution and the solver finds it', () => {
    const level6 = world1.find((level) => level.id === 'world-1-level-06');
    expect(level6).toBeDefined();
    const commands = [
      { type: 'move' as const, direction: { x: 0, y: -1 } },
      { type: 'move' as const, direction: { x: 1, y: 0 } },
      { type: 'move' as const, direction: { x: -1, y: 0 } },
      { type: 'move' as const, direction: { x: 0, y: 1 } },
      { type: 'move' as const, direction: { x: 1, y: 0 } },
    ];

    const runner = new LevelRunner(level6!);
    let state = runner.getState();
    for (const command of commands) state = runner.move(command.direction);

    expect(state.completed).toBe(true);

    const result = solveLevel(level6!);
    expect(result.solvable).toBe(true);
    expect(result.moves).toBe(5);
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
