import { describe, expect, it } from 'vitest';
import { world2 } from '@duality/level-format';
import { validateCampaign } from './LevelValidator';

describe('World 2 campaign validation', () => {
  it('validates every Positionnement puzzle', () => {
    const validation = validateCampaign(world2);

    console.info(
      validation.levels
        .map((entry) => `${entry.id} ${entry.result.solvable ? '✓' : '✗'} ${entry.difficulty?.moves ?? '-'} moves`)
        .join('\n'),
    );

    expect(validation.levels).toHaveLength(11);
    expect(validation.unsolvable).toBe(0);
  });
});
