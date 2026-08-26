# Maouss DS — 55-level overview

The visual overview generated during the reverse-engineering session represents the current **55 × 130-byte candidate table** as 55 compact 13 × 10 maps.

> Important: this visualization is a **research visualization**, not yet a verified extraction of the complete gameplay levels. The 130-byte table is a strong candidate for the terrain/collision layer; object positions (ball, square, stars) still need to be identified and validated.

## Candidate table

- Source build: `12_Maouss_DS_DLDI_GBATEMP.nds`
- Candidate ROM offset: `0x17D9E5`
- Candidate size: `55 × 130 = 7150` bytes
- Map dimensions: `13 × 10`
- Expected campaign structure: `5 planets × 11 levels = 55 levels`

## Validation target

The first extracted level must be validated against the documented level-1 walkthrough before we treat the format as decoded.

## Next implementation step

The Phaser prototype should consume a normalized `Level` model rather than this binary representation. Once the DS object tables are identified, add a converter under `tools/nds-research/` and commit only the normalized, rights-cleared/original data that is appropriate to redistribute.
