# Maouss DS — GBATEMP NDS analysis (2026-08-25)

Reference: `12_Maouss_DS_DLDI_GBATEMP.nds`

SHA-256: `bc81f5a935a6f81cb278be244bb98ecf3fd873ef761106dde47c7d1d3d16095f`

Size: `1,736,768` bytes.

## Important clarification

Despite the filename `DLDI_GBATEMP`, this is **not a GBA ROM**. It is a Nintendo DS Slot-2 ROM image (PassMe). The GBATEMP label identifies the DLDI/flash-cart variant, not the target platform.

## Header observations

- ARM9 ROM offset: `0x200`
- ARM9 load/entry address: `0x02000000`
- ARM9 size: `0x19fa8c`
- ARM7 ROM offset: `0x19fe00`
- ARM7 size: `0x77c0`
- FNT offset: `0x1a7600`
- FNT size: `0x9`
- FAT offset: `0x1a7800`
- FAT size: `0`

So, like the NeoFlash image, this build does not expose a normal populated NitroFS/FAT filesystem.

## Difference from NeoFlash image

The GBATEMP image is a different build/patch of the same program. It is 12,800 bytes larger and has the same ARM9 entry point and a very similar layout.

A byte-level comparison shows large identical ARM9 regions. The largest same-offset identical run starts at ARM9 offset `0x29e6a` and extends to `0xcfed8` (`0xa606e` bytes). This gives us a useful differential control for separating game data/code from DLDI-specific changes.

## Save path anchor

The image contains `/kukulcan/12.sav` at file offset `0x19bd08`.

The literal pointer to this string is referenced from ARM9 offsets `0x815c` and `0xa8e4`.

At ARM9 offset `0x8104`, code loads the save path and calls a file-loading routine with a requested size of **56 bytes (`0x38`)**. A related routine around `0xa880` also requests 56 bytes and subsequently reads byte `0x37` from the loaded structure, storing it in a global byte.

The `0x38` size is interesting because the historical CPC `TABLJEU.BIN` format is also documented as using **38 bytes per level**. This is currently only a coincidence/hypothesis: the DS 56-byte object is clearly tied to persistent save data and must not be treated as the CPC level record without further evidence.

## Potential resource region

A region around `0x19ec20` contains compact repeated character/pattern data, including rows labelled `a`–`z`, followed by `0`, `5` and `.`. This looks more like a character/tile/pattern table than a level table.

It is therefore **not classified as level data** yet.

## Current conclusion

The uploaded GBATEMP image is useful, but it is not the GBA version: it is another patched Nintendo DS build. The level data still appears likely to be embedded in the monolithic ARM9 payload rather than exposed as a normal file.

The save-loading routines give us a reliable code anchor, but they are not themselves the level table.

## Next steps

1. Recover ARM9 function boundaries around level selection/gameplay.
2. Find code that changes the current level and identify the associated data pointer.
3. Trace that pointer into ROM data.
4. Compare candidate regions against the NeoFlash build.
5. Look for 55 repeated structures and/or compact tile maps.
6. Validate the first candidate against the documented level-1 solution:
   - Square: Right, Down.
   - Ship: Right, Up (Star 1).
   - Square: Up, Left.
   - Ship: Down, Left, Up (Star 2), Down (Star 3).
7. Only after validation, define the binary-to-JSON converter for Duality.

## Rights / repository policy

The reference ROM remains local and is not committed to this repository. This document contains hashes, offsets and reverse-engineering observations only.
