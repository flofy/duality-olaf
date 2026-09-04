export const GRID_WIDTH = 13;
export const GRID_HEIGHT = 10;

export type Tile = 'empty' | 'wall' | 'special';
export type Position = { x: number; y: number };
export type Form = 'ball' | 'square';
export type Teleporter = { id: string; position: Position; targetId: string };

export type Level = {
  id: string;
  width: number;
  height: number;
  tiles: Tile[][];
  ball: Position;
  square: Position;
  stars: Position[];
  teleporters?: Teleporter[];
};

export function createEmptyLevel(id = 'prototype-1'): Level {
  return {
    id,
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    tiles: Array.from({ length: GRID_HEIGHT }, () => Array.from({ length: GRID_WIDTH }, () => 'empty' as Tile)),
    ball: { x: 1, y: 1 }, square: { x: 2, y: 1 }, stars: [],
  };
}

export function isInside(level: Level, position: Position): boolean {
  return position.x >= 0 && position.x < level.width && position.y >= 0 && position.y < level.height;
}
export function isWall(level: Level, position: Position): boolean {
  return isInside(level, position) && level.tiles[position.y][position.x] === 'wall';
}
export function samePosition(a: Position, b: Position): boolean { return a.x === b.x && a.y === b.y; }
export function clonePosition(position: Position): Position { return { ...position }; }
export function cloneLevel(level: Level): Level {
  return {
    ...level, tiles: level.tiles.map((row) => [...row]), ball: clonePosition(level.ball), square: clonePosition(level.square),
    stars: level.stars.map(clonePosition), teleporters: level.teleporters?.map((item) => ({ ...item, position: clonePosition(item.position) })),
  };
}
export { campaign, world1, world2, worlds, getWorld, getLevel } from './campaign';
export type { WorldDefinition } from './campaign';
export { teleporterTutorials } from './teleporters';
