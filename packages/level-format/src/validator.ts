import type { Level, Tile } from "./index";

const VALID_TILES: readonly Tile[] = ["empty", "wall", "special"];

export function validateLevel(level: Level): void {
  if (!level.id) throw new Error("Level id is required");
  if (!Number.isInteger(level.width) || level.width <= 0) {
    throw new Error(`${level.id}: width must be a positive integer`);
  }
  if (!Number.isInteger(level.height) || level.height <= 0) {
    throw new Error(`${level.id}: height must be a positive integer`);
  }
  if (level.tiles.length !== level.height) {
    throw new Error(`${level.id}: tile row count does not match height`);
  }

  for (const [y, row] of level.tiles.entries()) {
    if (row.length !== level.width) {
      throw new Error(`${level.id}: tile column count is invalid at row ${y}`);
    }
    for (const tile of row) {
      if (!VALID_TILES.includes(tile)) {
        throw new Error(`${level.id}: unknown tile '${tile}'`);
      }
    }
  }

  const positions = [level.ball, level.square, ...level.stars];
  for (const position of positions) {
    if (
      !Number.isInteger(position.x) ||
      !Number.isInteger(position.y) ||
      position.x < 0 ||
      position.x >= level.width ||
      position.y < 0 ||
      position.y >= level.height
    ) {
      throw new Error(`${level.id}: position is outside the grid`);
    }
    if (level.tiles[position.y][position.x] === "wall") {
      throw new Error(`${level.id}: entity cannot be placed on a wall`);
    }
  }
}
