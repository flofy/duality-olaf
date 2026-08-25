# Maouss DS level-data investigation — 2026-08-25

## Reference builds

Two supplied DLDI builds were compared:

- `12_Maouss_DS_DLDI_NEOFLASH.nds`
- `12_Maouss_DS_DLDI_GBATEMP.nds`

Large data regions are byte-for-byte identical between the builds, with the expected ROM-offset shift caused by the different build layout. This lets us distinguish game data from linker/loader-specific differences.

## Confirmed negative result

The first 38-byte CPC `TABLJEU.BIN` level record was reconstructed from the magazine scan and searched verbatim in both DS binaries. It does not occur in either build.

Therefore we should **not** build the DS parser around a literal CPC 38-byte record. The DS adaptation repacks, transforms, or independently stores its levels.

## Strong candidate data regions

One especially interesting region is around ROM offset `0x199da1` in the GBATEMP build (shifted in the NeoFlash build):

- length: 7,148 bytes of values in the range `0..5`;
- `7,148 = 55 × 130 - 2`;
- interpreted as 55 consecutive 130-byte records, the first eight records are blank and the remaining records form structured 2D-looking patterns.

130 bytes is compatible with a compact 13×10 cell map, but this is **not yet proven to be the level format**. The repeated 55-record arithmetic and the visual structure make it a high-priority candidate.

Another nearby region around `0x194ca5` is 11,015 bytes and also contains values `0..5`; its size is close to `55 × 200 + 15`. Visual inspection suggests it is likely another tile/resource table rather than the final level representation, so it is lower confidence.

## Why the 130-byte candidate is interesting

Interpreting each 130-byte chunk as 13×10 produces coherent, maze-like patterns with repeated tile values. The later chunks contain denser structures while the first chunks are mostly empty. This looks more like a map/tile table than arbitrary binary data.

However, the values occur many times per record, so they cannot directly be the unique ball/cube/star object encoding used by CPC. If this is the level map, object positions are likely stored in a separate table or represented by a second layer.

## Next reverse-engineering step

1. Identify the code path that selects a planet/level.
2. Locate references to the candidate map-table base.
3. Determine whether `130` is used as a record stride.
4. Locate adjacent tables containing object positions / star counts.
5. Validate the first real level against the published walkthrough:
   - Square: Right, Down.
   - Ship: Right, Up → star 1.
   - Square: Up, Left.
   - Ship: Down, Left, Up → star 2, Down → star 3.

Only after that validation should the candidate be promoted to the canonical Duality level format.
