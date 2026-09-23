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
          icon={<SwitchForm size={24} color="var(--text)" />}
          label={
            <span className={`switch-label switch-label-${activeForm}`}>
              <span
                className={activeForm === "ball" ? "switch-form-active" : ""}
              >
                BOULE
              </span>
              <span aria-hidden="true">↔</span>
              <span
                className={activeForm === "square" ? "switch-form-active" : ""}
              >
                CARRÉ
              </span>
            </span>
          }
          onClick={onSwitch}
          className={`switch-toggle switch-toggle-${activeForm}`}
        />
      )}
    </div>
  );
}
