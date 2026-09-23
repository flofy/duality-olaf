import type { WorldDefinition } from "@duality/level-format";
import { worlds } from "./levels/campaign";

const STORAGE_KEY = "duality.progress.v2";

export type LevelResult = {
  moves: number;
  optimalMoves: number;
  elapsedMs: number;
  score: number;
  stars: 1 | 2 | 3;
};

type Progress = {
  completed: string[];
  results: Record<string, LevelResult>;
};

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return {
        completed: Array.isArray(parsed.completed)
          ? parsed.completed.filter(
              (id): id is string => typeof id === "string",
            )
          : [],
        results:
          parsed.results && typeof parsed.results === "object"
            ? (parsed.results as Record<string, LevelResult>)
            : {},
      };
    }

    // Migrate the previous completion-only save without losing progress.
    const legacy = localStorage.getItem("duality.progress.v1");
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<{ completed: unknown }>;
      const completed = Array.isArray(parsed.completed)
        ? parsed.completed.filter((id): id is string => typeof id === "string")
        : [];
      return { completed, results: {} };
    }
  } catch {
    // Fall through to a clean save state.
  }

  return { completed: [], results: {} };
}

function writeProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLevelCompleted(levelId: string): boolean {
  return readProgress().completed.includes(levelId);
}

export function getLevelResult(levelId: string): LevelResult | null {
  return readProgress().results[levelId] ?? null;
}

export function calculateLevelResult(
  moves: number,
  optimalMoves: number,
  elapsedMs: number,
): LevelResult {
  const safeMoves = Math.max(0, moves);
  const safeOptimal = Math.max(0, optimalMoves);
  const safeElapsed = Math.max(0, elapsedMs);

  const efficiency =
    safeMoves === 0
      ? 1
      : Math.min(1, safeOptimal / Math.max(safeOptimal, safeMoves));

  // The time component rewards a brisk solve without making speed more
  // important than puzzle efficiency. The baseline is 2.5s per optimal move.
  const targetTimeMs = Math.max(5000, safeOptimal * 2500);
  const timeFactor =
    safeElapsed === 0 ? 1 : Math.min(1, targetTimeMs / safeElapsed);

  const score = Math.round((efficiency * 0.8 + timeFactor * 0.2) * 1000);
  const stars: 1 | 2 | 3 = score >= 900 ? 3 : score >= 700 ? 2 : 1;

  return {
    moves: safeMoves,
    optimalMoves: safeOptimal,
    elapsedMs: safeElapsed,
    score,
    stars,
  };
}

export function completeLevel(
  levelId: string,
  result?: Omit<LevelResult, "score" | "stars">,
): LevelResult | null {
  const progress = readProgress();

  if (result) {
    const nextResult = calculateLevelResult(
      result.moves,
      result.optimalMoves,
      result.elapsedMs,
    );
    const previous = progress.results[levelId];

    // Keep the player's best result. Stars are the primary progression metric,
    // then score, then time/moves as tie-breakers.
    const isBetter =
      !previous ||
      nextResult.stars > previous.stars ||
      (nextResult.stars === previous.stars &&
        (nextResult.score > previous.score ||
          (nextResult.score === previous.score &&
            nextResult.elapsedMs < previous.elapsedMs)));

    if (isBetter) progress.results[levelId] = nextResult;
  }

  if (!progress.completed.includes(levelId)) {
    progress.completed.push(levelId);
  }

  writeProgress(progress);
  return progress.results[levelId] ?? null;
}


export function getCompletedCount(): number {
  return readProgress().completed.length;
}

export function getCompletedStars(): number {
  return Object.values(readProgress().results).reduce(
    (total, result) => total + result.stars,
    0,
  );
}

export function getTotalStars(): number {
  return worlds.reduce((total, world) => total + world.levels.length * 3, 0);
}

export function getCampaignProgress(): {
  completed: number;
  total: number;
  stars: number;
  totalStars: number;
  percentage: number;
} {
  const completed = getCompletedCount();
  const total = worlds.reduce((count, world) => count + world.levels.length, 0);
  const stars = getCompletedStars();
  const totalStars = getTotalStars();

  return {
    completed,
    total,
    stars,
    totalStars,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
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
