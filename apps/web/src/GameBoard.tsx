import type { GameState } from "@duality/game";
import { isInside, type Level, type Switch } from "@duality/level-format";
import type { CSSProperties, ReactNode } from "react";
import { hexToCss, themes, type ThemeName } from "./theme";
import { getAnimationDuration } from "./animationPreferences";
import { Fire, Star, Door, Teleporter, SwitchIcon } from "./components/Icons";
import { BallCharacter, SquareCharacter } from "./components/Characters";
import type { MovementFeedback } from "./useLevelGameplay";

export function switchGlyph(form: Switch["form"]): string {
  if (form === "ball") return "●";
  if (form === "square") return "■";
  return "⌁";
}

type GameBoardProps = {
  level: Level;
  state: GameState;
  skin: string;
  themeName: ThemeName;
  movement?: MovementFeedback;
  children?: ReactNode;
};

export function GameBoard({
  level,
  state,
  skin,
  themeName,
  movement,
  children,
}: GameBoardProps) {
  const movementDirectionClass = movement
    ? `piece-moving--${movement.direction.x > 0 ? "right" : movement.direction.x < 0 ? "left" : movement.direction.y > 0 ? "down" : "up"}`
    : "";
  const activePieceClass = movement
    ? `piece-moving piece-moving--active ${movementDirectionClass}`
    : "piece-moving";
  const movementDistance = movement?.distance ?? 0;
  // The piece is rendered at its final cell, so the animation starts exactly
  // `distance` cells back and converges to the final position.
  const moveX =
    movement?.direction.x === 1
      ? `-${movementDistance * 100}%`
      : movement?.direction.x === -1
        ? `${movementDistance * 100}%`
        : "0%";
  const moveY =
    movement?.direction.y === 1
      ? `-${movementDistance * 100}%`
      : movement?.direction.y === -1
        ? `${movementDistance * 100}%`
        : "0%";
  // Keep travel speed consistent: long moves take proportionally longer instead of
  // compressing several cells into the same short animation.
  const moveDuration = Math.min(520, 160 + movementDistance * 90);
  const trailLength = `${movementDistance * 100}%`;

  return (
    <div
      className={`board ${skin !== "default" ? `seasonal theme-${skin}` : ""}`}
      style={
        {
          ...Object.fromEntries(
            Object.entries(themes[themeName])
              .filter(([, value]) => typeof value === "number")
              .map(([key, value]) => ["--" + key, hexToCss(value as number)]),
          ),
          "--cols": level.width,
          "--rows": level.height,
        } as CSSProperties
      }
    >
      {level.tiles.flatMap((row, y) =>
        row.map((tile, x) =>
          tile === "wall" ? (
            <div
              className="wall"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`wall-${x}-${y}`}
            />
          ) : tile === "spike" ? (
            <div
              className="fire-container"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`fire-${x}-${y}`}
            >
              <Fire
                size={24}
                color="#ff7a18"
                className="svg-icon svg-icon--fire fire-pulse"
              />
            </div>
          ) : (
            <div
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`empty-${x}-${y}`}
            />
          ),
        ),
      )}
      {level.doors?.map((door) => (
        <div
          className={`door ${state.doors[door.id] ? "open" : ""}`}
          style={{
            gridColumn: door.position.x + 1,
            gridRow: door.position.y + 1,
          }}
          key={door.id}
        >
          <Door
            size={20}
            color={hexToCss(themes[themeName].wall)}
            isOpen={state.doors[door.id]}
            className={`svg-icon svg-icon--door ${state.doors[door.id] ? "door-open" : ""}`}
          />
        </div>
      ))}
      {level.switches?.map((item) => (
        <div
          className={`switch-tile form-${item.form}`}
          style={{
            gridColumn: item.position.x + 1,
            gridRow: item.position.y + 1,
          }}
          key={item.id}
        >
          <SwitchIcon
            size={20}
            color={hexToCss(themes[themeName].star)}
            form={item.form}
            className="svg-icon svg-icon--switch"
          />
        </div>
      ))}
      {level.teleporters?.map((item) => (
        <div
          className="teleporter"
          style={{
            gridColumn: item.position.x + 1,
            gridRow: item.position.y + 1,
          }}
          key={item.id}
        >
          <Teleporter
            size={20}
            color={hexToCss(themes[themeName].accent)}
            className="svg-icon svg-icon--teleporter teleporter-pulse"
          />
        </div>
      ))}
      {state.stars.map((star) => (
        <div
          className="star-container"
          style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }}
          key={`${star.x}-${star.y}`}
        >
          <Star
            size={20}
            color={hexToCss(themes[themeName].star)}
            className="svg-icon svg-icon--star sparkle"
          />
        </div>
      ))}
      {isInside(level, state.ball) && (
        <div
          className={`piece ball ${state.activeForm === "ball" ? "" : "inactive"} ${state.activeForm === "ball" ? activePieceClass : ""}`}
          style={
            {
              gridColumn: state.ball.x + 1,
              gridRow: state.ball.y + 1,
              "--move-x": moveX,
              "--move-y": moveY,
              "--move-duration": `${moveDuration}ms`,
              "--trail-length": trailLength,
              "--piece-color": hexToCss(themes[themeName].ball),
            } as CSSProperties
          }
          key={`ball-${state.ball.x}-${state.ball.y}`}
        >
          <BallCharacter
            size={36}
            color={hexToCss(themes[themeName].ball)}
            expression={
              state.gameOver
                ? "defeated"
                : state.completed
                  ? "happy"
                  : "neutral"
            }
            className="character character-ball"
          />
        </div>
      )}
      {level.square && isInside(level, state.square) && (
        <div
          className={`piece square ${state.activeForm === "square" ? "" : "inactive"} ${state.activeForm === "square" ? activePieceClass : ""}`}
          style={
            {
              gridColumn: state.square.x + 1,
              gridRow: state.square.y + 1,
              "--move-x": moveX,
              "--move-y": moveY,
              "--move-duration": `${moveDuration}ms`,
              "--trail-length": trailLength,
              "--piece-color": hexToCss(themes[themeName].square),
            } as CSSProperties
          }
          key={`square-${state.square.x}-${state.square.y}`}
        >
          <SquareCharacter
            size={36}
            color={hexToCss(themes[themeName].square)}
            expression={
              state.gameOver
                ? "defeated"
                : state.completed
                  ? "happy"
                  : "neutral"
            }
            className="character character-square"
          />
        </div>
      )}
      {children}
    </div>
  );
}
