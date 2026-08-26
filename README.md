# Duality Olaf

Modern TypeScript/Phaser reimplementation inspired by the classic **Olaf / Le Touti Rikiki, Maousse Costo** puzzle mechanics and the later **Maouss DS** adaptation.

> **Status:** gameplay implementation / prototype

## Current direction

The project now has enough historical information to move forward **without making the NDS reverse-engineering a blocker**. The magazine scans gave us the original CPC level model, while the DS analysis and 55-level visual study remain useful as reference material.

The implementation target is therefore an independent game using our own level data and engine. Historical binaries stay outside the repository.

## Goals

- Build an independent modern game engine in TypeScript + Phaser.
- Recreate the two-form puzzle loop: ball / square switching, grid movement and collectible targets.
- Ship the game as a responsive PWA, installable on mobile.
- Keep the domain/game engine independent from the UI framework.
- Eventually provide all 55 levels in a normalized format, then a level editor.
- Keep the NDS reverse-engineering work optional and non-blocking.

## Architecture

```text
duality-olaf/
├── apps/web/               # Vite + Phaser PWA shell
├── packages/game/          # framework-independent game state + rules
├── packages/level-format/  # level domain model
├── tools/nds-research/     # optional historical research tooling
├── data/                   # local/generated data
└── docs/                   # mechanics, research and level documentation
```

The Phaser layer renders state from `packages/game`. The core rules do not depend on Phaser, React or Svelte.

## Level research

The current working hypothesis is **55 levels, arranged as 5 worlds × 11 levels**, with a candidate DS map representation of **13 × 10 cells** per level. This is documented visually in `docs/assets/levels-overview.svg`.

The historical CPC format remains documented separately. We can use it as a reference/conversion source without making the original binaries part of the runtime.

## Deployment

The web app is designed as a static PWA and can be deployed to **GitHub Pages** or **Cloudflare Pages**. The implementation remains deployment-provider agnostic.

## Development roadmap

1. [x] Establish the independent TypeScript domain model.
2. [x] Introduce a framework-independent `LevelRunner`.
3. [x] Connect the prototype to Phaser.
4. [x] Add keyboard + initial touch controls.
5. [ ] Stabilize movement/collision rules against the historical gameplay.
6. [ ] Define and import the normalized 55-level catalogue.
7. [ ] Build level selection / worlds / progression.
8. [ ] Add PWA install/offline support.
9. [ ] Deploy to GitHub Pages and/or Cloudflare Pages.
10. [ ] Add a level editor and original visual identity.

## Reference / rights

The project is inspired by historical releases. Original assets, binaries and copyrighted material are treated as reference material only and should not be redistributed in this repository without confirming the applicable rights.

## License

License for the new code and original assets will be selected before the first public release.
