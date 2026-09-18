import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Level } from "@duality/level-format";
import { worlds, levelLabel } from "./levels/campaign";
import { completeLevel, getNextWorld } from "./progression";
import { getActiveThemeName } from "./theme";
import { resolveLevelSkin } from "./skins";
import { GameBoard } from "./GameBoard";
import { Button, DPadButton, CenterDPadButton } from "./components/Button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SwitchForm,
  ResetIcon as Reset,
} from "./components/Icons";
import { interpretGesture, type Direction } from "./input/GestureInterpreter";
import { useLevelGameplay, type GameplayDirection } from "./useLevelGameplay";
import {
  formatDebugCommands,
  type DebugCommand,
  type DebugDirection,
} from "./debug/CommandRecorder";

const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

type GestureStart = {
  x: number;
  y: number;
  interactive: boolean;
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
        <DPadButton
          icon={<ArrowUp size={24} color="var(--text)" />}
          onClick={() => onMove(gestureDirections.up)}
        />
        <DPadButton
          icon={<ArrowLeft size={24} color="var(--text)" />}
          onClick={() => onMove(gestureDirections.left)}
        />
        <DPadButton
          icon={<ArrowDown size={24} color="var(--text)" />}
          onClick={() => onMove(gestureDirections.down)}
        />
        <DPadButton
          icon={<ArrowRight size={24} color="var(--text)" />}
          onClick={() => onMove(gestureDirections.right)}
        />
      </div>
      {hasSquare && (
        <CenterDPadButton
          icon={<SwitchForm size={24} color="var(--text)" />}
          label="CHANGER"
          onClick={onSwitch}
          className="switch-toggle"
        />
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

function CompletionOverlay({
  worldIndex,
  worldLength,
  hasNextWorld,
  completed,
  moves,
  onReset,
  onNext,
}: {
  worldIndex: number;
  worldLength: number;
  hasNextWorld: boolean;
  completed: boolean;
  moves: number;
  onReset: () => void;
  onNext: () => void;
}) {
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
          <Button
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button
            icon={<ArrowRight size={18} />}
            label={
              worldIndex < worldLength - 1
                ? "SUIVANT"
                : hasNextWorld
                  ? "MONDE SUIVANT"
                  : "NIVEAUX"
            }
            onClick={onNext}
            variant="primary"
          />
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
          <Button
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button
            icon={<ArrowLeft size={18} />}
            label="NIVEAUX"
            onClick={() => navigate(`/world/${worldId}`)}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}

export function Game({ level, worldId }: { level: Level; worldId: number }) {
  const navigate = useNavigate();
  const world = worlds.find((item) => item.id === worldId)!;
  const worldIndex = world.levels.findIndex((item) => item.id === level.id);
  const nextWorld = getNextWorld(world.id);
  const seasonalTheme = resolveLevelSkin(level.id);
  const [commands, setCommands] = useState<DebugCommand[]>([]);
  const [start, setStart] = useState<GestureStart | null>(null);

  const nextLevel = useCallback(() => {
    if (worldIndex < world.levels.length - 1) {
      navigate(`/world/${world.id}/level/${world.levels[worldIndex + 1].id}`);
    } else if (nextWorld) {
      // Dernier niveau du monde : enchaîner sur le premier du monde suivant.
      navigate(`/world/${nextWorld.id}/level/${nextWorld.levels[0].id}`);
    } else {
      navigate(`/world/${world.id}`);
    }
  }, [navigate, nextWorld, world, worldIndex]);

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

  // Le burger menu peut demander un reset (menu JEU → RECOMMENCER).
  useEffect(() => {
    const onGameReset = () => reset();
    window.addEventListener("duality:game-reset", onGameReset);
    return () => window.removeEventListener("duality:game-reset", onGameReset);
  }, [reset]);

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
        {/* Retour au monde : icône seule (le contexte « MONDE x » est déjà dans
            le titre), d'où le libellé porté par aria-label. */}
        <Button
          icon={<ArrowLeft size={18} />}
          aria-label={`Retour aux niveaux · monde ${world.id}`}
          onClick={() => navigate(`/world/${world.id}`)}
          variant="secondary"
        />
        <b>
          {levelLabel(worldIndex)} · MONDE {world.id}
        </b>
        <Button
          icon={<Reset size={18} />}
          label="RECOMMENCER"
          onClick={reset}
          variant="secondary"
          className="topbar-restart"
        />
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
      {/* Mobile : RECOMMENCER quitte la barre supérieure pour le bas de l'écran
          (rangée hors .controls, donc insensible à la préférence d'affichage
          des contrôles : on peut toujours relancer le niveau). */}
      <div className="mobile-restart">
        <Button
          icon={<Reset size={18} />}
          label="RECOMMENCER"
          onClick={reset}
          variant="secondary"
          className="restart-button"
        />
      </div>
      {isDevtoolsEnabled && (
        <DebugPanel
          level={level}
          state={state}
          commands={commands}
          onClear={() => setCommands([])}
        />
      )}
      <CompletionOverlay
        worldIndex={worldIndex}
        worldLength={world.levels.length}
        hasNextWorld={Boolean(nextWorld)}
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
