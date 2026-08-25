# CPC `TABLJEU.BIN` level format

This format was reconstructed from the **Le Touti Rikiki, Maousse Costo / Olaf** editor printed in *Amstrad Cent Pour Cent* no. 43, supplied as magazine scans for this project.

## Record size

Each level occupies exactly **38 bytes**.

The game loads a level with the equivalent of:

```basic
ADR + (NT - 1) * 38
```

The original `TABLJEU.BIN` was reported as 1 KiB and contained 21 levels. The editor expands it to 19 KiB for 500 levels.

## Layout

| Offset | Size | Meaning |
|---:|---:|---|
| `0..23` | 24 | 16×12 wall bitmap, 2 bytes per row |
| `24..25` | 2 | Ball position: X, Y |
| `26..27` | 2 | Cube position: X, Y |
| `28..37` | 10 | Up to five bonus positions, 2 bytes each |

Coordinates are stored as zero-based grid coordinates: X `0..15`, Y `0..11`.

### Wall bitmap

The 24-byte bitmap represents 12 rows × 16 columns.

For row `y`, bytes are stored at:

```text
record[2*y]
record[2*y + 1]
```

Each byte is interpreted as an 8-character binary string. The first character corresponds to the leftmost cell, so the most-significant bit is the leftmost cell within each 8-cell group.

A bit value of `1` represents a wall; `0` represents an empty cell.

Thus:

```text
byte 0 → x 0..7
byte 1 → x 8..15
byte 2 → row 1, x 0..7
...
byte 23 → row 11, x 8..15
```

## Objects

The editor uses these object types:

```text
0 = empty
1 = wall
2 = ball
3 = cube
4 = bonus
```

The editor requires exactly one ball, exactly one cube, and between one and five bonuses.

An unused bonus slot is represented by `255, 255`.

## Example TypeScript representation

```ts
export type CpcLevelRecord = {
  walls: boolean[][]; // [y][x], 12 × 16
  ball: { x: number; y: number };
  cube: { x: number; y: number };
  bonuses: Array<{ x: number; y: number }>;
};
```

## Decoder pseudocode

```text
for y = 0..11:
  left  = record[y * 2]
  right = record[y * 2 + 1]

  for bit = 0..7:
    walls[y][bit]     = (left  & (0x80 >> bit)) != 0
    walls[y][8+bit]   = (right & (0x80 >> bit)) != 0

ball.x = record[24]
ball.y = record[25]

cube.x = record[26]
cube.y = record[27]

for i = 0..4:
  x = record[28 + i*2]
  y = record[29 + i*2]
  if x != 255:
    bonuses.push({ x, y })
```

## Why this matters for Duality

We now have a concrete historical level format rather than only the earlier `38 bytes/level` clue. This gives us a deterministic target for a `level-format` package and makes it possible to validate any level data recovered from an original CPC disk image or from future reverse engineering of Maouss DS.

The format was reconstructed from the editor source printed on page 33 of *Amstrad Cent Pour Cent* no. 43. The same article explicitly documents the 38-byte record size and the 16×12 editor grid.
