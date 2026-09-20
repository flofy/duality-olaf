import {
  formatDebugCommands,
  type DebugCommand,
} from "../debug/CommandRecorder";
import type { useLevelGameplay } from "../useLevelGameplay";
import type { Level } from "@duality/level-format";

export function DebugPanel({
  level,
  state,
  commands,
  onClear,
}: {
  level: Level;
  state: ReturnType<typeof useLevelGameplay>["state"];
  commands: DebugCommand[];
  onClear: () => void;
}) {
  const copy = () =>
    void navigator.clipboard?.writeText(formatDebugCommands(commands));

  return (
    <aside className="dev-entry" aria-label="Outils de développement">
      <strong>🐛 DEBUG</strong>
      <span>{level.id}</span>
      <span>
        ● {state.ball.x},{state.ball.y}
        {level.square
          ? ` · ■ ${state.square.x},${state.square.y}`
          : " · ■ absent"}
      </span>
      <span>
        {state.activeForm} · ★ {state.stars.length} · {commands.length}{" "}
        commandes
      </span>
      <span className="muted">
        {commands
          .slice(-8)
          .map((command) =>
            command.type === "switch"
              ? "↔"
              : command.direction === "RIGHT"
                ? "→"
                : command.direction === "LEFT"
                  ? "←"
                  : command.direction === "DOWN"
                    ? "↓"
                    : "↑",
          )
          .join(" ") || "—"}
      </span>
      <div className="modal-actions">
        <button
          className="action"
          type="button"
          disabled={commands.length === 0}
          onClick={copy}
        >
          COPIER
        </button>
        <button className="action" type="button" onClick={onClear}>
          EFFACER
        </button>
      </div>
    </aside>
  );
}
