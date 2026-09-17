import {
  createEmptyLevel,
  type Level,
  type Position,
  type Tile,
} from "@duality/level-format";
import type { LevelEditorTool } from "../LevelEditorTools";

function same(a: Position | undefined, b: Position): boolean {
  return a !== undefined && a.x === b.x && a.y === b.y;
}

export function inferWorld(levelId: string): number {
  return Number(/world-(\d+)-level-/.exec(levelId)?.[1] ?? 0);
}

export function blankLevel(id: string, width: number, height: number): Level {
  const level = createEmptyLevel(id);
  level.width = width;
  level.height = height;
  level.tiles = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "empty" as Tile),
  );
  level.ball = { x: Math.min(1, width - 1), y: Math.min(1, height - 1) };
  level.square = { x: Math.min(2, width - 1), y: Math.min(1, height - 1) };
  return level;
}

/** Tools that paint the tile layer and support drag-painting. */
export function isDragPaintTool(tool: LevelEditorTool): boolean {
  return tool === "empty" || tool === "wall" || tool === "spike";
}

/**
 * Apply the selected tool at (x, y), mutating `level` in place.
 * Callers must pass a fresh clone (see cloneLevel from @duality/level-format).
 */
export function applyTool(
  level: Level,
  tool: LevelEditorTool,
  x: number,
  y: number,
): void {
  if (tool === "empty" || tool === "wall" || tool === "spike") {
    level.tiles[y]![x] = tool;
  }
  if (tool === "star") {
    const index = level.stars.findIndex((p) => p.x === x && p.y === y);
    if (index >= 0) level.stars.splice(index, 1);
    else level.stars.push({ x, y });
  }
  if (tool === "ball") level.ball = { x, y };
  // The square is optional: clicking its cell again removes it.
  if (tool === "square") {
    level.square = same(level.square, { x, y }) ? undefined : { x, y };
  }
  if (tool === "door") {
    level.doors ??= [];
    const index = level.doors.findIndex((d) => same(d.position, { x, y }));
    if (index >= 0) level.doors.splice(index, 1);
    else {
      level.doors.push({
        id: `door-${level.doors.length + 1}`,
        position: { x, y },
      });
    }
  }
  if (tool === "switch") {
    level.switches ??= [];
    const index = level.switches.findIndex((s) => same(s.position, { x, y }));
    if (index >= 0) level.switches.splice(index, 1);
    else {
      const door = level.doors?.[0];
      level.switches.push({
        id: `switch-${level.switches.length + 1}`,
        position: { x, y },
        form: "either",
        toggles: door ? [door.id] : [],
      });
    }
  }
  if (tool === "teleporter") {
    level.teleporters ??= [];
    const index = level.teleporters.findIndex((t) =>
      same(t.position, { x, y }),
    );
    if (index >= 0) level.teleporters.splice(index, 1);
    else {
      const existing = level.teleporters[0];
      level.teleporters.push({
        id: `teleporter-${level.teleporters.length + 1}`,
        position: { x, y },
        targetId: existing?.id ?? `teleporter-${level.teleporters.length + 2}`,
      });
    }
  }
}

/** Resize the grid, keeping what fits. Returns null when bounds are invalid. */
export function resizeLevel(
  level: Level,
  width: number,
  height: number,
): Level | null {
  if (width < 3 || height < 3 || width > 20 || height > 20) return null;
  const next = blankLevel(level.id, width, height);
  for (let y = 0; y < Math.min(height, level.height); y++) {
    for (let x = 0; x < Math.min(width, level.width); x++) {
      next.tiles[y]![x] = level.tiles[y]![x]!;
    }
  }
  const fits = (p: Position) => p.x < width && p.y < height;
  next.stars = level.stars.filter(fits);
  if (fits(level.ball)) next.ball = level.ball;
  // Preserve square optionality: a ball-only level stays ball-only after resize.
  next.square = undefined;
  if (level.square && fits(level.square)) next.square = level.square;
  next.doors = level.doors?.filter((d) => fits(d.position));
  next.switches = level.switches?.filter((s) => fits(s.position));
  next.teleporters = level.teleporters?.filter((t) => fits(t.position));
  return next;
}
