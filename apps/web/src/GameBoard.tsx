import type { GameState } from "@duality/game";
import { isInside, type Level, type Switch } from "@duality/level-format";
import type { CSSProperties, ReactNode } from "react";
import { hexToCss, themes, type ThemeName } from "./theme";
import {
  Spike,
  Ball,
  Square,
  Star,
  Door,
  Teleporter,
  SwitchIcon,
} from "./components/Icons";

/**
 * Visual glyph for a switch, distinguishing which form(s) can trigger it.
 * - "either": both the ball and the square can activate it.
 * - "ball" / "square": only that form can activate it.
 */
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
  /** Rendered inside the board, on top of the pieces (game-over overlay…). */
  children?: ReactNode;
};

/**
 * The single board renderer shared by the campaign game (AppRouter), the
 * playground and the level-editor test view (LevelLab.LabGame).
 */
export function GameBoard({
  level,
  state,
  skin,
  themeName,
  children,
}: GameBoardProps) {
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
              className="spike-container"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`spike-${x}-${y}`}
            >
              <Spike
                size={20}
                color={hexToCss(themes[themeName].wall)}
                className="svg-icon svg-icon--spike spike-pulse"
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
          className={`piece ball ${state.activeForm === "ball" ? "" : "inactive"} piece-moving`}
          style={{
            gridColumn: state.ball.x + 1,
            gridRow: state.ball.y + 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          key={`ball-${state.ball.x}-${state.ball.y}`}
        >
          <Ball
            size={24}
            color={hexToCss(themes[themeName].ball)}
            className={`svg-icon svg-icon--ball ${state.activeForm === "ball" ? "svg-icon--active" : "svg-icon--disabled"}`}
          />
        </div>
      )}

      {level.square && isInside(level, state.square) && (
        <div
          className={`piece square ${state.activeForm === "square" ? "" : "inactive"} piece-moving`}
          style={{
            gridColumn: state.square.x + 1,
            gridRow: state.square.y + 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          key={`square-${state.square.x}-${state.square.y}`}
        >
          <Square
            size={24}
            color={hexToCss(themes[themeName].square)}
            className={`svg-icon svg-icon--square ${state.activeForm === "square" ? "svg-icon--active" : "svg-icon--disabled"}`}
          />
        </div>
      )}

      {children}
    </div>
  );
}
