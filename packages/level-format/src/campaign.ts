import type { Level, Position } from './index';

const p = (x: number, y: number): Position => ({ x, y });
const WIDTH = 13;
const HEIGHT = 10;

function makeLevel(
  number: number,
  ball: Position,
  square: Position,
  stars: Position[],
  walls: Position[] = [],
): Level {
  const tiles = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 'wall' : 'empty',
    ),
  );
  for (const wall of walls) tiles[wall.y][wall.x] = 'wall';

  return {
    id: `world-1-level-${String(number).padStart(2, '0')}`,
    width: WIDTH,
    height: HEIGHT,
    tiles,
    ball,
    square,
    stars,
  };
}

/**
 * Canonical campaign data.
 *
 * Keep gameplay, solver and reporting on this shared definition so a level
 * played in the web app is exactly the level validated by the solver.
 */
const world1Source: Level[] = [
  makeLevel(1, p(1, 1), p(2, 1), [p(5, 1), p(5, 7)], [p(3, 2), p(4, 2), p(5, 2), p(7, 5), p(8, 5), p(9, 5)]),
  makeLevel(2, p(1, 8), p(2, 8), [p(11, 1), p(6, 4)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeLevel(3, p(1, 1), p(2, 2), [p(11, 1), p(11, 8), p(1, 8)], [p(3, 3), p(4, 3), p(5, 3), p(7, 6), p(8, 6), p(9, 6)]),
  makeLevel(4, p(11, 8), p(9, 8), [p(1, 1), p(6, 2), p(6, 7)], [p(3, 2), p(3, 3), p(3, 4), p(9, 5), p(9, 6), p(9, 7)]),
  makeLevel(5, p(1, 1), p(11, 8), [p(11, 1), p(1, 8), p(6, 5)], [p(5, 2), p(6, 2), p(7, 2), p(5, 7), p(6, 7), p(7, 7)]),
  makeLevel(6, p(1, 4), p(11, 4), [p(3, 1), p(6, 8), p(10, 1)], [p(2, 3), p(3, 3), p(4, 3), p(8, 6), p(9, 6), p(10, 6)]),
  makeLevel(7, p(2, 8), p(2, 1), [p(10, 8), p(10, 1), p(6, 5)], [p(4, 2), p(5, 2), p(6, 2), p(6, 7), p(7, 7), p(8, 7)]),
  makeLevel(8, p(1, 1), p(1, 8), [p(11, 1), p(11, 8), p(6, 4), p(6, 6)], [p(3, 4), p(4, 4), p(5, 4), p(7, 5), p(8, 5), p(9, 5)]),
  makeLevel(9, p(11, 8), p(11, 1), [p(1, 8), p(1, 1), p(6, 2), p(6, 7)], [p(2, 2), p(2, 3), p(2, 4), p(10, 5), p(10, 6), p(10, 7)]),
  makeLevel(10, p(1, 1), p(3, 8), [p(11, 1), p(11, 8), p(6, 3), p(6, 6)], [p(4, 3), p(5, 3), p(7, 3), p(8, 3), p(4, 6), p(5, 6), p(7, 6), p(8, 6)]),
  makeLevel(11, p(1, 8), p(11, 1), [p(1, 1), p(11, 8), p(6, 4), p(6, 7)], [p(3, 2), p(3, 3), p(3, 6), p(3, 7), p(9, 2), p(9, 3), p(9, 6), p(9, 7)]),
];

const world1Order = [3, 6, 1, 2, 9, 8, 7, 5, 10, 4, 11] as const;

/**
 * World 1 is ordered by the validated shortest-path difficulty metrics,
 * with the opening levels kept especially approachable.
 */
export const world1: Level[] = world1Order.map((number) => world1Source[number - 1]);

export type WorldDefinition = {
  id: number;
  name: string;
  subtitle: string;
  status: 'available' | 'coming-soon';
  levels: readonly Level[];
};

export const worlds: readonly WorldDefinition[] = [
  { id: 1, name: 'Découverte', subtitle: 'Les bases du mouvement', status: 'available', levels: world1 },
  { id: 2, name: 'Positionnement', subtitle: 'Préparer le terrain', status: 'coming-soon', levels: [] },
  { id: 3, name: 'Coordination', subtitle: 'Faire coopérer les formes', status: 'coming-soon', levels: [] },
  { id: 4, name: 'Combinaisons', subtitle: 'Plusieurs étapes à prévoir', status: 'coming-soon', levels: [] },
  { id: 5, name: 'Maîtrise', subtitle: 'Le défi final', status: 'coming-soon', levels: [] },
];

export const campaign = worlds.flatMap((world) => world.levels);

export function getWorld(world: number): WorldDefinition | undefined {
  return worlds.find((entry) => entry.id === world);
}

export function getLevel(world: number, number: number): Level | undefined {
  return getWorld(world)?.levels[number - 1];
}
