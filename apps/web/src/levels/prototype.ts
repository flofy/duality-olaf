import type { Level } from '@duality/level-format';

const WIDTH = 13;
const HEIGHT = 10;

const tiles = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' as const : 'empty' as const,
  ),
);

tiles[2][4] = 'wall';
tiles[2][5] = 'wall';
tiles[3][5] = 'wall';
tiles[4][5] = 'wall';
tiles[5][5] = 'wall';
tiles[6][7] = 'wall';
tiles[7][7] = 'wall';
tiles[8][7] = 'wall';

export const prototypeLevel: Level = {
  id: 'prototype-1',
  width: WIDTH,
  height: HEIGHT,
  tiles,
  ball: { x: 1, y: 1 },
  square: { x: 3, y: 1 },
  stars: [
    { x: 8, y: 1 },
    { x: 10, y: 4 },
    { x: 5, y: 7 },
    { x: 9, y: 8 },
  ],
};
