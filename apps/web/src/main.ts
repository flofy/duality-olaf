import Phaser from 'phaser';
import { LevelRunner } from '@duality/game';
import type { Level, Position } from '@duality/level-format';
import { campaign, levelLabel, levelsPerWorld, totalLevelCount } from './levels/campaign';
import { completeLevel, getCompletedCount, isLevelCompleted, resetProgress } from './progression';
import { cycleTheme, getTheme, hexToCss, type Theme } from './theme';
import { interpretGesture, type Direction } from './input/GestureInterpreter';
import { drawBallVisual, drawBoardVisuals, drawSquareVisual } from './visuals';
import { formatDebugCommands, type DebugCommand } from './debug/CommandRecorder';
import './style.css';

const TILE = 48;
const FOOTER = 108;
const WIDTH = 13;
const HEIGHT = 10;
const GAME_W = WIDTH * TILE;
const GAME_H = HEIGHT * TILE + FOOTER;
const BOARD_HEIGHT = HEIGHT * TILE;
const DPR = Math.min(window.devicePixelRatio || 1, 3);
const MOVE_DURATION = 145;

type MoveDirection = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
const GESTURE_DIRECTIONS: Record<Direction, MoveDirection> = {
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
};

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  create() {
    const theme = getTheme();
    this.cameras.main.setBackgroundColor(hexToCss(theme.background));
    this.cameras.main.setZoom(DPR);
    this.cameras.main.centerOn(GAME_W / 2, GAME_H / 2);
    const cx = GAME_W / 2;
    const completedCount = getCompletedCount();
    this.add.text(cx, 70, 'DUALITY', { fontFamily: 'monospace', fontSize: '52px', color: hexToCss(theme.text), fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 122, 'OLAF', { fontFamily: 'monospace', fontSize: '20px', color: hexToCss(theme.accent) }).setOrigin(0.5);
    this.add.text(cx, 170, 'BOULE ●   ×   CARRÉ ■', { fontFamily: 'monospace', fontSize: '16px', color: hexToCss(theme.square) }).setOrigin(0.5);
    this.add.text(cx, 220, 'PREMIER MONDE', { fontFamily: 'monospace', fontSize: '18px', color: hexToCss(theme.text) }).setOrigin(0.5);
    for (let index = 0; index < levelsPerWorld; index += 1) {
      const column = index % 6; const row = Math.floor(index / 6); const x = cx - 180 + column * 72; const y = 270 + row * 72;
      const unlocked = index === 0 || isLevelCompleted(campaign[index - 1].id); const completed = isLevelCompleted(campaign[index].id);
      const label = completed ? '✓' : unlocked ? String(index + 1).padStart(2, '0') : '·';
      const button = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '22px', color: hexToCss(unlocked ? theme.buttonText : theme.buttonTextLocked), backgroundColor: hexToCss(completed ? theme.buttonCompletedBg : unlocked ? theme.buttonBg : theme.buttonLockedBg), padding: { left: 15, right: 15, top: 10, bottom: 10 } }).setOrigin(0.5);
      if (unlocked) { button.setInteractive({ useHandCursor: true }); button.on('pointerdown', () => this.scene.start('game', { levelIndex: index })); }
    }
    this.add.text(cx, 420, `${completedCount} terminé${completedCount > 1 ? 's' : ''} · ${campaign.length} jouables · ${totalLevelCount} prévus`, { fontFamily: 'monospace', fontSize: '13px', color: hexToCss(theme.textMuted) }).setOrigin(0.5);
    this.add.text(cx, 452, `Clique un niveau · 1–9 · progression sauvegardée automatiquement`, { fontFamily: 'monospace', fontSize: '13px', color: hexToCss(theme.textMuted) }).setOrigin(0.5);
    this.add.text(cx, 486, `Thème « ${theme.name} » — touche T ou bouton pour changer`, { fontFamily: 'monospace', fontSize: '13px', color: hexToCss(theme.accent) }).setOrigin(0.5);
    this.createThemeButton(cx, theme);
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const number = Number(event.key);
      if (number >= 1 && number <= 9 && number <= campaign.length) { const index = number - 1; if (index === 0 || isLevelCompleted(campaign[index - 1].id)) this.scene.start('game', { levelIndex: index }); }
      if (event.key.toLowerCase() === 'x') { resetProgress(); this.scene.restart(); }
      if (event.key.toLowerCase() === 't') { cycleTheme(); this.scene.restart(); }
    });
  }
  private createThemeButton(cx: number, theme: Theme) {
    const button = this.add.text(cx, 520, '🎨 THÈME', { fontFamily: 'monospace', fontSize: '15px', color: hexToCss(theme.buttonText), backgroundColor: hexToCss(theme.buttonBg), padding: { left: 16, right: 16, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => { cycleTheme(); this.scene.restart(); });
  }
}

type GameState = ReturnType<LevelRunner['getState']>;
class GameScene extends Phaser.Scene {
  private runner!: LevelRunner; private level!: Level; private levelIndex = 0; private theme!: Theme;
  private ballSprite!: Phaser.GameObjects.Container; private squareSprite!: Phaser.GameObjects.Container;
  private starSprites: Phaser.GameObjects.GameObject[] = []; private status!: Phaser.GameObjects.Text; private completion!: Phaser.GameObjects.Text;
  private completionPanel?: Phaser.GameObjects.Container; private nextButton!: Phaser.GameObjects.Text;
  private gestureStart: { x: number; y: number } | null = null; private isAnimating = false; private activeTween?: Phaser.Tweens.Tween;
  private debugCommands: DebugCommand[] = []; private debugText?: Phaser.GameObjects.Text;
  constructor() { super('game'); }
  init(data: { levelIndex?: number }) { this.levelIndex = Math.max(0, Math.min(data.levelIndex ?? 0, campaign.length - 1)); this.level = campaign[this.levelIndex]; this.runner = new LevelRunner(this.level); }
  create() {
    this.theme = getTheme(); this.cameras.main.setBackgroundColor(hexToCss(this.theme.background)); this.cameras.main.setZoom(DPR); this.cameras.main.centerOn(GAME_W / 2, GAME_H / 2);
    this.input.keyboard!.on('keydown-SPACE', () => this.switchForm()); this.input.keyboard!.on('keydown-D', () => this.copyDebugTrace()); this.input.keyboard!.on('keydown-C', () => this.clearDebugTrace()); this.input.keyboard!.on('keydown-R', () => this.resetLevel()); this.input.keyboard!.on('keydown-ESC', () => this.scene.start('menu'));
    this.input.keyboard!.on('keydown-LEFT', () => this.tryMove({ x: -1, y: 0 })); this.input.keyboard!.on('keydown-RIGHT', () => this.tryMove({ x: 1, y: 0 })); this.input.keyboard!.on('keydown-UP', () => this.tryMove({ x: 0, y: -1 })); this.input.keyboard!.on('keydown-DOWN', () => this.tryMove({ x: 0, y: 1 }));
    drawBoardVisuals(this, this.level, TILE, this.theme); this.createEntities(); this.createHud(); this.createDebugPanel(); this.createTouchControls(); this.createSwipeControls(); this.refresh(this.runner.getState());
  }
  private createEntities() { this.ballSprite = drawBallVisual(this, 0, 0, TILE * 0.31, this.theme); this.squareSprite = drawSquareVisual(this, 0, 0, TILE * 0.62, this.theme); }
  private createHud() {
    const y = HEIGHT * TILE + 8;
    this.status = this.add.text(12, y, '', { fontFamily: 'monospace', fontSize: '15px', color: hexToCss(this.theme.text) });
    this.completion = this.add.text(12, y + 27, '', { fontFamily: 'monospace', fontSize: '13px', color: hexToCss(this.theme.textMuted) });
    this.nextButton = this.add.text(WIDTH * TILE - 12, y + 18, 'NIVEAU SUIVANT ▶', { fontFamily: 'monospace', fontSize: '13px', color: hexToCss(this.theme.nextText), backgroundColor: hexToCss(this.theme.nextBg), padding: { left: 10, right: 10, top: 7, bottom: 7 } }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setVisible(false);
    this.nextButton.on('pointerdown', () => this.nextLevel());
  }
  private createDebugPanel() {
    if (!import.meta.env.DEV) return;
    this.debugText = this.add.text(GAME_W - 8, 8, '', {
      fontFamily: 'monospace', fontSize: '11px', color: hexToCss(this.theme.text),
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { left: 8, right: 8, top: 6, bottom: 6 },
    }).setOrigin(1, 0).setDepth(30);
    this.refreshDebugPanel();
  }
  private refreshDebugPanel() {
    if (!this.debugText) return;
    const state = this.runner.getState();
    const trace = this.debugCommands.slice(-8).map((command) =>
      command.type === 'switch' ? '↔' : command.direction.x === 1 ? '→' : command.direction.x === -1 ? '←' : command.direction.y === 1 ? '↓' : '↑',
    ).join(' ');
    this.debugText.setText([
      '🐛 DEBUG',
      this.level.id,
      `● ${state.ball.x},${state.ball.y}  ■ ${state.square.x},${state.square.y}`,
      `active: ${state.activeForm}  stars: ${state.stars.length}`,
      `trace (${this.debugCommands.length}): ${trace || '—'}`,
      'D copy · C clear',
    ]);
  }
  private async copyDebugTrace() {
    if (!import.meta.env.DEV || this.debugCommands.length === 0) return;
    const text = formatDebugCommands(this.debugCommands);
    await navigator.clipboard?.writeText(text);
    this.debugText?.setText(`${this.debugText.text}\n✓ copied`);
  }
  private clearDebugTrace() { if (!import.meta.env.DEV) return; this.debugCommands = []; this.refreshDebugPanel(); }

  private createTouchControls() {
    const baseY = HEIGHT * TILE + FOOTER - 22; const center = (WIDTH * TILE) / 2;
    const makeMoveButton = (label: string, x: number, dir: MoveDirection) => { const button = this.add.text(x, baseY, label, { fontFamily: 'monospace', fontSize: '17px', color: hexToCss(this.theme.buttonText), backgroundColor: hexToCss(this.theme.buttonBg), padding: { left: 9, right: 9, top: 5, bottom: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }); button.on('pointerdown', () => this.tryMove(dir)); };
    makeMoveButton('◀', center - 120, { x: -1, y: 0 }); makeMoveButton('▲', center - 60, { x: 0, y: -1 }); makeMoveButton('▼', center, { x: 0, y: 1 }); makeMoveButton('▶', center + 60, { x: 1, y: 0 });
    const switchButton = this.add.text(center + 135, baseY, '●/■', { fontFamily: 'monospace', fontSize: '17px', color: hexToCss(this.theme.buttonText), backgroundColor: hexToCss(this.theme.buttonBg), padding: { left: 9, right: 9, top: 5, bottom: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }); switchButton.on('pointerdown', () => this.switchForm());
  }
  private createSwipeControls() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => { if (pointer.y < BOARD_HEIGHT) this.gestureStart = { x: pointer.x, y: pointer.y }; });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => { if (!this.gestureStart || pointer.y >= BOARD_HEIGHT) { this.gestureStart = null; return; } const result = interpretGesture(this.gestureStart, { x: pointer.x, y: pointer.y }); this.gestureStart = null; if (result.type !== 'swipe' || !result.direction) return; this.tryMove(GESTURE_DIRECTIONS[result.direction]); });
  }
  private tryMove(direction: MoveDirection) {
    if (this.runner.getState().completed) return;
    const before = this.runner.getState(); const after = this.runner.move(direction); const active = after.activeForm === 'ball' ? this.ballSprite : this.squareSprite;
    const from = after.activeForm === 'ball' ? before.ball : before.square; const to = after.activeForm === 'ball' ? after.ball : after.square; const moved = from.x !== to.x || from.y !== to.y;
    if (!moved) { this.refresh(after); return; }
    this.debugCommands.push({ type: 'move', direction }); this.refreshDebugPanel();
    if (this.activeTween?.isPlaying()) this.activeTween.stop();
    this.isAnimating = true; this.refreshStars(after); this.refreshHud(after); const [x, y] = this.toPixel(to);
    this.activeTween = this.tweens.add({ targets: active, x, y, duration: MOVE_DURATION, ease: 'Quad.easeOut', onComplete: () => { this.isAnimating = false; this.activeTween = undefined; this.refresh(after); } });
  }
  private switchForm() { if (this.runner.getState().completed) return; if (this.activeTween?.isPlaying()) this.activeTween.stop(); this.isAnimating = false; this.debugCommands.push({ type: 'switch' }); this.refreshDebugPanel(); this.refresh(this.runner.switchForm()); }
  private resetLevel() { if (this.activeTween?.isPlaying()) this.activeTween.stop(); this.isAnimating = false; this.debugCommands = []; this.refreshDebugPanel(); this.refresh(this.runner.reset()); }
  private refresh(state: GameState) {
    this.setPosition(this.ballSprite, state.ball); this.setPosition(this.squareSprite, state.square); this.ballSprite.setAlpha(state.activeForm === 'ball' ? 1 : 0.4); this.squareSprite.setAlpha(state.activeForm === 'square' ? 1 : 0.4); this.refreshStars(state); this.refreshHud(state);
  }
  private refreshStars(state: GameState) { for (const sprite of this.starSprites) sprite.destroy(); this.starSprites = state.stars.map((star) => { const [x, y] = this.toPixel(star); return this.add.star(x, y, 5, TILE * 0.12, TILE * 0.25, this.theme.star); }); }
  private refreshHud(state: GameState) {
    const form = state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'; const collected = this.level.stars.length - state.stars.length;
    this.status.setText(`${levelLabel(this.levelIndex)}   ${form}   ÉTOILES ${collected}/${this.level.stars.length}   COUPS ${state.moves}`); this.completion.setText(state.completed ? '✓ NIVEAU TERMINÉ' : 'ESPACE changer de forme · Flèches / swipe / tactile · Échap menu'); this.nextButton.setVisible(state.completed && this.levelIndex < campaign.length - 1);
    if (state.completed) { completeLevel(this.level.id); this.showCompletionPanel(); } else this.hideCompletionPanel();
  }
  private showCompletionPanel() {
    if (this.completionPanel) return;
    const panel = this.add.container(GAME_W / 2, BOARD_HEIGHT / 2).setDepth(20);
    const backdrop = this.add.rectangle(0, 0, GAME_W * 0.62, 180, this.theme.background, 0.94).setStrokeStyle(2, this.theme.accent, 0.9);
    const title = this.add.text(0, -55, '★ NIVEAU TERMINÉ ★', { fontFamily: 'monospace', fontSize: '24px', color: hexToCss(this.theme.accent), fontStyle: 'bold' }).setOrigin(0.5);
    const moves = this.add.text(0, -20, `Niveau ${this.levelIndex + 1} · ${this.runner.getState().moves} coups`, { fontFamily: 'monospace', fontSize: '14px', color: hexToCss(this.theme.text) }).setOrigin(0.5);
    const replay = this.add.text(-105, 35, 'REJOUER', { fontFamily: 'monospace', fontSize: '14px', color: hexToCss(this.theme.buttonText), backgroundColor: hexToCss(this.theme.buttonBg), padding: { left: 12, right: 12, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }); replay.on('pointerdown', () => this.resetLevel());
    const next = this.add.text(105, 35, this.levelIndex < campaign.length - 1 ? 'SUIVANT ▶' : 'MENU', { fontFamily: 'monospace', fontSize: '14px', color: hexToCss(this.theme.buttonText), backgroundColor: hexToCss(this.theme.buttonCompletedBg), padding: { left: 12, right: 12, top: 8, bottom: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }); next.on('pointerdown', () => this.nextLevel());
    panel.add([backdrop, title, moves, replay, next]); this.completionPanel = panel; panel.setScale(0.94).setAlpha(0); this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 180, ease: 'Back.easeOut' });
  }
  private hideCompletionPanel() { if (this.completionPanel) { this.completionPanel.destroy(); this.completionPanel = undefined; } }
  private nextLevel() { if (this.levelIndex < campaign.length - 1) this.scene.restart({ levelIndex: this.levelIndex + 1 }); else this.scene.start('menu'); }
  private setPosition(object: Phaser.GameObjects.Container, position: Position) { const [x, y] = this.toPixel(position); object.setPosition(x, y); }
  private toPixel(position: Position): [number, number] { return [position.x * TILE + TILE / 2, position.y * TILE + TILE / 2]; }
}

new Phaser.Game({ type: Phaser.AUTO, antialias: true, width: GAME_W * DPR, height: GAME_H * DPR, parent: 'app', scene: [MenuScene, GameScene], scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: GAME_W * DPR, height: GAME_H * DPR } });
