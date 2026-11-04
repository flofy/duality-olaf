import type { Level } from "./index";
import { validateLevel } from "./validator";

export type SeasonalTheme = "halloween" | "christmas";

export type SeasonalEvent = {
  id: string;
  theme: SeasonalTheme;
  label: string;
  start: { month: number; day: number };
  end: { month: number; day: number };
  levels: readonly Level[];
};

const seasonalModules = import.meta.glob<Level>("../levels/seasonal/*.json", {
  eager: true,
});
const challengeModules = import.meta.glob<Level>(
  "../levels/challenges/*.json",
  { eager: true },
);

function loadSeasonalTheme(theme: SeasonalTheme): Level[] {
  const prefix = `seasonal-${theme}-`;
  const levels = Object.entries(seasonalModules)
    .filter(([, level]) => level.id.startsWith(prefix))
    .sort(([, a], [, b]) => a.id.localeCompare(b.id))
    .map(([, level]) => level);

  if (levels.length === 0) {
    throw new Error(`No seasonal levels found for theme '${theme}'`);
  }

  levels.forEach((level, index) => {
    validateLevel(level);
    const expected = `${prefix}${String(index + 1).padStart(2, "0")}`;
    if (level.id !== expected) {
      throw new Error(
        `${level.id}: id must match its file position (expected ${expected}) — ` +
          "rename the file/id so id order equals play order",
      );
    }
  });
  return levels;
}

export const halloween: SeasonalEvent = {
  id: "seasonal-halloween",
  theme: "halloween",
  label: "Halloween",
  start: { month: 10, day: 13 },
  end: { month: 11, day: 3 },
};

export const christmas: SeasonalEvent = {
  id: "seasonal-christmas",
  theme: "christmas",
  label: "Hiver",
  start: { month: 12, day: 1 },
  end: { month: 3, day: 20 },
  levels: loadSeasonalTheme("christmas"),
};
halloween.levels = loadSeasonalTheme("halloween");

export const seasonalEvents: readonly SeasonalEvent[] = [halloween, christmas];

export const challengeLevels: readonly Level[] = Object.entries(challengeModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, level]) => {
    validateLevel(level);
    return level;
  });

function dayOfYear(date: Date): number {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  return (
    Math.floor(
      (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
        yearStart) /
        86_400_000,
    ) + 1
  );
}
function calendarDay(month: number, day: number, year: number): number {
  return dayOfYear(new Date(Date.UTC(year, month - 1, day)));
}
export function isSeasonalEventAvailable(
  event: SeasonalEvent,
  date = new Date(),
): boolean {
  const year = date.getUTCFullYear();
  const start = calendarDay(event.start.month, event.start.day, year);
  const endYear = event.end.month < event.start.month ? year + 1 : year;
  const end = calendarDay(event.end.month, event.end.day, endYear);
  const current = dayOfYear(date);
  if (endYear === year) return current >= start && current <= end;
  if (current >= start) return true;
  return current <= calendarDay(event.end.month, event.end.day, year);
}
