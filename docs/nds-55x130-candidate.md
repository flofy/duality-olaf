# Maouss DS — 55 × 130-byte candidate table

## Status

**Strong candidate, semantics not yet proven.**

The GBATEMP build contains a contiguous region starting at ROM offset `0x17D9E5` with exactly `55 × 130 = 7150` bytes. The same 7150-byte sequence occurs verbatim in the NeoFlash build at ROM offset `0x17A7CD`.

This makes the region substantially more interesting than the previously investigated `0x19A20F` region: it is build-independent and its contents are constrained to the values `0`, `1`, and `2`.

## Per-record observations

- Record count: 55
- Stride: 130 bytes
- Candidate grid interpretation: 13 × 10 bytes
- Values observed: 0, 1, 2 only
- No direct player/star coordinates are visible in this layer.

The absence of player/star coordinates means this should **not** yet be treated as the complete level representation. A plausible interpretation is that it is one level layer (for example collision/terrain) while object positions are held in another table.

## Cross-build validation

| Build | Candidate offset | Candidate size |
|---|---:|---:|
| GBATEMP | `0x17D9E5` | 7150 bytes |
| NeoFlash | `0x17A7CD` | 7150 bytes |

The two byte ranges are identical.

## Why 55 × 130 matters

GameBrew documents Maouss DS as five planets of eleven levels, for a total of 55 levels. The exact 55-record count is therefore a strong correlation, but not sufficient proof by itself. citeturn0search0

The original CPC format is different: `TABLJEU.BIN` uses 38 bytes per level. The CPC-Power documentation explicitly gives the test address `ADR+(NT-1)*38`. citeturn1search2

Therefore the DS build appears to have converted the original format rather than embedding `TABLJEU.BIN` unchanged.

## Next reverse-engineering step

Find the code path that selects a level and determine whether it indexes this table with a 130-byte stride. If confirmed, identify the companion tables that provide:

- spaceship position;
- square position;
- star positions/count;
- planet/level metadata.

Only after those fields are identified should the region be promoted from a candidate to a decoded `DSLevel` format.

## Local command

```bash
python tools/nds-research/scan_130_table.py MaoussDS.nds --index 1
```

The original `.nds` is intentionally not committed to this repository.
