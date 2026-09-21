import {
  worlds as canonicalWorlds,
  world3Refined,
} from "@duality/level-format";
import type { Level, WorldDefinition } from "@duality/level-format";

export const worlds: readonly WorldDefinition[] = canonicalWorlds.map(
  (world) => (world.id === 3 ? { ...world, levels: world3Refined } : world),
);
export const campaign: Level[] = worlds.flatMap((world) => world.levels);
const worldCount = worlds.length;
const levelsPerWorld = Math.max(...worlds.map((world) => world.levels.length));
const totalLevelCount = campaign.length;

function getWorldStartIndex(worldId: number): number {
  return worlds
    .filter((world) => world.id < worldId)
    .reduce((total, world) => total + world.levels.length, 0);
}
function getCampaignLevelIndex(worldId: number, levelIndex: number): number {
  return getWorldStartIndex(worldId) + levelIndex;
}
export function levelLabel(index: number): string {
  return `Niveau ${String(index + 1).padStart(2, "0")}`;
}
