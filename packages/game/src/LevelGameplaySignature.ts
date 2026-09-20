import type { Level } from "@duality/level-format";
import { solveLevel, type SolverCommand } from "./LevelSolver";

export type GameplaySignatureOptions = {
  /** Treat mirror-equivalent command sequences as the same puzzle. */
  includeReflections?: boolean;
};

export type LevelGameplayAnalysis = {
  solvable: boolean;
  moves: number | null;
  commands: SolverCommand[];
  /** Number of movement decisions, independent of slide distance. */
  movementSegments: number;
  switches: number;
  /** Canonical command signature, independent of board coordinates. */
  signature: string | null;
};

const DIRECTIONS = ["R", "L", "D", "U"] as const;
type DirectionCode = (typeof DIRECTIONS)[number];

function directionCode(command: SolverCommand): DirectionCode | null {
  if (command.type !== "move") return null;
  if (command.direction.x > 0) return "R";
  if (command.direction.x < 0) return "L";
  if (command.direction.y > 0) return "D";
  return "U";
}

function transformDirection(
  direction: DirectionCode,
  transform: number,
): DirectionCode {
  const vector = {
    R: { x: 1, y: 0 },
    L: { x: -1, y: 0 },
    D: { x: 0, y: 1 },
    U: { x: 0, y: -1 },
  }[direction];

  let { x, y } = vector;
  if (transform >= 4) x = -x;
  const rotations = transform % 4;
  for (let i = 0; i < rotations; i += 1) {
    [x, y] = [-y, x];
  }

  if (x > 0) return "R";
  if (x < 0) return "L";
  if (y > 0) return "D";
  return "U";
}

function encode(commands: readonly SolverCommand[], transform: number): string {
  return commands
    .map((command) => {
      if (command.type === "switch") return "S";
      return transformDirection(directionCode(command)!, transform);
    })
    .join(",");
}

/**
 * Returns an orientation-independent representation of the solution.
 *
 * A movement command is a continuous slide until the next obstacle, so its
 * distance in cells is intentionally ignored. For example, R and R across
 * different numbers of empty cells are the same movement segment.
 *
 * The 8 dihedral transforms make rotations and reflections equivalent for
 * diversity checks. This describes the puzzle's decision structure rather
 * than its raw grid geometry.
 */
export function gameplaySignature(
  commands: readonly SolverCommand[],
  options: GameplaySignatureOptions = {},
): string {
  const transformCount = options.includeReflections === false ? 4 : 8;
  let best = "";
  for (let transform = 0; transform < transformCount; transform += 1) {
    const candidate = encode(commands, transform);
    if (best === "" || candidate < best) best = candidate;
  }
  return best;
}

export function analyzeLevelGameplay(
  level: Level,
  options: GameplaySignatureOptions = {},
): LevelGameplayAnalysis {
  const result = solveLevel(level);
  if (!result.solvable) {
    return {
      solvable: false,
      moves: null,
      commands: [],
      movementSegments: 0,
      switches: 0,
      signature: null,
    };
  }

  const movementSegments = result.commands.filter(
    (command) => command.type === "move",
  ).length;
  const switches = result.commands.filter(
    (command) => command.type === "switch",
  ).length;

  return {
    solvable: true,
    moves: result.moves,
    commands: result.commands,
    movementSegments,
    switches,
    signature: gameplaySignature(result.commands, options),
  };
}
