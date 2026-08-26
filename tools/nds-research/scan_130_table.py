#!/usr/bin/env python3
"""Inspect the strongest 55 x 130-byte level-table candidate in Maouss DS.

The tool deliberately does not write extracted game data to the repository.
It is intended for local analysis of a user-supplied .nds file.
"""

from __future__ import annotations

import argparse
from pathlib import Path

RECORD_SIZE = 130
LEVEL_COUNT = 55
# Strong candidate in the GBATEMP build. The exact semantics of the three
# observed values are not yet established; this is a research hypothesis.
DEFAULT_OFFSET = 0x17D9E5
WIDTH = 13
HEIGHT = 10


def render(record: bytes) -> str:
    symbols = ".#S"
    rows = []
    for y in range(HEIGHT):
        row = record[y * WIDTH : (y + 1) * WIDTH]
        rows.append("".join(symbols[v] if v < len(symbols) else "?" for v in row))
    return "\n".join(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("rom", type=Path)
    parser.add_argument("--offset", type=lambda x: int(x, 0), default=DEFAULT_OFFSET)
    parser.add_argument("--index", type=int, help="Print one 1-based record")
    args = parser.parse_args()

    data = args.rom.read_bytes()
    end = args.offset + RECORD_SIZE * LEVEL_COUNT
    if end > len(data):
        raise SystemExit("candidate table exceeds ROM size")

    records = [
        data[args.offset + i * RECORD_SIZE : args.offset + (i + 1) * RECORD_SIZE]
        for i in range(LEVEL_COUNT)
    ]

    if args.index:
        if not 1 <= args.index <= LEVEL_COUNT:
            raise SystemExit("index must be between 1 and 55")
        record = records[args.index - 1]
        print(
            f"record={args.index} "
            f"offset=0x{args.offset + (args.index - 1) * RECORD_SIZE:X}"
        )
        print(render(record))
        return

    print(f"offset=0x{args.offset:X} records={LEVEL_COUNT} stride={RECORD_SIZE}")
    for i, record in enumerate(records, 1):
        counts = [record.count(v) for v in range(5)]
        print(f"{i:02d}: " + " ".join(f"{n}={counts[n]}" for n in range(5)))


if __name__ == "__main__":
    main()
