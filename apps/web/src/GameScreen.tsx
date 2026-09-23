import { useCallback, useEffect, useMemo } from "react";
import type { Level } from "@duality/level-format";
import { useNavigate } from "react-router";
import { GameBoard } from "./GameBoard";
import { getActiveThemeName } from "./theme";
import { resolveLevelSkin } from "./skins";
import { calculateLevelResult, completeLevel, getNextWorld } from "./progression";
import { worlds } from "./levels/campaign";
import { useLevelGameplay } from "./useLevelGameplay";
import { solveLevel } from "@duality/game";
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
      navigate(`/world/${nextWorld.id}/level/${nextWorld.levels[0].id}`);
    } else {
      navigate(`/world/${world.id}`);
    }
  }, [navigate, nextWorld, world, worldIndex]);

  const { commands, recordMove, recordSwitch, clear } = useDebugCommands();

  const { state, movement, move, reset, switchForm, elapsedMs } = useLevelGameplay(
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

  const completionResult = useMemo(() => {
    if (!state.completed) return null;
    const solution = solveLevel(level);
    const optimalMoves = solution.solvable && solution.moves !== null ? solution.moves : state.moves;
    return calculateLevelResult(state.moves, optimalMoves, elapsedMs);
  }, [elapsedMs, level, state.completed, state.moves]);

  useEffect(() => {
    if (completionResult) {
      completeLevel(level.id, completionResult);
    }
  }, [completionResult, level.id]);

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
          movement={movement}
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
        activeForm={state.activeForm}
        onMove={move}
        onSwitch={switchForm}
      />
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
        elapsedMs={elapsedMs}
        optimalMoves={completionResult?.optimalMoves ?? null}
        stars={completionResult?.stars ?? null}
        score={completionResult?.score ?? null}
        onReset={reset}
        onNext={nextLevel}
      />
      <GameOverOverlay
        worldId={world.id}
        gameOver={state.gameOver}
        activeForm={state.activeForm}
        onReset={reset}
      />
    </section>
  );
}
