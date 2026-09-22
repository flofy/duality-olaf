import { useCallback, useEffect, useMemo, useState } from "react";
import { LevelRunner } from "@duality/game";
import type { Level } from "@duality/level-format";
import { playSound, startAudio, toggleSound, vibrate } from "./audioFeedback";

export type GameplayDirection = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

export type MovementFeedback = {
  from: { x: number; y: number };
  direction: GameplayDirection;
} | null;

const keyboardDirections: Record<string, GameplayDirection> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

function countOpenDoors(doors: Record<string, boolean>) {
  return Object.values(doors).filter(Boolean).length;
}

export function useLevelGameplay(
  level: Level,
  onEscape?: () => void,
  onMove?: (direction: GameplayDirection, moved: boolean) => void,
  onSwitch?: () => void,
  onReset?: () => void,
) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());
  const [movement, setMovement] = useState<MovementFeedback>(null);

  useEffect(() => {
    setState(runner.reset());
    setMovement(null);
  }, [runner]);

  const move = useCallback(
    (direction: GameplayDirection) => {
      setState((current) => {
        if (current.completed || current.gameOver) return current;

        const activeBefore =
          current.activeForm === "ball" ? current.ball : current.square;
        const next = runner.move(direction);
        const activeAfter =
          next.activeForm === "ball" ? next.ball : next.square;
        const moved =
          activeBefore.x !== activeAfter.x || activeBefore.y !== activeAfter.y;
        const collected = next.stars.length < current.stars.length;
        const openedDoor =
          countOpenDoors(next.doors) > countOpenDoors(current.doors);
        const teleported =
          Math.abs(activeAfter.x - activeBefore.x) +
            Math.abs(activeAfter.y - activeBefore.y) >
          1;

        if (moved && !teleported) {
          setMovement({
            from: {
              x: activeAfter.x - direction.x,
              y: activeAfter.y - direction.y,
            },
            direction,
          });
        } else {
          setMovement(null);
        }

        void startAudio();
        if (!moved) {
          void playSound("wall");
          vibrate(22);
        } else {
          void playSound("move");
        }
        if (collected) {
          void playSound("collect");
          vibrate([12, 18, 12]);
        }
        if (openedDoor) void playSound("door");
        if (teleported) {
          void playSound("teleport");
          vibrate([8, 20, 8]);
        }
        if (next.gameOver) {
          void playSound("burn");
          vibrate([30, 45, 70]);
        }
        if (next.completed) {
          void playSound("complete");
          vibrate([18, 30, 45]);
        }

        onMove?.(direction, moved);
        return next;
      });
    },
    [onMove, runner],
  );

  const reset = useCallback(() => {
    setState(runner.reset());
    setMovement(null);
    void startAudio();
    void playSound("reset");
    onReset?.();
  }, [onReset, runner]);

  const switchForm = useCallback(() => {
    setState((current) => {
      if (current.completed || current.gameOver) return current;
      const next = runner.switchForm();
      setMovement(null);
      void startAudio();
      void playSound("switch");
      vibrate([10, 25, 10]);
      onSwitch?.();
      return next;
    });
  }, [onSwitch, runner]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        switchForm();
        return;
      }
      if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        toggleSound();
        return;
      }
      if (event.key === "r" || event.key === "R") {
        reset();
        return;
      }
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
      const direction = keyboardDirections[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move, onEscape, reset, switchForm]);

  return { runner, state, movement, move, reset, switchForm };
}
