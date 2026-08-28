export type Direction = 'left' | 'right' | 'up' | 'down';

export interface Point {
  x: number;
  y: number;
}

export interface GestureResult {
  type: 'swipe' | 'tap';
  direction?: Direction;
}

export function interpretGesture(start: Point, end: Point, threshold = 28): GestureResult {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);

  if (distance < threshold) return { type: 'tap' };

  if (Math.abs(dx) >= Math.abs(dy)) {
    return { type: 'swipe', direction: dx < 0 ? 'left' : 'right' };
  }

  return { type: 'swipe', direction: dy < 0 ? 'up' : 'down' };
}
