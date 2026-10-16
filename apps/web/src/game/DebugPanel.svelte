<script lang="ts">
  import type { GameState } from "@duality/game";
  import type { Level } from "@duality/level-format";
  import { formatDebugCommands, type DebugCommand } from "../lib/CommandRecorder";

  let {
    level,
    gameState,
    commands,
    onClear,
  }: {
    level: Level;
    gameState: GameState;
    commands: DebugCommand[];
    onClear: () => void;
  } = $props();

  const trace = $derived(
    commands
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
      .join(" ") || "—",
  );

  function copy() {
    void navigator.clipboard?.writeText(formatDebugCommands(commands));
  }
</script>

<aside class="dev-entry" aria-label="Outils de développement">
  <strong>🐛 DEBUG</strong>
  <span>{level.id}</span>
  <span>
    ● {gameState.ball.x},{gameState.ball.y}{level.square
      ? ` · ■ ${gameState.square.x},${gameState.square.y}`
      : " · ■ absent"}
  </span>
  <span>{gameState.activeForm} · ★ {gameState.stars.length} · {commands.length} commandes</span>
  <span class="muted">{trace}</span>
  <div class="modal-actions">
    <button class="action" type="button" disabled={commands.length === 0} onclick={copy}>COPIER</button>
    <button class="action" type="button" onclick={onClear}>EFFACER</button>
  </div>
</aside>
