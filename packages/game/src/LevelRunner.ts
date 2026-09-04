import type { Form, Level, Position } from '@duality/level-format';
import { cloneLevel, isInside, isWall } from '@duality/level-format';

export type Direction = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export type GameState = {
  level: Level;
  activeForm: Form;
  ball: Position;
  square: Position;
  stars: Position[];
  moves: number;
  completed: boolean;
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
      moves: state.moves,
      completed: state.completed,
    };
    return runner;
  }

  getState(): GameState {
    return {
      ...this.state,
      ball: { ...this.state.ball },
      square: { ...this.state.square },
      stars: this.state.stars.map((star) => ({ ...star })),
    };
  }

  switchForm(): GameState {
    this.state.activeForm = this.state.activeForm === 'ball' ? 'square' : 'ball';
    return this.getState();
  }

  move(direction: Direction): GameState {
    const axis = this.dominantAxis(direction);
    if (axis === null) return this.getState();
    const sign = axis === 'x' ? Math.sign(direction.x) : Math.sign(direction.y);
    const current = this.activeEntity();
    const other = this.blockingEntity();
    const swept: Position[] = [];
    let moved = 0;

    for (;;) {
      const next: Position = { ...current };
      next[axis] += sign;
      if (!this.isFree(next, other)) break;
      current.x = next.x;
      current.y = next.y;
      moved += 1;
      swept.push({ x: current.x, y: current.y });
    }

    if (moved === 0) return this.getState();
    this.state.moves += 1;
    this.applyTeleport(current);

    if (this.state.activeForm === 'ball') {
      this.state.stars = this.state.stars.filter(
        (star) => !swept.some((cell) => cell.x === star.x && cell.y === star.y) &&
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
    return true;
  }

  private applyTeleport(current: Position): void {
    const entry = this.state.level.teleporters?.find((item) => item.position.x === current.x && item.position.y === current.y);
    if (!entry) return;
    const target = this.state.level.teleporters?.find((item) => item.id === entry.targetId);
    if (!target) return;
    const other = this.blockingEntity();
    if (target.position.x === other.x && target.position.y === other.y) return;
    current.x = target.position.x;
    current.y = target.position.y;
  }

  private activeEntity(): Position { return this.state.activeForm === 'ball' ? this.state.ball : this.state.square; }
  private blockingEntity(): Position { return this.state.activeForm === 'ball' ? this.state.square : this.state.ball; }

  private dominantAxis(direction: Direction): 'x' | 'y' | null {
    const alongX = Math.abs(direction.x);
    const alongY = Math.abs(direction.y);
    if (alongX === 0 && alongY === 0) return null;
    return alongX >= alongY ? 'x' : 'y';
  }

  private createState(level: Level): GameState {
    return {
      level: cloneLevel(level),
      activeForm: 'ball',
      ball: { ...level.ball },
      square: { ...level.square },
      stars: level.stars.map((star) => ({ ...star })),
      moves: 0,
      completed: level.stars.length === 0,
    };
  }
}
