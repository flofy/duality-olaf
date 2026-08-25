#!/usr/bin/env python3
"""Scan a binary for literal CPC TABLJEU.BIN level records.

This is deliberately conservative: it only answers whether the CPC record
format appears verbatim. It does not claim that a failed match means the DS
levels are absent; the DS port may repack or transform them.
"""

from __future__ import annotations

import argparse
from pathlib import Path

LEVEL_SIZE = 38

# CPC level 1 reconstructed from Amstrad Cent Pour Cent no. 43.
LEVEL_1 = bytes.fromhex(
    "15 00 00 00 00 00 00 70 "
    "0F D0 08 10 0F D0 02 D0 "
    "02 10 02 F0 03 80 00 00 "
    "00 00 05 04 06 04 0A 03 "
    "07 08 07 06 FF FF"
)


def find_all(data: bytes, needle: bytes) -> list[int]:
    offsets: list[int] = []
    start = 0
    while True:
        offset = data.find(needle, start)
        if offset < 0:
            return offsets
        offsets.append(offset)
        start = offset + 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("binary", type=Path)
    args = parser.parse_args()

    data = args.binary.read_bytes()
    offsets = find_all(data, LEVEL_1)

    print(f"file={args.binary}")
    print(f"size={len(data)}")
    print(f"cpc_level_1_literal_matches={len(offsets)}")
    for offset in offsets:
        print(f"  0x{offset:08x}")

    if not offsets:
        print("No literal CPC level-1 record found.")
        print("This does not prove the DS levels are different; it only rules out verbatim embedding.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
