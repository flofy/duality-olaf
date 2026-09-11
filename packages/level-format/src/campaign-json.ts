import world1Data from "../levels/world-01.json";
import world2Data from "../levels/world-02.json";
import world3Data from "../levels/world-03.json";
import world4Data from "../levels/world-04.json";
import world5Data from "../levels/world-05.json";
import type { Level } from "./index";
import { puzzleMechanics, worldDesign, type WorldDefinition } from "./campaign";
import { validateLevel } from "./validator";

const world1 = world1Data.levels as Level[];
const world2 = world2Data as Level[];
const world3 = world3Data as Level[];
const world4 = world4Data as Level[];
const world5 = world5Data as Level[];

for (const level of [...world1, ...world2, ...world3, ...world4, ...world5]) {
  validateLevel(level);
}

export { puzzleMechanics, worldDesign };
export { world1, world2, world3, world4, world5 };
export type { WorldDefinition };

export const worlds: readonly WorldDefinition[] = [
  {
    id: 1,
    name: "Découverte",
    subtitle: "Les bases du mouvement",
    status: "available",
    levels: [
      world1[2],
      world1[5],
      world1[0],
      world1[1],
      world1[8],
      world1[7],
      world1[6],
      world1[4],
      world1[9],
      world1[3],
      world1[10],
    ],
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
