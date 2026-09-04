import { describe, expect, it } from 'vitest';
import { generateChallenge } from './ChallengeGenerator';
import { solveLevel } from './LevelSolver';

describe('generateChallenge', () => {
  it('is deterministic for the same seed', () => {
    const first = generateChallenge(20260904);
    const second = generateChallenge(20260904);
    expect(second).toEqual(first);
  });

  it('returns only solver-validated challenges', () => {
    const challenge = generateChallenge(42);
    const result = solveLevel(challenge.level);
    expect(result.solvable).toBe(true);
    expect(result.moves).toBe(challenge.moves);
    expect(challenge.level.stars.length).toBeGreaterThan(0);
  });

  it('keeps the canonical board dimensions by default', () => {
    const challenge = generateChallenge(7);
    expect(challenge.level.width).toBe(13);
    expect(challenge.level.height).toBe(10);
  });
});
