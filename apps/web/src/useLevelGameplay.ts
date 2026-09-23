import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LevelRunner } from "@duality/game";
import type { Level } from "@duality/level-format";
import { getAnimationDuration } from "./animationPreferences";
import {
  playSound,
  setAmbientMuted,
  startAudio,
  toggleSound,
  vibrate,
} from "./audioFeedback";

export type GameplayDirection = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

export type MovementFeedback = {
  from: { x: number; y: number };
  direction: GameplayDirection;
  distance: number;
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
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerPauseReasonsRef = useRef<Set<"visibility" | "animation">>(new Set());
  const timerPausedAtRef = useRef<number | null>(null);
  const animationPauseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setState(runner.reset());
    setMovement(null);
    setStartedAt(Date.now());
    setElapsedMs(0);
    timerPauseReasonsRef.current.clear();
    timerPausedAtRef.current = null;
    if (animationPauseTimeoutRef.current !== null) {
      window.clearTimeout(animationPauseTimeoutRef.current);
      animationPauseTimeoutRef.current = null;
    }
  }, [runner]);

  const pauseTimer = useCallback((reason: "visibility" | "animation") => {
    if (timerPauseReasonsRef.current.has(reason)) return;
    if (timerPauseReasonsRef.current.size === 0) {
      timerPausedAtRef.current = Date.now();
    }
    timerPauseReasonsRef.current.add(reason);
  }, []);

  const resumeTimer = useCallback((reason: "visibility" | "animation") => {
    if (!timerPauseReasonsRef.current.delete(reason)) return;
    if (timerPauseReasonsRef.current.size > 0) return;
    const pausedAt = timerPausedAtRef.current;
    if (pausedAt === null) return;
    setStartedAt((current) => current + (Date.now() - pausedAt));
    timerPausedAtRef.current = null;
  }, []);

  const pauseForAnimation = useCallback(
    (baseDurationMs: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      pauseTimer("animation");
      if (animationPauseTimeoutRef.current !== null) {
        window.clearTimeout(animationPauseTimeoutRef.current);
      }
      animationPauseTimeoutRef.current = window.setTimeout(() => {
        animationPauseTimeoutRef.current = null;
        resumeTimer("animation");
      }, getAnimationDuration(baseDurationMs));
    },
    [pauseTimer, resumeTimer],
  );

  useEffect(() => {
    if (state.completed || state.gameOver) return;
    const interval = window.setInterval(() => {
      if (timerPauseReasonsRef.current.size > 0) return;
      setElapsedMs(Date.now() - startedAt);
    }, 100);
    return () => window.clearInterval(interval);
  }, [startedAt, state.completed, state.gameOver]);

  useEffect(() => {
    const pause = () => {
      pauseTimer("visibility");
      setAmbientMuted(true);
    };

    const resume = () => {
      resumeTimer("visibility");
      setAmbientMuted(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pause();
      else resume();
    };

    const handleBlur = () => pause();
    const handleFocus = () => resume();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      setAmbientMuted(false);
    };
  }, [pauseTimer, resumeTimer]);

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
        const distance =
          Math.abs(activeAfter.x - activeBefore.x) +
          Math.abs(activeAfter.y - activeBefore.y);
        const teleported = next.lastTeleport !== null;

        if (moved && !teleported && !next.gameOver) {
          setMovement({
            from: { ...activeBefore },
            direction,
            distance,
          });
        } else {
          setMovement(null);
        }
        if (moved && !teleported && !next.gameOver) {
          pauseForAnimation(Math.min(520, 160 + distance * 90));
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
          const pausedAt = timerPausedAtRef.current;
          const pausedDuration = pausedAt === null ? 0 : Date.now() - pausedAt;
          setElapsedMs(Math.max(0, Date.now() - startedAt - pausedDuration));
          void playSound("complete");
          vibrate([18, 30, 45]);
        }

        onMove?.(direction, moved);
        return next;
      });
    },
    [onMove, pauseForAnimation, runner, startedAt],
  );

  const reset = useCallback(() => {
    setState(runner.reset());
    setMovement(null);
    setStartedAt(Date.now());
    setElapsedMs(0);
    timerPauseReasonsRef.current.clear();
    timerPausedAtRef.current = null;
    if (animationPauseTimeoutRef.current !== null) {
      window.clearTimeout(animationPauseTimeoutRef.current);
      animationPauseTimeoutRef.current = null;
    }
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

  return { runner, state, movement, move, reset, switchForm, elapsedMs };
}
