/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEVTOOLS?: string;
  readonly VITE_ENABLE_LEVEL_LAB?: string;
  readonly VITE_LEVEL_SERVER_URL?: string;
}
