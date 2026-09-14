import type { Level, Position } from "@duality/level-format";
import { LevelRunner, type GameState } from "./LevelRunner";
import type { SolverCommand } from "./LevelSolver";

const DIRECTIONS: readonly Position[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function stateKey(state: GameState): string {
  const stars = state.stars
    .map((s) => `${s.x},${s.y}`)
    .sort()
    .join(";");
  const doors = Object.entries(state.doors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, open]) => `${id}:${open ? 1 : 0}`)
    .join(";");
  return [
    state.activeForm,
    `${state.ball.x},${state.ball.y}`,
    `${state.square.x},${state.square.y}`,
    stars,
    doors,
  ].join("|");
}

/**
 * Does ANY solution complete the level while warping from BOTH teleporter
 * pads? Explores (state × flags) pairs so a pad that only ever warps in one
 * direction cannot satisfy the level's two-way contract.
 */
export function existsSolutionUsingBothPads(
  level: Level,
  maxStates = 250_000,
): boolean {
  const pads = level.teleporters ?? [];
  if (pads.length < 2) return false;
  const padIdAt = (p: Position): string | null =>
    pads.find((t) => t.position.x === p.x && t.position.y === p.y)?.id ?? null;

  const initial = new LevelRunner(level).getState();
  type Node = { state: GameState; a: boolean; b: boolean };
  const nodes: Node[] = [{ state: initial, a: false, b: false }];
  const visited = new Set<string>([`${stateKey(initial)}|0|0`]);
  let cursor = 0;
  while (cursor < nodes.length) {
    const node = nodes[cursor++]!;
    if (node.state.completed) continue;
    if (cursor > maxStates || nodes.length > maxStates) return false;
    const commands: SolverCommand[] = [
      ...DIRECTIONS.map((direction) => ({ type: "move" as const, direction })),
      { type: "switch" as const },
    ];
    for (const command of commands) {
      const runner = LevelRunner.fromState(node.state);
      const after =
        command.type === "move"
          ? runner.move(command.direction)
          : runner.switchForm();
      if (after.gameOver) continue;
      let a = node.a;
      let b = node.b;
      if (after.lastTeleport) {
        const id = padIdAt(after.lastTeleport.from);
        if (id === pads[0]!.id) a = true;
        if (id === pads[1]!.id) b = true;
      }
      const key = `${stateKey(after)}|${a ? 1 : 0}|${b ? 1 : 0}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (after.completed && a && b) return true;
      nodes.push({ state: after, a, b });
    }
  }
  return false;
}

/** Does the given command list toggle a door at any point? */
export function commandsToggleDoor(
  level: Level,
  commands: readonly SolverCommand[],
): boolean {
  const runner = new LevelRunner(level);
  const initial = { ...runner.getState().doors };
  for (const command of commands) {
    const state =
      command.type === "move"
        ? runner.move(command.direction)
        : runner.switchForm();
    for (const id of Object.keys(state.doors)) {
      if (state.doors[id] !== initial[id]) return true;
    }
  }
  return false;
}

/** Does the given command list warp through a teleporter at least once? */
export function commandsWarp(
  level: Level,
  commands: readonly SolverCommand[],
): boolean {
  const runner = new LevelRunner(level);
  for (const command of commands) {
    const state =
      command.type === "move"
        ? runner.move(command.direction)
        : runner.switchForm();
    if (state.lastTeleport) return true;
  }
  return false;
}
