# Maouss DS binary analysis — 2026-08-25

Reference file supplied for research:

- `12_Maouss_DS_DLDI_NEOFLASH.nds`
- SHA-256: `e570a3700408c04ea065b5ae6ba7c97ffb1472b8c85d8257b8467abc5aba42ab`
- Size: `1,723,968` bytes

## NDS container

The header reports:

- ARM9 ROM offset: `0x200`
- ARM9 RAM/entry: `0x02000000`
- ARM9 size: `0x19c874`
- ARM7 ROM offset: `0x19cc00`
- ARM7 RAM/entry: `0x037f8000`
- ARM7 size: `0x77c0`
- FNT offset: `0x1a4400`, size `0x9`
- FAT offset: `0x1a4600`, size `0`

This is consistent with a homebrew-style image with no useful conventional FAT/NitroFS file table. The main program/data therefore needs to be inspected as a monolithic ARM9 payload.

## Confirmed strings

The ARM9 payload contains `/kukulcan/12.sav` and PALib-related strings. There are no literal `MAOUSS`, `OLAF` or `TABLJEU` strings.

The save-path string is at file offset `0x198af0`; its ARM9 runtime address is referenced from code/data locations around `0x835c` and `0xaae4`.

## Data observations

Large regions near the end of ARM9 contain low-entropy byte/tile data and RGB555-looking data. These are likely graphics/palettes/tile resources rather than level records. For example, `0x195800` is dominated by 16-bit values consistent with NDS RGB555 graphics data, while regions around `0x193c70` contain repeated small indices.

There is also a large pointer table beginning around `0x19c090`, containing pointers to nearby data at regular 8-byte intervals. This appears resource-related and is not yet identified as level data.

## Important negative finding

A literal search does **not** find `TABLJEU.BIN`, so the DS game does not appear to carry the CPC level table under its original filename.

A naive search for 55 × 38-byte low-entropy records produces candidates in graphic/tile data, but these do not yet behave like the documented level records. They must not be treated as levels without validation.

## Next step

Trace the code around the level-selection/load path and identify the data structure used when entering level 1. The public GameBrew walkthrough gives a behavioural oracle for level 1:

- Square: Right, Down
- Ship: Right, Up → Star 1
- Square: Up, Left
- Ship: Down, Left, Up → Star 2, Down → Star 3

A candidate parser should reproduce the three-star level and its movement constraints before scaling to all 55 levels.

## Tool

`tools/nds-research/analyze_nds.py` reproduces the basic header/string/pointer/candidate scans without external dependencies. The ROM itself is intentionally not committed to Git.
