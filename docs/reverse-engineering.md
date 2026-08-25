# Maouss DS reverse-engineering notes

## Objective

Use the historical Maouss DS `.nds` as a reference to understand the game's data model, level representation and behaviour. The repository should contain documentation and our own tooling, not redistributed proprietary binaries or assets unless their redistribution rights are established.

## Investigation plan

1. Obtain the Maouss DS release from a legitimate archival source.
2. Keep the original `.nds` outside Git by default.
3. Inspect the NDS filesystem/container structure.
4. Identify executable code, graphics, sound and candidate level resources.
5. Search resources for repeated fixed-size records, tile maps, coordinates and level counts.
6. Compare candidate data with the known CPC `TABLJEU.BIN` model.
7. Document observations with offsets, sizes, hypotheses and confidence.
8. Build a converter only when the format is sufficiently understood.

## Known historical clues

- The CPC version is documented as having a level table named `TABLJEU.BIN`.
- The documented extended table uses 38 bytes per level and can represent up to 500 levels.
- Maouss DS is documented as having 55 levels arranged as five groups of eleven.
- The DS version is a later adaptation of the CPC concept.

These clues are hypotheses/targets for verification against the actual binary, not assumptions to bake into the parser.

## Local reference layout

```text
reference/
└── maouss-ds/
    └── MaoussDS.nds        # keep local; do not commit by default

data/
└── extracted/
    └── maouss-ds/          # generated extraction; ignored by Git
```

## Tooling direction

Prefer small deterministic command-line tools that can emit:

- filesystem listings;
- binary hexdump slices;
- candidate record tables;
- checksums/hashes;
- extracted images/resources;
- normalized JSON level data.

Every inferred field should be documented before becoming part of a parser.

## Rights boundary

Reverse engineering for interoperability, preservation and research can involve jurisdiction-specific legal considerations. Do not redistribute the original `.nds`, copyrighted assets, or extracted proprietary resources from this repository without verifying the applicable rights.
