import { useCallback, useEffect, useMemo, useState } from "react";
import { LevelRunner } from "@duality/game";
import type { Level } from "@duality/level-format";

export type GameplayDirection = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

const keyboardDirections: Record<string, GameplayDirection> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export function useLevelGameplay(
  level: Level,
  onEscape?: () => void,
  onMove?: (direction: GameplayDirection, moved: boolean) => void,
  onSwitch?: () => void,
  onReset?: () => void,
) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());

  useEffect(() => {
    setState(runner.reset());
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
        onMove?.(
          direction,
          activeBefore.x !== activeAfter.x || activeBefore.y !== activeAfter.y,
        );
        return next;
      });
    },
    [onMove, runner],
  );

  const reset = useCallback(() => {
    setState(runner.reset());
    onReset?.();
  }, [onReset, runner]);

  const switchForm = useCallback(() => {
    setState((current) => {
      if (current.completed || current.gameOver) return current;
      const next = runner.switchForm();
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

  return { runner, state, move, reset, switchForm };
}
