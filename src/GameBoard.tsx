import React, { useMemo, type CSSProperties } from "react";
import type { Level, Entity } from "@duality/level-format";
import type { GameState } from "./useLevelGameplay";
import { getTheme } from "./theme";
import {
  Ball,
  Square,
  Spike,
  Star,
  Door,
  Teleporter,
  SwitchIcon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "./components/Icons";

export type GameBoardProps = {
  level: Level;
  state: GameState;
  skin: string;
  themeName: string;
};

type CellProps = {
  entity: Entity;
  size: number;
  isStarCollected: boolean;
  isDoorOpen: (doorId: string) => boolean;
  skin: string;
  themeName: string;
};

function Cell({ entity, size, isStarCollected, isDoorOpen, skin, themeName }: CellProps) {
  const theme = getTheme();
  const cellStyle: CSSProperties = {
    width: size,
    height: size,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: `var(--bg, ${theme.bg})`,
  };

  const getEntityComponent = () => {
    switch (entity.type) {
      case "empty":
        return null;
      case "wall":
        return (
          <div
            style={{
              width: size * 0.8,
              height: size * 0.8,
              backgroundColor: `var(--wall, ${theme.wall})`,
              borderRadius: "2px",
            }}
          />
        );
      case "ball":
        return <Ball size={size * 0.7} color="var(--ball, #4aa3ff)" />;
      case "square":
        return <Square size={size * 0.7} color="var(--square, #ffd447)" />;
      case "spike":
        return <Spike size={size * 0.6} color="var(--spike, #ff4444)" />;
      case "star":
        if (isStarCollected) return null;
        return (
          <Star
            size={size * 0.6}
            color="var(--star, #ffd700)"
            className="star-collectible"
          />
        );
      case "door":
        const isOpen = isDoorOpen(entity.id);
        return (
          <Door
            size={size * 0.8}
            color={isOpen ? "var(--doorOpen, #4CAF50)" : "var(--door, #7a5c3d)"}
            isOpen={isOpen}
          />
        );
      case "teleporter":
        return (
          <Teleporter
            size={size * 0.7}
            color="var(--teleporter, #9b59b6)"
            className="teleporter-entity"
          />
        );
      case "switch":
        return (
          <SwitchIcon
            size={size * 0.6}
            color="var(--switch, #ffd447)"
            form={entity.form}
          />
        );
      case "arrow":
        const ArrowComponent = {
          up: ArrowUp,
          down: ArrowDown,
          left: ArrowLeft,
          right: ArrowRight,
        }[entity.direction];
        return ArrowComponent ? (
          <ArrowComponent size={size * 0.6} color="var(--arrow, #ffffff)" />
        ) : null;
      default:
        return null;
    }
  };

  return <div style={cellStyle}>{getEntityComponent()}</div>;
}

export function GameBoard({ level, state, skin, themeName }: GameBoardProps) {
  const cellSize = 40;
  const collectedStarIds = useMemo(() => new Set(state.stars.map((s) => `${s.x},${s.y}`)), [state.stars]);
  const openDoors = useMemo(() => new Set(state.openDoors), [state.openDoors]);

  const isDoorOpen = (doorId: string) => openDoors.has(doorId);
  const isStarCollected = (x: number, y: number) => collectedStarIds.has(`${x},${y}`);

  const boardStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${level.width}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${level.height}, ${cellSize}px)`,
    gap: "1px",
    backgroundColor: `var(--gridGap, rgba(255, 255, 255, 0.1))`,
    borderRadius: "4px",
    padding: "4px",
    background: `var(--boardBg, ${getTheme().boardBg})`,
  };

  return (
    <div className="game-board" style={boardStyle}>
      {Array.from({ length: level.height }, (_, y) =>
        Array.from({ length: level.width }, (_, x) => {
          const entity = level.grid[y][x];
          const starCollected = entity.type === "star" && isStarCollected(x, y);
          return (
            <Cell
              key={`${x}-${y}`}
              entity={entity}
              size={cellSize}
              isStarCollected={starCollected}
              isDoorOpen={isDoorOpen}
              skin={skin}
              themeName={themeName}
            />
          );
        }),
      )}
    </div>
  );
}