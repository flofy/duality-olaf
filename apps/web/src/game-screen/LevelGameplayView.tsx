import type { Level } from "@duality/level-format";
import { solveLevel } from "@duality/game";
import { useEffect, useMemo, useState } from "react";
import { GameBoard } from "../GameBoard";
import { GameControls } from "./GameControls";
import { GameHud } from "./GameHud";
import { useSwipeControls } from "./useSwipeControls";
import type {
  GameplayDirection,
  MovementFeedback,
  useLevelGameplay,
} from "../useLevelGameplay";
import type { ThemeName } from "../theme";
import { getSwipeEnabled } from "../controls";

type GameplayState = ReturnType<typeof useLevelGameplay>["state"];

export function LevelGameplayView({
  level,
  state,
  movement,
  skin,
  themeName,
  move,
  switchForm,
  onReset,
}: {
  level: Level;
  state: GameplayState;
  movement: MovementFeedback;
  skin: string;
  themeName: ThemeName;
  move: (direction: GameplayDirection) => void;
  switchForm: () => void;
  onReset: () => void;
}) {
  const [swipeEnabled, setSwipeEnabled] = useState(getSwipeEnabled);

  useEffect(() => {
    const sync = () => setSwipeEnabled(getSwipeEnabled());
    window.addEventListener("duality:swipe-preference", sync);
    return () => window.removeEventListener("duality:swipe-preference", sync);
  }, []);

  const { onPointerDown, onPointerUp } = useSwipeControls(move, swipeEnabled);
  const optimalMoves = useMemo(() => {
    const solution = solveLevel(level);
    return solution.solvable ? solution.moves : null;
  }, [level]);

  return (
    <>
      <GameHud
        level={level}
        activeForm={state.activeForm}
        starsRemaining={state.stars.length}
        moves={state.moves}
        optimalMoves={optimalMoves}
        onReset={onReset}
      />
      <div
        className="board-wrap"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <GameBoard
          level={level}
          state={state}
          skin={skin}
          themeName={themeName}
          movement={movement}
        />
      </div>
      <GameControls
        hasSquare={Boolean(level.square)}
        activeForm={state.activeForm}
        onMove={move}
        onSwitch={switchForm}
      />
    </>
  );
}
