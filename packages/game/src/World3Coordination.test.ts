import { describe, expect, it } from 'vitest';
import { solveLevel } from './LevelSolver';
import { world3Refined } from '@duality/level-format/world3-refined';

describe('World 3 — Coordination', () => {
  it('contains eleven distinct solver-valid levels', () => {
    expect(world3Refined).toHaveLength(11);
    expect(new Set(world3Refined.map((level) => level.id)).size).toBe(11);
    for (const level of world3Refined) expect(solveLevel(level).solvable).toBe(true);
  });

  it('keeps the campaign difficulty moving upward overall', () => {
    const moves = world3Refined.map((level) => solveLevel(level).moves);
    expect(moves[0]).toBeLessThanOrEqual(moves[moves.length - 1]!);
    expect(Math.max(...moves.slice(0, 5))).toBeLessThanOrEqual(Math.max(...moves.slice(6))!);
  });
});
