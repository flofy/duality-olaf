import { test, expect } from "@playwright/test";

/**
 * Garde-fou de l'animation de déplacement : le sprite principal reste
 * mounted et se déplace de `from` à `target`, avec une traînée de brume
 * attachée au sprite. Aucun overlay de remplacement, clone décalé ou
 * clignotement ne doit revenir.
 */
test("le sprite principal reste continu et la trace suit tout le trajet", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({ completed: ["world-1-level-01"], results: {} }),
    );
  });

  await page.goto("/world/1/level/world-1-level-02");
  const board = page.locator(".board");
  await expect(board).toBeVisible();

  await page.keyboard.press("ArrowRight");
  const movingPiece = board.locator(".piece.ball.is-moving");
  await expect(movingPiece).toBeVisible();
  await expect(board.locator(".movement-overlay")).toHaveCount(0);
  await expect
    .poll(() => board.locator(".movement-trail-particle").count())
    .toBeGreaterThan(0);
  await expect(board.locator(".movement-fog")).toHaveCount(0);

  const endpoints = await movingPiece.evaluate((element) => ({
    from: element.getAttribute("data-movement-from"),
    target: element.getAttribute("data-movement-target"),
    moveX: getComputedStyle(element).getPropertyValue("--move-x").trim(),
  }));
  expect(endpoints.from).toBe("1,1");
  expect(endpoints.target).toBe("11,1");
  expect(endpoints.moveX).toMatch(/\* 10\)$/);
  await expect(board.locator(".movement-ghost")).toHaveCount(0);
  const fog = await board
    .locator(".movement-trail-particle")
    .first()
    .evaluate((element) => {
    const style = getComputedStyle(element);
    const boardRect = element.parentElement!.parentElement!.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      background: style.backgroundImage,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
      boardX: boardRect.x,
      boardY: boardRect.y,
      boardWidth: boardRect.width,
      boardHeight: boardRect.height,
    };
  });
  expect(fog.background).toContain("radial-gradient");
  expect(fog.width).toBeGreaterThan(10);
  expect(fog.height).toBeGreaterThan(10);
  await expect
    .poll(() =>
      board
        .locator(".movement-trail-particle")
        .evaluateAll((elements) =>
          elements.some((element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.1),
        ),
    )
    .toBe(true);

  await page.waitForTimeout(100);
  const transform = await movingPiece.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(transform).not.toBe("none");
  await expect(movingPiece).toHaveCount(1, { timeout: 1000 });
  await expect(board.locator(".movement-ghost")).toHaveCount(0);
});
