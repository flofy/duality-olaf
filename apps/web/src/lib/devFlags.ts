/** Outils de développement : activés par variables d'environnement Vite. */
export const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";
export const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";

/** Serveur d'écriture local (tools/level-serve.mjs) — `pnpm level:serve`. */
export const LEVEL_SERVER_URL =
  import.meta.env.VITE_LEVEL_SERVER_URL ?? "http://localhost:34761";
