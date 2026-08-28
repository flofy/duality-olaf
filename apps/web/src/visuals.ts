import Phaser from 'phaser';
import type { Theme } from './theme';

export function drawBoardVisuals(
  scene: Phaser.Scene,
  level: { width: number; height: number; tiles: string[][] },
  tile: number,
  theme: Theme,
): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(theme.board, 1).fillRect(0, 0, level.width * tile, level.height * tile);

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const px = x * tile;
      const py = y * tile;
      graphics.lineStyle(1, theme.gridLine, 0.7).strokeRect(px, py, tile, tile);

      if (level.tiles[y][x] !== 'wall') continue;

      // A compact two-tone tile gives the wall a soft raised edge without
      // introducing image assets or a large rendering cost on mobile.
      graphics.fillStyle(theme.wall, 1).fillRoundedRect(px + 3, py + 4, tile - 6, tile - 7, 5);
      graphics.fillStyle(lighten(theme.wall, 0.16), 0.72).fillRoundedRect(px + 5, py + 5, tile - 10, 5, 3);
      graphics.fillStyle(darken(theme.wall, 0.18), 0.5).fillRoundedRect(px + 5, py + tile - 9, tile - 10, 3, 2);
    }
  }
}

export function drawBallVisual(scene: Phaser.Scene, x: number, y: number, radius: number, theme: Theme): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const shadow = scene.add.ellipse(2, radius * 0.58, radius * 1.55, radius * 0.42, 0x000000, 0.18);
  const ball = scene.add.circle(0, 0, radius, theme.ball);
  const highlight = scene.add.circle(-radius * 0.32, -radius * 0.34, radius * 0.22, lighten(theme.ball, 0.5), 0.8);
  container.add([shadow, ball, highlight]);
  return container;
}

export function drawSquareVisual(scene: Phaser.Scene, x: number, y: number, size: number, theme: Theme): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const half = size / 2;
  const shadow = scene.add.rectangle(2, half * 0.78, size * 0.82, size * 0.24, 0x000000, 0.18).setOrigin(0.5);
  const square = scene.add.rectangle(0, 0, size, size, theme.square).setOrigin(0.5);
  const highlight = scene.add.rectangle(-size * 0.16, -size * 0.23, size * 0.48, size * 0.12, lighten(theme.square, 0.35), 0.78).setOrigin(0.5);
  container.add([shadow, square, highlight]);
  return container;
}

function lighten(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return ((Math.round(r + (255 - r) * amount) << 16)
    | (Math.round(g + (255 - g) * amount) << 8)
    | Math.round(b + (255 - b) * amount)) >>> 0;
}

function darken(color: number, amount: number): number {
  const factor = 1 - amount;
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return ((r << 16) | (g << 8) | b) >>> 0;
}
