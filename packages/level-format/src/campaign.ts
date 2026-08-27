import { createLevel, type Level } from './level'

const W = (x: number, y: number) => ({ x, y })

export const world1: Level[] = [
  createLevel({ world: 1, number: 1, width: 13, height: 10, ball: W(2, 2), square: W(4, 2), stars: [W(9, 2), W(9, 7)], walls: [
    ...Array.from({ length: 13 }, (_, x) => W(x, 0)),
    ...Array.from({ length: 13 }, (_, x) => W(x, 9)),
    ...Array.from({ length: 8 }, (_, y) => W(0, y + 1)),
    ...Array.from({ length: 8 }, (_, y) => W(12, y + 1)),
    W(6, 1), W(6, 2), W(6, 3), W(3, 5), W(4, 5), W(5, 5), W(8, 5), W(9, 5),
  ] }),
  createLevel({ world: 1, number: 2, width: 13, height: 10, ball: W(2, 7), square: W(2, 2), stars: [W(10, 2), W(10, 7)], walls: [
    ...Array.from({ length: 13 }, (_, x) => W(x, 0)), ...Array.from({ length: 13 }, (_, x) => W(x, 9)),
    ...Array.from({ length: 8 }, (_, y) => W(0, y + 1)), ...Array.from({ length: 8 }, (_, y) => W(12, y + 1)),
    ...Array.from({ length: 6 }, (_, x) => W(x + 4, 4)), W(6, 3), W(6, 5),
  ] }),
  createLevel({ world: 1, number: 3, width: 13, height: 10, ball: W(2, 2), square: W(2, 7), stars: [W(10, 2), W(10, 7), W(6, 4)], walls: [
    ...Array.from({ length: 13 }, (_, x) => W(x, 0)), ...Array.from({ length: 13 }, (_, x) => W(x, 9)),
    ...Array.from({ length: 8 }, (_, y) => W(0, y + 1)), ...Array.from({ length: 8 }, (_, y) => W(12, y + 1)),
    W(4, 2), W(4, 3), W(4, 4), W(8, 5), W(8, 6), W(8, 7),
  ] }),
]

function corridor(number: number, ball: { x: number; y: number }, square: { x: number; y: number }, stars: { x: number; y: number }[]): Level {
  const walls = [
    ...Array.from({ length: 13 }, (_, x) => W(x, 0)), ...Array.from({ length: 13 }, (_, x) => W(x, 9)),
    ...Array.from({ length: 8 }, (_, y) => W(0, y + 1)), ...Array.from({ length: 8 }, (_, y) => W(12, y + 1)),
    W(6, 2), W(6, 3), W(6, 6), W(6, 7), W(3, 5), W(4, 5), W(8, 4), W(9, 4),
  ]
  return createLevel({ world: 1, number, width: 13, height: 10, ball, square, stars, walls })
}

world1.push(
  corridor(4, W(2, 7), W(2, 2), [W(10, 2), W(10, 7)]),
  corridor(5, W(2, 2), W(10, 7), [W(10, 2), W(2, 7)]),
  corridor(6, W(2, 7), W(10, 2), [W(6, 2), W(6, 7), W(10, 5)]),
  corridor(7, W(2, 2), W(10, 2), [W(2, 7), W(10, 7), W(6, 5)]),
  corridor(8, W(10, 7), W(2, 7), [W(2, 2), W(10, 2), W(6, 4)]),
  corridor(9, W(2, 2), W(6, 7), [W(10, 2), W(10, 7), W(6, 2)]),
  corridor(10, W(10, 2), W(2, 2), [W(2, 7), W(10, 7), W(6, 5)]),
  corridor(11, W(2, 7), W(10, 2), [W(2, 2), W(10, 7), W(6, 4), W(6, 7)]),
)

export const campaign: Level[] = [...world1]

export function getLevel(world: number, number: number): Level | undefined {
  return campaign.find(level => level.world === world && level.number === number)
}
