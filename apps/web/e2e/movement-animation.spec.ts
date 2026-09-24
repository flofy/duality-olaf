import { test, expect } from "@playwright/test";

/**
 * Garde-fou de l'animation de déplacement (cf. #132 puis #145, régression #143).
 *
 * Deux propriétés doivent rester vraies, sinon le trajet « saccade » :
 * 1. la pièce réelle est masquée tant que l'overlay anime le trajet (sinon on
 *    voit deux sprites : la pièce déjà arrivée + le fantôme en mouvement) ;
 * 2. l'overlay vit au moins aussi longtemps que son animation CSS (sinon la
 *    pièce est révélée en plein vol et saute sur la fin du trajet).
 */
test("le trajet anime l'overlay sur toute la durée et masque la pièce réelle", async ({
  page,
}) => {
  // Le niveau 02 est verrouillé tant que le 01 n'est pas terminé : on amorce la
  // sauvegarde locale. Son premier coup est un long glissement (10 cases).
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({ completed: ["world-1-level-01"], results: {} }),
    );
  });

  await page.goto("/world/1/level/world-1-level-02");
  await expect(page.locator(".board")).toBeVisible();

  await page.evaluate(() => {
    const measurements: {
      shownMs: number;
      animationMs: number;
      pieceOpacity: string | null;
    }[] = [];
    (window as typeof window & { __moves?: typeof measurements }).__moves =
      measurements;

    const board = document.querySelector(".board");
    if (!board) return;
    let startedAt: number | null = null;
    let animationMs = 0;
    let pieceOpacity: string | null = null;

    const observer = new MutationObserver(() => {
      const overlay = board.querySelector(".movement-overlay");
      if (overlay && startedAt === null) {
        startedAt = performance.now();
        const moveAnimation = overlay
          .getAnimations()
          .find(
            (animation) =>
              (animation as CSSAnimation).animationName === "pieceMove",
          );
        animationMs = Number(moveAnimation?.effect?.getTiming().duration ?? 0);
        const piece = board.querySelector(
          ".piece.ball:not(.movement-overlay), .piece.square:not(.movement-overlay)",
        );
        pieceOpacity = piece ? getComputedStyle(piece).opacity : null;
      } else if (!overlay && startedAt !== null) {
        measurements.push({
          shownMs: performance.now() - startedAt,
          animationMs,
          pieceOpacity,
        });
        startedAt = null;
      }
    });
    observer.observe(board, { childList: true, subtree: true });
  });

  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".movement-overlay")).toBeVisible();
  const movementEndpoints = await page
    .locator(".movement-overlay")
    .evaluate((element) => ({
      from: element.getAttribute("data-movement-from"),
      target: element.getAttribute("data-movement-target"),
      moveX: getComputedStyle(element).getPropertyValue("--move-x").trim(),
    }));
  // Niveau 02 : la balle part de 1,1 et glisse jusqu'au mur. Le target doit
  // être cette dernière case du glissement, pas la case 2,1 voisine.
  const [fromX, fromY] = movementEndpoints.from!.split(",").map(Number);
  const [targetX, targetY] = movementEndpoints.target!.split(",").map(Number);
  expect(fromY).toBe(1);
  expect(targetY).toBe(1);
  expect(targetX - fromX).toBeGreaterThan(1);
  expect(movementEndpoints.moveX).toMatch(/\* 10\)$/);
  await page.waitForTimeout(100);
  const measuredMove = await page
    .locator(".movement-overlay")
    .evaluate((element) => ({
      from: element.getBoundingClientRect().left,
      transform: getComputedStyle(element).transform,
    }));
  expect(measuredMove.transform).not.toBe("none");
  // La transformation doit utiliser plusieurs cellules, pas seulement la
  // largeur de l'overlay (le bug qui donnait une impression de saut d'une case).
  const translation = measuredMove.transform.match(
    /matrix\([^,]+, [^,]+, [^,]+, [^,]+, ([^,]+),/,
  );
  expect(translation).not.toBeNull();
  expect(Math.abs(Number(translation![1]))).toBeGreaterThan(0);

  await expect(page.locator(".movement-overlay")).toHaveCount(0);

  const moves = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __moves?: {
            shownMs: number;
            animationMs: number;
            pieceOpacity: string | null;
          }[];
        }
      ).__moves ?? [],
  );
  expect(moves).toHaveLength(1);
  const [firstMove] = moves;
  expect(firstMove!.animationMs).toBeGreaterThan(0);
  // Le déplacement doit rester réactif, y compris sur un long glissement.
  expect(firstMove!.animationMs).toBeLessThanOrEqual(600);
  // La pièce « réelle » ne doit pas doubler le sprite en mouvement.
  expect(firstMove!.pieceOpacity).toBe("0");
  // Une petite tolérance couvre la granularité du timer JS.
  expect(firstMove!.shownMs).toBeGreaterThanOrEqual(
    firstMove!.animationMs - 25,
  );
});
