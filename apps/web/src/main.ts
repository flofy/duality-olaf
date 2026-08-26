import Phaser from 'phaser';
import './style.css';

type Form = 'ball' | 'square';
type Position = { x: number; y: number };
type Tile = 0 | 1;

const WIDTH = 13;
const HEIGHT = 10;
const TILE = 48;

const level = {
  tiles: Array.from({ length: HEIGHT }, (_, y): Tile[] =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? 1 : 0,
    ),
  ),
  ball: { x: 1, y: 1 } as Position,
  square: { x: 3, y: 1 } as Position,
  stars: [
    { x: 8, y: 1 },
    { x: 10, y: 4 },
    { x: 5, y: 7 },
    { x: 9, y: 8 },
  ] as Position[],
};

// A first hand-authored level. Historical level data stays isolated until the
// DS format is decoded and validated.
level.tiles[2][4] = 1;
level.tiles[2][5] = 1;
level.tiles[3][5] = 1;
level.tiles[4][5] = 1;
level.tiles[5][5] = 1;
level.tiles[6][7] = 1;
level.tiles[7][7] = 1;
level.tiles[8][7] = 1;

class DualityScene extends Phaser.Scene {
  private active: Form = 'ball';
  private ball = { ...level.ball };
  private square = { ...level.square };
  private stars = level.stars.map((star) => ({ ...star }));
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private switchKey!: Phaser.Input.Keyboard.Key;
  private ballSprite!: Phaser.GameObjects.Arc;
  private squareSprite!: Phaser.GameObjects.Rectangle;
  private starSprites: Phaser.GameObjects.Arc[] = [];
  private status!: Phaser.GameObjects.Text;

  constructor() {
    super('duality');
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.switchKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBackgroundColor('#0b1020');
    this.drawBoard();
    this.drawEntities();

    this.status = this.add.text(16, HEIGHT * TILE + 14, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    });
    this.updateStatus();

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.active = this.active === 'ball' ? 'square' : 'ball';
      this.updateStatus();
    });

    this.input.keyboard!.on('keydown-R', () => this.reset());
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) this.move(-1, 0);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) this.move(1, 0);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) this.move(0, -1);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) this.move(0, 1);
  }

  private move(dx: number, dy: number) {
    const current = this.active === 'ball' ? this.ball : this.square;
    const next = { x: current.x + dx, y: current.y + dy };

    if (!this.isInside(next) || level.tiles[next.y][next.x] === 1) return;

    if (this.active === 'square' && next.x === this.ball.x && next.y === this.ball.y) return;

    current.x = next.x;
    current.y = next.y;

    if (this.active === 'ball') {
      this.stars = this.stars.filter((star) => star.x !== current.x || star.y !== current.y);
    }

    this.redrawEntities();
    this.updateStatus();
  }

  private drawBoard() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x111a2d);
    graphics.fillRect(0, 0, WIDTH * TILE, HEIGHT * TILE);

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const px = x * TILE;
        const py = y * TILE;
        graphics.lineStyle(1, 0x26324a, 1);
        graphics.strokeRect(px, py, TILE, TILE);
        if (level.tiles[y][x] === 1) {
          graphics.fillStyle(0x7b879d);
          graphics.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
        }
      }
    }
  }

  private drawEntities() {
    this.ballSprite = this.add.circle(0, 0, TILE * 0.31, 0x4aa3ff);
    this.squareSprite = this.add.rectangle(0, 0, TILE * 0.62, TILE * 0.62, 0xffd447);
    this.starSprites = [];
    this.redrawEntities();
  }

  private redrawEntities() {
    this.ballSprite.setPosition(...this.toPixel(this.ball));
    this.squareSprite.setPosition(...this.toPixel(this.square));
    this.ballSprite.setAlpha(this.active === 'ball' ? 1 : 0.55);
    this.squareSprite.setAlpha(this.active === 'square' ? 1 : 0.55);

    for (const sprite of this.starSprites) sprite.destroy();
    this.starSprites = this.stars.map((star) => {
      const [x, y] = this.toPixel(star);
      return this.add.star(x, y, 5, TILE * 0.12, TILE * 0.25, 0xfff2a1);
    });
  }

  private updateStatus() {
    if (!this.status) return;
    const collected = level.stars.length - this.stars.length;
    this.status.setText(
      `Forme: ${this.active === 'ball' ? '● BOULE' : '■ CARRÉ'}   ` +
        `Étoiles: ${collected}/${level.stars.length}   ` +
        `Espace: changer · R: recommencer`,
    );
  }

  private reset() {
    this.active = 'ball';
    this.ball = { ...level.ball };
    this.square = { ...level.square };
    this.stars = level.stars.map((star) => ({ ...star }));
    this.redrawEntities();
    this.updateStatus();
  }

  private isInside(position: Position) {
    return position.x >= 0 && position.x < WIDTH && position.y >= 0 && position.y < HEIGHT;
  }

  private toPixel(position: Position): [number, number] {
    return [position.x * TILE + TILE / 2, position.y * TILE + TILE / 2];
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH * TILE,
  height: HEIGHT * TILE + 56,
  parent: 'app',
  scene: DualityScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH * TILE,
    height: HEIGHT * TILE + 56,
  },
});
