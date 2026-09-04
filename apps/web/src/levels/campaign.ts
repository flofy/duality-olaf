import { campaign as canonicalCampaign, worlds as canonicalWorlds, world3Refined } from '@duality/level-format';
import type { Level, WorldDefinition } from '@duality/level-format';

export const worlds: readonly WorldDefinition[] = canonicalWorlds.map((world) =>
  world.id === 3 ? { ...world, levels: world3Refined } : world,
);
export const campaign: Level[] = worlds.flatMap((world) => world.levels);

// Keep these values derived from the actual campaign instead of assuming a fixed layout.
export const worldCount = worlds.length;
export const levelsPerWorld = Math.max(...worlds.map((world) => world.levels.length));
export const totalLevelCount = campaign.length;

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
