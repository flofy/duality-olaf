import type { DebugDirection } from "../debug/CommandRecorder";
import type { Direction } from "../input/GestureInterpreter";
import type { GameplayDirection } from "../useLevelGameplay";

export const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

export function toDebugDirection(direction: GameplayDirection): DebugDirection {
  return direction.x === 1
    ? "RIGHT"
    : direction.x === -1
      ? "LEFT"
      : direction.y === 1
        ? "DOWN"
        : "UP";
}
