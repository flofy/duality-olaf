import { useCallback, useState } from "react";
import type { DebugCommand, DebugDirection } from "../debug/CommandRecorder";
import type { GameplayDirection } from "../useLevelGameplay";
import { toDebugDirection } from "./directions";

const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

export function useDebugCommands() {
  const [commands, setCommands] = useState<DebugCommand[]>([]);

  const recordMove = useCallback(
    (direction: GameplayDirection, moved: boolean) => {
      if (!moved || !isDevtoolsEnabled) return;
      const debugDirection: DebugDirection = toDebugDirection(direction);
      setCommands((current) => [
        ...current,
        { type: "move", direction: debugDirection },
      ]);
    },
    [],
  );

  const recordSwitch = useCallback(() => {
    if (isDevtoolsEnabled)
      setCommands((current) => [...current, { type: "switch" }]);
  }, []);

  const clear = useCallback(() => {
    if (isDevtoolsEnabled) setCommands([]);
  }, []);

  return { commands, recordMove, recordSwitch, clear };
}

export { isDevtoolsEnabled };
