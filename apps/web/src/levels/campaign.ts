import { campaign as canonicalCampaign } from '@duality/level-format';
import type { Level } from '@duality/level-format';

export const campaign: Level[] = canonicalCampaign;

export const worldCount = 5;
export const levelsPerWorld = 11;
export const totalLevelCount = worldCount * levelsPerWorld;

export function levelLabel(index: number): string {
  return `Niveau ${String(index + 1).padStart(2, '0')}`;
}
