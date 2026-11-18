import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { halloween } from "@duality/level-format";
import {
  completeLevel,
  getCampaignProgress,
  getCollectionProgress,
  isCollectionStarted,
  startLevel,
} from "./progression";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

beforeEach(() => vi.stubGlobal("localStorage", new MemoryStorage()));
afterEach(() => vi.unstubAllGlobals());

describe("collection progression", () => {
  it("records a level as started before it is completed", () => {
    startLevel(halloween.levels[0]!.id);

    expect(isCollectionStarted(halloween.levels)).toBe(true);
    expect(getCollectionProgress(halloween.levels)).toMatchObject({
      started: true,
      unlocked: 1,
      completed: 0,
      total: halloween.levels.length,
    });
  });

  it("keeps seasonal results out of the permanent campaign counters", () => {
    completeLevel(halloween.levels[0]!.id, {
      moves: 5,
      optimalMoves: null,
      elapsedMs: 1_000,
    });

    expect(getCollectionProgress(halloween.levels)).toMatchObject({
      completed: 1,
      stars: 3,
      unlocked: 2,
    });
    expect(getCampaignProgress()).toMatchObject({
      completed: 0,
      total: 55,
      stars: 0,
      percentage: 0,
    });
  });

  it("recognizes existing seasonal completions in legacy saves", () => {
    localStorage.setItem(
      "duality.progress.v1",
      JSON.stringify({ completed: [halloween.levels[0]!.id] }),
    );

    expect(isCollectionStarted(halloween.levels)).toBe(true);
    expect(getCollectionProgress(halloween.levels).completed).toBe(1);
  });
});
