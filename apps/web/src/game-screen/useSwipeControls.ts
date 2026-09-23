import { useCallback, useState } from "react";
import { interpretGesture } from "../input/GestureInterpreter";
import type { GameplayDirection } from "../useLevelGameplay";
import { gestureDirections } from "./directions";

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [role="dialog"]';

export function useSwipeControls(
  onSwipe: (direction: GameplayDirection) => void,
) {
  const [start, setStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    const target = event.target as Element | null;

    // UI controls own their pointer interaction. Do not let the game's
    // swipe recognizer observe their touch sequence: otherwise mobile
    // browsers can delay/compete with the button click.
    if (target?.closest(INTERACTIVE_SELECTOR)) {
      setStart(null);
      return;
    }

    setStart({ x: event.clientX, y: event.clientY });
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!start) return;

      const result = interpretGesture(
        start,
        { x: event.clientX, y: event.clientY },
        24,
      );
      setStart(null);

      if (result.type === "swipe" && result.direction) {
        onSwipe(gestureDirections[result.direction]);
      }
    },
    [start, onSwipe],
  );

  return { onPointerDown, onPointerUp };
}
