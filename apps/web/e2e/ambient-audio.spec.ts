import { test, expect } from "@playwright/test";

/**
 * La musique de monde est synthétisée à la volée : une hauteur invalide, un
 * paramètre Web Audio hors bornes ou une boucle mal découpée ne se voient pas à
 * la compilation, seulement à l'oreille — donc jamais pendant une régression.
 * Ce test démarre vraiment la boucle et vérifie qu'elle produit des voix sans
 * lever d'erreur.
 */
test("l'ambiance du monde démarre et ne lève aucune erreur", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  // Compte les oscillateurs créés par la boucle d'ambiance (les notes
  // utilisent `createOscillator`), sans toucher au reste du moteur audio.
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

  await page.goto("/world/1/level/world-1-level-01");
  await expect(page.locator(".board")).toBeVisible();

  // Le son est actif par défaut : deux bascules « m » éteignent puis rallument
  // la musique, ce qui la (re)démarre après un premier vrai geste clavier.
  await page.keyboard.press("m");
  await page.keyboard.press("m");

  // Laisse tourner quelques pas de la boucle (un pas ≈ 280 ms en monde 1).
  await page.waitForTimeout(1_500);

  const oscillators = await page.evaluate(
    () => (window as typeof window & { __oscillators?: number }).__oscillators,
  );
  expect(oscillators ?? 0).toBeGreaterThan(4);
  expect(errors).toEqual([]);
});
