# Level format

## Target

Define an engine-independent level representation that can eventually import historical levels when their format is understood and their use is permitted.

## Initial TypeScript model

```ts
export type Position = {
  x: number;
  y: number;
};

export type Tile =
  | 'empty'
  | 'wall'
  | 'target'
  | 'hazard'
  | 'stop';

export type Level = {
  id: string;
  width: number;
  height: number;
  tiles: Tile[][];
  movingForm: Position;
  blockingForm: Position;
  targets: Position[];
};
```

This is deliberately a clean-room domain model. Historical binary fields should be mapped into it by an explicit converter rather than leaking binary-layout assumptions into the game engine.

## Historical CPC clue

`TABLJEU.BIN` is reported by CPC-Power documentation as using 38 bytes per level in its extended representation. The exact byte layout must be recovered from the original listing/binary and verified before implementing a decoder.

## Future format

The normalized format should be serializable as JSON for easy authoring and web delivery. A compact binary format can be added later if useful for distribution.
