import type { WorldDefinition } from "@duality/level-format";
import { worlds } from "./levels/campaign";

const STORAGE_KEY = "duality.progress.v1";

type Progress = {
  completed: string[];
};

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Array.isArray(parsed.completed)
        ? parsed.completed.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { completed: [] };
  }
}

function writeProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLevelCompleted(levelId: string): boolean {
  return readProgress().completed.includes(levelId);
}

export function completeLevel(levelId: string): void {
  const progress = readProgress();
  if (!progress.completed.includes(levelId)) {
    progress.completed.push(levelId);
    writeProgress(progress);
  }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCompletedCount(): number {
  return readProgress().completed.length;
}

/** Un monde est terminé quand tous ses niveaux sont validés. */
export function isWorldCompleted(worldId: number): boolean {
  const world = worlds.find((item) => item.id === worldId);
  if (!world || world.levels.length === 0) return false;
  return world.levels.every((level) => isLevelCompleted(level.id));
}

/** Les mondes s'enchaînent : le suivant s'ouvre quand le précédent est fini. */
export function isWorldUnlocked(worldId: number): boolean {
  const index = worlds.findIndex((item) => item.id === worldId);
  if (index < 0) return false;
  if (index === 0) return true;
  const previous = worlds[index - 1] as WorldDefinition;
  return isWorldCompleted(previous.id);
}

/** Monde qui suit `worldId` dans la campagne, `null` pour le dernier. */
export function getNextWorld(worldId: number): WorldDefinition | null {
  const index = worlds.findIndex((item) => item.id === worldId);
  if (index < 0) return null;
  return worlds[index + 1] ?? null;
}
