import { campaign as canonicalCampaign, worlds as canonicalWorlds } from '@duality/level-format';
import type { Level, WorldDefinition } from '@duality/level-format';

export const campaign: Level[] = canonicalCampaign;
export const worlds: readonly WorldDefinition[] = canonicalWorlds;

export const worldCount = worlds.length;
export const levelsPerWorld = 11;
export const totalLevelCount = worldCount * levelsPerWorld;

export function getWorldStartIndex(worldId: number): number {
  return worlds
    .filter((world) => world.id < worldId)
    .reduce((total, world) => total + world.levels.length, 0);
}

export function getCampaignLevelIndex(worldId: number, levelIndex: number): number {
  return getWorldStartIndex(worldId) + levelIndex;
}

export function levelLabel(index: number): string {
  return `Niveau ${String(index + 1).padStart(2, '0')}`;
}
