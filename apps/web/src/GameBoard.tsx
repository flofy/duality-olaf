import type { GameState } from "@duality/game";
import { isInside, type Level, type Switch } from "@duality/level-format";
import type { CSSProperties, ReactNode } from "react";
import { hexToCss, themes, type ThemeName } from "./theme";
import { Fire, Star, Door, Teleporter, SwitchIcon } from "./components/Icons";
import { BallCharacter, SquareCharacter } from "./components/Characters";
import { moveBaseDurationMs } from "./movementTiming";
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
  const activePieceClass = movement ? "piece-moving--active is-moving" : "";
  const movementDistance = movement?.distance ?? 0;
  // Le point d'arrivée est la position réelle après TOUT le glissement. On ne
  // le reconstruit donc jamais avec « from + une case ».
  const moveX = movement
    ? `calc(var(--cell-width) * ${movement.target.x - movement.from.x})`
    : "0px";
  const moveY = movement
    ? `calc(var(--cell-height) * ${movement.target.y - movement.from.y})`
    : "0px";
  // Keep travel speed consistent: long moves take proportionally longer instead of
  // compressing several cells into the same short animation. The duration is
  // shared with the movement timer so the piece is revealed exactly when the
  // animation ends.
  const moveDuration = moveBaseDurationMs(movementDistance);
  const hasIntermediateCells = movementDistance > 1;
  const ghostCells =
    movement && hasIntermediateCells
      ? Array.from({ length: movementDistance - 1 }, (_, index) => ({
          x: movement.from.x + movement.direction.x * (index + 1),
          y: movement.from.y + movement.direction.y * (index + 1),
        }))
      : [];
  const renderActiveCharacter = (ghost = false) =>
    state.activeForm === "ball" ? (
      <BallCharacter
        size={36}
        color={hexToCss(themes[themeName].ball)}
        expression="neutral"
        className={
          ghost
            ? "character movement-ghost-character"
            : "character character-ball"
        }
      />
    ) : (
      <SquareCharacter
        size={36}
        color={hexToCss(themes[themeName].square)}
        expression="neutral"
        className={
          ghost
            ? "character movement-ghost-character"
            : "character character-square"
        }
      />
    );

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
              gridColumn:
                state.activeForm === "ball" && movement
                  ? movement.from.x + 1
                  : state.ball.x + 1,
              gridRow:
                state.activeForm === "ball" && movement
                  ? movement.from.y + 1
                  : state.ball.y + 1,
              "--move-x": state.activeForm === "ball" ? moveX : "0px",
              "--move-y": state.activeForm === "ball" ? moveY : "0px",
              "--move-duration": `${moveDuration}ms`,
              "--piece-color": hexToCss(themes[themeName].ball),
            } as CSSProperties
          }
          data-movement-from={
            state.activeForm === "ball" && movement
              ? `${movement.from.x},${movement.from.y}`
              : undefined
          }
          data-movement-target={
            state.activeForm === "ball" && movement
              ? `${movement.target.x},${movement.target.y}`
              : undefined
          }
          key="ball-piece"
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
              gridColumn:
                state.activeForm === "square" && movement
                  ? movement.from.x + 1
                  : state.square.x + 1,
              gridRow:
                state.activeForm === "square" && movement
                  ? movement.from.y + 1
                  : state.square.y + 1,
              "--move-x": state.activeForm === "square" ? moveX : "0px",
              "--move-y": state.activeForm === "square" ? moveY : "0px",
              "--move-duration": `${moveDuration}ms`,
              "--piece-color": hexToCss(themes[themeName].square),
            } as CSSProperties
          }
          data-movement-from={
            state.activeForm === "square" && movement
              ? `${movement.from.x},${movement.from.y}`
              : undefined
          }
          data-movement-target={
            state.activeForm === "square" && movement
              ? `${movement.target.x},${movement.target.y}`
              : undefined
          }
          key="square-piece"
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
      {ghostCells.map((cell) => (
        <div
          className={`movement-ghost ${movementDirectionClass}`}
          key={`ghost-${cell.x}-${cell.y}`}
          style={
            {
              gridColumn: cell.x + 1,
              gridRow: cell.y + 1,
              "--move-duration": `${moveDuration}ms`,
              "--piece-color": hexToCss(
                state.activeForm === "ball"
                  ? themes[themeName].ball
                  : themes[themeName].square,
              ),
            } as CSSProperties
          }
        >
          {renderActiveCharacter(true)}
        </div>
      ))}
      {children}
    </div>
  );
}
