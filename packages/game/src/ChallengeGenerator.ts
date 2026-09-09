import type {
  Door,
  Form,
  Level,
  Position,
  Switch,
  Teleporter,
} from "@duality/level-format";
import { solveLevel } from "./LevelSolver";
export type ChallengeMechanic = "walls" | "doors" | "teleporters";
export type Challenge = {
  seed: number;
  level: Level;
  moves: number;
  exploredStates: number;
  score: number;
  mechanics: readonly ChallengeMechanic[];
};
export type ChallengeGeneratorOptions = {
  width?: number;
  height?: number;
  stars?: number;
  wallCount?: number;
  mechanics?: readonly ChallengeMechanic[];
  maxAttempts?: number;
};
const DEFAULTS = {
  width: 13,
  height: 10,
  stars: 3,
  wallCount: 8,
  maxAttempts: 128,
};
const random = (s: { value: number }) => {
  s.value |= 0;
  s.value = (s.value + 0x6d2b79f5) | 0;
  let t = Math.imul(s.value ^ (s.value >>> 15), 1 | s.value);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(a: readonly T[], s: { value: number }): T =>
  a[Math.floor(random(s) * a.length)]!;
const key = (p: Position) => `${p.x},${p.y}`;
function candidate(
  seed: number,
  o: Required<Omit<ChallengeGeneratorOptions, "mechanics">> & {
    mechanics: readonly ChallengeMechanic[];
  },
  attempt: number,
): Level {
  const r = { value: (seed ^ Math.imul(attempt + 1, 0x45d9f3b)) | 0 };
  const cells: Position[] = [];
  for (let y = 1; y < o.height - 1; y++)
    for (let x = 1; x < o.width - 1; x++) cells.push({ x, y });
  const ball = pick(cells, r),
    square = pick(
      cells.filter((c) => key(c) !== key(ball)),
      r,
    ),
    occupied = new Set([key(ball), key(square)]),
    walls: Position[] = [];
  if (o.mechanics.includes("walls"))
    for (let i = 0; i < o.wallCount; i++) {
      const a = cells.filter((c) => !occupied.has(key(c)));
      if (!a.length) break;
      const w = pick(a, r);
      walls.push(w);
      occupied.add(key(w));
    }
  const tiles: Level["tiles"] = Array.from({ length: o.height }, (_, y) =>
    Array.from({ length: o.width }, (_, x) =>
      x === 0 || y === 0 || x === o.width - 1 || y === o.height - 1
        ? ("wall" as const)
        : ("empty" as const),
    ),
  );
  for (const w of walls) tiles[w.y]![w.x] = "wall";
  const free = () => {
    const a = cells.filter((c) => !occupied.has(key(c)));
    if (!a.length) throw new Error("Challenge board has no free cell");
    const c = pick(a, r);
    occupied.add(key(c));
    return c;
  };
  let doors: Door[] | undefined, switches: Switch[] | undefined;
  if (o.mechanics.includes("doors")) {
    const d: Door = { id: "door-1", position: free(), initiallyOpen: false };
    const form: Form | "either" = random(r) < 0.5 ? "ball" : "square";
    const sw: Switch = {
      id: "switch-1",
      position: free(),
      form,
      toggles: [d.id],
    };
    doors = [d];
    switches = [sw];
  }
  let teleporters: Teleporter[] | undefined;
  if (o.mechanics.includes("teleporters")) {
    const a = free(),
      b = free();
    teleporters = [
      { id: "teleporter-a", position: a, targetId: "teleporter-b" },
      { id: "teleporter-b", position: b, targetId: "teleporter-a" },
    ];
  }
  const stars: Position[] = [];
  for (let i = 0; i < o.stars; i++) {
    const a = cells.filter((c) => !occupied.has(key(c)));
    if (!a.length) break;
    const s = pick(a, r);
    stars.push(s);
    occupied.add(key(s));
  }
  return {
    id: `challenge-${seed}-${attempt}`,
    width: o.width,
    height: o.height,
    tiles,
    ball,
    square,
    stars,
    doors,
    switches,
    teleporters,
  };
}
export function generateChallenge(
  seed: number,
  overrides: ChallengeGeneratorOptions = {},
): Challenge {
  const mechanics = overrides.mechanics?.length
    ? [...overrides.mechanics]
    : (["walls"] as ChallengeMechanic[]);
  const o = { ...DEFAULTS, ...overrides, mechanics };
  if (o.stars < 1) throw new Error("Challenge must contain at least one star");
  for (let attempt = 0; attempt < o.maxAttempts; attempt++) {
    const level = candidate(seed, o, attempt),
      result = solveLevel(level);
    if (!result.solvable || result.moves === null) continue;
    return {
      seed,
      level,
      moves: result.moves,
      exploredStates: result.exploredStates,
      score:
        result.moves * 10 +
        Math.round(Math.log2(Math.max(1, result.exploredStates))),
      mechanics,
    };
  }
  throw new Error(`Unable to generate a solvable challenge for seed ${seed}`);
}
