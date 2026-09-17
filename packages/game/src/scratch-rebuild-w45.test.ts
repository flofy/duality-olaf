import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Level } from "../../level-format/src";
import { solveLevel } from "./LevelSolver";

const LEVELS_DIR = path.resolve(
  import.meta.dirname,
  "../../level-format/levels",
);

describe("current levels snapshot (pass-over semantics)", () => {
  it(
    "reports score/moves/solvable for all 55 levels",
    { timeout: 300_000 },
    () => {
      const worlds = [1, 2, 3, 4, 5] as const;
      const lines: string[] = [];
      lines.push("WORLD LEVEL  MOVES  EXPLORED  SOLVABLE");
      const unsolvable: string[] = [];
      for (const w of worlds) {
        const dir = path.join(LEVELS_DIR, `world-0${w}`);
        const files = fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .sort();
        for (const f of files) {
          const id = f.replace(".json", "");
          const levelIdx = +id.replace(`world-${w}-level-`, "");
          const lvl = JSON.parse(
            fs.readFileSync(path.join(dir, f), "utf8"),
          ) as Level;
          // Single solve per level: report line and solvability check both
          // reuse this result.
          const r = solveLevel(lvl);
          if (!r.solvable) unsolvable.push(id);
          lines.push(
            `W${w}     ${String(levelIdx).padStart(2)}  ${String(r.moves ?? -1).padStart(5)}  ${String(r.exploredStates).padStart(9)}  ${r.solvable ? "yes" : "NO"}`,
          );
        }
      }
      console.info(`\n=== SNAPSHOT ===\n${lines.join("\n")}`);
      expect(unsolvable).toEqual([]);
    },
  );
});
