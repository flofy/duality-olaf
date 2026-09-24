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
      const boardRect =
        element.parentElement!.parentElement!.getBoundingClientRect();
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
          elements.some(
            (element) =>
              Number.parseFloat(getComputedStyle(element).opacity) > 0.1,
          ),
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

test("le téléportateur produit un zap audio sans erreur", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const proto = window.BaseAudioContext?.prototype;
    if (!proto) return;
    const state = window as typeof window & { __oscillators?: number };
    state.__oscillators = 0;
    const original = proto.createOscillator;
    proto.createOscillator = function patched(this: BaseAudioContext) {
      state.__oscillators = (state.__oscillators ?? 0) + 1;
      return original.call(this);
    };
  });

  await page.goto("/dev/levels/tutorial-teleporter-02");
  await expect(page.locator(".board")).toBeVisible();
  const oscillators = () =>
    page.evaluate(
      () =>
        (window as typeof window & { __oscillators?: number }).__oscillators ??
        0,
    );
  const before = await oscillators();
  await page.keyboard.press("ArrowUp");
  await expect.poll(oscillators).toBeGreaterThan(before);
  expect(errors).toEqual([]);
});

test("la téléportation révèle l'arrivée puis poursuit le glissement", async ({
  page,
}) => {
  await page.goto("/dev/levels/tutorial-teleporter-02");
  const board = page.locator(".board");
  await expect(board).toBeVisible();

  // Le premier pad encountered during this upward slide is (2,5). The runner
  // continues upward after landing on its counterpart (10,7), stopping at
  // (10,3) because the square blocks the next cell.
  await page.keyboard.press("ArrowUp");
  const departure = board.locator(".teleport-departure");
  const arrival = board.locator(".teleport-arrival");
  await expect(departure).toBeVisible();
  await expect(arrival).toBeVisible();
  await expect(departure).toHaveAttribute("data-teleport-from", "2,5");
  await expect(arrival).toHaveAttribute("data-teleport-to", "10,7");
  await expect(board.locator(".piece.ball")).toHaveClass(/teleporting-piece/);
  await expect(board.locator(".piece.ball.is-moving")).toHaveCount(0);
  await expect(arrival).toHaveAttribute(
    "style",
    /--teleport-shift-y: calc\(var\(--cell-height\) \* -4\)/,
  );
  await expect(board.locator(".teleport-effect")).toHaveCount(0);
  const ball = board.locator(".piece.ball");
  await expect(ball).toHaveClass(/piece ball/);
  await expect(ball).not.toHaveClass(/teleporting-piece/);
  await expect(ball).toHaveAttribute("style", /grid-area: 4 \/ 11/);

  // Return through pad B, then leave the ball on pad A. Starting a third warp
  // immediately after the second checks that the sequence id remounts the
  // effects and restarts CSS rather than inheriting the previous animation.
  await page.keyboard.press("ArrowDown");
  await expect(board.locator(".teleport-effect")).toHaveCount(2);
  await expect(departure).toHaveAttribute("data-teleport-from", "10,7");
  await expect(arrival).toHaveAttribute("data-teleport-to", "2,5");

  await page.keyboard.press("ArrowUp");
  await expect(board.locator(".teleport-effect")).toHaveCount(2);
  await expect(departure).toHaveAttribute("data-teleport-from", "2,5");
  await expect(arrival).toHaveAttribute("data-teleport-to", "10,7");

  // A blocked input must not cut the active teleport feedback short.
  await page.keyboard.press("ArrowUp");
  await expect(board.locator(".teleport-effect")).toHaveCount(2);

  // Reset immediately cancels both visual feedback and its timer. Switching the
  // form afterwards stays clean too.
  await page.keyboard.press("r");
  await expect(board.locator(".teleport-effect")).toHaveCount(0);
  await expect(board.locator(".piece.ball")).toBeVisible();
  await expect(page.locator(".hud .muted")).toContainText("0 COUPS");
  await page.keyboard.press(" ");
  await expect(board.locator(".piece.square")).not.toHaveClass(/inactive/);
  await expect(board.locator(".teleport-effect")).toHaveCount(0);
});
