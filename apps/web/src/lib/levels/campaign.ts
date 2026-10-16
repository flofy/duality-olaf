import { worlds as canonicalWorlds } from "@duality/level-format";
import type { Level, WorldDefinition } from "@duality/level-format";

/**
 * The web app plays the exact same campaign the CI validates: every world comes
 * straight from the JSON files in `@duality/level-format/levels`. No local
 * override, so a level can never drift between the tests and the game.
 */
export const worlds: readonly WorldDefinition[] = canonicalWorlds;
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
