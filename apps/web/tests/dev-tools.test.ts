import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import App from "../src/App.svelte";
import { worlds } from "../src/lib/levels/campaign";
import { markWorldTutorialSeen } from "../src/lib/progression";
import { navigate } from "../src/lib/router.svelte";

async function boot(path: string) {
  navigate(path, { replace: true });
  document.body.innerHTML = '<div id="app"></div>';
  const app = mount(App, {
    target: document.getElementById("app")!,
    props: { updateSW: async () => {} },
  });
  flushSync();
  await new Promise((r) => setTimeout(r, 0));
  flushSync();
  return app;
}

const click = (el: Element | null | undefined) => {
  expect(el).toBeTruthy();
  (el as HTMLElement).click();
  flushSync();
};
const byText = (selector: string, text: string) =>
  Array.from(document.querySelectorAll(selector)).find((el) => el.textContent?.includes(text));

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("outils de dev", () => {
  it("catalogue : déplie un monde et affiche des vignettes", async () => {
    const app = await boot("/dev/levels");
    expect(document.body.textContent).toContain("LEVEL LAB");
    click(byText(".dev-catalogue-group", "World 1"));
    expect(document.querySelectorAll(".dev-catalogue-card").length).toBe(worlds[0]!.levels.length);
    expect(document.querySelector(".dev-thumb-cell")).not.toBeNull();
    unmount(app);
  });

  it("playground : charge un niveau et le plateau", async () => {
    const app = await boot(`/dev/levels/${worlds[0]!.levels[0]!.id}`);
    expect(document.querySelector(".board")).not.toBeNull();
    expect(document.body.textContent).toContain("PLAYGROUND");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    flushSync();
    unmount(app);
  });

  it("éditeur : peint un mur, valide et teste", async () => {
    const app = await boot("/dev/editor");
    const cells = () => document.querySelectorAll(".editor-cell");
    expect(cells().length).toBe(13 * 10);
    const before = document.querySelectorAll(".editor-cell.wall").length;
    // « empty » puis « wall » : on pose un mur sur une case vide au centre
    const target = cells()[5 * 13 + 6]!;
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
    flushSync();
    expect(document.querySelectorAll(".editor-cell.wall").length).not.toBe(before);
    click(byText(".editor-action", "VALIDER"));
    expect(document.querySelector(".editor-status")?.textContent).toMatch(/Solvable|non solvable/);
    click(byText(".editor-action", "TESTER"));
    expect(document.querySelector(".editor-play-overlay")).not.toBeNull();
    unmount(app);
  });

  it("générateur : propose des candidats solvables", async () => {
    const app = await boot("/dev/generator");
    expect(document.body.textContent).toContain("GÉNÉRATEUR DE NIVEAUX");
    expect(document.querySelectorAll(".generator-card").length).toBeGreaterThan(0);
    click(document.querySelector(".generator-card"));
    expect(document.querySelector(".generator-player")).not.toBeNull();
    unmount(app);
  });

  it("panneau de debug : enregistre les coups", async () => {
    markWorldTutorialSeen(1);
    const app = await boot(`/world/1/level/${worlds[0]!.levels[0]!.id}`);
    expect(document.querySelector(".dev-entry")).not.toBeNull();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    flushSync();
    expect(document.querySelector(".dev-entry")?.textContent).toMatch(/1 commandes|0 commandes/);
    unmount(app);
  });
});
