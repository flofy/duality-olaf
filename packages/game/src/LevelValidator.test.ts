import { describe, expect, it } from 'vitest';
import { createEmptyLevel } from '@duality/level-format';
import { formatCampaignReport, validateCampaign } from './LevelValidator';

describe('campaign validation', () => {
  it('summarizes solvable levels', () => {
    const level = createEmptyLevel('report-01');
    level.ball = { x: 1, y: 1 };
    level.square = { x: 5, y: 5 };
    level.stars = [{ x: 3, y: 1 }];

    const validation = validateCampaign([level]);

    expect(validation.solvable).toBe(1);
    expect(validation.unsolvable).toBe(0);
    expect(formatCampaignReport(validation)).toContain('report-01');
    expect(formatCampaignReport(validation)).toContain('1 moves');
  });
});
