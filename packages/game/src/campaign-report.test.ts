import { describe, expect, it } from 'vitest';
import { campaign } from '../../level-format/src/campaign';
import { formatCampaignReport, validateCampaign } from './LevelValidator';

describe('World 1 campaign validation', () => {
  it('reports every current level', () => {
    const validation = validateCampaign(campaign);
    const report = formatCampaignReport(validation);

    console.info(`\n${report}\n`);

    expect(validation.levels).toHaveLength(campaign.length);
    expect(campaign).toHaveLength(55);
    expect(report).toContain('CAMPAIGN VALIDATION');
    expect(report).toContain('Solvable:');

    for (const level of campaign) {
      expect(report).toContain(level.id);
    }
  });
});
