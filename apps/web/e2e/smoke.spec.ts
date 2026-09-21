import { test, expect } from "@playwright/test";

test("smoke: navigate from intro to level 1 and complete it", async ({
  page,
}) => {
  // --- Lancement depuis l'intro ---
  await page.goto("/");
  // L'intro est ciblable par .intro (pas de route /menu dans l'URL).
  await expect(page.locator(".intro")).toBeVisible();

  // Le tagline confirme qu'on a le bon jeu.
  await expect(page.locator(".intro-tagline")).toHaveText(
    "DEUX FORMES · UN SEUL CHEMIN",
  );

  // ENTRÉE pour passer à la page de menu.
  await page.keyboard.press("Enter");

  // --- Page menu : liste des mondes ---
  await expect(page).toHaveURL(/\/menu/);
  await expect(page.locator(".title")).toHaveText("DUALITY");

  // Le monde 1 est débloqué (premier clic possible).
  const world1Button = page.getByRole("button", { name: /MONDE 1/ });
  await expect(world1Button).toBeEnabled();
  await world1Button.click();

  // --- Page monde 1 : liste des niveaux ---
  await expect(page).toHaveURL(/\/world\/1$/);
  await expect(page.locator("b")).toHaveText("MONDE 1");

  // Le premier niveau (01) est débloqué.
  const level1Button = page.locator(".level-button").first();
  await expect(level1Button).toBeEnabled();
  await expect(level1Button).toHaveText("01");
  await level1Button.click();

  // --- Page niveau ---
  await expect(page).toHaveURL(/\/world\/1\/level\/world-1-level-01$/);
  await expect(page.locator(".board")).toBeVisible();

  // L'étoile est affichée sur le plateau.
  await expect(page.locator(".star-container")).toBeVisible();
  // Aucun overlay de victoire au début.
  await expect(page.locator(".overlay")).toHaveCount(0);

  // --- Jouer : la balle va de (1,4) à (5,4), 4 mouvements à droite ---
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  // --- Victoire ---
  // L'overlay de complétion apparaît.
  await expect(page.locator(".overlay")).toBeVisible({ timeout: 2_000 });
  await expect(page.locator(".overlay")).toContainText(
    /félicitations|terminé|réussi/i,
  );

  // La progression est enregistrée : le niveau apparaît comme terminé (✓) en revenant.
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/world\/1$/);
  await expect(page.locator(".level-button").first()).toHaveText("✓");
});

test("level-lab: le catalogue /dev/levels scrolle sur desktop", async ({
  page,
}) => {
  // Régression desktop : .app est en overflow:hidden + height:100dvh et .shell
  // en max-height:100% sans overflow → le contenu long du catalogue était
  // clippé, sans aucun scroll possible. Le correctif (layout.css) ajoute
  // overflow-y:auto sur .shell pour les routes /dev/*. On vérifie ici qu'un
  // scroll vertical existe vraiment (scrollHeight > clientHeight) et que le
  // scrollTop bouge.
  await page.goto("/dev/levels");
  const shell = page.locator(".shell");
  await expect(shell).toBeVisible();

  // Le catalogue est replié par défaut : on déplie un groupe pour que le
  // contenu dépasse du viewport desktop (1280x720), condition nécessaire
  // pour exercer le scroll.
  const firstGroup = page.locator(".dev-catalogue-group").first();
  await expect(firstGroup).toBeVisible();
  if ((await firstGroup.getAttribute("aria-expanded")) !== "true") {
    await firstGroup.click();
  }
  await expect
    .poll(
      async () =>
        shell.evaluate(
          (el) => el.scrollHeight - el.clientHeight,
        ),
      { timeout: 5_000 },
    )
    .toBeGreaterThan(40);

  const scrollable = await shell.evaluate((el) => {
    const style = getComputedStyle(el);
    const canScrollY =
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      el.scrollHeight - el.clientHeight > 40;
    return {
      overflowY: style.overflowY,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      canScrollY,
    };
  });
  expect(
    scrollable,
    `le catalogue devrait scroller (overflowY=${scrollable.overflowY}, scrollH=${scrollable.scrollHeight}, clientH=${scrollable.clientHeight})`,
  ).toMatchObject({ canScrollY: true });

  // Le scroll fonctionne réellement : scrollTop augmente après scrollTo bas.
  const topBefore = await shell.evaluate((el) => el.scrollTop);
  await shell.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  const topAfter = await shell.evaluate((el) => el.scrollTop);
  expect(topAfter).toBeGreaterThan(topBefore);
});
