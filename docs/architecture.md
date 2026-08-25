# Architecture

## Principles

- Phaser owns the game loop and rendering.
- The game domain remains independent of React/Svelte and deployment infrastructure.
- The PWA shell owns navigation, installation, persistence and non-game UI.
- Level data is independent from rendering.
- Historical reverse-engineering tools remain isolated from the runtime.

## Proposed workspace

```text
apps/
  web/                 PWA shell + game host
packages/
  game/                Phaser scenes, systems and input adapter
  level-format/        Level types, parser/serializer and validation
  ui/                  UI components; framework choice remains open
  shared/              Common primitives
  tools/               Optional reusable analysis utilities

tools/
  nds-research/        NDS extraction/inspection scripts
```

## UI decision

React and Svelte are both viable. The first gameplay prototype should not depend on either framework. Once the core loop is stable, choose the UI framework based on the needs of menus, level selection, editor and PWA shell.

## Deployment

Primary target: static PWA.

Supported deployment options:

- GitHub Pages via GitHub Actions;
- Cloudflare Pages/Workers static hosting.

The application should use relative asset paths and avoid provider-specific APIs so either deployment remains straightforward.
