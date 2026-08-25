# Maouss DS level-data candidate — 2026-08-25

## Strong candidate table

In the supplied `12_Maouss_DS_DLDI_GBATEMP.nds`, a contiguous region begins at ROM offset `0x19A20F` and contains exactly `55 × 130` bytes before the following PALib/runtime error strings.

The same first 1,000 bytes of this region occur at ROM offset `0x196FF7` in the supplied NeoFlash build, confirming that this is shared game data rather than a DLDI-specific patch area.

### Record shape

`130 = 13 × 10`.

When rendered as a 13-column by 10-row grid, the records produce coherent, sparse 2D layouts rather than random binary noise. This makes the region a **high-confidence map/tile-data candidate**.

## Important caveat

This is **not yet proven to be the complete logical level representation**.

The records contain multiple occurrences of byte values `1..4`, so they cannot directly be interpreted as the CPC 38-byte object record where ball/cube positions are unique. The DS version likely stores a tile/map layer separately from object positions, or uses multi-cell graphical representations.

The candidate should therefore be treated as:

```text
55 × (13 × 10) map/tile records
             +
     unknown object/state data
```

rather than immediately calling each 130-byte record a complete level.

## First record observation

Record #1 has this distribution:

```text
value 0: 104
value 1:  14
value 2:   8
value 3:   2
value 4:   2
value 5:   0
```

Values 3 and 4 each occur as a contiguous two-cell segment in this record, which is interesting for identifying graphical/object tiles, but this is not sufficient to assign semantics.

## Why this is a breakthrough

The table has the exact number of records expected for Maouss DS: **55**. It is also immediately followed by ordinary PALib error strings, making accidental alignment across a large arbitrary binary region unlikely.

The next task is to identify the code that indexes this table and determine what additional data supplies the moving forms and collectible positions.

## Reverse-engineering next steps

1. Find references from ARM9 code to the table's surrounding data.
2. Determine whether `130` is used as an index stride (`level * 130`).
3. Find the level-selection/planet-selection state.
4. Identify adjacent tables for object positions, star count and level metadata.
5. Validate record #1 against the published Maouss DS level-1 walkthrough.
6. Only then define the canonical Duality level schema.

## Local tool

Use `tools/nds-research/scan_130_table.py` to inspect the records without committing the extracted game data.
