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

function createBaseKey(level: Level): (state: GameState) => string {
  const doorIds = (level.doors ?? []).map((door) => door.id);
  const width = level.width;

  const positionIndex = (position: Position): number =>
    position.x + position.y * width;

  return (state) => {
    let doorMask = 0n;
    for (let i = 0; i < doorIds.length; i += 1) {
      if (state.doors[doorIds[i]!] === true) {
        doorMask |= 1n << BigInt(i);
      }
    }

    return [
      state.activeForm === "ball" ? 0 : 1,
      positionIndex(state.ball),
      positionIndex(state.square),
      doorMask,
    ].join("|");
  };
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

type RelaxedReverseEdge = {
  from: string;
};

type RelaxedReverseGraph = Map<string, RelaxedReverseEdge[]>;

function buildRelaxedReverseGraph(
  graph: RelaxedMovementGraph,
): RelaxedReverseGraph {
  const reverse: RelaxedReverseGraph = new Map();

  for (const [fromKey, moves] of graph) {
    for (const move of moves) {
      const toKey = positionKey(move.position);
      const edges = reverse.get(toKey) ?? [];
      edges.push({ from: fromKey });
      reverse.set(toKey, edges);
    }
  }

  return reverse;
}

function buildRelaxedDistances(
  level: Level,
  graph: RelaxedMovementGraph,
): Map<string, Map<string, number>> {
  const reverse = buildRelaxedReverseGraph(graph);
  const distances = new Map<string, Map<string, number>>();

  for (const star of level.stars) {
    const targetKey = positionKey(star);
    const distanceToStar = new Map<string, number>([[targetKey, 0]]);
    const queue = [targetKey];

    for (const [fromKey, moves] of graph) {
      if (
        moves.some((move) =>
          move.swept.some((cell) => positionKey(cell) === targetKey),
        )
      ) {
        const previousDistance = distanceToStar.get(fromKey);
        if (previousDistance === undefined || previousDistance > 1) {
          distanceToStar.set(fromKey, 1);
          queue.push(fromKey);
        }
      }
    }

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const currentKey = queue[cursor]!;
      const currentDistance = distanceToStar.get(currentKey)!;

      for (const edge of reverse.get(currentKey) ?? []) {
        const nextDistance = currentDistance + 1;
        const previousDistance = distanceToStar.get(edge.from);
        if (
          previousDistance !== undefined &&
          previousDistance <= nextDistance
        ) {
          continue;
        }

        distanceToStar.set(edge.from, nextDistance);
        queue.push(edge.from);
      }
    }

    for (const [fromKey, distance] of distanceToStar) {
      const row = distances.get(fromKey) ?? new Map<string, number>();
      row.set(targetKey, distance);
      distances.set(fromKey, row);
    }
  }

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const position = { x, y };
      if (isWall(level, position)) continue;
      distances.set(
        positionKey(position),
        distances.get(positionKey(position)) ?? new Map(),
      );
    }
  }

  return distances;
}

function createHeuristic(
  level: Level,
  starIndex: ReadonlyMap<string, number>,
): (state: GameState) => number {
  const graph = buildRelaxedMovementGraph(level);
  const distances = buildRelaxedDistances(level, graph);
  const mstCache = new Map<bigint, number>();

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

  const mstCost = (
    remainingStars: readonly string[],
    remainingMaskValue: bigint,
  ): number => {
    const cached = mstCache.get(remainingMaskValue);
    if (cached !== undefined) return cached;
    if (remainingStars.length < 2) {
      mstCache.set(remainingMaskValue, 0);
      return 0;
    }

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

      if (bestStar === null) {
        mstCache.set(remainingMaskValue, 0);
        return 0;
      }
      connected.add(bestStar);
      cost += bestCost;
    }

    mstCache.set(remainingMaskValue, cost);
    return cost;
  };

  const heuristicCache = new Map<string, number>();

  return (state) => {
    if (state.stars.length === 0) return 0;

    const remainingMaskValue = remainingMask(starIndex, state);
    const ballKey = positionKey(state.ball);
    const squareKey = positionKey(state.square);
    const cacheKey = `${ballKey}|${squareKey}|${remainingMaskValue}`;
    const cached = heuristicCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const remainingStarKeys = state.stars.map(positionKey);
    const fromBall = distances.get(ballKey);
    const fromSquare = distances.get(squareKey);

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
    const value = startCost + mstCost(remainingStarKeys, remainingMaskValue);
    heuristicCache.set(cacheKey, value);
    return value;
  };
}

function solveBfs(level: Level, options?: SolveOptions): SolverResult {
  const maxDepth = options?.maxDepth ?? Number.POSITIVE_INFINITY;
  const maxExplored = options?.maxExploredStates ?? DEFAULT_MAX_EXPLORED_STATES;
  const initial = new LevelRunner(level).getState();
  if (initial.completed)
    return { solvable: true, moves: 0, commands: [], exploredStates: 1 };

  const starIndex = starIndexMap(level);
  const stateKey = createBaseKey(level);
  const dominance: Dominance = new Map();
  remember(dominance, stateKey(initial), remainingMask(starIndex, initial), 0);

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
        stateKey(node.state),
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

      const key = stateKey(after);
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

  const starIndex = starIndexMap(level);
  const heuristic = createHeuristic(level, starIndex);
  const stateKey = createBaseKey(level);
  const dominance: Dominance = new Map();
  remember(dominance, stateKey(initial), remainingMask(starIndex, initial), 0);
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
        stateKey(node.state),
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
      const key = stateKey(after);
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
