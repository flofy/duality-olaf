# NDS research tooling

This directory contains small, deterministic tools used to inspect the supplied Maouss DS reference ROM locally.

## Reference

`12_Maouss_DS_DLDI_NEOFLASH.nds`

SHA-256:

`e570a3700408c04ea065b5ae6ba7c97ffb1472b8c85d8257b8467abc5aba42ab`

Keep the binary outside Git. The repository intentionally stores only hashes, notes and analysis tooling.

## First findings

- ROM size: 1,723,968 bytes.
- The header does not describe a normal populated NDS FAT filesystem; the image is effectively a monolithic homebrew payload.
- ARM9 payload starts at `0x200` and occupies `0x19c874` bytes according to the NDS header.
- The image contains the path `/kukulcan/12.sav`.
- The image contains PALib sprite-memory error strings, strongly indicating a PALib-based homebrew build.
- No literal `TABLJEU`, `OLAF` or `MAOUSS` strings were found.

## Next investigation

1. Identify ARM9 code/data boundaries.
2. Locate references to the save path and level-selection state.
3. Search for 55 repeated level records and tile-map-like data.
4. Compare candidate structures with the CPC 38-byte level-table clue.
5. Produce a normalized JSON representation for the first confirmed level.
