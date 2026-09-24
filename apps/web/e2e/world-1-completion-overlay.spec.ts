import { test, expect, type Page } from "@playwright/test";

/**
 * Régression #142 : en monde 1, la balle est le seul héros (le carré est
 * introduit en monde 2, cf. docs/campaign-plan-2026-09-23.md « aucun carré »).
 * Le premier correctif ne masquait le carré qu'au **premier niveau** de chaque
 * monde (`showSquare={worldIndex > 0}`, où `worldIndex` est l'index du niveau) :
 * on vérifie donc un niveau intermédiaire du monde 1.
 */
test("le popin de fin de niveau du monde 1 n'affiche que la balle", async ({
  page,
}) => {
  await unlockWorld1Level(page, 2);
  await page.goto("/world/1/level/world-1-level-02");
  await expect(page.locator(".board")).toBeVisible();

  // Solution optimale en 3 coups : chaque direction glisse jusqu'au mur
  // (droite → étoile, bas → étoile, gauche → étoile).
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");

  const modal = page.locator(".completion-modal");
  await expect(modal).toBeVisible();
  await expect(
    modal.locator(".modal-illustration__character--ball"),
  ).toHaveCount(1);
  await expect(
    modal.locator(".modal-illustration__character--square"),
  ).toHaveCount(0);
});

/**
 * Le popin de passage de monde est l'exception assumée : c'est le moment où le
 * deuxième héros est annoncé (« notre deuxième héros arrive ! »), donc le carré
 * y apparaît même en quittant le monde 1.
 */
test("le popin de passage du monde 1 annonce le carré", async ({ page }) => {
  await unlockWorld1Level(page, 11);
  await page.goto("/world/1/level/world-1-level-11");
  await expect(page.locator(".board")).toBeVisible();

  // Solution optimale du niveau (13 coups), extraite du solveur du jeu :
  // `solveLevel(worlds[0].levels[10])` dans packages/game.
  const solution = [
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowLeft",
    "ArrowUp",
    "ArrowLeft",
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
  ] as const;
  for (const key of solution) await page.keyboard.press(key);

  const modal = page.locator(".completion-modal");
  await expect(modal).toBeVisible();
  await expect(modal.locator(".modal-illustration--transition")).toBeVisible();
  await expect(
    modal.locator(".modal-illustration__character--square"),
  ).toHaveCount(1);
  await expect(modal).toContainText("deuxième héros");
});

/** Débloque le niveau demandé du monde 1 en marquant les précédents terminés. */
async function unlockWorld1Level(page: Page, levelNumber: number) {
  await page.addInitScript((count: number) => {
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({
        completed: Array.from(
          { length: count - 1 },
          (_, index) => `world-1-level-${String(index + 1).padStart(2, "0")}`,
        ),
        results: {},
      }),
    );
  }, levelNumber);
}
