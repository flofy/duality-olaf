import { isDevtoolsEnabled } from "./devFlags";

let simulatedDate = $state<Date | null>(null);

/** The application date used by date-dependent seasonal features. */
export function getAppDate(): Date {
  return isDevtoolsEnabled && simulatedDate
    ? new Date(simulatedDate)
    : new Date();
}

export function getSimulatedDate(): Date | null {
  return simulatedDate ? new Date(simulatedDate) : null;
}

export function setSimulatedDate(value: string): void {
  if (!isDevtoolsEnabled) return;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
  if (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  ) {
    simulatedDate = date;
  }
}

export function resetSimulatedDate(): void {
  simulatedDate = null;
}
