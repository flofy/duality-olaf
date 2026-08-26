import Phaser from 'phaser';
import { LevelRunner } from '@duality/game';
import type { Position } from '@duality/level-format';
import { prototypeLevel } from './levels/prototype';
import './style.css';

const TILE = 48;
const FOOTER = 72;

type State = ReturnType<LevelRunner['getState']>;

class DualityScene extends Phaser.Scene {
  private readonly runner = new LevelRunner(prototypeLevel);
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private ballSprite!: Phaser.GameObjects.Arc;
  private squareSprite!: Phaser.GameObjects.Rectangle;
  private starSprites: Phaser.GameObjects.GameObject[] = [];
  private status!: Phaser.GameObjects.Text;
  private completion!: Phaser.GameObjects.Text;

  constructor() {
    super('duality');
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown-SPACE', () => this.refresh(this.runner.switchForm()));
    this.input.keyboard!.on('keydown-R', () => this.refresh(this.runner.reset()));

    this.cameras.main.setBackgroundColor('#0b1020');
    this.drawBoard();
    this.createEntities();
    this.createHud();
    this.createTouchControls();
    this.refresh(this.runner.getState());
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) this.move(-1, 0);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) this.move(1, 0);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) this.move(0, -1);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) this.move(0, 1);
  }

  private move(x: -1 | 0 | 1, y: -1 | 0 | 1) {
    this.refresh(this.runner.move({ x, y }));
  }

  private drawBoard() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x111a2d);
    graphics.fillRect(0, 0, prototypeLevel.width * TILE, prototypeLevel.height * TILE);

    for (let y = 0; y < prototypeLevel.height; y += 1) {
      for (let x = 0; x < prototypeLevel.width; x += 1) {
        const px = x * TILE;
        const py = y * TILE;
        graphics.lineStyle(1, 0x26324a, 1);
        graphics.strokeRect(px, py, TILE, TILE);
        if (prototypeLevel.tiles[y][x] === 'wall') {
          graphics.fillStyle(0x7b879d);
          graphics.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
        }
      }
    }
  }

  private createEntities() {
    this.ballSprite = this.add.circle(0, 0, TILE * 0.31, 0x4aa3ff);
    this.squareSprite = this.add.rectangle(0, 0, TILE * 0.62, TILE * 0.62, 0xffd447);
  }

  private createHud() {
    const y = prototypeLevel.height * TILE + 8;
    this.status = this.add.text(12, y, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
    });
    this.completion = this.add.text(12, y + 27, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fff2a1',
    });
  }

  private createTouchControls() {
    const baseY = prototypeLevel.height * TILE + FOOTER - 18;
    const center = (prototypeLevel.width * TILE) / 2;

    const makeButton = (label: string, x: number, callback: () => void) => {
      const button = this.add.text(x, baseY, label, {
        fontFamily: 'monospace',
        fontSize: '18px',
        backgroundColor: '#1b2942',
        padding: { left: 9, right: 9, top: 5, bottom: 5 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      button.on('pointerdown', callback);
    };

    makeButton('◀', center - 120, () => this.move(-1, 0));
    makeButton('▲', center - 60, () => this.move(0, -1));
    makeButton('▼', center, () => this.move(0, 1));
    makeButton('▶', center + 60, () => this.move(1, 0));
    makeButton('●/■', center + 135, () => this.refresh(this.runner.switchForm()));
  }

  private refresh(state: State) {
    this.setPosition(this.ballSprite, state.ball);
    this.setPosition(this.squareSprite, state.square);
    this.ballSprite.setAlpha(state.activeForm === 'ball' ? 1 : 0.5);
    this.squareSprite.setAlpha(state.activeForm === 'square' ? 1 : 0.5);

    for (const sprite of this.starSprites) sprite.destroy();
    this.starSprites = state.stars.map((star) => {
      const [x, y] = this.toPixel(star);
      return this.add.star(x, y, 5, TILE * 0.12, TILE * 0.25, 0xfff2a1);
    });

    const form = state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ';
    const collected = prototypeLevel.stars.length - state.stars.length;
    this.status.setText(`${form}   ÉTOILES ${collected}/${prototypeLevel.stars.length}   COUPS ${state.moves}`);
    this.completion.setText(
      state.completed
        ? '✓ NIVEAU TERMINÉ — R pour recommencer'
        : 'ESPACE : changer de forme · Flèches / tactile : déplacer',
    );
  }

  private setPosition(object: Phaser.GameObjects.Shape, position: Position) {
    const [x, y] = this.toPixel(position);
    object.setPosition(x, y);
  }

  private toPixel(position: Position): [number, number] {
    return [position.x * TILE + TILE / 2, position.y * TILE + TILE / 2];
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: prototypeLevel.width * TILE,
  height: prototypeLevel.height * TILE + FOOTER,
  parent: 'app',
  scene: DualityScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: prototypeLevel.width * TILE,
    height: prototypeLevel.height * TILE + FOOTER,
  },
});
