/** Returns the currently unlocked Advent day (0 before December, capped at 24). */
export function getAdventDay(date = new Date()): number {
  if (date.getMonth() < 11) return 0;
  if (date.getMonth() > 11) return 24;
  return Math.min(24, date.getDate());
}

export function isAdventDayAvailable(day: number, date = new Date()): boolean {
  return Number.isInteger(day) && day >= 1 && day <= 24 && day <= getAdventDay(date);
}
