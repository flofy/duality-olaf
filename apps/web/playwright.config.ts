import { defineConfig, devices } from "@playwright/test";

/** Doit rester aligné avec le port utilisé par le `webServer` ci-dessous. */
const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Le jeu est tactile et mobile-first : un second projet exerce le vrai
    // chemin swipe/hasTouch, que Desktop Chrome ne couvre pas.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Vite donne la priorité à process.env sur .env/.env.local : les tests ne
      // dépendent donc pas de la config locale du développeur (vérifié).
      // Le LEVEL LAB doit être actif car un test s'en sert comme harnais.
      VITE_ENABLE_LEVEL_LAB: "true",
      VITE_ENABLE_DEVTOOLS: "false",
    },
  },
});
