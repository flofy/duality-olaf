# Duality Olaf

Modern TypeScript/Phaser reimplementation inspired by the classic **Olaf / Le Touti Rikiki, Maousse Costo** puzzle mechanics and the later **Maouss DS** adaptation.

> **Status:** research / prototype

## Goals

- Study the original Maouss DS `.nds` as a gameplay and level-format reference.
- Reverse-engineer level data where technically and legally appropriate.
- Build an independent modern game engine in TypeScript + Phaser.
- Ship the game as a responsive PWA, installable on mobile.
- Keep the UI layer independent from the Phaser game loop so React or Svelte can be evaluated without coupling the core engine.
- Eventually provide a level editor and custom-level format.

## Project structure

```text
duality-olaf/
├── apps/
│   └── web/                 # PWA / web application
├── packages/
│   ├── game/                # Phaser game engine
│   ├── level-format/        # Level model, parser and serializer
│   ├── ui/                  # Application UI (React/Svelte decision pending)
│   └── shared/              # Shared TypeScript types/utilities
├── tools/
│   └── nds-research/        # NDS extraction and analysis tooling
├── data/
│   ├── reference/           # Research notes and metadata
│   ├── extracted/           # Locally extracted reference data (not committed by default)
│   └── levels/              # Normalized level data
├── docs/
│   ├── reverse-engineering.md
│   ├── game-mechanics.md
│   └── level-format.md
└── .github/
    └── workflows/
```

## Deployment

The web app is designed as a static PWA and can be deployed to **GitHub Pages** or **Cloudflare Pages**. The first implementation should remain deployment-provider agnostic.

## Reference

The project is inspired by historical releases. Original assets, binaries and copyrighted material are treated as reference material only and should not be redistributed in this repository without confirming the applicable rights.

See `docs/reverse-engineering.md` for the research boundary and workflow.

## Development roadmap

1. [ ] Recover and archive research metadata for Maouss DS.
2. [ ] Analyze the `.nds` filesystem and identify candidate level resources.
3. [ ] Document the level format and gameplay rules.
4. [ ] Define the independent TypeScript domain model.
5. [ ] Implement the Phaser prototype with one hand-authored test level.
6. [ ] Add PWA support and mobile touch controls.
7. [ ] Add level conversion/import tooling where permitted.
8. [ ] Add a level editor.
9. [ ] Build an original campaign and visual identity.

## License

License for the new code and original assets will be selected before the first public release. Reference material remains subject to its original rights and licenses.
