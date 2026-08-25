# Maouss DS — GBATEMP NDS analysis (2026-08-25)

Reference: `12_Maouss_DS_DLDI_GBATEMP.nds`

SHA-256: `bc81f5a935a6f81cb278be244bb98ecf3fd873ef761106dde47c7d1d3d16095f`

Size: `1,736,768` bytes.

## Important clarification

Despite the filename `DLDI_GBATEMP`, this is **not a GBA ROM**. `file` identifies it as a **Nintendo DS Slot-2 ROM image (PassMe)**. The GBATEMP label appears to identify the DLDI/flash-cart variant, not the target platform.

The NDS header is also intentionally unusual/patch-oriented: the title bytes are not a normal commercial title and the game code is `####`.

## Header observations

- ARM9 ROM offset: `0x200`
- ARM9 entry: `0x02000000`
- ARM9 RAM: `0x02000000`
- ARM9 size: `0x19fa8c`
- ARM7 ROM offset: `0x19fe00`
- ARM7 size: `0x77c0`
- FNT offset: `0x1a7600`
- FNT size: `0x9`
- FAT offset: `0x1a7800`
- FAT size: `0`

So, like the NeoFlash image, this build does not expose a normal populated NitroFS/FAT filesystem.

## Difference from NeoFlash image

The GBATEMP image is a different build/patch of the same program. It is 12,800 bytes larger and has the same ARM9 entry point and very similar layout, but many bytes differ due to the build/patch differences.

The GBATEMP image contains `/kukulcan/12.sav` at file offset `0x19bd08`.

## Potential data region

A particularly interesting region begins around `0x19ec20`:

- small binary metadata/addresses precede it;
- from approximately `0x19ec60` there are repeated 16-character rows labelled `a` through `z`;
- immediately afterwards are rows labelled `0`, `5`, and `.`;
- this looks like a compact character/tile/pattern table rather than a conventional filesystem asset.

This is **not yet identified as level data**. It must be cross-referenced with code pointers before being classified.

## Next step

Use the ARM9 code to locate references to the save path and to routines that select/load a level. From those routines, trace data pointers backwards and test candidate regions for 55-level structures.

The goal remains to produce one verified level representation before writing a decoder.
