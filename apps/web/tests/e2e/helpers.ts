import { expect, type Locator, type Page } from "@playwright/test";
import type { SolverCommand } from "@duality/game";
import type { Level } from "@duality/level-format";

/** Progress storage key, mirroring src/progression.ts. */
export const PROGRESS_KEY = "duality.progress.v1";

/** Le plateau de jeu d'une partie (par opposition au playground dev). */
export const board = (page: Page): Locator => page.locator(".game .board");

/** Ligne « ★ x/y · N COUPS » : la seule source du compteur de coups. */
export const hud = (page: Page): Locator => page.locator(".game .hud .muted");

/** Prépare une progression locale avant que l'application ne démarre. */
export async function seedProgress(
  page: Page,
  completed: readonly string[],
): Promise<void> {
  await page.addInitScript(
    ([key, ids]) => {
      window.localStorage.setItem(key!, JSON.stringify({ completed: ids }));
    },
    [PROGRESS_KEY, completed] as const,
  );
}

/** Ids de tous les niveaux qui précèdent `level` dans la campagne. */
export function levelsBefore(
  worlds: readonly { levels: readonly Level[] }[],
  level: Level,
): string[] {
  const ids: string[] = [];
  for (const world of worlds) {
    for (const candidate of world.levels) {
      if (candidate.id === level.id) return ids;
      ids.push(candidate.id);
    }
  }
  throw new Error(`niveau inconnu : ${level.id}`);
}

/** Touche clavier correspondant à une commande du solveur. */
export function keyFor(command: SolverCommand): string {
  if (command.type === "switch") return " ";
  const { x, y } = command.direction;
  if (x === -1) return "ArrowLeft";
  if (x === 1) return "ArrowRight";
  if (y === -1) return "ArrowUp";
  return "ArrowDown";
}

/**
 * Rejoue une solution du solveur au clavier, en attendant à chaque étape que
 * React ait rendu le coup : sans cette attente, des frappes trop rapides
 * seraient fusionnées et la partie divergerait du scénario.
 */
export async function replaySolution(
  page: Page,
  commands: readonly SolverCommand[],
): Promise<void> {
  const counter = page.locator(".game .hud .muted");
  for (const [index, command] of commands.entries()) {
    await page.keyboard.press(keyFor(command));
    await expect(counter).toContainText(`${index + 1} COUPS`);
  }
}

/** Ouvre le panneau burger et attend qu'il soit déplié. */
export async function openAppMenu(page: Page): Promise<Locator> {
  const toggle = page.locator("button.burger-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#app-menu")).toHaveClass(/open/);
  return toggle;
}
