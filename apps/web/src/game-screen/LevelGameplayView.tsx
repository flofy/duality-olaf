import type { Level } from "@duality/level-format";
import { solveLevel } from "@duality/game";
import { useMemo, useState } from "react";
import { GameBoard } from "../GameBoard";
import { Button } from "../components/Button";
import { ResetIcon as Reset } from "../components/Icons";
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
  const [swipeEnabled] = useState(getSwipeEnabled);
  const { onPointerDown, onPointerUp } = useSwipeControls(move, swipeEnabled);
  const optimalMoves = useMemo(() => {
    const solution = solveLevel(level);
    return solution.solvable ? solution.moves : null;
  }, [level]);

  return (
    <>
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
      <GameHud
        level={level}
        activeForm={state.activeForm}
        starsRemaining={state.stars.length}
        moves={state.moves}
        optimalMoves={optimalMoves}
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
          onClick={onReset}
          variant="secondary"
          className="restart-button"
        />
      </div>
    </>
  );
}
