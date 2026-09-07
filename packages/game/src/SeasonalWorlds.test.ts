import { describe, expect, it } from 'vitest';
import { christmas, halloween, isSeasonalEventAvailable } from '@duality/level-format';
import { solveLevel } from './LevelSolver';

describe('seasonal worlds', () => {
  it('exposes stable event and level identifiers', () => {
    expect(halloween.id).toBe('seasonal-halloween');
    expect(christmas.id).toBe('seasonal-christmas');
    expect(new Set(halloween.levels.map((level) => level.id)).size).toBe(halloween.levels.length);
    expect(new Set(christmas.levels.map((level) => level.id)).size).toBe(christmas.levels.length);
  });

  it('keeps every seasonal tutorial level solver-valid', () => {
    for (const event of [halloween, christmas]) {
      for (const level of event.levels) expect(solveLevel(level).solvable).toBe(true);
    }
  });

  it('supports recurring cross-year Christmas availability', () => {
    expect(isSeasonalEventAvailable(christmas, new Date('2026-12-24T12:00:00Z'))).toBe(true);
    expect(isSeasonalEventAvailable(christmas, new Date('2027-01-05T12:00:00Z'))).toBe(true);
    expect(isSeasonalEventAvailable(christmas, new Date('2027-02-01T12:00:00Z'))).toBe(false);
  });

  it('keeps Halloween outside its event window', () => {
    expect(isSeasonalEventAvailable(halloween, new Date('2026-10-19T12:00:00Z'))).toBe(false);
    expect(isSeasonalEventAvailable(halloween, new Date('2026-10-31T12:00:00Z'))).toBe(true);
    expect(isSeasonalEventAvailable(halloween, new Date('2026-11-04T12:00:00Z'))).toBe(false);
  });
});
