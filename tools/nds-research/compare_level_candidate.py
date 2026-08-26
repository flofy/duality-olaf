#!/usr/bin/env python3
"""Verify a candidate 55 x 130-byte region across two Maouss DS builds."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

RECORD_SIZE = 130
LEVEL_COUNT = 55
SIZE = RECORD_SIZE * LEVEL_COUNT
DEFAULT_A = 0x17D9E5
DEFAULT_B = 0x17A7CD


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("gbatemp", type=Path)
    parser.add_argument("neoflash", type=Path)
    parser.add_argument("--gbatemp-offset", type=lambda x: int(x, 0), default=DEFAULT_A)
    parser.add_argument("--neoflash-offset", type=lambda x: int(x, 0), default=DEFAULT_B)
    args = parser.parse_args()

    a = args.gbatemp.read_bytes()[args.gbatemp_offset : args.gbatemp_offset + SIZE]
    b = args.neoflash.read_bytes()[args.neoflash_offset : args.neoflash_offset + SIZE]

    if len(a) != SIZE or len(b) != SIZE:
        raise SystemExit("candidate region exceeds one of the ROMs")

    print(f"GBATEMP sha256={hashlib.sha256(a).hexdigest()}")
    print(f"NEOFLASH sha256={hashlib.sha256(b).hexdigest()}")
    print(f"identical={a == b}")

    if a != b:
        for i, (x, y) in enumerate(zip(a, b)):
            if x != y:
                print(f"first difference: record={i // RECORD_SIZE + 1} byte={i % RECORD_SIZE} {x:02X}!={y:02X}")
                break


if __name__ == "__main__":
    main()
