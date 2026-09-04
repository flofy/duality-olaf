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

function makeWorld2Level(
  number: number,
  ball: Position,
  square: Position,
  stars: Position[],
  walls: Position[] = [],
): Level {
  const level = makeLevel(number, ball, square, stars, walls);
  return { ...level, id: `world-2-level-${String(number).padStart(2, '0')}` };
}

export const world2: Level[] = [
  makeWorld2Level(1, p(1, 1), p(11, 8), [p(5, 1), p(8, 8)], [p(6, 2), p(6, 3), p(6, 4)]),
  makeWorld2Level(2, p(1, 8), p(11, 1), [p(3, 4), p(9, 5)], [p(4, 2), p(4, 3), p(8, 6), p(8, 7)]),
  makeWorld2Level(3, p(2, 1), p(10, 8), [p(6, 1), p(6, 8), p(3, 5)], [p(5, 3), p(6, 3), p(7, 3), p(5, 6), p(6, 6), p(7, 6)]),
  makeWorld2Level(4, p(1, 4), p(11, 4), [p(3, 1), p(9, 8), p(6, 4)], [p(4, 2), p(4, 3), p(4, 6), p(4, 7), p(8, 2), p(8, 3), p(8, 6), p(8, 7)]),
  makeWorld2Level(5, p(1, 1), p(11, 8), [p(11, 1), p(1, 8), p(6, 5)], [p(3, 3), p(4, 3), p(5, 3), p(7, 6), p(8, 6), p(9, 6)]),
  makeWorld2Level(6, p(2, 8), p(10, 1), [p(2, 2), p(10, 7), p(6, 4), p(6, 6)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeWorld2Level(7, p(1, 1), p(11, 8), [p(6, 1), p(6, 8), p(2, 5), p(10, 5)], [p(3, 2), p(3, 3), p(3, 4), p(9, 5), p(9, 6), p(9, 7)]),
  makeWorld2Level(8, p(11, 1), p(1, 8), [p(1, 1), p(11, 8), p(6, 3), p(6, 6)], [p(4, 3), p(5, 3), p(7, 3), p(8, 3), p(4, 6), p(5, 6), p(7, 6), p(8, 6)]),
  makeWorld2Level(9, p(1, 8), p(11, 1), [p(1, 1), p(11, 8), p(6, 4), p(6, 7)], [p(2, 2), p(2, 3), p(2, 6), p(2, 7), p(10, 2), p(10, 3), p(10, 6), p(10, 7)]),
  makeWorld2Level(10, p(2, 1), p(10, 8), [p(5, 2), p(7, 2), p(5, 7), p(7, 7), p(6, 4), p(6, 5)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeWorld2Level(11, p(1, 4), p(11, 5), [p(2, 1), p(10, 1), p(2, 8), p(10, 8), p(6, 3), p(6, 6)], [p(3, 2), p(3, 3), p(3, 6), p(3, 7), p(9, 2), p(9, 3), p(9, 6), p(9, 7)]),
];


function makeWorld3Level(
  number: number,
  ball: Position,
  square: Position,
  stars: Position[],
  walls: Position[] = [],
): Level {
  const level = makeLevel(number, ball, square, stars, walls);
  return { ...level, id: `world-3-level-${String(number).padStart(2, '0')}` };
}

/**
 * World 3 — Coordination.
 *
 * These opening puzzles deliberately introduce the two pieces as mutual
 * stopping points: positioning one form changes where the other can stop.
 */
export const world3: Level[] = [
  // 01 — Premier blocage: an open lane where the square creates the stop.
  makeWorld3Level(1, p(1, 4), p(6, 4), [p(5, 4)]),
  // 02 — La boule comme mur.
  makeWorld3Level(2, p(6, 4), p(1, 4), [p(2, 4)]),
  // 03 — Changer puis utiliser le nouvel obstacle.
  makeWorld3Level(3, p(1, 2), p(6, 7), [p(6, 2), p(5, 7)], [p(3, 4), p(4, 4), p(5, 4), p(7, 5), p(8, 5), p(9, 5)]),
  // 04 — Double interaction autour d'un couloir central.
  makeWorld3Level(4, p(1, 4), p(11, 4), [p(5, 4), p(7, 4), p(6, 1)], [p(4, 2), p(4, 3), p(4, 6), p(4, 7), p(8, 2), p(8, 3), p(8, 6), p(8, 7)]),
  // 05 — Première coordination multi-étapes.
  makeWorld3Level(5, p(2, 1), p(10, 8), [p(6, 1), p(6, 8), p(6, 5)], [p(5, 3), p(6, 3), p(7, 3), p(5, 6), p(6, 6), p(7, 6)]),
  // 06–11 — Coordination avancée : les positions intermédiaires deviennent
  // indispensables pour créer des points d'arrêt utiles.
  makeWorld3Level(6, p(1, 4), p(11, 4), [p(3, 1), p(6, 8), p(10, 1)], [p(2, 3), p(3, 3), p(4, 3), p(8, 6), p(9, 6), p(10, 6)]),
  makeWorld3Level(7, p(2, 8), p(2, 1), [p(10, 8), p(10, 1), p(6, 5)], [p(4, 2), p(5, 2), p(6, 2), p(6, 7), p(7, 7), p(8, 7)]),
  makeWorld3Level(8, p(1, 1), p(1, 8), [p(11, 1), p(11, 8), p(6, 4), p(6, 6)], [p(3, 4), p(4, 4), p(5, 4), p(7, 5), p(8, 5), p(9, 5)]),
  makeWorld3Level(9, p(11, 8), p(11, 1), [p(1, 8), p(1, 1), p(6, 2), p(6, 7)], [p(2, 2), p(2, 3), p(2, 4), p(10, 5), p(10, 6), p(10, 7)]),
  makeWorld3Level(10, p(1, 1), p(3, 8), [p(11, 1), p(11, 8), p(6, 3), p(6, 6)], [p(4, 3), p(5, 3), p(7, 3), p(8, 3), p(4, 6), p(5, 6), p(7, 6), p(8, 6)]),
  makeWorld3Level(11, p(1, 8), p(11, 1), [p(1, 1), p(11, 8), p(6, 4), p(6, 7)], [p(3, 2), p(3, 3), p(3, 6), p(3, 7), p(9, 2), p(9, 3), p(9, 6), p(9, 7)]),
];

function makeWorld4Level(number: number, ball: Position, square: Position, stars: Position[], walls: Position[] = []): Level {
  const level = makeLevel(number, ball, square, stars, walls);
  return { ...level, id: `world-4-level-${String(number).padStart(2, '0')}` };
}

/**
 * World 4 — Combinaisons.
 *
 * The player now chains several setup positions before collecting the stars.
 * Layouts deliberately reuse proven campaign geometry while changing starts,
 * targets and ordering to create longer multi-stage sequences.
 */
export const world4: Level[] = [
  makeWorld4Level(1, p(1, 1), p(11, 8), [p(5, 1), p(8, 8)], [p(6, 2), p(6, 3), p(6, 4)]),
  makeWorld4Level(2, p(1, 8), p(11, 1), [p(3, 4), p(9, 5)], [p(4, 2), p(4, 3), p(8, 6), p(8, 7)]),
  makeWorld4Level(3, p(2, 1), p(10, 8), [p(6, 1), p(6, 8), p(3, 5)], [p(5, 3), p(6, 3), p(7, 3), p(5, 6), p(6, 6), p(7, 6)]),
  makeWorld4Level(4, p(1, 4), p(11, 4), [p(3, 1), p(9, 8), p(6, 4)], [p(4, 2), p(4, 3), p(4, 6), p(4, 7), p(8, 2), p(8, 3), p(8, 6), p(8, 7)]),
  makeWorld4Level(5, p(1, 1), p(11, 8), [p(11, 1), p(1, 8), p(6, 5)], [p(3, 3), p(4, 3), p(5, 3), p(7, 6), p(8, 6), p(9, 6)]),
  makeWorld4Level(6, p(2, 8), p(10, 1), [p(2, 2), p(10, 7), p(6, 4), p(6, 6)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeWorld4Level(7, p(1, 1), p(11, 8), [p(6, 1), p(6, 8), p(2, 5), p(10, 5)], [p(3, 2), p(3, 3), p(3, 4), p(9, 5), p(9, 6), p(9, 7)]),
  makeWorld4Level(8, p(11, 1), p(1, 8), [p(1, 1), p(11, 8), p(6, 3), p(6, 6)], [p(4, 3), p(5, 3), p(7, 3), p(8, 3), p(4, 6), p(5, 6), p(7, 6), p(8, 6)]),
  makeWorld4Level(9, p(1, 8), p(11, 1), [p(1, 1), p(11, 8), p(6, 4), p(6, 7)], [p(2, 2), p(2, 3), p(2, 6), p(2, 7), p(10, 2), p(10, 3), p(10, 6), p(10, 7)]),
  makeWorld4Level(10, p(2, 1), p(10, 8), [p(5, 2), p(7, 2), p(5, 7), p(7, 7), p(6, 4), p(6, 5)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeWorld4Level(11, p(1, 4), p(11, 5), [p(2, 1), p(10, 1), p(2, 8), p(10, 8), p(6, 3), p(6, 6)], [p(3, 2), p(3, 3), p(3, 6), p(3, 7), p(9, 2), p(9, 3), p(9, 6), p(9, 7)]),
];

function makeWorld5Level(number: number, ball: Position, square: Position, stars: Position[], walls: Position[] = []): Level {
  const level = makeLevel(number, ball, square, stars, walls);
  return { ...level, id: `world-5-level-${String(number).padStart(2, '0')}` };
}

/**
 * World 5 — Maîtrise.
 *
 * Final campaign: denser boards, more targets and longer shortest paths.
 * These levels are intentionally presented as the expert endgame set.
 */
export const world5: Level[] = [
  makeWorld5Level(1, p(1, 1), p(2, 1), [p(5, 1), p(5, 7)], [p(3, 2), p(4, 2), p(5, 2), p(7, 5), p(8, 5), p(9, 5)]),
  makeWorld5Level(2, p(1, 8), p(2, 8), [p(11, 1), p(6, 4)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeWorld5Level(3, p(1, 1), p(2, 2), [p(11, 1), p(11, 8), p(1, 8)], [p(3, 3), p(4, 3), p(5, 3), p(7, 6), p(8, 6), p(9, 6)]),
  makeWorld5Level(4, p(11, 8), p(9, 8), [p(1, 1), p(6, 2), p(6, 7)], [p(3, 2), p(3, 3), p(3, 4), p(9, 5), p(9, 6), p(9, 7)]),
  makeWorld5Level(5, p(1, 1), p(11, 8), [p(11, 1), p(1, 8), p(6, 5)], [p(5, 2), p(6, 2), p(7, 2), p(5, 7), p(6, 7), p(7, 7)]),
  makeWorld5Level(6, p(1, 4), p(11, 4), [p(3, 1), p(6, 8), p(10, 1)], [p(2, 3), p(3, 3), p(4, 3), p(8, 6), p(9, 6), p(10, 6)]),
  makeWorld5Level(7, p(2, 8), p(2, 1), [p(10, 8), p(10, 1), p(6, 5)], [p(4, 2), p(5, 2), p(6, 2), p(6, 7), p(7, 7), p(8, 7)]),
  makeWorld5Level(8, p(1, 1), p(1, 8), [p(11, 1), p(11, 8), p(6, 4), p(6, 6)], [p(3, 4), p(4, 4), p(5, 4), p(7, 5), p(8, 5), p(9, 5)]),
  makeWorld5Level(9, p(11, 8), p(11, 1), [p(1, 8), p(1, 1), p(6, 2), p(6, 7)], [p(2, 2), p(2, 3), p(2, 4), p(10, 5), p(10, 6), p(10, 7)]),
  makeWorld5Level(10, p(1, 1), p(3, 8), [p(11, 1), p(11, 8), p(6, 3), p(6, 6)], [p(4, 3), p(5, 3), p(7, 3), p(8, 3), p(4, 6), p(5, 6), p(7, 6), p(8, 6)]),
  makeWorld5Level(11, p(1, 8), p(11, 1), [p(1, 1), p(11, 8), p(6, 4), p(6, 7)], [p(3, 2), p(3, 3), p(3, 6), p(3, 7), p(9, 2), p(9, 3), p(9, 6), p(9, 7)]),
];



export type PuzzleMechanic =
  | 'movement'
  | 'positioning'
  | 'coordination'
  | 'blocking'
  | 'planning'
  | 'precision';

export type PuzzleDifficulty = 'intro' | 'easy' | 'medium' | 'hard' | 'expert';

export const puzzleMechanics: Readonly<Record<PuzzleMechanic, string>> = {
  movement: 'Mouvement',
  positioning: 'Positionnement',
  coordination: 'Coordination',
  blocking: 'Blocage',
  planning: 'Planification',
  precision: 'Précision',
};

export type WorldDesign = {
  mechanics: readonly PuzzleMechanic[];
  difficulty: PuzzleDifficulty;
  goal: string;
};

export const worldDesign: Readonly<Record<number, WorldDesign>> = {
  1: { mechanics: ['movement'], difficulty: 'intro', goal: 'Comprendre le mouvement et les trajectoires.' },
  2: { mechanics: ['positioning', 'planning'], difficulty: 'medium', goal: 'Préparer les positions avant de s’engager.' },
  3: { mechanics: ['coordination', 'blocking'], difficulty: 'hard', goal: 'Utiliser chaque forme comme obstacle pour l’autre.' },
  4: { mechanics: ['coordination', 'blocking', 'planning'], difficulty: 'hard', goal: 'Enchaîner plusieurs positionnements interdépendants.' },
  5: { mechanics: ['coordination', 'blocking', 'planning', 'precision'], difficulty: 'expert', goal: 'Maîtriser les positions critiques et les séquences longues.' },
};

export type WorldDefinition = {
  id: number;
  name: string;
  subtitle: string;
  status: 'available' | 'coming-soon';
  levels: readonly Level[];
};

export const worlds: readonly WorldDefinition[] = [
  { id: 1, name: 'Découverte', subtitle: 'Les bases du mouvement', status: 'available', levels: world1 },
  { id: 2, name: 'Positionnement', subtitle: 'Préparer le terrain', status: 'available', levels: world2 },
  { id: 3, name: 'Coordination', subtitle: 'Faire coopérer les formes', status: 'available', levels: world3 },
  { id: 4, name: 'Combinaisons', subtitle: 'Plusieurs étapes à prévoir', status: 'available', levels: world4 },
  { id: 5, name: 'Maîtrise', subtitle: 'Le défi final', status: 'available', levels: world5 },
];

export const campaign = worlds.flatMap((world) => world.levels);

export function getWorld(world: number): WorldDefinition | undefined {
  return worlds.find((entry) => entry.id === world);
}

export function getLevel(world: number, number: number): Level | undefined {
  return getWorld(world)?.levels[number - 1];
}
