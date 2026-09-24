import type { GameState } from "@duality/game";
import { isInside, type Level, type Switch } from "@duality/level-format";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { hexToCss, themes, type ThemeName } from "./theme";
import { Fire, Star, Door, Teleporter, SwitchIcon } from "./components/Icons";
import { BallCharacter, SquareCharacter } from "./components/Characters";
import { moveBaseDurationMs, teleportTiming } from "./movementTiming";
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
  const isTeleporting = Boolean(movement?.teleport);
  const movementDirectionClass =
    movement && !isTeleporting
      ? `piece-moving--${movement.direction.x > 0 ? "right" : movement.direction.x < 0 ? "left" : movement.direction.y > 0 ? "down" : "up"}`
      : "";
  const activePieceClass = movement
    ? isTeleporting
      ? "teleporting-piece"
      : `piece-moving--active is-moving ${movementDirectionClass}`
    : "";
  const movementDistance = movement?.distance ?? 0;
  const boardRef = useRef<HTMLDivElement>(null);
  const movingPieceRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);
  const moveX =
    movement && !isTeleporting
      ? `calc(var(--cell-width) * ${movement.target.x - movement.from.x})`
      : "0px";
  const moveY =
    movement && !isTeleporting
      ? `calc(var(--cell-height) * ${movement.target.y - movement.from.y})`
      : "0px";
  // Keep travel speed consistent: long moves take proportionally longer instead of
  // compressing several cells into the same short animation. The duration is
  // shared with the movement timer so the piece is revealed exactly when the
  // animation ends.
  const moveDuration = moveBaseDurationMs(movementDistance);
  const activeColor = hexToCss(
    state.activeForm === "ball"
      ? themes[themeName].ball
      : themes[themeName].square,
  );

  useEffect(() => {
    const board = boardRef.current;
    const piece = movingPieceRef.current;
    const layer = trailLayerRef.current;
    if (!movement || isTeleporting || !board || !piece || !layer) return;

    const boardRect = board.getBoundingClientRect();
    const cellWidth = boardRect.width / level.width;
    const cellHeight = boardRect.height / level.height;
    const startX = (movement.from.x + 0.5) * cellWidth;
    const startY = (movement.from.y + 0.5) * cellHeight;
    const endX = (movement.target.x + 0.5) * cellWidth;
    const endY = (movement.target.y + 0.5) * cellHeight;
    const startedAt = performance.now();
    const duration = moveBaseDurationMs(movement.distance);
    let frame = 0;
    let lastTrailAt = -Infinity;

    const leaveTrailAt = (x: number, y: number) => {
      const particle = document.createElement("span");
      particle.className = "movement-trail-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.opacity = "1";
      particle.style.setProperty("--trail-color", activeColor);
      particle.style.width = "34px";
      particle.style.height = "34px";
      layer.append(particle);
      const fadeOutAt = window.setTimeout(() => {
        particle.style.opacity = "0";
        particle.style.transform = "translate(-50%, -50%) scale(0.25)";
      }, 240);
      window.setTimeout(() => particle.remove(), 700);
      particle.addEventListener(
        "transitionend",
        () => window.clearTimeout(fadeOutAt),
        { once: true },
      );
    };

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      piece.style.transform = `translate3d(${x - startX}px, ${y - startY}px, 0)`;
      if (now - lastTrailAt >= 16) {
        leaveTrailAt(x, y);
        lastTrailAt = now;
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      piece.style.transform = "";
    };
  }, [activeColor, isTeleporting, level.height, level.width, movement]);

  return (
    <div
      ref={boardRef}
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
          "--move-duration": `${moveDuration}ms`,
          "--teleport-departure-duration": `${teleportTiming.departureMs}ms`,
          "--teleport-arrival-delay": `${teleportTiming.arrivalDelayMs}ms`,
          "--teleport-arrival-duration": `${teleportTiming.arrivalMs}ms`,
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
      {movement?.teleport && (
        <>
          <div
            className="teleport-effect teleport-departure"
            style={{
              gridColumn: movement.teleport.from.x + 1,
              gridRow: movement.teleport.from.y + 1,
            }}
            data-teleport-from={`${movement.teleport.from.x},${movement.teleport.from.y}`}
            key={`teleport-departure-${movement.sequence}`}
          >
            {movement.teleport.form === "ball" ? (
              <BallCharacter
                size={36}
                color={hexToCss(themes[themeName].ball)}
                expression="neutral"
                className="character character-ball"
              />
            ) : (
              <SquareCharacter
                size={36}
                color={hexToCss(themes[themeName].square)}
                expression="neutral"
                className="character character-square"
              />
            )}
          </div>
          <div
            className="teleport-effect teleport-arrival"
            style={
              {
                gridColumn: movement.teleport.to.x + 1,
                gridRow: movement.teleport.to.y + 1,
                "--teleport-shift-x": `calc(var(--cell-width) * ${movement.target.x - movement.teleport.to.x})`,
                "--teleport-shift-y": `calc(var(--cell-height) * ${movement.target.y - movement.teleport.to.y})`,
              } as CSSProperties
            }
            data-teleport-to={`${movement.teleport.to.x},${movement.teleport.to.y}`}
            key={`teleport-arrival-${movement.sequence}`}
          >
            {movement.teleport.form === "ball" ? (
              <BallCharacter
                size={36}
                color={hexToCss(themes[themeName].ball)}
                expression="surprised"
                className="character character-ball"
              />
            ) : (
              <SquareCharacter
                size={36}
                color={hexToCss(themes[themeName].square)}
                expression="surprised"
                className="character character-square"
              />
            )}
          </div>
        </>
      )}
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
          ref={state.activeForm === "ball" ? movingPieceRef : undefined}
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
              "--trail-cells": movementDistance,

              "--trail-color": activeColor,
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
          ref={state.activeForm === "square" ? movingPieceRef : undefined}
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
              "--trail-cells": movementDistance,

              "--move-y": state.activeForm === "square" ? moveY : "0px",
              "--move-duration": `${moveDuration}ms`,
              "--trail-color": activeColor,
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
      <div
        ref={trailLayerRef}
        className="movement-trail-layer"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
