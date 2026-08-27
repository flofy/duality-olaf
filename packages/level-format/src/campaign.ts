import type { Level, Position } from './index'

const p = (x: number, y: number): Position => ({ x, y })

function makeLevel(number: number, ball: Position, square: Position, stars: Position[], extraWalls: Position[] = []): Level {
  const tiles = Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 13 }, (_, x) => (x === 0 || x === 12 || y === 0 || y === 9 ? 'wall' : 'empty') as const),
  )
  for (const wall of extraWalls) tiles[wall.y][wall.x] = 'wall'
  return { id: `world-1-level-${String(number).padStart(2, '0')}`, width: 13, height: 10, tiles, ball, square, stars }
}

const central = [p(6, 1), p(6, 2), p(6, 3), p(3, 5), p(4, 5), p(5, 5), p(8, 5), p(9, 5)]

export const world1: Level[] = [
  makeLevel(1, p(2, 2), p(4, 2), [p(9, 2), p(9, 7)], central),
  makeLevel(2, p(2, 7), p(2, 2), [p(10, 2), p(10, 7)], [p(4, 4), p(5, 4), p(6, 4), p(7, 4), p(8, 4), p(6, 3), p(6, 5)]),
  makeLevel(3, p(2, 2), p(2, 7), [p(10, 2), p(10, 7), p(6, 4)], [p(4, 2), p(4, 3), p(4, 4), p(8, 5), p(8, 6), p(8, 7)]),
  makeLevel(4, p(2, 7), p(2, 2), [p(10, 2), p(10, 7)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(5, p(2, 2), p(10, 7), [p(10, 2), p(2, 7)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(6, p(2, 7), p(10, 2), [p(6, 2), p(6, 7), p(10, 5)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(7, p(2, 2), p(10, 2), [p(2, 7), p(10, 7), p(6, 5)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(8, p(10, 7), p(2, 7), [p(2, 2), p(10, 2), p(6, 4)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(9, p(2, 2), p(6, 7), [p(10, 2), p(10, 7), p(6, 2)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(10, p(10, 2), p(2, 2), [p(2, 7), p(10, 7), p(6, 5)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
  makeLevel(11, p(2, 7), p(10, 2), [p(2, 2), p(10, 7), p(6, 4), p(6, 7)], [p(6, 2), p(6, 3), p(6, 6), p(6, 7), p(3, 5), p(4, 5), p(8, 4), p(9, 4)]),
]

export const campaign = world1

export function getLevel(world: number, number: number): Level | undefined {
  return campaign.find(level => level.id === `world-${world}-level-${String(number).padStart(2, '0')}`)
}
