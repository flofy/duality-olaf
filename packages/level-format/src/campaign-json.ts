import type { Level } from "./index";
import { puzzleMechanics, worldDesign, type WorldDefinition } from "./campaign";
import { validateLevel } from "./validator";

/**
 * One JSON file per level, grouped by world directory. New levels can be
 * added by dropping a file in the matching folder — no code change required.
 * Files are prefixed with a zero-padded index so lexicographic order matches
 * the intended play order.
 */
const modulesPerWorld = [
  import.meta.glob<Level>("../levels/world-01/*.json", { eager: true }),
  import.meta.glob<Level>("../levels/world-02/*.json", { eager: true }),
  import.meta.glob<Level>("../levels/world-03/*.json", { eager: true }),
  import.meta.glob<Level>("../levels/world-04/*.json", { eager: true }),
  import.meta.glob<Level>("../levels/world-05/*.json", { eager: true }),
];

function loadWorld(
  modules: Record<string, Level>,
  worldNumber: number,
): Level[] {
  const levels = Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, level]) => level);

  if (levels.length === 0) {
    throw new Error("World level directory is empty");
  }

  const worldPrefix = `world-${worldNumber}-level-`;
  levels.forEach((level, index) => {
    validateLevel(level);
    const expected = `${worldPrefix}${String(index + 1).padStart(2, "0")}`;
    if (level.id !== expected) {
      throw new Error(
        `${level.id}: id must match its file position (expected ${expected}) — ` +
          "rename the file/id so id order equals play order",
      );
    }
  });

  return levels;
}

const world1 = loadWorld(modulesPerWorld[0]!, 1);
const world2 = loadWorld(modulesPerWorld[1]!, 2);
const world3 = loadWorld(modulesPerWorld[2]!, 3);
const world4 = loadWorld(modulesPerWorld[3]!, 4);
const world5 = loadWorld(modulesPerWorld[4]!, 5);

export { puzzleMechanics, worldDesign };
export { world1, world2, world3, world4, world5 };
export type { WorldDefinition };

export const worlds: readonly WorldDefinition[] = [
  {
    id: 1,
    name: "Découverte",
    subtitle: "Les bases du mouvement",
    status: "available",
    levels: world1,
  },
  {
    id: 2,
    name: "Positionnement",
    subtitle: "Préparer le terrain",
    status: "available",
    levels: world2,
  },
  {
    id: 3,
    name: "Coordination",
    subtitle: "Faire coopérer les formes",
    status: "available",
    levels: world3,
  },
  {
    id: 4,
    name: "Combinaisons",
    subtitle: "Plusieurs étapes à prévoir",
    status: "available",
    levels: world4,
  },
  {
    id: 5,
    name: "Maîtrise",
    subtitle: "Le défi final",
    status: "available",
    levels: world5,
  },
];

export const campaign = worlds.flatMap((world) => world.levels);

export function getWorld(world: number): WorldDefinition | undefined {
  return worlds.find((entry) => entry.id === world);
}

export function getLevel(world: number, number: number): Level | undefined {
  return getWorld(world)?.levels[number - 1];
}
