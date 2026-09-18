import { useCallback, useEffect, useState } from "react";
import { type Level } from "@duality/level-format";
import { useNavigate } from "react-router";
import { GameBoard } from "./GameBoard";
import {
  formatDebugCommands,
  type DebugCommand,
  type DebugDirection,
} from "./debug/CommandRecorder";
import { interpretGesture, type Direction } from "./input/GestureInterpreter";
import {
  getActiveThemeName,
  resolveLevelSkin,
} from "./theme";
import { completeLevel, isLevelCompleted } from "./progression";
import { levelLabel, worlds } from "./levels/campaign";
import { useLevelGameplay, type GameplayDirection } from "./useLevelGameplay";

const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

function GameHud({
  level,
  activeForm,
  starsRemaining,
  moves,
}: {
  level: Level;
  activeForm: "ball" | "square";
  starsRemaining: number;
  moves: number;
}) {
  return (
    <div className="hud">
      <b>{activeForm === "ball" ? "● BOULE" : "■ CARRÉ"}</b>
      <br />
      <span className="muted">
        ★ {level.stars.length - starsRemaining}/{level.stars.length} · {moves}{" "}
        COUPS · swipe ou flèches
      </span>
    </div>
  );
}

function GameControls({
  hasSquare,
  onMove,
  onSwitch,
}: {
  hasSquare: boolean;
  onMove: (direction: GameplayDirection) => void;
  onSwitch: () => void;
}) {
  return (
    <div className="controls">
      <div className="dpad">
        <button className="up" onClick={() => onMove(gestureDirections.up)}>
          ▲
        </button>
        <button onClick={() => onMove(gestureDirections.left)}>◀</button>
        <button onClick={() => onMove(gestureDirections.down)}>▼</button>
        <button onClick={() => onMove(gestureDirections.right)}>▶</button>
      </div>
      {hasSquare && (
        <button className="action switch" onClick={onSwitch}>
          ● ⇄ ■
          <br />
          CHANGER
        </button>
      )}
    </div>
  );
}

function DebugPanel({
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
        {state.activeForm} · ★ {state.stars.length} · {commands.length} commandes
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

function CompletionOverlay({
  worldId,
  worldIndex,
  completed,
  moves,
  onReset,
  onNext,
}: {
  worldId: number;
  worldIndex: number;
  completed: boolean;
  moves: number;
  onReset: () => void;
  onNext: () => void;
}) {
  const navigate = useNavigate();

  if (!completed) return null;

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
      >
        <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
        <p>{moves} coups</p>
        <div className="modal-actions">
          <button className="action" onClick={onReset}>
            REJOUER
          </button>
          <button className="action" onClick={onNext}>
            {worldIndex < worlds[worldId - 1].levels.length - 1
              ? "SUIVANT ▶"
              : "NIVEAUX"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GameOverOverlay({
  worldId,
  gameOver,
  onReset,
}: {
  worldId: number;
  gameOver: boolean;
  onReset: () => void;
}) {
  const navigate = useNavigate();

  if (!gameOver) return null;

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
      >
        <h2 id="gameover-title">✗ GAME OVER</h2>
        <p>Une forme est sortie du niveau…</p>
        <div className="modal-actions">
          <button className="action" onClick={onReset}>
            REJOUER
          </button>
          <button
            className="action"
            onClick={() => navigate(`/world/${worldId}`)}
          >
            ← NIVEAUX
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameScreen({
  level,
  worldId,
}: {
  level: Level;
  worldId: number;
}) {
  const navigate = useNavigate();
  const world = worlds.find((item) => item.id === worldId)!;
  const worldIndex = world.levels.findIndex((item) => item.id === level.id);
  const seasonalTheme = resolveLevelSkin(level.id);
  const [commands, setCommands] = useState<DebugCommand[]>([]);
  const [start, setStart] = useState<{
    x: number;
    y: number;
    interactive: boolean;
  } | null>(null);

  const nextLevel = useCallback(() => {
    if (worldIndex < world.levels.length - 1) {
      navigate(`/world/${world.id}/level/${world.levels[worldIndex + 1].id}`);
    } else {
      navigate(`/world/${world.id}`);
    }
  }, [navigate, world, worldIndex]);

  const { state, move, reset, switchForm } = useLevelGameplay(
    level,
    () => navigate(`/world/${world.id}`),
    (direction, moved) => {
      if (!moved || !isDevtoolsEnabled) return;
      const debugDirection: DebugDirection =
        direction.x === 1
          ? "RIGHT"
          : direction.x === -1
            ? "LEFT"
            : direction.y === 1
              ? "DOWN"
              : "UP";
      setCommands((current) => [
        ...current,
        { type: "move", direction: debugDirection },
      ]);
    },
    () => {
      if (isDevtoolsEnabled)
        setCommands((current) => [...current, { type: "switch" }]);
    },
    () => {
      if (isDevtoolsEnabled) setCommands([]);
    },
  );

  useEffect(() => {
    if (state.completed) completeLevel(level.id);
  }, [level.id, state.completed]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && state.completed) {
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
        setCommands([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commands, nextLevel, state.completed]);

  return (
    <section
      className="game"
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        const interactive = Boolean(
          target.closest('button, a, input, textarea, select, [role="dialog"]'),
        );
        setStart({ x: event.clientX, y: event.clientY, interactive });
      }}
      onPointerUp={(event) => {
        if (!start) return;
        const result = interpretGesture(
          start,
          { x: event.clientX, y: event.clientY },
          24,
        );
        const wasInteractive = start.interactive;
        setStart(null);
        if (!wasInteractive && result.type === "swipe" && result.direction) {
          move(gestureDirections[result.direction]);
        }
      }}
    >
      <div className="topbar">
        <button
          className="action"
          onClick={() => navigate(`/world/${world.id}`)}
        >
          ← NIVEAUX
        </button>
        <b>
          {levelLabel(worldIndex)} · MONDE {world.id}
        </b>
        <button className="action" onClick={reset}>
          ↻
        </button>
      </div>
      <div className="board-wrap">
        <GameBoard
          level={level}
          state={state}
          skin={seasonalTheme ?? "default"}
          themeName={getActiveThemeName()}
        />
      </div>
      <GameHud
        level={level}
        activeForm={state.activeForm}
        starsRemaining={state.stars.length}
        moves={state.moves}
      />
      <GameControls
        hasSquare={Boolean(level.square)}
        onMove={move}
        onSwitch={switchForm}
      />
      {isDevtoolsEnabled && (
        <DebugPanel
          level={level}
          state={state}
          commands={commands}
          onClear={() => setCommands([])}
        />
      )}
      <CompletionOverlay
        worldId={world.id}
        worldIndex={worldIndex}
        completed={state.completed}
        moves={state.moves}
        onReset={reset}
        onNext={nextLevel}
      />
      <GameOverOverlay
        worldId={world.id}
        gameOver={state.gameOver}
        onReset={reset}
      />
    </section>
  );
}
