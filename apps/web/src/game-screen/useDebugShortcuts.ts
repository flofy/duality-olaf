import { useEffect } from "react";
import { formatDebugCommands, type DebugCommand } from "../debug/CommandRecorder";

const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

export function useDebugShortcuts({
  commands,
  completed,
  nextLevel,
  onClear,
}: {
  commands: DebugCommand[];
  completed: boolean;
  nextLevel: () => void;
  onClear: () => void;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && completed) {
        event.preventDefault();
        nextLevel();
        return;
      }
      if (event.key === "d" || event.key === "D") {
        if (!isDevtoolsEnabled || commands.length === 0) return;
        event.preventDefault();
        void navigator.clipboard?.writeText(formatDebugCommands(commands));
        return;
      }
      if (event.key === "c" || event.key === "C") {
        if (!isDevtoolsEnabled) return;
        onClear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commands, completed, nextLevel, onClear]);
}
