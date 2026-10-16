# @duality/web

App web Duality : Svelte 5 + Vite + CSS (PWA). Elle réutilise `@duality/game`
et `@duality/level-format` ; seule la couche UI vit ici.

```bash
pnpm --filter @duality/web dev        # serveur de dev
pnpm --filter @duality/web build      # svelte-check + vite build
pnpm --filter @duality/web exec vitest run   # test de fumée (jsdom)
```

## Correspondance React → Svelte

| React                                       | Svelte                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| hook `useLevelGameplay` (ancien code React) | `src/game/gameplay.svelte.ts` (`createLevelGameplay`, runes) |
| `react-router` (ancien code React)          | `src/lib/router.svelte.ts` (History API, ~60 lignes)         |
| `ErrorBoundary`                             | `<svelte:boundary>` dans `App.svelte`                        |
| `useDialogButtonNavigation`                 | action `createDialogNavigation`                              |
| tick de `AppLayout` (thème/skin)            | `appearance.svelte.ts`                                       |

Copiés de l'ancien code React : `theme`, `skins`, `progression`,
`audioFeedback`, `ambientTracks`, `movementTiming`, `boardDisplay`, `controls`,
`GestureInterpreter`, `levels/campaign`, `styles/*`, `public/*`.

## Outils de développement (portés)

Level Lab (`/dev/levels`), playground, éditeur, générateur et panneau de debug
sont portés dans `src/dev/` et `src/game/DebugPanel.svelte`. Ils restent
inactifs tant que les variables d'environnement ne sont pas activées :

```bash
VITE_ENABLE_LEVEL_LAB=true VITE_ENABLE_DEVTOOLS=true pnpm --filter @duality/web dev
pnpm level:serve   # serveur d'écriture local utilisé par « ÉCRIRE SUR LE DISQUE »
```

## Tests

- `pnpm --filter @duality/web test` : tests de fumée jsdom (vitest) —
  parcours complet d'un niveau, redirections, mode défi, outils de dev.
- `pnpm --filter @duality/web test:e2e` : suite Playwright
  (port 4174, desktop + mobile).
