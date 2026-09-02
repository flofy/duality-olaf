import { describe, expect, it } from 'vitest';
import { world1 } from '../../level-format/src/campaign';
import { validateCampaign } from './LevelValidator';

describe('World 1 progression', () => {
  it('keeps every level solvable and starts with the easiest validated puzzles', () => {
    const validation = validateCampaign(world1);

    expect(validation.solvable).toBe(world1.length);
    expect(validation.levels.slice(0, 3).map((entry) => entry.result.solvable)).toEqual([true, true, true]);

    const moves = validation.levels.map((entry) => entry.difficulty?.moves ?? Infinity);
    expect(moves[0]).toBeLessThanOrEqual(moves[1]);
    expect(moves[1]).toBeLessThanOrEqual(moves[2]);
  });
});
