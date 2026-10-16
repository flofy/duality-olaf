import { LevelRunner, type GameState } from "@duality/game";
import type { Level } from "@duality/level-format";
import { onMount } from "svelte";
import {
  playSound,
  setAmbientMuted,
  startAmbient,
  toggleSound,
  vibrate,
} from "../lib/audioFeedback";
import type { GameplayDirection } from "../lib/directions";
import {
  moveAnimationDurationMs,
  prefersReducedMotion,
  teleportAnimationDurationMs,
} from "../lib/movementTiming";

export type { GameplayDirection } from "../lib/directions";
type GameplaySkin = "default" | "halloween" | "christmas";

type TeleportFeedback = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  form: "ball" | "square";
};

export type MovementFeedback = {
  /** Position de la pièce avant le coup. */
  from: { x: number; y: number };
  /** Position finale réelle du glissement, et non la case adjacente à `from`. */
  target: { x: number; y: number };
  direction: GameplayDirection;
  distance: number;
  /** Identifiant stable du coup affiché, pour recréer une animation répétée. */
  sequence: number;
  teleport?: TeleportFeedback;
} | null;

type PauseReason = "visibility" | "animation";

const keyboardDirections: Record<string, GameplayDirection> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

function countOpenDoors(doors: Record<string, boolean>) {
  return Object.values(doors).filter(Boolean).length;
}

type GameplayOptions = {
  onEscape?: () => void;
  onMove?: (direction: GameplayDirection, moved: boolean) => void;
  onSwitch?: () => void;
  onReset?: () => void;
  /** Getter pour que l'ambiance suive le skin quand il change. */
  ambientSkin?: () => GameplaySkin;
};

/**
 * Équivalent Svelte de `useLevelGameplay`. À appeler pendant l'initialisation
 * d'un composant (il utilise onMount et $effect). Le niveau est fixe pour la
 * durée de vie du composant : on remonte le composant pour changer de niveau.
 */
export function createLevelGameplay(
  level: Level,
  options: GameplayOptions = {},
) {
  const runner = new LevelRunner(level);
  // `raw` : l'état est remplacé en bloc à chaque coup, inutile de le proxifier.
  let gameState = $state.raw<GameState>(runner.getState());
  let movement = $state.raw<MovementFeedback>(null);
  let elapsedMs = $state(0);

  let startedAt = Date.now();
  const pauseReasons = new Set<PauseReason>();
  let pausedAt: number | null = null;
  let animationTimeout: number | null = null;

  function clearTimerState() {
    startedAt = Date.now();
    elapsedMs = 0;
    pauseReasons.clear();
    pausedAt = null;
    if (animationTimeout !== null) {
      window.clearTimeout(animationTimeout);
      animationTimeout = null;
    }
  }

  function pauseTimer(reason: PauseReason) {
    if (pauseReasons.has(reason)) return;
    if (pauseReasons.size === 0) pausedAt = Date.now();
    pauseReasons.add(reason);
  }

  function resumeTimer(reason: PauseReason) {
    if (!pauseReasons.delete(reason)) return;
    if (pauseReasons.size > 0) return;
    if (pausedAt === null) return;
    startedAt += Date.now() - pausedAt;
    pausedAt = null;
  }

  function pauseForAnimation(durationMs: number) {
    pauseTimer("animation");
    if (animationTimeout !== null) window.clearTimeout(animationTimeout);
    animationTimeout = window.setTimeout(() => {
      animationTimeout = null;
      movement = null;
      resumeTimer("animation");
    }, durationMs);
  }

  function move(direction: GameplayDirection) {
    const current = gameState;
    if (current.completed || current.gameOver) return;

    const activeBefore =
      current.activeForm === "ball" ? current.ball : current.square;
    const next = runner.move(direction);
    const activeAfter = next.activeForm === "ball" ? next.ball : next.square;
    const moved =
      activeBefore.x !== activeAfter.x || activeBefore.y !== activeAfter.y;
    const collected = next.stars.length < current.stars.length;
    const openedDoor =
      countOpenDoors(next.doors) > countOpenDoors(current.doors);
    const distance =
      Math.abs(activeAfter.x - activeBefore.x) +
      Math.abs(activeAfter.y - activeBefore.y);
    const teleported = next.lastTeleport !== null;

    const reducedMotion = prefersReducedMotion();
    const animating = moved && !teleported && !next.gameOver && !reducedMotion;

    if (moved) {
      if (teleported && next.lastTeleport && !next.gameOver && !reducedMotion) {
        movement = {
          from: { ...activeBefore },
          target: { ...activeAfter },
          direction,
          distance,
          sequence: next.moves,
          teleport: {
            from: { ...next.lastTeleport.from },
            to: { ...next.lastTeleport.to },
            form: current.activeForm,
          },
        };
        pauseForAnimation(teleportAnimationDurationMs());
      } else {
        movement = animating
          ? {
              from: { ...activeBefore },
              target: { ...activeAfter },
              direction,
              distance,
              sequence: next.moves,
            }
          : null;
        if (animating) pauseForAnimation(moveAnimationDurationMs(distance));
      }
    }

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
      const pausedDuration = pausedAt === null ? 0 : Date.now() - pausedAt;
      elapsedMs = Math.max(0, Date.now() - startedAt - pausedDuration);
      void playSound("complete");
      vibrate([18, 30, 45]);
    }

    gameState = next;
    options.onMove?.(direction, moved);
  }

  function reset() {
    gameState = runner.reset();
    movement = null;
    clearTimerState();
    void playSound("reset");
    options.onReset?.();
  }

  function switchForm() {
    const current = gameState;
    if (current.completed || current.gameOver) return;
    const next = runner.switchForm();
    movement = null;
    if (animationTimeout !== null) {
      window.clearTimeout(animationTimeout);
      animationTimeout = null;
      resumeTimer("animation");
    }
    void playSound("switch");
    vibrate([10, 25, 10]);
    gameState = next;
    options.onSwitch?.();
  }

  // L'ambiance sonore suit le niveau et le skin (relancée si le skin change).
  $effect(() => {
    const skin = options.ambientSkin?.() ?? "default";
    void startAmbient(level.id, skin);
  });

  onMount(() => {
    // Chronomètre : ne tourne ni pendant une animation, ni onglet masqué.
    const interval = window.setInterval(() => {
      if (gameState.completed || gameState.gameOver) return;
      if (pauseReasons.size > 0) return;
      elapsedMs = Date.now() - startedAt;
    }, 100);

    const pause = () => {
      pauseTimer("visibility");
      setAmbientMuted(true);
    };
    const resume = () => {
      resumeTimer("visibility");
      setAmbientMuted(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") pause();
      else resume();
    };

    const onKeyDown = (event: KeyboardEvent) => {
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
        options.onEscape?.();
        return;
      }
      const direction = keyboardDirections[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", pause);
    window.addEventListener("focus", resume);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearInterval(interval);
      if (animationTimeout !== null) window.clearTimeout(animationTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", pause);
      window.removeEventListener("focus", resume);
      window.removeEventListener("keydown", onKeyDown);
      setAmbientMuted(false);
    };
  });

  return {
    runner,
    get state() {
      return gameState;
    },
    get movement() {
      return movement;
    },
    get elapsedMs() {
      return elapsedMs;
    },
    move,
    reset,
    switchForm,
  };
}
