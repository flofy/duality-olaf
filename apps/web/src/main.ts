import Phaser from "phaser";
import { registerSW } from "virtual:pwa-register";
import { LevelRunner } from "@duality/game";
import type { Level, Position } from "@duality/level-format";
import {
  campaign,
  getCampaignLevelIndex,
  levelLabel,
  totalLevelCount,
  worlds,
} from "./levels/campaign";
import {
  completeLevel,
  getCompletedCount,
  isLevelCompleted,
  resetProgress,
} from "./progression";
import { cycleTheme, getTheme, hexToCss, type Theme } from "./theme";
import { interpretGesture, type Direction } from "./input/GestureInterpreter";
import { drawBallVisual, drawBoardVisuals, drawSquareVisual } from "./visuals";
import "./style.css";

const TILE = 48;
const FOOTER = 210;
const WIDTH = 13;
const HEIGHT = 10;
const GAME_W = WIDTH * TILE;
const GAME_H = HEIGHT * TILE + FOOTER;
const BOARD_HEIGHT = HEIGHT * TILE;
const DPR = Math.min(window.devicePixelRatio || 1, 3);
const MOVE_DURATION = 145;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event("duality-pwa-update"));
  },
});

function createPwaUi() {
  const root = document.body;
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  const install = document.createElement("button");
  install.textContent = "⬇ INSTALLER";
  install.className = "pwa-action";
  install.hidden = true;
  install.onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    install.hidden = true;
  };

  const update = document.createElement("button");
  update.textContent = "↻ MISE À JOUR DISPONIBLE";
  update.className = "pwa-action pwa-update";
  update.hidden = true;
  update.onclick = () => updateSW(true);

  root.append(install, update);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    install.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    install.hidden = true;
  });
  window.addEventListener("duality-pwa-update", () => {
    update.hidden = false;
  });
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
createPwaUi();

type MoveDirection = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
const GESTURE_DIRECTIONS: Record<Direction, MoveDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }
  create() {
    const theme = getTheme();
    this.cameras.main.setBackgroundColor(hexToCss(theme.background));
    this.cameras.main.setZoom(DPR);
    this.cameras.main.centerOn(GAME_W / 2, GAME_H / 2);
    this.showWorldSelector(theme);
  }
  private showWorldSelector(theme: Theme) {
    const cx = GAME_W / 2;
    const completedCount = getCompletedCount();
    this.add
      .text(cx, 62, "DUALITY", {
        fontFamily: "monospace",
        fontSize: "48px",
        color: hexToCss(theme.text),
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 108, "CHOISIS TON MONDE", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: hexToCss(theme.accent),
      })
      .setOrigin(0.5);
    worlds.forEach((world, index) => {
      const y = 165 + index * 62;
      const available = world.status === "available";
      const done = world.levels.filter((level) =>
        isLevelCompleted(level.id),
      ).length;
      const button = this.add.text(
        36,
        y,
        `🌍 MONDE ${world.id} — ${world.name.toUpperCase()}`,
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: hexToCss(
            available ? theme.buttonText : theme.buttonTextLocked,
          ),
          backgroundColor: hexToCss(
            available ? theme.buttonBg : theme.buttonLockedBg,
          ),
          padding: { left: 14, right: 14, top: 8, bottom: 8 },
        },
      );
      this.add.text(
        52,
        y + 32,
        available
          ? `${world.subtitle} · ${done}/${world.levels.length}`
          : `${world.subtitle} · BIENTÔT`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: hexToCss(available ? theme.textMuted : theme.buttonTextLocked),
        },
      );
      if (available) {
        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => this.showLevelSelector(world.id, theme));
      }
    });
    this.add
      .text(
        cx,
        475,
        `${completedCount} terminé${completedCount > 1 ? "s" : ""} · ${campaign.length} jouables · ${totalLevelCount} prévus`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: hexToCss(theme.textMuted),
        },
      )
      .setOrigin(0.5);
    this.createThemeButton(cx, theme, 515);
  }
  private showLevelSelector(worldId: number, theme: Theme) {
    this.children.removeAll(true);
    const world = worlds.find((entry) => entry.id === worldId);
    if (!world) return;
    const cx = GAME_W / 2;
    // Whole top strip is clickable to go back to the world menu, not just the title.
    const back = this.add.text(24, 30, "← MONDES", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: hexToCss(theme.accent),
    });
    const backHit = this.add
      .rectangle(0, 44, GAME_W, 48, 0, 0)
      .setOrigin(0, 0.5)
      .setDepth(-1)
      .setInteractive({ useHandCursor: true });
    const goBack = () => {
      this.children.removeAll(true);
      this.showWorldSelector(theme);
    };
    back.setInteractive({ useHandCursor: true });
    back.on("pointerdown", goBack);
    backHit.on("pointerdown", goBack);
    this.add.text(cx, 66, `MONDE ${world.id}`, { fontFamily: "monospace", fontSize: "22px", color: hexToCss(theme.text), fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(cx, 100, world.name.toUpperCase(), { fontFamily: "monospace", fontSize: "19px", color: hexToCss(theme.accent) }).setOrigin(0.5);
    this.add.text(cx, 132, world.subtitle, { fontFamily: "monospace", fontSize: "13px", color: hexToCss(theme.textMuted) }).setOrigin(0.5);
    world.levels.forEach((level, index) => {
      const column = index % 6;
      const row = Math.floor(index / 6);
      const x = cx - 180 + column * 72;
      const y = 205 + row * 76;
      const previous = index === 0 ? undefined : world.levels[index - 1];
      const unlocked =
        index === 0 || (!!previous && isLevelCompleted(previous.id));
      const completed = isLevelCompleted(level.id);
      const label = completed
        ? "✓"
        : unlocked
          ? String(index + 1).padStart(2, "0")
          : "🔒";
      const button = this.add
        .text(x, y, label, {
          fontFamily: "monospace",
          fontSize: unlocked ? "22px" : "15px",
          color: hexToCss(unlocked ? theme.buttonText : theme.buttonTextLocked),
          backgroundColor: hexToCss(
            completed
              ? theme.buttonCompletedBg
              : unlocked
                ? theme.buttonBg
                : theme.buttonLockedBg,
          ),
          padding: { left: 14, right: 14, top: 10, bottom: 10 },
        })
        .setOrigin(0.5);
      if (unlocked) {
        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () =>
          this.scene.start("game", {
            levelIndex: getCampaignLevelIndex(world.id, index),
            worldId: world.id,
            worldLevelIndex: index,
          }),
        );
      }
    });
  }
  private createThemeButton(cx: number, theme: Theme, y: number) {
    const button = this.add
      .text(cx, y, "🎨 THÈME", {
        fontFamily: "monospace",
        fontSize: "15px",
        color: hexToCss(theme.buttonText),
        backgroundColor: hexToCss(theme.buttonBg),
        padding: { left: 16, right: 16, top: 8, bottom: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on("pointerdown", () => {
      cycleTheme();
      this.scene.restart();
    });
  }
}

type GameState = ReturnType<LevelRunner["getState"]>;
class GameScene extends Phaser.Scene {
  private runner!: LevelRunner;
  private level!: Level;
  private levelIndex = 0;
  private worldId = 1;
  private worldLevelIndex = 0;
  private theme!: Theme;
  private ballSprite!: Phaser.GameObjects.Container;
  private squareSprite!: Phaser.GameObjects.Container;
  private starSprites: Phaser.GameObjects.GameObject[] = [];
  private status!: Phaser.GameObjects.Text;
  private completion!: Phaser.GameObjects.Text;
  private completionPanel?: Phaser.GameObjects.Container;
  private nextButton!: Phaser.GameObjects.Text;
  private gestureStart: { x: number; y: number } | null = null;
  private isAnimating = false;
  private gesturePointerId: number | null = null;
  private heldDirection: MoveDirection | null = null;
  private pendingDirection: MoveDirection | null = null;
  constructor() {
    super("game");
  }
  init(data: {
    levelIndex?: number;
    worldId?: number;
    worldLevelIndex?: number;
  }) {
    this.levelIndex = Math.max(
      0,
      Math.min(data.levelIndex ?? 0, campaign.length - 1),
    );
    this.worldId = data.worldId ?? 1;
    this.worldLevelIndex = data.worldLevelIndex ?? 0;
    this.level = campaign[this.levelIndex];
    this.runner = new LevelRunner(this.level);
  }
  create() {
    this.theme = getTheme();
    this.cameras.main.setBackgroundColor(hexToCss(this.theme.background));
    this.cameras.main.setZoom(DPR);
    this.cameras.main.centerOn(GAME_W / 2, GAME_H / 2);
    this.input.keyboard!.on("keydown-SPACE", () => this.switchForm());
    this.input.keyboard!.on("keydown-R", () => this.resetLevel());
    this.input.keyboard!.on("keydown-ESC", () => this.scene.start("menu"));
    // When a level is completed, Enter advances to the next level
    // (and returns to the world menu on the final level — see nextLevel).
    this.input.keyboard!.on("keydown-ENTER", () => {
      if (this.runner.getState().completed) this.nextLevel();
    });
    this.input.keyboard!.on("keydown-LEFT", () => {
      this.heldDirection = { x: -1, y: 0 };
      this.tryMove(this.heldDirection);
    });
    this.input.keyboard!.on("keydown-RIGHT", () => {
      this.heldDirection = { x: 1, y: 0 };
      this.tryMove(this.heldDirection);
    });
    this.input.keyboard!.on("keydown-UP", () => {
      this.heldDirection = { x: 0, y: -1 };
      this.tryMove(this.heldDirection);
    });
    this.input.keyboard!.on("keydown-DOWN", () => {
      this.heldDirection = { x: 0, y: 1 };
      this.tryMove(this.heldDirection);
    });
    this.input.keyboard!.on("keyup-LEFT", () => {
      if (this.heldDirection?.x === -1) this.heldDirection = null;
    });
    this.input.keyboard!.on("keyup-RIGHT", () => {
      if (this.heldDirection?.x === 1) this.heldDirection = null;
    });
    this.input.keyboard!.on("keyup-UP", () => {
      if (this.heldDirection?.y === -1) this.heldDirection = null;
    });
    this.input.keyboard!.on("keyup-DOWN", () => {
      if (this.heldDirection?.y === 1) this.heldDirection = null;
    });
    this.input.keyboard!.on("keyup", () => {
      this.heldDirection = null;
    });
    this.events.once("shutdown", () => {
      this.heldDirection = null;
    });
    drawBoardVisuals(this, this.level, TILE, this.theme);
    this.createEntities();
    this.createHud();
    this.createTouchControls();
    this.createSwipeControls();
    this.refresh(this.runner.getState());
  }
  private createEntities() {
    this.ballSprite = drawBallVisual(this, 0, 0, TILE * 0.31, this.theme);
    this.squareSprite = drawSquareVisual(this, 0, 0, TILE * 0.62, this.theme);
  }
  private createHud() {
    // Level data is pushed below the on-screen controls so nothing overlaps the board.
    const y = BOARD_HEIGHT + 18;
    this.status = this.add.text(12, y, "", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: hexToCss(this.theme.text),
    });
    this.completion = this.add.text(12, y + 27, "", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: hexToCss(this.theme.textMuted),
    });
    this.nextButton = this.add
      .text(WIDTH * TILE - 12, y + 18, "NIVEAU SUIVANT ▶", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: hexToCss(this.theme.nextText),
        backgroundColor: hexToCss(this.theme.nextBg),
        padding: { left: 10, right: 10, top: 7, bottom: 7 },
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.nextButton.on("pointerdown", () => this.nextLevel());
  }
  private createTouchControls() {
    const center = GAME_W / 2;
    // Controls sit directly under the board, spaced out so hit areas never overlap,
    // leaving the level data room below them.
    const dpadY = BOARD_HEIGHT + 132;
    const size = 62;
    const gap = 16;

    const makeMoveButton = (
      label: string,
      x: number,
      y: number,
      dir: MoveDirection,
    ) => {
      const hit = this.add
        .rectangle(x, y, size, size, this.theme.buttonBg, 0.96)
        .setStrokeStyle(2, this.theme.accent, 0.35)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(x, y, label, {
          fontFamily: "monospace",
          fontSize: "28px",
          color: hexToCss(this.theme.buttonText),
        })
        .setOrigin(0.5);
      hit.on("pointerdown", () => this.requestMove(dir));
    };

    // Properly spaced cross-shaped D-pad: no overlapping hit areas.
    const dpadX = center - 145;
    makeMoveButton("▲", dpadX, dpadY - size - gap, { x: 0, y: -1 });
    makeMoveButton("◀", dpadX - size - gap, dpadY, { x: -1, y: 0 });
    makeMoveButton("▼", dpadX, dpadY, { x: 0, y: 1 });
    makeMoveButton("▶", dpadX + size + gap, dpadY, { x: 1, y: 0 });

    // Action button gets its own zone on the right.
    const actionX = center + 145;
    const switchHit = this.add
      .rectangle(actionX, dpadY - 12, 128, 88, this.theme.buttonBg, 0.98)
      .setStrokeStyle(2, this.theme.accent, 0.5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(actionX, dpadY - 27, "●  ⇄  ■", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: hexToCss(this.theme.buttonText),
      })
      .setOrigin(0.5);
    this.add
      .text(actionX, dpadY + 12, "CHANGER", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: hexToCss(this.theme.textMuted),
      })
      .setOrigin(0.5);
    switchHit.on("pointerdown", () => this.switchForm());
  }
  private createSwipeControls() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= BOARD_HEIGHT) return;
      this.gesturePointerId = pointer.id;
      this.gestureStart = { x: pointer.x, y: pointer.y };
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.gestureStart || this.gesturePointerId !== pointer.id) return;
      const start = this.gestureStart;
      this.gestureStart = null;
      this.gesturePointerId = null;

      const result = interpretGesture(
        start,
        { x: pointer.x, y: pointer.y },
        18,
      );
      if (result.type === "swipe" && result.direction) {
        this.requestMove(GESTURE_DIRECTIONS[result.direction]);
      }
    });

    this.input.on("pointerupoutside", () => {
      this.gestureStart = null;
      this.gesturePointerId = null;
    });
  }

  private requestMove(direction: MoveDirection) {
    // Keep only the latest intent while a tween is running. This makes rapid
    // consecutive swipes responsive without building a long command queue.
    if (this.isAnimating) {
      this.pendingDirection = direction;
      return;
    }
    this.tryMove(direction);
  }
  private tryMove(direction: MoveDirection) {
    if (this.isAnimating || this.runner.getState().completed) return;
    const before = this.runner.getState();
    const after = this.runner.move(direction);
    const active =
      after.activeForm === "ball" ? this.ballSprite : this.squareSprite;
    const from = after.activeForm === "ball" ? before.ball : before.square;
    const to = after.activeForm === "ball" ? after.ball : after.square;
    const moved = from.x !== to.x || from.y !== to.y;
    if (!moved) {
      this.refresh(after);
      return;
    }
    this.isAnimating = true;
    this.refreshStars(after);
    this.refreshHud(after);
    const [x, y] = this.toPixel(to);
    this.tweens.add({
      targets: active,
      x,
      y,
      duration: MOVE_DURATION,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.isAnimating = false;
        this.refresh(after);
        const pending = this.pendingDirection;
        this.pendingDirection = null;
        if (pending && !this.runner.getState().completed) this.tryMove(pending);
        else if (this.heldDirection && !this.runner.getState().completed)
          this.tryMove(this.heldDirection);
      },
    });
  }
  private switchForm() {
    if (this.isAnimating || this.runner.getState().completed) return;
    this.refresh(this.runner.switchForm());
  }
  private resetLevel() {
    if (this.isAnimating) return;
    this.refresh(this.runner.reset());
  }
  private refresh(state: GameState) {
    this.setPosition(this.ballSprite, state.ball);
    this.setPosition(this.squareSprite, state.square);
    this.ballSprite.setAlpha(state.activeForm === "ball" ? 1 : 0.4);
    this.squareSprite.setAlpha(state.activeForm === "square" ? 1 : 0.4);
    this.refreshStars(state);
    this.refreshHud(state);
  }
  private refreshStars(state: GameState) {
    for (const sprite of this.starSprites) sprite.destroy();
    this.starSprites = state.stars.map((star) => {
      const [x, y] = this.toPixel(star);
      return this.add.star(x, y, 5, TILE * 0.12, TILE * 0.25, this.theme.star);
    });
  }
  private refreshHud(state: GameState) {
    const form = state.activeForm === "ball" ? "● BOULE" : "■ CARRÉ";
    const collected = this.level.stars.length - state.stars.length;
    this.status.setText(
      `MONDE ${this.worldId} · ${levelLabel(this.worldLevelIndex)}   ${form}`,
    );
    this.completion.setText(
      state.completed
        ? `✓ NIVEAU TERMINÉ · ★ ${collected}/${this.level.stars.length} · ${state.moves} COUPS`
        : `★ ${collected}/${this.level.stars.length} · ${state.moves} COUPS · ESPACE changer · swipe / tactile`,
    );
    this.nextButton.setVisible(
      state.completed && this.levelIndex < campaign.length - 1,
    );
    if (state.completed) {
      completeLevel(this.level.id);
      this.showCompletionPanel();
    } else this.hideCompletionPanel();
  }
  private showCompletionPanel() {
    if (this.completionPanel) return;
    const panel = this.add.container(GAME_W / 2, BOARD_HEIGHT / 2).setDepth(20);
    const backdrop = this.add
      .rectangle(0, 0, GAME_W * 0.62, 180, this.theme.background, 0.94)
      .setStrokeStyle(2, this.theme.accent, 0.9);
    const title = this.add
      .text(0, -55, "★ NIVEAU TERMINÉ ★", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: hexToCss(this.theme.accent),
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const moves = this.add
      .text(
        0,
        -20,
        `Niveau ${this.levelIndex + 1} · ${this.runner.getState().moves} coups`,
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: hexToCss(this.theme.text),
        },
      )
      .setOrigin(0.5);
    const replay = this.add
      .text(-105, 35, "REJOUER", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: hexToCss(this.theme.buttonText),
        backgroundColor: hexToCss(this.theme.buttonBg),
        padding: { left: 12, right: 12, top: 8, bottom: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    replay.on("pointerdown", () => this.resetLevel());
    const next = this.add
      .text(
        105,
        35,
        this.levelIndex < campaign.length - 1 ? "SUIVANT ▶" : "MENU",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: hexToCss(this.theme.buttonText),
          backgroundColor: hexToCss(this.theme.buttonCompletedBg),
          padding: { left: 12, right: 12, top: 8, bottom: 8 },
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    next.on("pointerdown", () => this.nextLevel());
    panel.add([backdrop, title, moves, replay, next]);
    this.completionPanel = panel;
    panel.setScale(0.94).setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: "Back.easeOut",
    });
  }
  private hideCompletionPanel() {
    if (this.completionPanel) {
      this.completionPanel.destroy();
      this.completionPanel = undefined;
    }
  }
  private nextLevel() {
    const world = worlds.find((entry) => entry.id === this.worldId);
    if (world && this.worldLevelIndex < world.levels.length - 1)
      this.scene.restart({
        levelIndex: getCampaignLevelIndex(
          this.worldId,
          this.worldLevelIndex + 1,
        ),
        worldId: this.worldId,
        worldLevelIndex: this.worldLevelIndex + 1,
      });
    else this.scene.start("menu");
  }
  private setPosition(
    object: Phaser.GameObjects.Container,
    position: Position,
  ) {
    const [x, y] = this.toPixel(position);
    object.setPosition(x, y);
  }
  private toPixel(position: Position): [number, number] {
    return [position.x * TILE + TILE / 2, position.y * TILE + TILE / 2];
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  antialias: true,
  width: GAME_W * DPR,
  height: GAME_H * DPR,
  parent: "app",
  scene: [MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W * DPR,
    height: GAME_H * DPR,
  },
});
