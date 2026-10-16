import type { Direction } from "./GestureInterpreter";

export type GameplayDirection = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

import type { DebugDirection } from "./CommandRecorder";

export function toDebugDirection(direction: GameplayDirection): DebugDirection {
  return direction.x === 1
    ? "RIGHT"
    : direction.x === -1
      ? "LEFT"
      : direction.y === 1
        ? "DOWN"
        : "UP";
}
