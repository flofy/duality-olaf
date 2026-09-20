import { useCallback, useEffect } from "react";
import type { Level } from "@duality/level-format";
import { useNavigate } from "react-router";
import { GameBoard } from "./GameBoard";
import { getActiveThemeName } from "./theme";
import { resolveLevelSkin } from "./skins";
import { completeLevel, getNextWorld } from "./progression";
import { worlds } from "./levels/campaign";
import { useLevelGameplay } from "./useLevelGameplay";
import { Button } from "./components/Button";
import { ResetIcon as Reset } from "./components/Icons";
import { CompletionOverlay } from "./game-screen/CompletionOverlay";
import { DebugPanel } from "./game-screen/DebugPanel";
import { GameControls } from "./game-screen/GameControls";
import { GameHud } from "./game-screen/GameHud";
import { GameOverOverlay } from "./game-screen/GameOverOverlay";
import { GameTopbar } from "./game-screen/GameTopbar";
import {
  isDevtoolsEnabled,
  useDebugCommands,
} from "./game-screen/useDebugCommands";
import { useDebugShortcuts } from "./game-screen/useDebugShortcuts";
import { useSwipeControls } from "./game-screen/useSwipeControls";

export function Game({ level, worldId }: { level: Level; worldId: number }) {
  const navigate = useNavigate();
  const world = worlds.find((item) => item.id === worldId)!;
  const worldIndex = world.levels.findIndex((item) => item.id === level.id);
  const nextWorld = getNextWorld(world.id);
  const seasonalTheme = resolveLevelSkin(level.id);

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

  const { commands, recordMove, recordSwitch, clear } = useDebugCommands();

  const { state, move, reset, switchForm } = useLevelGameplay(
    level,
    () => navigate(`/world/${world.id}`),
    recordMove,
    recordSwitch,
    clear,
  );

  useDebugShortcuts({
    commands,
    completed: state.completed,
    nextLevel,
    onClear: clear,
  });

  const { onPointerDown, onPointerUp } = useSwipeControls(move);

  useEffect(() => {
    if (state.completed) completeLevel(level.id);
  }, [level.id, state.completed]);

  // Le burger menu peut demander un reset (menu JEU → RECOMMENCER).
  useEffect(() => {
    const onGameReset = () => reset();
    window.addEventListener("duality:game-reset", onGameReset);
    return () => window.removeEventListener("duality:game-reset", onGameReset);
  }, [reset]);

  return (
    <section
      className="game"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <GameTopbar
        worldId={world.id}
        worldIndex={worldIndex}
        onBack={() => navigate(`/world/${world.id}`)}
        onReset={reset}
      />
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
          onClear={clear}
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
