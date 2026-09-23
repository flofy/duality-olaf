import { DPadButton, CenterDPadButton } from "../components/Button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SwitchForm,
} from "../components/Icons";
import { gestureDirections } from "./directions";
import type { GameplayDirection } from "../useLevelGameplay";

export function GameControls({
  hasSquare,
  activeForm,
  onMove,
  onSwitch,
}: {
  hasSquare: boolean;
  activeForm: "ball" | "square";
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
          icon={
            <SwitchForm
              size={24}
              color="var(--text)"
              form={activeForm === "ball" ? "square" : "ball"}
            />
          }
          label={activeForm === "ball" ? "CARRÉ" : "BOULE"}
          onClick={onSwitch}
          className={`switch-toggle switch-toggle-${activeForm === "ball" ? "square" : "ball"}`}
        />
      )}
    </div>
  );
}
