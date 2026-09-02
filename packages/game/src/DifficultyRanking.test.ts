import { describe, expect, it } from 'vitest';
import { campaign } from '@duality/level-format';
import { rankCampaign, validateCampaign } from './LevelValidator';

describe('campaign difficulty ranking', () => {
  it('ranks every solvable level from easier to harder', () => {
    const validation = validateCampaign(campaign);
    const ranked = rankCampaign(validation);

    expect(ranked).toHaveLength(campaign.length);
    expect(ranked.every((entry) => entry.result.solvable)).toBe(true);

    for (let index = 1; index < ranked.length; index += 1) {
      expect(ranked[index - 1].difficulty!.score)
        .toBeLessThanOrEqual(ranked[index].difficulty!.score);
    }
  });
});
