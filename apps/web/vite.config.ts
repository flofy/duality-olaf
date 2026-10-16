import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: env.VITE_BASE_PATH || "./",
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            game: ["@duality/game"],
            "level-format": ["@duality/level-format"],
            vendor: ["workbox-window"],
          },
        },
      },
    },
    plugins: [
      svelte(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["favicon.svg"],
        manifest: {
          name: "Duality Olaf",
          short_name: "Duality",
          description: "A retro grid puzzle inspired by Olaf / Maouss DS.",
          theme_color: "#0b1020",
          background_color: "#0b1020",
          display: "standalone",
          orientation: "portrait",
          lang: "fr",
          icons: [
            {
              src: "icons/icon-192.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "icons/icon-512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "maskable",
            },
            {
              src: "icons/icon-maskable.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        },
      }),
    ],
  };
});
