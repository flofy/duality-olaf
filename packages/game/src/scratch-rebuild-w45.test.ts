import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Level } from "../../level-format/src";
import { solveLevel } from "./LevelSolver";

const LEVELS_DIR = path.resolve(import.meta.dirname, "../../level-format/levels");

describe("current levels snapshot (pass-over semantics)", () => {
  it("reports score/moves/solvable for all 55 levels", () => {
    const worlds = [1, 2, 3, 4, 5] as const;
    const lines: string[] = [];
    lines.push("WORLD LEVEL  SCORE  MOVES  SOLVABLE");
    for (const w of worlds) {
      const dir = path.join(LEVELS_DIR, `world-0${w}`);
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
      for (const f of files) {
        const id = f.replace(".json", "");
        const levelIdx = +id.replace(`world-${w}-level-`, "");
        const lvl = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Level;
        const r = solveLevel(lvl);
        lines.push(
          `W${w}     ${String(levelIdx).padStart(2)}     ${(r.score ?? -1).toString().padStart(4)}  ${(r.moves ?? -1).toString().padStart(4)}  ${(r.solvable ? "yes" : "NO")}`,
        );
      }
    }
    console.info(`\n=== SNAPSHOT ===\n${lines.join("\n")}`);
    // Basic sanity: every level must be solvable
    let bad = 0;
    for (const w of worlds) {
      const dir = path.join(LEVELS_DIR, `world-0${w}`);
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
      for (const f of files) {
        const lvl = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Level;
        const r = solveLevel(lvl);
        if (!r.solvable) bad += 1;
      }
    }
    expect(bad).toBe(0);
  });
});
