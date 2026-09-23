import type { Level } from "@duality/level-format";
import { GameBoard } from "../GameBoard";
import { GameControls } from "./GameControls";
import { GameHud } from "./GameHud";
import { useSwipeControls } from "./useSwipeControls";
import type { MovementFeedback } from "../useLevelGameplay";
import type { useLevelGameplay } from "../useLevelGameplay";

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
  themeName: string;
  move: (direction: { x: -1 | 0 | 1; y: -1 | 0 | 1 }) => void;
  switchForm: () => void;
  onReset: () => void;
}) {
  const { onPointerDown, onPointerUp } = useSwipeControls(move);

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
      />
      <GameControls
        hasSquare={Boolean(level.square)}
        activeForm={state.activeForm}
        onMove={move}
        onSwitch={switchForm}
      />
      <div className="mobile-restart">
        <button
          type="button"
          className="action restart-button"
          onClick={onReset}
        >
          ↻ RECOMMENCER
        </button>
      </div>
    </>
  );
}
