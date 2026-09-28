import { test, expect, type Page } from "@playwright/test";

async function performTutorialAction(page: Page) {
  const activeStep = page.locator(
    ".world-tutorial-stepper li[aria-current='step']",
  );
  const action = page.locator(".world-tutorial-command kbd");
  const label = (await action.innerText()).trim();
  const stepText = await activeStep.innerText();

  if (label === "ESPACE") {
    await page.getByRole("button", { name: "Changer de forme" }).click();
  } else {
    const direction = {
      "→": "Déplacer à droite",
      "←": "Déplacer à gauche",
      "↑": "Déplacer en haut",
      "↓": "Déplacer en bas",
    }[label];
    if (!direction) throw new Error(`Action inconnue : ${label}`);
    await page.getByRole("button", { name: direction }).click();
  }

  await expect
    .poll(async () => {
      const next = page.locator(
        ".world-tutorial-stepper li[aria-current='step']",
      );
      return (await next.count()) === 0 ? "finished" : next.innerText();
    })
    .not.toBe(stepText);
}

test("le tutoriel utilise le premier niveau réel puis le mode libre", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({
        completed: [
          "world-1-level-01",
          "world-1-level-02",
          "world-1-level-03",
          "world-1-level-04",
        ],
        results: {},
      }),
    );
  });
  await page.goto("/menu");
  await page.getByRole("button", { name: /MONDE 1/ }).click();
  await expect(page).toHaveURL(/\/world\/1$/);

  await page.locator(".level-button").first().click();
  await expect(page).toHaveURL(/world-1-level-01$/);
  await expect(page.locator(".world-tutorial .board")).toBeVisible();
  await expect(page.locator(".world-tutorial-panel h1")).toHaveText(
    "Déplacer la boule",
  );
  await expect(page.locator(".world-tutorial-stepper li")).toHaveCount(1);
  await expect(page.locator(".star-container")).toBeVisible();
  await expect(page.locator(".world-tutorial-reset")).toHaveCount(1);
  await expect(page.locator(".hud-restart")).toHaveCount(0);

  if ((page.viewportSize()?.width ?? 0) <= 900) {
    const panelBox = await page.locator(".world-tutorial-panel").boundingBox();
    const boardColumnBox = await page
      .locator(".world-tutorial-board-column")
      .boundingBox();
    const resetBox = await page.locator(".world-tutorial-reset").boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(panelBox).not.toBeNull();
    expect(boardColumnBox).not.toBeNull();
    expect(resetBox).not.toBeNull();
    expect(panelBox!.y).toBeLessThan(boardColumnBox!.y);
    expect(resetBox!.x).toBeGreaterThanOrEqual(0);
    expect(resetBox!.x + resetBox!.width).toBeLessThanOrEqual(viewportWidth);
  }

  await expect(page.locator(".world-tutorial-timer")).toBeVisible();
  await expect(page.locator(".world-tutorial-timer-bar")).toHaveCSS(
    "height",
    "5px",
  );
  await expect(page.getByRole("button", { name: "CONTINUER" })).toHaveCount(0);
  await expect
    .poll(
      async () =>
        Number(
          await page
            .locator(".world-tutorial-timer")
            .getAttribute("aria-valuenow"),
        ),
      { timeout: 5000 },
    )
    .toBeLessThan(5);
  await page.getByRole("button", { name: "Recommencer le niveau" }).click();
  await expect(page.locator(".world-tutorial-panel h1")).toHaveText(
    "Déplacer la boule",
  );
  await expect(page.locator(".star-container")).toBeVisible();
  await expect
    .poll(async () => page.locator(".world-tutorial-panel h1").innerText(), {
      timeout: 7000,
    })
    .toBe("C’EST COMPRIS !");
  await expect(page.locator(".star-container")).toHaveCount(0);
  await expect(page.locator(".world-tutorial-timer")).toHaveCount(0);
  await page.getByRole("button", { name: "JOUER LE NIVEAU" }).click();

  // Le mode libre est bien un nouveau état du vrai niveau, avec ses commandes.
  await expect(page.locator(".world-tutorial")).toHaveCount(0);
  await expect(page.locator(".hud")).toContainText("0 COUPS");
  await expect(page.locator(".star-container")).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) <= 600) {
    const hudRestart = await page.locator(".hud-restart").boundingBox();
    expect(hudRestart).not.toBeNull();
    expect(hudRestart!.x + hudRestart!.width).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? 0,
    );
  }
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".overlay")).toBeVisible();
  await expect(page.locator(".overlay")).toContainText("NIVEAU TERMINÉ");

  await page.goto("/world/1");
  await expect(page.locator(".level-button").first()).toContainText("01");
  await expect(
    page.getByRole("button", { name: "REVOIR LE TUTORIEL FEU" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "REVOIR LE TUTORIEL FEU" }).click();
  await expect(page).toHaveURL(/world-1-level-05\?tutorial=fire/);
  await expect(page.locator(".world-tutorial-eyebrow")).toContainText(
    "TUTORIEL FEU",
  );
  await expect(page.locator(".world-tutorial-timer")).toBeVisible();
  await page.goto("/world/1");
  await page
    .getByRole("button", { name: "REVOIR LE TUTORIEL", exact: true })
    .click();
  await expect(page.locator(".world-tutorial-panel h1")).toHaveText(
    "Déplacer la boule",
  );
});

test("le premier niveau avec feu est guidé sur son vrai plateau", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({
        completed: [
          "world-1-level-01",
          "world-1-level-02",
          "world-1-level-03",
          "world-1-level-04",
        ],
        results: {},
      }),
    );
  });

  await page.goto("/world/1/level/world-1-level-05");
  await expect(page.locator(".world-tutorial .board")).toBeVisible();
  await expect(page.locator(".world-tutorial-eyebrow")).toContainText(
    "TUTORIEL FEU",
  );
  await expect(page.locator(".world-tutorial-panel h1")).toHaveText(
    "Repérer les flammes",
  );
  await expect(page.locator(".fire-container")).toHaveCount(2);
  await expect(page.locator(".world-tutorial-stepper li")).toHaveCount(5);

  await expect(page.getByRole("button", { name: "CONTINUER" })).toHaveCount(0);
  await expect
    .poll(async () => page.locator(".world-tutorial-panel h1").innerText(), {
      timeout: 9000,
    })
    .not.toBe("Repérer les flammes");
  for (let index = 0; index < 4; index += 1) {
    await performTutorialAction(page);
  }
  await page.getByRole("button", { name: "JOUER LE NIVEAU" }).click();
  await expect(page.locator(".world-tutorial")).toHaveCount(0);
  await expect(page.locator(".hud")).toContainText("0 COUPS");

  await page.reload();
  await expect(page.locator(".world-tutorial")).toHaveCount(0);
  await expect(page.locator(".board")).toBeVisible();
});

test("chaque premier niveau/tutorial présente la mécanique de son monde", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const completed = Array.from({ length: 44 }, (_, index) => {
      const world = Math.floor(index / 11) + 1;
      const level = (index % 11) + 1;
      return `world-${world}-level-${String(level).padStart(2, "0")}`;
    });
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({ completed, results: {} }),
    );
  });

  for (let world = 1; world <= 5; world += 1) {
    await page.goto(`/world/${world}/level/world-${world}-level-01?tutorial=1`);
    await expect(page.locator(".world-tutorial .board")).toBeVisible();
    await expect(
      page.locator(".world-tutorial-stepper li").first(),
    ).toBeVisible();
  }

  await expect(page.locator(".switch-tile.form-ball")).toBeVisible();
  await expect(page.locator(".door")).toBeVisible();
  await expect(
    page
      .locator(".world-tutorial-stepper li")
      .filter({ hasText: "Actionner l’interrupteur" }),
  ).toHaveCount(1);

  for (let index = 0; index < 6; index += 1) {
    await performTutorialAction(page);
  }
  await expect(page.locator(".door")).toHaveClass(/open/);
});

test("les interrupteurs associent chaque variante à la couleur de sa forme", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const completed: string[] = [];
    for (let world = 1; world <= 4; world += 1) {
      for (let level = 1; level <= 11; level += 1) {
        completed.push(
          `world-${world}-level-${String(level).padStart(2, "0")}`,
        );
      }
    }
    for (let level = 1; level <= 6; level += 1) {
      completed.push(`world-5-level-${String(level).padStart(2, "0")}`);
    }
    localStorage.setItem(
      "duality.progress.v2",
      JSON.stringify({ completed, results: {} }),
    );
  });

  await page.goto("/world/5/level/world-5-level-07");
  const boardSwitch = page.locator(".switch-tile.form-square");
  await expect(boardSwitch).toBeVisible();
  await expect(boardSwitch.locator("svg")).toHaveAttribute(
    "aria-label",
    "Interrupteur actionnable par le carré",
  );
  await expect(boardSwitch.locator("svg rect").nth(1)).toHaveCSS(
    "fill",
    "rgb(255, 212, 71)",
  );
});

test("level-lab: le catalogue /dev/levels scrolle", async ({ page }) => {
  // Régression desktop : .app est en overflow:hidden + height:100dvh et .shell
  // en max-height:100% sans overflow → le contenu long du catalogue était
  // clippé, sans aucun scroll possible. Le correctif (layout.css) ajoute
  // overflow-y:auto sur .shell pour les routes /dev/*. On vérifie ici qu'un
  // scroll vertical existe vraiment (scrollHeight > clientHeight) et que le
  // scrollTop bouge.
  // Viewport court et explicite : l'overflow doit être garanti quel que soit le
  // profil Playwright (desktop 1280x720 ou mobile Pixel 7, bien plus haut).
  await page.setViewportSize({ width: 900, height: 420 });
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
      async () => shell.evaluate((el) => el.scrollHeight - el.clientHeight),
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

test("ui regression: burger menu exposes keyboard-safe controls", async ({
  page,
}) => {
  await page.goto("/menu");

  const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();

  const gestures = page.getByRole("button", {
    name: /GESTES · (ACTIVÉS|DÉSACTIVÉS)/,
  });
  await expect(gestures).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe("app-menu");

  const initial = await page.evaluate(() =>
    window.localStorage.getItem("duality.swipe.v1"),
  );
  await gestures.click();
  const updated = await page.evaluate(() =>
    window.localStorage.getItem("duality.swipe.v1"),
  );
  expect(updated).not.toBe(initial);
});
