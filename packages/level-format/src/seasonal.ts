import type { Level, Position } from './index';

export type SeasonalTheme = 'halloween' | 'christmas';

export type SeasonalEvent = {
  id: string;
  theme: SeasonalTheme;
  label: string;
  start: { month: number; day: number };
  end: { month: number; day: number };
  levels: readonly Level[];
};

const p = (x: number, y: number): Position => ({ x, y });
const WIDTH = 13;
const HEIGHT = 10;

function makeLevel(id: string, ball: Position, square: Position, stars: Position[], walls: Position[] = []): Level {
  const tiles = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' as const : 'empty' as const,
    ),
  );
  for (const wall of walls) tiles[wall.y]![wall.x] = 'wall';
  return { id, width: WIDTH, height: HEIGHT, tiles, ball, square, stars };
}

/**
 * Seasonal worlds intentionally reuse the core movement rules. Their IDs are
 * stable across years, so the existing local progress store can persist
 * completion without coupling completion to the event's calendar year.
 */
export const halloween: SeasonalEvent = {
  id: 'seasonal-halloween',
  theme: 'halloween',
  label: 'Halloween',
  start: { month: 10, day: 20 },
  end: { month: 11, day: 3 },
  levels: [
    makeLevel('seasonal-halloween-01', p(1, 1), p(11, 8), [p(5, 1), p(9, 2), p(7, 4), p(5, 7), p(9, 8)], [p(6, 3), p(6, 4), p(6, 5)]),
    makeLevel('seasonal-halloween-02', p(1, 8), p(11, 1), [p(2, 2), p(5, 5), p(8, 2), p(10, 7)], [p(4, 3), p(5, 3), p(8, 6), p(9, 6)]),
    makeLevel('seasonal-halloween-03', p(2, 4), p(10, 5), [p(3, 1), p(6, 2), p(9, 1), p(9, 8), p(6, 7), p(3, 8)], [p(4, 4), p(5, 4), p(7, 5), p(8, 5)]),
  ],
};

export const christmas: SeasonalEvent = {
  id: 'seasonal-christmas',
  theme: 'christmas',
  label: 'Christmas',
  start: { month: 12, day: 1 },
  end: { month: 1, day: 7 },
  levels: [
    makeLevel('seasonal-christmas-01', p(1, 8), p(11, 8), [p(6, 1), p(5, 2), p(6, 3), p(5, 4), p(6, 5), p(5, 6), p(6, 7)]),
    makeLevel('seasonal-christmas-02', p(1, 1), p(11, 8), [p(3, 2), p(5, 3), p(7, 4), p(9, 5), p(7, 6), p(5, 7)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7)]),
    makeLevel('seasonal-christmas-03', p(2, 8), p(10, 1), [p(3, 1), p(5, 2), p(7, 3), p(9, 4), p(7, 5), p(5, 6), p(3, 7)], [p(4, 4), p(5, 4), p(8, 5), p(9, 5)]),
  ],
};

export const seasonalEvents: readonly SeasonalEvent[] = [halloween, christmas];

function dayOfYear(date: Date): number {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - yearStart) / 86_400_000) + 1;
}

function calendarDay(month: number, day: number, year: number): number {
  return dayOfYear(new Date(Date.UTC(year, month - 1, day)));
}

/** Return whether an event is active on a given UTC calendar date. */
export function isSeasonalEventAvailable(event: SeasonalEvent, date = new Date()): boolean {
  const year = date.getUTCFullYear();
  const start = calendarDay(event.start.month, event.start.day, year);
  const endYear = event.end.month < event.start.month ? year + 1 : year;
  const end = calendarDay(event.end.month, event.end.day, endYear);
  const current = dayOfYear(date);

  if (endYear === year) return current >= start && current <= end;
  if (current >= start) return true;
  return current <= calendarDay(event.end.month, event.end.day, year);
}
