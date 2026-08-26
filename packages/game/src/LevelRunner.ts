import type { Form, Level, Position } from '@duality/level-format';
import { cloneLevel, isInside, isWall, samePosition } from '@duality/level-format';

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
    if (this.state.completed) return this.getState();

    const current = this.state.activeForm === 'ball' ? this.state.ball : this.state.square;
    const next = { x: current.x + direction.x, y: current.y + direction.y };

    if (!isInside(this.state.level, next) || isWall(this.state.level, next)) {
      return this.getState();
    }

    const other = this.state.activeForm === 'ball' ? this.state.square : this.state.ball;
    if (samePosition(next, other)) return this.getState();

    current.x = next.x;
    current.y = next.y;
    this.state.moves += 1;

    if (this.state.activeForm === 'ball') {
      this.state.stars = this.state.stars.filter((star) => !samePosition(star, current));
      this.state.completed = this.state.stars.length === 0;
    }

    return this.getState();
  }

  reset(): GameState {
    this.state = this.createState(this.initialLevel);
    return this.getState();
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
