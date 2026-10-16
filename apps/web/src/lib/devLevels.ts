import type { Level } from "@duality/level-format";
import {
  challengeLevels,
  doorSwitchTutorials,
  seasonalEvents,
  teleporterTutorials,
} from "@duality/level-format";
import { campaign, worlds } from "./levels/campaign";

type CatalogueEntry = { id: string; label: string; level: Level };
type CatalogueGroup = { label: string; entries: CatalogueEntry[] };

const allDevLevels: readonly Level[] = [
  ...campaign,
  ...doorSwitchTutorials,
  ...teleporterTutorials,
  ...seasonalEvents.flatMap((event) => event.levels),
  ...challengeLevels,
];

export const devLevelById: ReadonlyMap<string, Level> = new Map(
  allDevLevels.map((level) => [level.id, level]),
);

export function levelDisplayLabel(level: Level): string {
  for (const world of worlds) {
    const index = world.levels.findIndex((l) => l.id === level.id);
    if (index >= 0)
      return `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, "0")}`;
  }
  return level.id;
}

export function buildCatalogueGroups(): CatalogueGroup[] {
  const groups: CatalogueGroup[] = [];

  for (const world of worlds) {
    groups.push({
      label: `World ${world.id}`,
      entries: world.levels.map((level, index) => ({
        id: level.id,
        label: `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, "0")} · ${level.id}`,
        level,
      })),
    });
  }

  const plain = (levels: readonly Level[]): CatalogueEntry[] =>
    levels.map((level) => ({ id: level.id, label: level.id, level }));

  groups.push({ label: "Doors & switches", entries: plain(doorSwitchTutorials) });
  groups.push({ label: "Teleporters", entries: plain(teleporterTutorials) });
  groups.push({ label: "Défis & bonus", entries: plain(challengeLevels) });
  for (const event of seasonalEvents) {
    groups.push({ label: event.label, entries: plain(event.levels) });
  }

  return groups;
}
