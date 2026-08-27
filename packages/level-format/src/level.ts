export type Form = 'ball' | 'square'

export interface Point {
  x: number
  y: number
}

export interface Level {
  id: string
  world: number
  number: number
  width: number
  height: number
  walls: Point[]
  ball: Point
  square: Point
  stars: Point[]
}

export interface LevelDefinition extends Omit<Level, 'id'> {
  id?: string
}

export function createLevel(definition: LevelDefinition): Level {
  return {
    ...definition,
    id: definition.id ?? `world-${definition.world}-level-${String(definition.number).padStart(2, '0')}`,
  }
}

export function pointKey(point: Point): string {
  return `${point.x},${point.y}`
}
