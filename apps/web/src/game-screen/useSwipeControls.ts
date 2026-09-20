import { useCallback, useState } from "react";
import { interpretGesture } from "../input/GestureInterpreter";
import type { GameplayDirection } from "../useLevelGameplay";
import { gestureDirections } from "./directions";

export function useSwipeControls(onSwipe: (direction: GameplayDirection) => void) {
  const [start, setStart] = useState<{
    x: number;
    y: number;
    interactive: boolean;
  } | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const target = event.target as HTMLElement;
      const interactive = Boolean(
        target.closest('button, a, input, textarea, select, [role="dialog"]'),
      );
      setStart({ x: event.clientX, y: event.clientY, interactive });
    },
    [],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!start) return;
      const result = interpretGesture(
        start,
        { x: event.clientX, y: event.clientY },
        24,
      );
      const wasInteractive = start.interactive;
      setStart(null);
      if (!wasInteractive && result.type === "swipe" && result.direction) {
        onSwipe(gestureDirections[result.direction]);
      }
    },
    [start, onSwipe],
  );

  return { onPointerDown, onPointerUp };
}
