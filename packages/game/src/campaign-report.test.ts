import { describe, expect, it } from 'vitest';
import { campaign } from '@duality/level-format/campaign';
import { formatCampaignReport, validateCampaign } from './LevelValidator';

describe('World 1 campaign validation', () => {
  it('reports every current level', () => {
    const validation = validateCampaign(campaign);
    const report = formatCampaignReport(validation);

    expect(validation.levels).toHaveLength(11);
    expect(report).toContain('CAMPAIGN VALIDATION');
    expect(report).toContain('Solvable:');

    for (const level of campaign) {
      expect(report).toContain(level.id);
    }
  });
});
