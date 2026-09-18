import {
  cloneLevel,
  isInside,
  isWall,
  type Level,
} from "@duality/level-format";
import type { Direction, GameState } from "./LevelRunner";
import { LevelRunner } from "./LevelRunner";

export type SolverCommand =
  | { type: "move"; direction: Direction }
  | { type: "switch" };

export type SolverResult =
  | {
      solvable: true;
      moves: number;
      commands: SolverCommand[];
      exploredStates: number;
    }
  | {
      solvable: false;
      moves: null;
      commands: [];
      exploredStates: number;
      /** Set when the search stopped because it hit its exploration budget. */
      budgetExhausted?: boolean;
    };

export type SolveOptions = {
  /** Maximum solution length (inclusive). */
  maxDepth?: number;
  /**
   * Safety net against pathological state spaces: stop the search after this
   * many explored states and report `budgetExhausted` instead of exhausting
   * time and memory.
   */
  maxExploredStates?: number;
};

const DEFAULT_MAX_EXPLORED_STATES = 500_000;

const DIRECTIONS: readonly Direction[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

type SearchNode = {
  state: GameState;
  parent: number | null;
  command: SolverCommand | null;
  depth: number;
};

type OpenEntry = {
  nodeIndex: number;
  priority: number;
  depth: number;
};

type RelaxedMove = {
  position: Position;
  swept: Position[];
};

type Position = { x: number; y: number };

class MinHeap {
  private readonly items: OpenEntry[] = [];

  get size(): number {
    return this.items.length;
  }

  push(entry: OpenEntry): void {
    this.items.push(entry);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.less(this.items[index]!, this.items[parent]!)) break;
      [this.items[index], this.items[parent]] = [
        this.items[parent]!,
        this.items[index]!,
      ];
      index = parent;
    }
  }

  pop(): OpenEntry | undefined {
    const first = this.items[0];
    if (!first) return undefined;
    const last = this.items.pop()!;
    if (this.items.length === 0) return first;
    this.items[0] = last;

    let index = 0;
    for (;;) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (
        left < this.items.length &&
        this.less(this.items[left]!, this.items[smallest]!)
      ) {
        smallest = left;
      }
      if (
        right < this.items.length &&
        this.less(this.items[right]!, this.items[smallest]!)
      ) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [
        this.items[smallest]!,
        this.items[index]!,
      ];
      index = smallest;
    }
    return first;
  }

  private less(a: OpenEntry, b: OpenEntry): boolean {
    if (a.priority !== b.priority) return a.priority < b.priority;
    return a.depth > b.depth;
  }
}

function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function doorKey(state: GameState): string {
  return Object.entries(state.doors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, open]) => `${id}:${open ? 1 : 0}`)
    .join(";");
}

/** Base identity of a state: everything except which stars remain. */
function baseKey(state: GameState): string {
  return [
    state.activeForm,
    `${state.ball.x},${state.ball.y}`,
    `${state.square.x},${state.square.y}`,
    doorKey(state),
  ].join("|");
}

/** Bit i of the mask ↔ level.stars[i]. */
function starIndexMap(level: Level): Map<string, number> {
  const index = new Map<string, number>();
  level.stars.forEach((star, i) => index.set(`${star.x},${star.y}`, i));
  return index;
}

/**
 * Remaining stars as a bitmask. Collecting stars is monotonic along a slide,
 * which enables dominance pruning: reaching the same place / form / doors
 * with a star-set *superset* at equal-or-higher cost can never beat the
 * already-seen state, no matter how the rest of the run plays out.
 */
function remainingMask(
  starIndex: ReadonlyMap<string, number>,
  state: GameState,
): bigint {
  let mask = 0n;
  for (const star of state.stars) {
    const bit = starIndex.get(`${star.x},${star.y}`);
    if (bit !== undefined) mask |= 1n << BigInt(bit);
  }
  return mask;
}

type Dominance = Map<string, { masks: bigint[]; depths: number[] }>;

function isDominated(
  dominance: Dominance,
  key: string,
  mask: bigint,
  depth: number,
): boolean {
  const entry = dominance.get(key);
  if (!entry) return false;
  return entry.masks.some(
    (seen, i) => entry.depths[i]! <= depth && (seen & mask) === seen,
  );
}

/** Same as isDominated, but ignores the state's own recorded entry. */
function isDominatedBesidesSelf(
  dominance: Dominance,
  key: string,
  mask: bigint,
  depth: number,
): boolean {
  const entry = dominance.get(key);
  if (!entry) return false;
  return entry.masks.some(
    (seen, i) =>
      !(seen === mask && entry.depths[i] === depth) &&
      entry.depths[i]! <= depth &&
      (seen & mask) === seen,
  );
}

function remember(
  dominance: Dominance,
  key: string,
  mask: bigint,
  depth: number,
): void {
  const entry = dominance.get(key) ?? { masks: [], depths: [] };
  for (let i = entry.masks.length - 1; i >= 0; i -= 1) {
    // Drop stored states the new one dominates.
    if (
      depth <= entry.depths[i]! &&
      (mask & entry.masks[i]!) === entry.masks[i]!
    ) {
      entry.masks.splice(i, 1);
      entry.depths.splice(i, 1);
    }
  }
  entry.masks.push(mask);
  entry.depths.push(depth);
  dominance.set(key, entry);
}

function reconstruct(
  nodes: readonly SearchNode[],
  index: number,
): SolverCommand[] {
  const commands: SolverCommand[] = [];
  let cursor: number | null = index;
  while (cursor !== null) {
    const node: SearchNode = nodes[cursor]!;
    if (node.command) commands.push(node.command);
    cursor = node.parent;
  }
  return commands.reverse();
}

function relaxedMove(
  level: Level,
  position: Position,
  direction: Direction,
): RelaxedMove | null {
  const axis =
    Math.abs(direction.x) >= Math.abs(direction.y)
      ? direction.x === 0
        ? "y"
        : "x"
      : "y";
  const sign = axis === "x" ? Math.sign(direction.x) : Math.sign(direction.y);
  if (sign === 0) return null;

  const current = { ...position };
  const swept: Position[] = [];
  for (;;) {
    const next = { ...current };
    next[axis] += sign;
    if (!isInside(level, next)) return null;
    if (isWall(level, next)) break;
    current.x = next.x;
    current.y = next.y;
    swept.push({ ...current });
  }

  if (current.x === position.x && current.y === position.y) return null;
  return { position: current, swept };
}

type RelaxedMovementGraph = Map<string, RelaxedMove[]>;

function buildRelaxedMovementGraph(level: Level): RelaxedMovementGraph {
  const graph: RelaxedMovementGraph = new Map();

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const position = { x, y };
      if (isWall(level, position)) continue;
      graph.set(positionKey(position), buildRelaxedMoves(level, position));
    }
  }

  return graph;
}

function buildRelaxedMoves(level: Level, position: Position): RelaxedMove[] {
  return DIRECTIONS.flatMap((direction) => {
    const move = relaxedMove(level, position, direction);
    return move ? [move] : [];
  });
}

function buildRelaxedDistances(
  level: Level,
  graph: RelaxedMovementGraph,
): Map<string, Map<string, number>> {
  const distances = new Map<string, Map<string, number>>();

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const start = { x, y };
      if (isWall(level, start)) continue;

      const startKey = positionKey(start);
      const distanceByStar = new Map<string, number>();
      for (const star of level.stars) {
        const targetKey = positionKey(star);
        if (targetKey === startKey) {
          distanceByStar.set(targetKey, 0);
          continue;
        }

        const targetDistance = findRelaxedStarDistance(graph, start, star);
        if (targetDistance !== null) {
          distanceByStar.set(targetKey, targetDistance);
        }
      }

      distances.set(startKey, distanceByStar);
    }
  }

  return distances;
}

function findRelaxedStarDistance(
  graph: RelaxedMovementGraph,
  start: Position,
  target: Position,
): number | null {
  const queue: Position[] = [start];
  const visited = new Set<string>([positionKey(start)]);
  const distance = new Map<string, number>([[positionKey(start), 0]]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor]!;
    const currentKey = positionKey(current);
    const currentDistance = distance.get(currentKey)!;

    for (const move of graph.get(currentKey) ?? []) {
      if (
        move.swept.some((cell) => cell.x === target.x && cell.y === target.y)
      ) {
        return currentDistance + 1;
      }

      const nextKey = positionKey(move.position);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      distance.set(nextKey, currentDistance + 1);
      queue.push(move.position);
    }
  }

  return null;
}

function createHeuristic(level: Level): (state: GameState) => number {
  const graph = buildRelaxedMovementGraph(level);
  const distances = buildRelaxedDistances(level, graph);
  const starKeys = level.stars.map(positionKey);

  const distanceBetweenStars = (
    fromKey: string,
    toKey: string,
  ): number | null => {
    if (fromKey === toKey) return 0;

    const forward = distances.get(fromKey)?.get(toKey);
    const backward = distances.get(toKey)?.get(fromKey);
    if (forward === undefined) return backward ?? null;
    if (backward === undefined) return forward;
    return Math.min(forward, backward);
  };

  const mstCost = (remainingStars: readonly string[]): number => {
    if (remainingStars.length < 2) return 0;

    const connected = new Set<string>([remainingStars[0]!]);
    let cost = 0;

    while (connected.size < remainingStars.length) {
      let bestCost = Number.POSITIVE_INFINITY;
      let bestStar: string | null = null;

      for (const from of connected) {
        for (const to of remainingStars) {
          if (connected.has(to)) continue;
          const distance = distanceBetweenStars(from, to);
          if (distance !== null && distance < bestCost) {
            bestCost = distance;
            bestStar = to;
          }
        }
      }

      if (bestStar === null) return 0;
      connected.add(bestStar);
      cost += bestCost;
    }

    return cost;
  };

  return (state) => {
    if (state.stars.length === 0) return 0;

    const remainingKeys = state.stars.map(positionKey);
    const remainingSet = new Set(remainingKeys);
    const remainingStarKeys = starKeys.filter((key) => remainingSet.has(key));
    const fromBall = distances.get(positionKey(state.ball));
    const fromSquare = distances.get(positionKey(state.square));

    let startCost = Number.POSITIVE_INFINITY;
    for (const starKey of remainingStarKeys) {
      const ballDistance = fromBall?.get(starKey);
      const squareDistance = fromSquare?.get(starKey);
      const distance = Math.min(
        ballDistance ?? Number.POSITIVE_INFINITY,
        squareDistance ?? Number.POSITIVE_INFINITY,
      );
      startCost = Math.min(startCost, distance);
    }

    if (!Number.isFinite(startCost)) return 0;
    return startCost + mstCost(remainingStarKeys);
  };
}

function solveBfs(level: Level, options?: SolveOptions): SolverResult {
  const maxDepth = options?.maxDepth ?? Number.POSITIVE_INFINITY;
  const maxExplored = options?.maxExploredStates ?? DEFAULT_MAX_EXPLORED_STATES;
  const initial = new LevelRunner(level).getState();
  if (initial.completed)
    return { solvable: true, moves: 0, commands: [], exploredStates: 1 };

  const starIndex = starIndexMap(level);
  const dominance: Dominance = new Map();
  remember(dominance, baseKey(initial), remainingMask(starIndex, initial), 0);

  const nodes: SearchNode[] = [
    { state: initial, parent: null, command: null, depth: 0 },
  ];
  let cursor = 0;
  let exploredStates = 0;
  const candidates: readonly SolverCommand[] = [
    ...DIRECTIONS.map((direction) => ({ type: "move" as const, direction })),
    { type: "switch" as const },
  ];

  while (cursor < nodes.length) {
    const nodeIndex = cursor++;
    const node: SearchNode = nodes[nodeIndex]!;
    if (
      isDominatedBesidesSelf(
        dominance,
        baseKey(node.state),
        remainingMask(starIndex, node.state),
        node.depth,
      )
    ) {
      continue;
    }
    exploredStates += 1;
    if (exploredStates > maxExplored) {
      return {
        solvable: false,
        moves: null,
        commands: [],
        exploredStates,
        budgetExhausted: true,
      };
    }
    if (node.depth >= maxDepth) continue;

    for (const command of candidates) {
      const runner = LevelRunner.fromState(node.state);
      const after =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
      if (after.gameOver) continue;
      const childDepth = node.depth + 1;
      if (childDepth > maxDepth) continue;

      if (after.completed) {
        const childIndex = nodes.length;
        nodes.push({
          state: after,
          parent: nodeIndex,
          command,
          depth: childDepth,
        });
        const commands = reconstruct(nodes, childIndex);
        return {
          solvable: true,
          moves: commands.length,
          commands,
          exploredStates,
        };
      }

      const key = baseKey(after);
      const mask = remainingMask(starIndex, after);
      if (isDominated(dominance, key, mask, childDepth)) continue;
      remember(dominance, key, mask, childDepth);

      nodes.push({
        state: after,
        parent: nodeIndex,
        command,
        depth: childDepth,
      });
    }
  }

  return { solvable: false, moves: null, commands: [], exploredStates };
}

function solveAStar(level: Level, options?: SolveOptions): SolverResult {
  const maxDepth = options?.maxDepth ?? Number.POSITIVE_INFINITY;
  const maxExplored = options?.maxExploredStates ?? DEFAULT_MAX_EXPLORED_STATES;
  const initial = new LevelRunner(level).getState();
  if (initial.completed)
    return { solvable: true, moves: 0, commands: [], exploredStates: 1 };

  const heuristic = createHeuristic(level);
  const starIndex = starIndexMap(level);
  const dominance: Dominance = new Map();
  remember(dominance, baseKey(initial), remainingMask(starIndex, initial), 0);
  const nodes: SearchNode[] = [
    { state: initial, parent: null, command: null, depth: 0 },
  ];
  const open = new MinHeap();
  open.push({
    nodeIndex: 0,
    priority: heuristic(initial),
    depth: 0,
  });

  let exploredStates = 0;
  const candidates: readonly SolverCommand[] = [
    ...DIRECTIONS.map((direction) => ({ type: "move" as const, direction })),
    { type: "switch" as const },
  ];

  while (open.size > 0) {
    const entry = open.pop()!;
    const node = nodes[entry.nodeIndex]!;
    if (
      isDominatedBesidesSelf(
        dominance,
        baseKey(node.state),
        remainingMask(starIndex, node.state),
        node.depth,
      )
    ) {
      continue;
    }

    exploredStates += 1;
    if (exploredStates > maxExplored) {
      return {
        solvable: false,
        moves: null,
        commands: [],
        exploredStates,
        budgetExhausted: true,
      };
    }
    if (node.state.completed) {
      return {
        solvable: true,
        moves: node.depth,
        commands: reconstruct(nodes, entry.nodeIndex),
        exploredStates,
      };
    }
    if (node.depth >= maxDepth) continue;

    for (const command of candidates) {
      const runner = LevelRunner.fromState(node.state);
      const after =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
      if (after.gameOver) continue;

      const childDepth = node.depth + 1;
      if (childDepth > maxDepth) continue;
      const key = baseKey(after);
      const mask = remainingMask(starIndex, after);
      if (isDominated(dominance, key, mask, childDepth)) continue;
      remember(dominance, key, mask, childDepth);

      const childIndex = nodes.length;
      nodes.push({
        state: after,
        parent: entry.nodeIndex,
        command,
        depth: childDepth,
      });
      open.push({
        nodeIndex: childIndex,
        priority: childDepth + heuristic(after),
        depth: childDepth,
      });
    }
  }

  return { solvable: false, moves: null, commands: [], exploredStates };
}

function withoutAdvancedMechanics(level: Level): Level {
  const simplified = cloneLevel(level);
  simplified.doors = undefined;
  simplified.switches = undefined;
  simplified.teleporters = undefined;
  return simplified;
}

function replayOnLevel(
  level: Level,
  commands: readonly SolverCommand[],
): GameState {
  return replay(new LevelRunner(level), commands);
}

export function solveLevel(level: Level, options?: SolveOptions): SolverResult {
  const hasAdvancedMechanics =
    (level.doors?.length ?? 0) > 0 || (level.teleporters?.length ?? 0) > 0;

  if (!hasAdvancedMechanics) {
    return solveAStar(level, options);
  }

  const simpleResult = solveAStar(withoutAdvancedMechanics(level), options);
  if (!simpleResult.solvable && simpleResult.budgetExhausted) {
    // The relaxed search already blew the budget; the full-mechanics search
    // can only be worse. Surface the exhaustion instead of digging deeper.
    return simpleResult;
  }
  if (!simpleResult.solvable) {
    return solveBfs(level, options);
  }

  if (replayOnLevel(level, simpleResult.commands).completed) {
    const betterResult = solveAStar(level, {
      maxDepth: simpleResult.moves - 1,
      maxExploredStates: options?.maxExploredStates,
    });
    if (betterResult.solvable) {
      return {
        ...betterResult,
        exploredStates:
          simpleResult.exploredStates + betterResult.exploredStates,
      };
    }

    return {
      ...simpleResult,
      exploredStates: simpleResult.exploredStates + betterResult.exploredStates,
    };
  }

  return solveBfs(level, options);
}

export function replay(
  runner: LevelRunner,
  commands: readonly SolverCommand[],
): GameState {
  let state = runner.getState();
  for (const command of commands)
    state =
      command.type === "move"
        ? runner.move(command.direction)
        : runner.switchForm();
  return state;
}
