import type { Position } from './index';

export type ShapeMask = readonly string[];

export function shapeToStars(mask: ShapeMask, offsetX = 0, offsetY = 0): Position[] {
  const stars: Position[] = [];
  mask.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === 'X') stars.push({ x: x + offsetX, y: y + offsetY });
  }));
  return stars;
}

export const BAT_MASK: ShapeMask = [
  'X.......X',
  'XX.....XX',
  '.XX...XX.',
  '..XXXXX..',
  '.XXXXXXX.',
  'XXXXXXXXX',
  'XX.XXX.XX',
  'X...X...X',
];

export const TREE_MASK: ShapeMask = [
  '....X....',
  '...XXX...',
  '..XXXXX..',
  '.XXXXXXX.',
  'XXXXXXXXX',
  '...XXX...',
  '...XXX...',
  '..XXXXX..',
];
