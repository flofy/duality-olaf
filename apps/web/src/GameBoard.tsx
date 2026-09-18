import { useEffect, useRef, type CSSProperties } from "react";
import { type Level } from "@duality/level-format";
import { type GameState } from "./useLevelGameplay";
import { resolveLevelSkin, type SkinPreference } from "./skins";
import { getTheme } from "./theme";

export interface GameBoardProps {
  level: Level;
  state: GameState;
  skin?: SkinPreference;
  themeName?: string;
}

const CELL_SIZE = 32;

function cellStyle(
  cell: { x: number; y: number },
  theme: ReturnType<typeof getTheme>,
): CSSProperties {
  const themeColor = theme[cell.y * 8 + cell.x] as number;
  const hexColor = themeColor !== undefined ? `#${themeColor.toString(16).padStart(6, "0")}` : "transparent";
  return {
    position: "absolute",
    left: `${cell.x * CELL_SIZE}px`,
    top: `${cell.y * CELL_SIZE}px`,
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    backgroundColor: hexColor,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };
}

function Star({ x, y, theme }: { x: number; y: number; theme: ReturnType<typeof getTheme> }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE + CELL_SIZE / 2 - 8}px`,
        top: `${y * CELL_SIZE + CELL_SIZE / 2 - 8}px`,
        width: "16px",
        height: "16px",
        backgroundColor: "gold",
        borderRadius: "50%",
        boxShadow: "0 0 8px gold",
      }}
      aria-label="Star"
      style={{ userSelect: "none" }}
    />
  );
}

function Ball({ x, y, active, theme }: { x: number; y: number; active: boolean; theme: ReturnType<typeof getTheme> }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE + 4}px`,
        top: `${y * CELL_SIZE + 4}px`,
        width: `${CELL_SIZE - 8}px`,
        height: `${CELL_SIZE - 8}px`,
        backgroundColor: active ? "var(--ballActive)" : "var(--ballInactive)",
        borderRadius: "50%",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 12px var(--ballActive)" : "none",
      }}
      aria-label={active ? "Active Ball" : "Ball"}
      style={{ userSelect: "none" }}
    />
  );
}

function Square({ x, y, active, theme }: { x: number; y: number; active: boolean; theme: ReturnType<typeof getTheme> }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE + 4}px`,
        top: `${y * CELL_SIZE + 4}px`,
        width: `${CELL_SIZE - 8}px`,
        height: `${CELL_SIZE - 8}px`,
        backgroundColor: active ? "var(--squareActive)" : "var(--squareInactive)",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 12px var(--squareActive)" : "none",
      }}
      aria-label={active ? "Active Square" : "Square"}
      style={{ userSelect: "none" }}
    />
  );
}

function Wall({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE}px`,
        top: `${y * CELL_SIZE}px`,
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        backgroundColor: "var(--wall)",
      }}
      aria-label="Wall"
      style={{ userSelect: "none" }}
    />
  );
}

function Door({
  x,
  y,
  open,
}: {
  x: number;
  y: number;
  open: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE}px`,
        top: `${y * CELL_SIZE}px`,
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        backgroundColor: open ? "var(--doorOpen)" : "var(--doorClosed)",
        border: "2px solid var(--text)",
      }}
      aria-label={open ? "Open Door" : "Closed Door"}
      style={{ userSelect: "none" }}
    />
  );
}

function Switch({
  x,
  y,
  active,
}: {
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE + 4}px`,
        top: `${y * CELL_SIZE + 4}px`,
        width: `${CELL_SIZE - 8}px`,
        height: `${CELL_SIZE - 8}px`,
        backgroundColor: active ? "var(--switchActive)" : "var(--switchInactive)",
        borderRadius: "4px",
      }}
      aria-label={active ? "Active Switch" : "Switch"}
      style={{ userSelect: "none" }}
    />
  );
}

function Portal({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: "orange" | "blue";
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * CELL_SIZE + 4}px`,
        top: `${y * CELL_SIZE + 4}px`,
        width: `${CELL_SIZE - 8}px`,
        height: `${CELL_SIZE - 8}px`,
        backgroundColor: color,
        borderRadius: "50%",
        opacity: 0.7,
      }}
      aria-label={color}
      style={{ userSelect: "none" }}
    />
  );
}

export function GameBoard({ level, state, skin, themeName }: GameBoardProps) {
  const theme = getTheme();
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.style.setProperty(
        "--board-width",
        `${level.width * CELL_SIZE}px`,
      );
      boardRef.current.style.setProperty(
        "--board-height",
        `${level.height * CELL_SIZE}px`,
      );
    }
  }, [level.width, level.height]);

  const boardStyle: CSSProperties = {
    position: "relative",
    width: `${level.width * CELL_SIZE}px`,
    height: `${level.height * CELL_SIZE}px`,
    margin: "0 auto",
    backgroundColor: "var(--background)",
    border: "1px solid var(--text)",
    overflow: "hidden",
    userSelect: "none",
  };

  return (
    <div
      ref={boardRef}
      className="game-board"
      style={boardStyle}
      aria-label="Game Board"
    >
      {level.grid.map((row, y) =>
        row.map((cell, x) => {
          if (cell === "wall") {
            return <Wall key=`${x}-${y}-wall` x={x} y={y} />;
          }
          if (cell === "empty") {
            return (
              <div
                key=`${x}-${y}-empty`
                style={cellStyle({ x, y }, theme)}
                aria-hidden="true"
                style={{ userSelect: "none" }}
              />
            );
          }
          return null;
        }),
      )}

      {level.doors?.map((door, index) => (
        <Door
          key=`door-${index}`
          x={door.x}
          y={door.y}
          open={state.doorsOpen?.includes(index) || false}
        />
      ))}

      {level.switches?.map((sw, index) => (
        <Switch
          key=`switch-${index}`
          x={sw.x}
          y={sw.y}
          active={state.switchesActive?.includes(index) || false}
        />
      ))}

      {level.portals?.map((portal, index) => (
        <Portal
          key=`portal-${index}`
          x={portal.x}
          y={portal.y}
          color={portal.color}
        />
      ))}

      {level.stars.map((star, index) => {
        const collected = state.stars.includes(index);
        if (collected) return null;
        return <Star key=`star-${index}` x={star.x} y={star.y} theme={theme} />;
      })}

      {state.ball && (
        <Ball
          x={state.ball.x}
          y={state.ball.y}
          active={state.activeForm === "ball"}
          theme={theme}
        />
      )}

      {state.square && (
        <Square
          x={state.square.x}
          y={state.square.y}
          active={state.activeForm === "square"}
          theme={theme}
        />
      )}
    </div>
  );
}