import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { solveLevel } from "@duality/game";
import { worlds } from "../src/lib/levels/campaign";
import { markWorldTutorialSeen } from "../src/lib/progression";
import { navigate } from "../src/lib/router.svelte";
import App from "../src/App.svelte";

async function boot(path: string) {
  navigate(path, { replace: true });
  document.body.innerHTML = '<div id="app"></div>';
  const app = mount(App, {
    target: document.getElementById("app")!,
    props: { updateSW: async () => {} },
  });
  flushSync();
  return app;
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const press = (key: string) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("duality svelte smoke", () => {
  it("affiche l'intro puis le menu", async () => {
    const app = await boot("/");
    expect(document.body.textContent).toContain("DUALITY");
    unmount(app);
    const app2 = await boot("/menu");
    expect(document.body.textContent).toContain("MONDE 1");
    unmount(app2);
  });

  it("joue le niveau 1 du monde 1 jusqu'à la victoire", async () => {
    markWorldTutorialSeen(1);
    const level = worlds[0]!.levels[0]!;
    const app = await boot(`/world/1/level/${level.id}`);
    await tick();
    expect(document.querySelector(".board")).not.toBeNull();
    expect(document.querySelector(".piece.ball")).not.toBeNull();

    const solution = solveLevel(level);
    expect(solution.solvable).toBe(true);
    if (!solution.solvable) return;
    for (const command of solution.commands) {
      if (command.type === "switch") press(" ");
      else {
        const { x, y } = command.direction;
        press(x < 0 ? "ArrowLeft" : x > 0 ? "ArrowRight" : y < 0 ? "ArrowUp" : "ArrowDown");
      }
      flushSync();
      await tick(400); // laisse finir l'animation (le chrono est en pause)
    }
    flushSync();
    expect(document.body.textContent).toContain("NIVEAU TERMINÉ");
    expect(localStorage.length).toBeGreaterThan(0);
    unmount(app);
  });

  it("redirige un niveau verrouillé vers le monde", async () => {
    markWorldTutorialSeen(1);
    const app = await boot(`/world/1/level/${worlds[0]!.levels[3]!.id}`);
    await tick();
    flushSync();
    expect(window.location.pathname).toBe("/world/1");
    unmount(app);
  });

  it("ouvre le mode défi", async () => {
    const app = await boot("/challenge?profile=classic&seed=42");
    await tick();
    expect(document.body.textContent).toContain("SEED · 42");
    unmount(app);
  });
});
