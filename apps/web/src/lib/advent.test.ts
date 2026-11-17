import { describe, expect, it } from "vitest";
import { getAdventDay, isAdventDayAvailable, isNewYearSurpriseAvailable } from "./advent";

describe("Advent calendar availability", () => {
  it("reveals one door per day from December 1 to 24", () => {
    expect(getAdventDay(new Date(2026, 10, 30))).toBe(0);
    expect(getAdventDay(new Date(2026, 11, 1))).toBe(1);
    expect(getAdventDay(new Date(2026, 11, 12))).toBe(12);
    expect(getAdventDay(new Date(2026, 11, 24))).toBe(24);
  });

  it("keeps all revealed doors available after Christmas", () => {
    const january = new Date(2027, 0, 5);
    expect(getAdventDay(january)).toBe(24);
    expect(isAdventDayAvailable(24, january)).toBe(true);
    expect(isAdventDayAvailable(1, january)).toBe(true);
  });

  it("unlocks the separate New Year surprise from January 1 through 7", () => {
    expect(isNewYearSurpriseAvailable(new Date(2027, 0, 1))).toBe(true);
    expect(isNewYearSurpriseAvailable(new Date(2027, 0, 7))).toBe(true);
    expect(isNewYearSurpriseAvailable(new Date(2027, 0, 8))).toBe(false);
    expect(isNewYearSurpriseAvailable(new Date(2026, 11, 31))).toBe(false);
  });
});
