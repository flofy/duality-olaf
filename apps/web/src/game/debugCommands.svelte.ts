import type { DebugCommand } from "../lib/CommandRecorder";
import { toDebugDirection } from "../lib/directions";
import type { GameplayDirection } from "../lib/directions";
import { isDevtoolsEnabled } from "../lib/devFlags";

/** Enregistre les coups joués (uniquement si VITE_ENABLE_DEVTOOLS=true). */
export function createDebugCommands() {
  let commands = $state<DebugCommand[]>([]);

  return {
    get commands() {
      return commands;
    },
    recordMove(direction: GameplayDirection, moved: boolean) {
      if (!moved || !isDevtoolsEnabled) return;
      commands = [...commands, { type: "move", direction: toDebugDirection(direction) }];
    },
    recordSwitch() {
      if (isDevtoolsEnabled) commands = [...commands, { type: "switch" }];
    },
    clear() {
      if (isDevtoolsEnabled) commands = [];
    },
  };
}
