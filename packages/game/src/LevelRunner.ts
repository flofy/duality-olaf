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

const DEFAULT_SPEED = 4.2;
const ENTITY_RADIUS = 0.31;
const COLLISION_EPSILON = 0.0001;

export class LevelRunner {
  readonly initialLevel: Level;
  private state: GameState;
  private distanceSinceMove = 0;

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

  /** Move continuously for a frame. The level remains grid-based, but positions are continuous. */
  update(direction: Direction, deltaSeconds: number, speed = DEFAULT_SPEED): GameState {
    if (this.state.completed || deltaSeconds <= 0) return this.getState();

    const length = Math.hypot(direction.x, direction.y);
    if (length === 0) return this.getState();

    // Inputs are deliberately normalized so diagonal input cannot be faster.
    const dx = (direction.x / length) * speed * deltaSeconds;
    const dy = (direction.y / length) * speed * deltaSeconds;
    const current = this.state.activeForm === 'ball' ? this.state.ball : this.state.square;
    const other = this.state.activeForm === 'ball' ? this.state.square : this.state.ball;

    let moved = false;
    moved = this.moveAxis(current, other, 'x', dx) || moved;
    moved = this.moveAxis(current, other, 'y', dy) || moved;

    if (moved) {
      this.distanceSinceMove += Math.hypot(dx, dy);
      if (this.distanceSinceMove >= 1) {
        this.state.moves += Math.floor(this.distanceSinceMove);
        this.distanceSinceMove %= 1;
      }
    }

    if (this.state.activeForm === 'ball') {
      this.state.stars = this.state.stars.filter(
        (star) => Math.hypot(star.x - current.x, star.y - current.y) > ENTITY_RADIUS + 0.18,
      );
      this.state.completed = this.state.stars.length === 0;
    }

    return this.getState();
  }

  /** Compatibility helper for one-cell directional commands and tests. */
  move(direction: Direction): GameState {
    return this.update(direction, 1 / DEFAULT_SPEED, DEFAULT_SPEED);
  }

  reset(): GameState {
    this.state = this.createState(this.initialLevel);
    this.distanceSinceMove = 0;
    return this.getState();
  }

  private moveAxis(
    current: Position,
    other: Position,
    axis: 'x' | 'y',
    amount: number,
  ): boolean {
    if (amount === 0) return false;

    const next = { ...current };
    next[axis] += amount;
    next.x = Math.max(ENTITY_RADIUS, Math.min(this.state.level.width - ENTITY_RADIUS, next.x));
    next.y = Math.max(ENTITY_RADIUS, Math.min(this.state.level.height - ENTITY_RADIUS, next.y));

    if (this.collidesWithWalls(next) || this.collidesWithEntity(next, other)) {
      return false;
    }

    current.x = next.x;
    current.y = next.y;
    return Math.abs(amount) > COLLISION_EPSILON;
  }

  private collidesWithWalls(position: Position): boolean {
    const minX = Math.floor(position.x - ENTITY_RADIUS);
    const maxX = Math.floor(position.x + ENTITY_RADIUS);
    const minY = Math.floor(position.y - ENTITY_RADIUS);
    const maxY = Math.floor(position.y + ENTITY_RADIUS);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (!isInside(this.state.level, { x, y })) return true;
        if (!isWall(this.state.level, { x, y })) continue;

        const closestX = Math.max(x, Math.min(position.x, x + 1));
        const closestY = Math.max(y, Math.min(position.y, y + 1));
        const distance = Math.hypot(position.x - closestX, position.y - closestY);
        if (distance < ENTITY_RADIUS) return true;
      }
    }

    return false;
  }

  private collidesWithEntity(a: Position, b: Position): boolean {
    return Math.hypot(a.x - b.x, a.y - b.y) < ENTITY_RADIUS * 2;
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
