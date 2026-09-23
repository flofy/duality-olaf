import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Level, Position } from "@duality/level-format";
import { world3Refined } from "@duality/level-format";
import {
  generateChallenge,
  type ChallengeGeneratorOptions,
} from "./ChallengeGenerator";
import { solveLevel } from "./LevelSolver";
import { LevelRunner, type Direction } from "./LevelRunner";
import {
  commandsToggleDoor,
  commandsWarp,
  existsSolutionWithoutMovingSquare,
} from "./MechanicCoverage";

const ROOT = path.resolve(import.meta.dirname, "../../level-format/levels");
const WRITE = process.env.WRITE_LEVELS === "1";

/**
 * Yield to the event loop between heavy solver batches: without it a single
 * test blocks the vitest worker long enough to time out its RPC channel
 * ("Timeout calling onTaskUpdate") and the run exits non-zero.
 */
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

/**
 * Rebuild tool for the 55 campaign levels.
 *
 * Each `it` reconstructs one world from a curated hand pool (the levels
 * currently on disk + `world3Refined`) plus deterministic `generateChallenge`
 * seeds, enforcing the world's contracts (score window, fire from level 05,
 * square rules, doors/teleporters…), then optionally writes the result back to
 * `packages/level-format/levels/`.
 *
 * A full rebuild costs several minutes of solver work, so the suite is skipped
 * unless REBUILD=1. CI relies on the `World*` tests to validate the levels
 * that actually ship.
 *
 * ```sh
 * REBUILD=1 npx vitest run src/campaign-rebuild.test.ts   # rebuild-check only
 * REBUILD=1 WRITE_LEVELS=1 npx vitest run src/campaign-rebuild.test.ts -t 'world 2'
 * ```
 */

type Analysis = {
  id: string;
  level: Level;
  score: number;
  moves: number;
  ballOnly: boolean;
  fire: number;
  square: boolean;
  doors: number;
  teleporters: number;
  togglesDoor: boolean;
  warps: boolean;
  /** `true`/`false` once checked, `null` when the slot does not require it. */
  squareStill: boolean | null;
};

function withoutSquare(level: Level): Level {
  const clone = structuredClone(level) as Level;
  delete clone.square;
  return clone;
}

function analyze(level: Level, needBallOnly = false): Analysis {
  const result = solveLevel(level);
  if (!result.solvable || result.moves === null)
    throw new Error(`${level.id}: not solvable`);
  const fire = level.tiles.flat().filter((tile) => tile === "spike").length;
  return {
    id: level.id,
    level,
    score:
      result.moves * 10 +
      Math.round(Math.log2(Math.max(1, result.exploredStates))),
    moves: result.moves,
    ballOnly:
      needBallOnly &&
      level.square &&
      !level.doors?.length &&
      !level.teleporters?.length
        ? solveLevel(withoutSquare(level)).solvable
        : true,
    squareStill: null,
    fire,
    square: Boolean(level.square),
    doors: level.doors?.length ?? 0,
    teleporters: level.teleporters?.length ?? 0,
    togglesDoor:
      (level.doors?.length ?? 0) > 0
        ? commandsToggleDoor(level, result.commands)
        : false,
    warps:
      (level.teleporters?.length ?? 0) > 0
        ? commandsWarp(level, result.commands)
        : false,
  };
}

function readWorld(world: number): Level[] {
  const dir = path.join(ROOT, `world-0${world}`);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map(
      (file): Level =>
        JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Level,
    );
}

function writeWorld(world: number, levels: readonly Level[]): void {
  const dir = path.join(ROOT, `world-0${world}`);
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")))
    fs.rmSync(path.join(dir, file));
  levels.forEach((level, index) => {
    const id = `world-${world}-level-${String(index + 1).padStart(2, "0")}`;
    const clean = { ...structuredClone(level), id } as Level;
    fs.writeFileSync(
      path.join(dir, `${id}.json`),
      `${JSON.stringify(clean, null, 2)}\n`,
    );
  });
}

/** Jaccard similarity on interior walls, used to reject near-duplicates. */
function wallSignature(level: Level): Set<string> {
  const walls = new Set<string>();
  for (let y = 1; y < level.height - 1; y += 1)
    for (let x = 1; x < level.width - 1; x += 1)
      if (level.tiles[y]![x] === "wall") walls.add(`${x},${y}`);
  return walls;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  const union = new Set([...a, ...b]);
  let inter = 0;
  for (const value of a) if (b.has(value)) inter += 1;
  return inter / union.size;
}

/** Cells traversed by the active form during the optimal solution. */
function sweptCells(
  level: Level,
  commands: readonly { type: string; direction?: Position }[],
): Set<string> {
  const runner = new LevelRunner(level);
  const cells = new Set<string>();
  let state = runner.getState();
  for (const command of commands) {
    const active = state.activeForm;
    const before = active === "ball" ? { ...state.ball } : { ...state.square };
    state =
      command.type === "move"
        ? runner.move(command.direction as Direction)
        : runner.switchForm();
    if (command.type !== "move") continue;
    const after = active === "ball" ? state.ball : state.square;
    if (before.x === after.x && before.y === after.y) continue;
    // A warp changes both coordinates: not a straight slide, skip it.
    if (before.x !== after.x && before.y !== after.y) continue;
    const dx = Math.sign(after.x - before.x);
    const dy = Math.sign(after.y - before.y);
    let x = before.x + dx;
    let y = before.y + dy;
    for (;;) {
      cells.add(`${x},${y}`);
      if (x === after.x && y === after.y) break;
      x += dx;
      y += dy;
    }
  }
  return cells;
}

/** Add `count` fire cells crossed by rows/columns of the optimal path. */
function injectFire(level: Level, count: number, seed: number): Level | null {
  return injectTile(level, "spike", count, seed);
}

/** Add `count` cells of `tile` on the rows/columns the optimal path crosses. */
function injectTile(
  level: Level,
  tile: "spike" | "wall",
  count: number,
  seed: number,
): Level | null {
  const result = solveLevel(level);
  if (!result.solvable) return null;
  const swept = sweptCells(level, result.commands);
  const occupied = new Set(swept);
  const reserve = [
    level.ball,
    ...(level.square ? [level.square] : []),
    ...level.stars,
    ...(level.doors ?? []).map((door) => door.position),
    ...(level.switches ?? []).map((item) => item.position),
    ...(level.teleporters ?? []).map((item) => item.position),
  ];
  for (const cell of reserve) occupied.add(`${cell.x},${cell.y}`);
  const rows = new Set([...swept].map((cell) => cell.split(",")[1]));
  const cols = new Set([...swept].map((cell) => cell.split(",")[0]));
  const candidateCells: Position[] = [];
  for (let y = 1; y < level.height - 1; y += 1)
    for (let x = 1; x < level.width - 1; x += 1) {
      if (level.tiles[y]![x] !== "empty") continue;
      if (occupied.has(`${x},${y}`)) continue;
      if (cols.has(String(x)) || rows.has(String(y)))
        candidateCells.push({ x, y });
    }
  if (candidateCells.length < count) return null;
  let state = (seed * 2654435761) >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const clone = structuredClone(level) as Level;
  const picked = new Set<number>();
  let placed = 0;
  for (let guard = 0; guard < 200 && placed < count; guard += 1) {
    const index = Math.floor(next() * candidateCells.length);
    if (picked.has(index)) continue;
    picked.add(index);
    const cell = candidateCells[index]!;
    clone.tiles[cell.y]![cell.x] = tile;
    placed += 1;
  }
  return solveLevel(clone).solvable ? clone : null;
}

type Slot = {
  label: string;
  window: [number, number];
  recipe?: ChallengeGeneratorOptions;
  seeds?: number;
  fire?: [number, number];
  square?: boolean;
  requiresSquare?: boolean;
  /**
   * `true`: the level must be finishable without ever moving the square (the
   * square only has to appear). `false`: every solution must move the square
   * (real ball/square interaction, World 3 contract).
   */
  squareStill?: boolean;
  doors?: number;
  teleporters?: number;
  togglesDoor?: boolean;
  warps?: boolean;
  bothPads?: boolean;
  /** `highest` lifts the final level of a world to the hardest match. */
  prefer?: "lowest" | "highest";
  hand?: Analysis[];
};

function matches(candidate: Analysis, slot: Slot): boolean {
  if (
    slot.fire &&
    (candidate.fire < slot.fire[0] || candidate.fire > slot.fire[1])
  )
    return false;
  if (slot.square !== undefined && candidate.square !== slot.square)
    return false;
  if (slot.requiresSquare && candidate.ballOnly) return false;
  if (slot.doors !== undefined && candidate.doors !== slot.doors) return false;
  if (
    slot.teleporters !== undefined &&
    candidate.teleporters !== slot.teleporters
  )
    return false;
  if (slot.togglesDoor && !candidate.togglesDoor) return false;
  if (slot.warps && !candidate.warps) return false;
  return true;
}

async function candidatesFor(slot: Slot): Promise<Analysis[]> {
  const found: Analysis[] = [];
  const { hand = [], recipe, seeds = 120 } = slot;
  // Checked lazily so the BFS only runs on candidates that already pass the
  // score window and the structural constraints.
  const stillOk = (candidate: Analysis): boolean => {
    if (slot.squareStill === undefined) return true;
    candidate.squareStill ??= existsSolutionWithoutMovingSquare(
      candidate.level,
    );
    return candidate.squareStill === slot.squareStill;
  };
  const accepts = (candidate: Analysis) =>
    candidate.score >= slot.window[0] &&
    candidate.score <= slot.window[1] &&
    matches(candidate, slot) &&
    stillOk(candidate);
  const needsBallOnly = Boolean(slot.requiresSquare);
  for (const candidate of hand) {
    if (found.length >= 12) break;
    await tick();
    if (accepts(candidate)) found.push(candidate);
    const missing = (slot.fire?.[0] ?? 0) - candidate.fire;
    if (missing > 0)
      // Reuse a handcrafted layout by adding the missing fire cells on the rows
      // and columns the optimal path crosses.
      for (let seed = 1; seed <= 12; seed += 1) {
        await tick();
        const injected = injectFire(candidate.level, missing, seed);
        if (!injected) continue;
        const level = { ...injected, id: candidate.id } as Level;
        try {
          const analysis = analyze(level, needsBallOnly);
          if (accepts(analysis)) found.push(analysis);
        } catch {
          // injected layout became unsolvable: skip
        }
      }
    if (slot.requiresSquare && candidate.ballOnly)
      // Repair a level the ball can finish alone: obstruct the relaxed path
      // (wall first, then fire) until the square becomes mandatory.
      for (let seed = 1; seed <= 12; seed += 1)
        for (const [tile, count] of [
          ["wall", 1],
          ["wall", 2],
          ["spike", 1],
          ["spike", 2],
        ] as const) {
          await tick();
          const injected = injectTile(candidate.level, tile, count, seed);
          if (!injected) continue;
          const level = { ...injected, id: candidate.id } as Level;
          try {
            const analysis = analyze(level, needsBallOnly);
            if (accepts(analysis)) found.push(analysis);
          } catch {
            // injected layout became unsolvable: skip
          }
        }
  }
  if (recipe)
    for (let seed = 1; seed <= seeds; seed += 1) {
      await tick();
      try {
        const candidate = analyze(
          generateChallenge(seed, recipe).level,
          needsBallOnly,
        );
        if (accepts(candidate)) found.push(candidate);
      } catch {
        // unsolvable candidate: skip
      }
    }
  return found.sort((a, b) => a.score - b.score);
}

async function buildWorld(
  world: number,
  slots: readonly Slot[],
  handPool: readonly Analysis[] = [],
): Promise<Analysis[]> {
  const chosen: Analysis[] = [];
  let previous = -Infinity;
  for (const slot of slots) {
    await tick();
    const attempt = async (target: Slot) =>
      await candidatesFor({
        ...target,
        hand: [...(target.hand ?? []), ...handPool],
      });
    const startedAt = Date.now();
    let pool = await attempt(slot);
    let usedWindow = slot.window;
    if (pool.filter((candidate) => candidate.score >= previous).length === 0) {
      // No level matched the preferred window: keep the mechanic constraints
      // and widen the score band instead of failing the whole world.
      usedWindow = [
        previous === -Infinity ? 0 : Math.max(0, previous),
        Math.max(previous + 600, 600),
      ];
      pool = await attempt({ ...slot, window: usedWindow });
    }
    const viable = pool.filter((candidate) => candidate.score >= previous);
    const ordered = slot.prefer === "highest" ? [...viable].reverse() : viable;
    const pick =
      ordered.find((candidate) =>
        chosen.every(
          (item) =>
            jaccard(wallSignature(item.level), wallSignature(candidate.level)) <
            0.95,
        ),
      ) ?? ordered[0];
    console.info(
      `W${world} ${slot.label} pool=${pool.length} win=[${usedWindow}] ${Date.now() - startedAt}ms -> ${pick?.score ?? "none"}`,
    );
    if (!pick)
      throw new Error(
        `W${world} slot ${slot.label}: no candidate at all (>= ${previous})`,
      );
    const level = {
      ...structuredClone(pick.level),
      id: `world-${world}-level-${slot.label}`,
    } as Level;
    chosen.push({ ...pick, id: level.id, level });
    previous = pick.score;
  }
  return chosen;
}

function report(name: string, levels: readonly Analysis[]): string {
  const lines = [`--- ${name} ---`];
  levels.forEach((entry, index) => {
    lines.push(
      `${String(index + 1).padStart(2)} ${entry.score.toString().padStart(4)} pts ${String(entry.moves).padStart(3)} mv feu${entry.fire} carre${entry.square ? "y" : "-"} fixe${entry.squareStill === null ? "?" : entry.squareStill ? "y" : "-"} porte${entry.doors} tp${entry.teleporters} toggle${entry.togglesDoor ? "y" : "-"} warp${entry.warps ? "y" : "-"} ${entry.id}`,
    );
  });
  return lines.join("\n");
}

const fireRecipe = (
  wallCount: number,
  spikes: number,
  stars: number,
): ChallengeGeneratorOptions => ({
  mechanics: ["walls", "spikes"],
  square: false,
  wallCount,
  spikes,
  stars,
});

const rebuild = describe.skipIf(process.env.REBUILD !== "1");

rebuild("campaign rebuild", () => {
  it(
    "rebuilds world 1 (ball only, fire from level 05)",
    { timeout: 3_600_000 },
    async () => {
      const hand = readWorld(1).map((level) => analyze(level));
      const ball = hand.filter((entry) => !entry.square && entry.fire === 0);
      const slots: Slot[] = [
        {
          label: "01",
          window: [0, 25],
          square: false,
          fire: [0, 0],
          hand: ball,
        },
        {
          label: "02",
          window: [26, 45],
          square: false,
          fire: [0, 0],
          hand: ball,
        },
        {
          label: "03",
          window: [26, 45],
          square: false,
          fire: [0, 0],
          hand: ball,
        },
        {
          label: "04",
          window: [30, 55],
          square: false,
          fire: [0, 0],
          hand: ball,
        },
        {
          label: "05",
          window: [40, 75],
          square: false,
          fire: [2, 3],
          recipe: fireRecipe(12, 2, 2),
          seeds: 150,
        },
        {
          label: "06",
          window: [50, 85],
          square: false,
          fire: [2, 4],
          recipe: fireRecipe(14, 3, 2),
          seeds: 150,
        },
        {
          label: "07",
          window: [60, 100],
          square: false,
          fire: [2, 4],
          recipe: fireRecipe(14, 3, 3),
          seeds: 150,
        },
        {
          label: "08",
          window: [70, 115],
          square: false,
          fire: [2, 5],
          recipe: fireRecipe(16, 4, 3),
          seeds: 150,
        },
        {
          label: "09",
          window: [85, 130],
          square: false,
          fire: [2, 6],
          recipe: fireRecipe(16, 4, 3),
          seeds: 150,
        },
        {
          label: "10",
          window: [100, 160],
          square: false,
          fire: [3, 7],
          recipe: fireRecipe(18, 5, 3),
          seeds: 200,
        },
        {
          label: "11",
          window: [130, 220],
          square: false,
          fire: [3, 8],
          recipe: fireRecipe(18, 6, 4),
          seeds: 300,
        },
      ];
      const built = await buildWorld(1, slots, ball);
      console.info(`\n${report("WORLD 1", built)}\n`);
      if (WRITE)
        writeWorld(
          1,
          built.map((entry) => entry.level),
        );
      expect(built).toHaveLength(11);
    },
  );

  it(
    "rebuilds world 2 (square present, fire from level 05)",
    { timeout: 3_600_000 },
    async () => {
      const hand = readWorld(2).map((level) => analyze(level));
      const square = hand.filter((entry) => entry.square);
      const recipe = (
        wallCount: number,
        spikes: number,
        stars: number,
      ): ChallengeGeneratorOptions => ({
        mechanics: ["walls", "spikes"],
        square: true,
        wallCount,
        spikes,
        stars,
      });
      const plain = (
        wallCount: number,
        stars: number,
      ): ChallengeGeneratorOptions => ({
        mechanics: ["walls"],
        square: true,
        wallCount,
        stars,
      });
      const slots: Slot[] = [
        {
          label: "01",
          window: [50, 70],
          fire: [0, 0],
          squareStill: true,
          hand: square,
          recipe: plain(8, 2),
          seeds: 80,
        },
        {
          label: "02",
          window: [60, 80],
          fire: [0, 0],
          squareStill: true,
          hand: square,
          recipe: plain(10, 3),
          seeds: 80,
        },
        {
          label: "03",
          window: [62, 85],
          fire: [0, 0],
          squareStill: true,
          hand: square,
          recipe: plain(10, 3),
          seeds: 80,
        },
        {
          label: "04",
          window: [65, 95],
          fire: [0, 0],
          squareStill: true,
          hand: square,
          recipe: plain(12, 3),
          seeds: 80,
        },
        {
          label: "05",
          window: [70, 105],
          fire: [1, 3],
          squareStill: true,
          hand: square,
          recipe: recipe(12, 2, 3),
          seeds: 120,
        },
        {
          label: "06",
          window: [80, 115],
          fire: [1, 4],
          squareStill: true,
          hand: square,
          recipe: recipe(14, 3, 3),
          seeds: 120,
        },
        {
          label: "07",
          window: [90, 130],
          fire: [1, 4],
          squareStill: true,
          hand: square,
          recipe: recipe(14, 3, 3),
          seeds: 120,
        },
        {
          label: "08",
          window: [100, 150],
          fire: [1, 5],
          squareStill: true,
          hand: square,
          recipe: recipe(16, 4, 3),
          seeds: 150,
        },
        {
          label: "09",
          window: [115, 175],
          fire: [2, 6],
          squareStill: true,
          hand: square,
          recipe: recipe(16, 4, 3),
          seeds: 150,
        },
        {
          label: "10",
          window: [140, 175],
          fire: [2, 8],
          squareStill: true,
          hand: square,
          recipe: recipe(18, 5, 3),
          seeds: 200,
        },
        {
          label: "11",
          window: [160, 190],
          fire: [2, 10],
          squareStill: true,
          hand: square,
          recipe: recipe(18, 6, 4),
          seeds: 250,
        },
      ];
      const built = await buildWorld(2, slots, square);
      console.info(`\n${report("WORLD 2", built)}\n`);
      if (WRITE)
        writeWorld(
          2,
          built.map((entry) => entry.level),
        );
      expect(built).toHaveLength(11);
    },
  );

  it(
    "rebuilds world 3 (square mandatory, fire from level 05)",
    { timeout: 3_600_000 },
    async () => {
      const current = readWorld(3);
      const refined = world3Refined.map((level) => analyze({ ...level }, true));
      const orphan = readWorld(1)
        .map((level) => analyze(level, true))
        .filter((entry) => entry.square);
      const current3 = current.map((level) => analyze(level, true));
      const hand = [...refined, ...current3, ...orphan];
      const recipe = (
        wallCount: number,
        spikes: number,
        stars: number,
      ): ChallengeGeneratorOptions => ({
        mechanics: ["walls", "spikes"],
        square: true,
        wallCount,
        spikes,
        stars,
      });
      const slots: Slot[] = [
        {
          label: "01",
          window: [50, 80],
          fire: [0, 0],
          requiresSquare: true,
          squareStill: false,
          hand,
        },
        {
          label: "02",
          window: [60, 95],
          fire: [0, 0],
          requiresSquare: true,
          squareStill: false,
          hand,
        },
        {
          label: "03",
          window: [70, 105],
          fire: [0, 0],
          requiresSquare: true,
          squareStill: false,
          hand,
        },
        {
          label: "04",
          window: [80, 120],
          fire: [0, 0],
          requiresSquare: true,
          squareStill: false,
          hand,
        },
        {
          label: "05",
          window: [95, 140],
          fire: [1, 3],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(12, 2, 3),
          seeds: 80,
        },
        {
          label: "06",
          window: [105, 155],
          fire: [1, 4],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(14, 3, 3),
          seeds: 80,
        },
        {
          label: "07",
          window: [115, 170],
          fire: [1, 4],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(14, 3, 3),
          seeds: 80,
        },
        {
          label: "08",
          window: [130, 190],
          fire: [1, 5],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(16, 4, 3),
          seeds: 100,
        },
        {
          label: "09",
          window: [145, 215],
          fire: [2, 6],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(16, 4, 3),
          seeds: 100,
        },
        {
          label: "10",
          window: [165, 250],
          fire: [2, 6],
          requiresSquare: true,
          squareStill: false,
          hand,
          recipe: recipe(18, 5, 4),
          seeds: 120,
        },
        {
          label: "11",
          window: [190, 400],
          fire: [2, 8],
          requiresSquare: true,
          squareStill: false,
          prefer: "highest",
          hand,
          recipe: recipe(18, 6, 4),
          seeds: 150,
        },
      ];
      const built = await buildWorld(3, slots, hand);
      console.info(`\n${report("WORLD 3", built)}\n`);
      if (WRITE)
        writeWorld(
          3,
          built.map((entry) => entry.level),
        );
      expect(built).toHaveLength(11);
    },
  );

  it(
    "rebuilds world 4 (teleporters arrive)",
    { timeout: 3_600_000 },
    async () => {
      const recipe = (
        wallCount: number,
        stars: number,
        square: boolean,
      ): ChallengeGeneratorOptions => ({
        mechanics: ["walls", "teleporters"],
        square,
        wallCount,
        stars,
      });
      const slots: Slot[] = [
        {
          label: "01",
          window: [60, 140],
          square: false,
          teleporters: 2,
          warps: true,
          recipe: recipe(8, 2, false),
          seeds: 80,
        },
        {
          label: "02",
          window: [90, 165],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(10, 3, true),
          seeds: 80,
        },
        {
          label: "03",
          window: [110, 185],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(12, 3, true),
          seeds: 80,
        },
        {
          label: "04",
          window: [125, 205],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(12, 3, true),
          seeds: 80,
        },
        {
          label: "05",
          window: [140, 225],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(14, 3, true),
          seeds: 100,
        },
        {
          label: "06",
          window: [155, 245],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(14, 3, true),
          seeds: 100,
        },
        {
          label: "07",
          window: [170, 265],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(16, 3, true),
          seeds: 100,
        },
        {
          label: "08",
          window: [185, 285],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(16, 4, true),
          seeds: 120,
        },
        {
          label: "09",
          window: [200, 305],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(18, 4, true),
          seeds: 120,
        },
        {
          label: "10",
          window: [220, 330],
          square: true,
          teleporters: 2,
          warps: true,
          recipe: recipe(18, 4, true),
          seeds: 150,
        },
        {
          label: "11",
          window: [240, 600],
          square: true,
          teleporters: 2,
          warps: true,
          prefer: "highest",
          recipe: recipe(20, 4, true),
          seeds: 180,
        },
      ];
      const built = await buildWorld(4, slots);
      console.info(`\n${report("WORLD 4", built)}\n`);
      if (WRITE)
        writeWorld(
          4,
          built.map((entry) => entry.level),
        );
      expect(built).toHaveLength(11);
    },
  );

  it(
    "rebuilds world 5 (doors arrive, then the four elements)",
    { timeout: 3_600_000 },
    async () => {
      const doors = (
        wallCount: number,
        stars: number,
        square: boolean,
        teleporters: boolean,
      ): ChallengeGeneratorOptions => ({
        mechanics: teleporters
          ? ["walls", "doors", "teleporters"]
          : ["walls", "doors"],
        square,
        wallCount,
        stars,
      });
      const slots: Slot[] = [
        {
          label: "01",
          window: [70, 150],
          square: false,
          doors: 1,
          togglesDoor: true,
          recipe: doors(8, 2, false, false),
          seeds: 80,
        },
        {
          label: "02",
          window: [100, 175],
          square: true,
          doors: 1,
          togglesDoor: true,
          recipe: doors(10, 3, true, false),
          seeds: 80,
        },
        {
          label: "03",
          window: [115, 195],
          square: true,
          doors: 1,
          togglesDoor: true,
          recipe: doors(12, 3, true, false),
          seeds: 80,
        },
        {
          label: "04",
          window: [130, 215],
          square: true,
          doors: 1,
          togglesDoor: true,
          recipe: doors(12, 3, true, false),
          seeds: 80,
        },
        {
          label: "05",
          window: [145, 235],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(14, 3, true, true),
          seeds: 100,
        },
        {
          label: "06",
          window: [160, 255],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(14, 3, true, true),
          seeds: 100,
        },
        {
          label: "07",
          window: [175, 275],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(16, 4, true, true),
          seeds: 120,
        },
        {
          label: "08",
          window: [190, 300],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(16, 4, true, true),
          seeds: 120,
        },
        {
          label: "09",
          window: [210, 325],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(18, 4, true, true),
          seeds: 150,
        },
        {
          label: "10",
          window: [230, 350],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          recipe: doors(18, 5, true, true),
          seeds: 180,
        },
        {
          label: "11",
          window: [250, 700],
          square: true,
          doors: 1,
          teleporters: 2,
          togglesDoor: true,
          warps: true,
          prefer: "highest",
          recipe: doors(20, 5, true, true),
          seeds: 200,
        },
      ];
      const built = await buildWorld(5, slots);
      console.info(`\n${report("WORLD 5", built)}\n`);
      if (WRITE)
        writeWorld(
          5,
          built.map((entry) => entry.level),
        );
      expect(built).toHaveLength(11);
    },
  );
});
