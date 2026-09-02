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

/**
 * Coordinate model: every position (ball, square, star) is the **cell index** it
 * occupies and is always an integer. Entities stay aligned to their cell centre,
 * so a position never holds a fractional value. A press slides the active form
 * from cell to cell along a single row/column and stops at the centre of the
 * last free cell before the first wall or the other form.
 */
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

  /**
   * A single press slides the active form all the way along the dominant axis,
   * one cell at a time, and stops at the centre of the first cell that is a wall
   * / out of bounds / occupied by the other form. Returns the new state.
   */
  move(direction: Direction): GameState {
    const axis = this.dominantAxis(direction);
    if (axis === null) return this.getState();

    const sign = axis === 'x' ? Math.sign(direction.x) : Math.sign(direction.y);
    const current = this.activeEntity();
    const other = this.blockingEntity();
    const swept: Position[] = [];
    let moved = 0;

    // March one whole cell at a time so positions stay integer (cell centres).
    for (;;) {
      const next: Position = { ...current };
      next[axis] += sign;

      if (!this.isFree(next, other)) break;

      current.x = next.x;
      current.y = next.y;
      moved += 1;
      swept.push({ x: current.x, y: current.y });
    }

    if (moved > 0) this.state.moves += 1;

    if (this.state.activeForm === 'ball') {
      // Collect every star swept while passing through each cell.
      this.state.stars = this.state.stars.filter(
        (star) => !swept.some((cell) => cell.x === star.x && cell.y === star.y),
      );
      this.state.completed = this.state.stars.length === 0;
    }

    return this.getState();
  }

  reset(): GameState {
    this.state = this.createState(this.initialLevel);
    return this.getState();
  }

  /** Position is in bounds and not a wall and not occupied by the other form. */
  private isFree(cell: Position, other: Position): boolean {
    if (!isInside(this.state.level, cell)) return false;
    if (isWall(this.state.level, cell)) return false;
    if (cell.x === other.x && cell.y === other.y) return false;
    return true;
  }

  private activeEntity(): Position {
    return this.state.activeForm === 'ball' ? this.state.ball : this.state.square;
  }

  private blockingEntity(): Position {
    return this.state.activeForm === 'ball' ? this.state.square : this.state.ball;
  }

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

type Cell = {
  x: number;
  y: number;
};