import Phaser from 'phaser';
import { LevelRunner } from '@duality/game';
import type { Level, Position } from '@duality/level-format';
import { campaign, levelLabel, levelsPerWorld, totalLevelCount } from './levels/campaign';
import { completeLevel, getCompletedCount, isLevelCompleted, resetProgress } from './progression';
import './style.css';

const TILE = 48;
const FOOTER = 108;
const WIDTH = 13;
const HEIGHT = 10;

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  create() {
    this.cameras.main.setBackgroundColor('#0b1020');
    const cx = this.scale.width / 2;
    const completedCount = getCompletedCount();

    this.add.text(cx, 70, 'DUALITY', { fontFamily: 'monospace', fontSize: '52px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 122, 'OLAF', { fontFamily: 'monospace', fontSize: '20px', color: '#4aa3ff' }).setOrigin(0.5);
    this.add.text(cx, 170, 'BOULE ●   ×   CARRÉ ■', { fontFamily: 'monospace', fontSize: '16px', color: '#ffd447' }).setOrigin(0.5);
    this.add.text(cx, 220, 'PREMIER MONDE', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

    for (let index = 0; index < levelsPerWorld; index += 1) {
      const column = index % 6;
      const row = Math.floor(index / 6);
      const x = cx - 180 + column * 72;
      const y = 270 + row * 72;
      const unlocked = index === 0 || isLevelCompleted(campaign[index - 1].id);
      const completed = isLevelCompleted(campaign[index].id);
      const label = completed ? '✓' : unlocked ? String(index + 1).padStart(2, '0') : '·';
      const button = this.add.text(x, y, label, {
        fontFamily: 'monospace', fontSize: '22px', color: unlocked ? '#ffffff' : '#46516a',
        backgroundColor: completed ? '#25452f' : unlocked ? '#1b2942' : '#101728',
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
      }).setOrigin(0.5);
      if (unlocked) {
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => this.scene.start('game', { levelIndex: index }));
      }
    }

    this.add.text(cx, 420, `${completedCount} terminé${completedCount > 1 ? 's' : ''} · ${campaign.length} jouables · ${totalLevelCount} prévus`, { fontFamily: 'monospace', fontSize: '13px', color: '#8995ad' }).setOrigin(0.5);
    this.add.text(cx, 452, 'Clique un niveau · 1–9 · progression sauvegardée automatiquement', { fontFamily: 'monospace', fontSize: '13px', color: '#8995ad' }).setOrigin(0.5);

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const number = Number(event.key);
      if (number >= 1 && number <= 9 && number <= campaign.length) {
        const index = number - 1;
        if (index === 0 || isLevelCompleted(campaign[index - 1].id)) this.scene.start('game', { levelIndex: index });
      }
      if (event.key.toLowerCase() === 'x') {
        resetProgress();
        this.scene.restart();
      }
    });
  }
}

type GameState = ReturnType<LevelRunner['getState']>;

class GameScene extends Phaser.Scene {
  private runner!: LevelRunner;
  private level!: Level;
  private levelIndex = 0;
  private ballSprite!: Phaser.GameObjects.Arc;
  private squareSprite!: Phaser.GameObjects.Rectangle;
  private starSprites: Phaser.GameObjects.GameObject[] = [];
  private status!: Phaser.GameObjects.Text;
  private completion!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;

  constructor() { super('game'); }

  init(data: { levelIndex?: number }) {
    this.levelIndex = Math.max(0, Math.min(data.levelIndex ?? 0, campaign.length - 1));
    this.level = campaign[this.levelIndex];
    this.runner = new LevelRunner(this.level);
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1020');
    this.input.keyboard!.on('keydown-SPACE', () => this.refresh(this.runner.switchForm()));
    this.input.keyboard!.on('keydown-R', () => this.refresh(this.runner.reset()));
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('menu'));
    // One press = slide to the first collision along the chosen line/column.
    this.input.keyboard!.on('keydown-LEFT', () => this.refresh(this.runner.move({ x: -1, y: 0 })));
    this.input.keyboard!.on('keydown-RIGHT', () => this.refresh(this.runner.move({ x: 1, y: 0 })));
    this.input.keyboard!.on('keydown-UP', () => this.refresh(this.runner.move({ x: 0, y: -1 })));
    this.input.keyboard!.on('keydown-DOWN', () => this.refresh(this.runner.move({ x: 0, y: 1 })));
    this.drawBoard();
    this.createEntities();
    this.createHud();
    this.createTouchControls();
    this.refresh(this.runner.getState());
  }

  private drawBoard() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x111a2d).fillRect(0, 0, WIDTH * TILE, HEIGHT * TILE);
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const px = x * TILE; const py = y * TILE;
        graphics.lineStyle(1, 0x26324a, 1).strokeRect(px, py, TILE, TILE);
        if (this.level.tiles[y][x] === 'wall') {
          graphics.fillStyle(0x65718a).fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
        }
      }
    }
  }

  private createEntities() {
    this.ballSprite = this.add.circle(0, 0, TILE * 0.31, 0x4aa3ff);
    this.squareSprite = this.add.rectangle(0, 0, TILE * 0.62, TILE * 0.62, 0xffd447);
  }

  private createHud() {
    const y = HEIGHT * TILE + 8;
    this.status = this.add.text(12, y, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffffff' });
    this.completion = this.add.text(12, y + 27, '', { fontFamily: 'monospace', fontSize: '13px', color: '#8995ad' });
    this.nextButton = this.add.text(WIDTH * TILE - 12, y + 18, 'NIVEAU SUIVANT ▶', {
      fontFamily: 'monospace', fontSize: '13px', color: '#fff2a1', backgroundColor: '#1b2942',
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setVisible(false);
    this.nextButton.on('pointerdown', () => this.nextLevel());
  }

  private createTouchControls() {
    const baseY = HEIGHT * TILE + FOOTER - 22;
    const center = (WIDTH * TILE) / 2;
    const makeMoveButton = (label: string, x: number, dir: { x: -1 | 0 | 1; y: -1 | 0 | 1 }) => {
      const button = this.add.text(x, baseY, label, { fontFamily: 'monospace', fontSize: '17px', backgroundColor: '#1b2942', padding: { left: 9, right: 9, top: 5, bottom: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      // A tap slides the active form all the way along that line/column to the first collision.
      button.on('pointerdown', () => this.refresh(this.runner.move(dir)));
    };
    makeMoveButton('◀', center - 120, { x: -1, y: 0 });
    makeMoveButton('▲', center - 60, { x: 0, y: -1 });
    makeMoveButton('▼', center, { x: 0, y: 1 });
    makeMoveButton('▶', center + 60, { x: 1, y: 0 });
    const switchButton = this.add.text(center + 135, baseY, '●/■', { fontFamily: 'monospace', fontSize: '17px', backgroundColor: '#1b2942', padding: { left: 9, right: 9, top: 5, bottom: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    switchButton.on('pointerdown', () => this.refresh(this.runner.switchForm()));
  }

  private refresh(state: GameState) {
    this.setPosition(this.ballSprite, state.ball);
    this.setPosition(this.squareSprite, state.square);
    this.ballSprite.setAlpha(state.activeForm === 'ball' ? 1 : 0.35);
    this.squareSprite.setAlpha(state.activeForm === 'square' ? 1 : 0.35);
    for (const sprite of this.starSprites) sprite.destroy();
    this.starSprites = state.stars.map((star) => {
      const [x, y] = this.toPixel(star);
      return this.add.star(x, y, 5, TILE * 0.12, TILE * 0.25, 0xfff2a1);
    });
    const form = state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ';
    const collected = this.level.stars.length - state.stars.length;
    this.status.setText(`${levelLabel(this.levelIndex)}   ${form}   ÉTOILES ${collected}/${this.level.stars.length}   COUPS ${state.moves}`);
    if (state.completed) {
      completeLevel(this.level.id);
      this.completion.setText('✓ NIVEAU TERMINÉ · R recommencer · Échap menu');
    } else {
      this.completion.setText('ESPACE changer de forme · Flèches / tactile déplacer · Échap menu');
    }
    this.nextButton.setVisible(state.completed && this.levelIndex < campaign.length - 1);
  }

  private nextLevel() { if (this.levelIndex < campaign.length - 1) this.scene.restart({ levelIndex: this.levelIndex + 1 }); }
  private setPosition(object: Phaser.GameObjects.Shape, position: Position) { const [x, y] = this.toPixel(position); object.setPosition(x, y); }
  private toPixel(position: Position): [number, number] { return [position.x * TILE + TILE / 2, position.y * TILE + TILE / 2]; }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH * TILE,
  height: HEIGHT * TILE + FOOTER,
  parent: 'app',
  scene: [MenuScene, GameScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: WIDTH * TILE, height: HEIGHT * TILE + FOOTER },
});
