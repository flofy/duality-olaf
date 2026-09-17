import type { Form, Level, Position } from "@duality/level-format";
import { cloneLevel, isInside, isSpike, isWall } from "@duality/level-format";

export type Direction = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
export type DoorState = Record<string, boolean>;

const HIDDEN_POSITION: Position = { x: -1, y: -1 };

export type GameState = {
  level: Level;
  activeForm: Form;
  ball: Position;
  square: Position;
  stars: Position[];
  doors: DoorState;
  moves: number;
  completed: boolean;
  gameOver: boolean;
  /** Set when the last successful move ended with a teleporter warp. */
  lastTeleport: { from: Position; to: Position } | null;
  /** How many pass-over teleports this move has chained so far. */
  teleportsThisMove: number;
};

export class LevelRunner {
  readonly initialLevel: Level;
  private state: GameState;

  constructor(level: Level) {
    this.initialLevel = cloneLevel(level);
    this.state = this.createState(this.initialLevel);
  }

  static fromState(state: GameState): LevelRunner {
    const runner = new LevelRunner(state.level);
    runner.state = {
      level: cloneLevel(state.level),
      activeForm: state.activeForm,
      ball: { ...state.ball },
      square: { ...state.square },
      stars: state.stars.map((star) => ({ ...star })),
      doors: { ...state.doors },
      moves: state.moves,
      completed: state.completed,
      gameOver: state.gameOver,
      lastTeleport: state.lastTeleport
        ? {
            from: { ...state.lastTeleport.from },
            to: { ...state.lastTeleport.to },
          }
        : null,
      teleportsThisMove: state.teleportsThisMove,
    };
    return runner;
  }

  getState(): GameState {
    return {
      ...this.state,
      ball: { ...this.state.ball },
      square: { ...this.state.square },
      stars: this.state.stars.map((star) => ({ ...star })),
      doors: { ...this.state.doors },
      lastTeleport: this.state.lastTeleport
        ? {
            from: { ...this.state.lastTeleport.from },
            to: { ...this.state.lastTeleport.to },
          }
        : null,
      teleportsThisMove: this.state.teleportsThisMove,
    };
  }

  switchForm(): GameState {
    if (!this.initialLevel.square) return this.getState();
    this.state.activeForm =
      this.state.activeForm === "ball" ? "square" : "ball";
    return this.getState();
  }

  move(direction: Direction): GameState {
    if (this.state.gameOver) return this.getState();
    const axis = this.dominantAxis(direction);
    if (axis === null) return this.getState();
    this.state.lastTeleport = null;
    this.state.teleportsThisMove = 0;

    const sign = axis === "x" ? Math.sign(direction.x) : Math.sign(direction.y);
    const current = this.activeEntity();
    const other = this.blockingEntity();
    const swept: Position[] = [];
    let moved = 0;

    for (;;) {
      if (this.state.teleportsThisMove >= 3) break;
      const next: Position = { ...current };
      next[axis] += sign;
      if (!isInside(this.state.level, next)) {
        current.x = next.x;
        current.y = next.y;
        this.state.gameOver = true;
        return this.getState();
      }
      if (!this.isFree(next, other)) break;
      current.x = next.x;
      current.y = next.y;
      moved += 1;
      swept.push({ x: current.x, y: current.y });
      // Spikes are lethal wherever they are placed: sliding onto one — even
      // while passing over — ends the run immediately.
      if (isSpike(this.state.level, current)) {
        this.state.gameOver = true;
        return this.getState();
      }
      if (this.tryTeleport(current, other)) {
        this.state.teleportsThisMove += 1;
        break;
      }
    }

    if (moved === 0) return this.getState();
    this.state.moves += 1;
    this.applySwitches(swept);

    if (this.state.activeForm === "ball") {
      this.state.stars = this.state.stars.filter(
        (star) =>
          !swept.some((cell) => cell.x === star.x && cell.y === star.y) &&
          !(star.x === current.x && star.y === current.y),
      );
      this.state.completed = this.state.stars.length === 0;
    }

    return this.getState();
  }

  reset(): GameState {
    this.state = this.createState(this.initialLevel);
    return this.getState();
  }

  private isFree(cell: Position, other: Position): boolean {
    if (!isInside(this.state.level, cell)) return false;
    if (isWall(this.state.level, cell)) return false;
    if (cell.x === other.x && cell.y === other.y) return false;
    const door = this.state.level.doors?.find(
      (item) => item.position.x === cell.x && item.position.y === cell.y,
    );
    if (door && !this.state.doors[door.id]) return false;
    return true;
  }

  private applySwitches(cells: readonly Position[]): void {
    for (const item of this.state.level.switches ?? []) {
      if (
        !cells.some(
          (cell) => cell.x === item.position.x && cell.y === item.position.y,
        )
      )
        continue;
      if (item.form !== "either" && item.form !== this.state.activeForm)
        continue;
      for (const doorId of item.toggles) {
        if (doorId in this.state.doors)
          this.state.doors[doorId] = !this.state.doors[doorId];
      }
    }
  }

  private tryTeleport(current: Position, other: Position): boolean {
    const entry = this.state.level.teleporters?.find(
      (item) => item.position.x === current.x && item.position.y === current.y,
    );
    if (!entry) return false;
    const target = this.state.level.teleporters?.find(
      (item) => item.id === entry.targetId,
    );
    if (!target) return false;
    if (target.position.x === other.x && target.position.y === other.y) {
      return false;
    }
    this.state.lastTeleport = {
      from: { x: current.x, y: current.y },
      to: { x: target.position.x, y: target.position.y },
    };
    current.x = target.position.x;
    current.y = target.position.y;
    return true;
  }

  private activeEntity(): Position {
    return this.state.activeForm === "ball"
      ? this.state.ball
      : this.state.square;
  }

  private blockingEntity(): Position {
    return this.state.activeForm === "ball"
      ? this.state.square
      : this.state.ball;
  }

  private dominantAxis(direction: Direction): "x" | "y" | null {
    const alongX = Math.abs(direction.x);
    const alongY = Math.abs(direction.y);
    if (alongX === 0 && alongY === 0) return null;
    return alongX >= alongY ? "x" : "y";
  }

  private createState(level: Level): GameState {
    return {
      level: cloneLevel(level),
      activeForm: "ball",
      ball: { ...level.ball },
      square: level.square ? { ...level.square } : { ...HIDDEN_POSITION },
      stars: level.stars.map((star) => ({ ...star })),
      doors: Object.fromEntries(
        (level.doors ?? []).map((door) => [
          door.id,
          door.initiallyOpen === true,
        ]),
      ),
      moves: 0,
      completed: level.stars.length === 0,
      gameOver: false,
      lastTeleport: null,
      teleportsThisMove: 0,
    };
  }
}
