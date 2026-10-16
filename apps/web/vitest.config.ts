import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: { conditions: ["browser"] },
  test: { environment: "jsdom", env: { VITE_ENABLE_LEVEL_LAB: "true", VITE_ENABLE_DEVTOOLS: "true" }, include: ["tests/**/*.test.ts"], setupFiles: ["tests/setup.ts"] },
});
