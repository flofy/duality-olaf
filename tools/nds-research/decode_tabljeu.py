#!/usr/bin/env python3
"""Decode a CPC TABLJEU.BIN file into normalized JSON.

Historical record format reconstructed from the Olaf editor listing in
Amstrad Cent Pour Cent no. 43.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

RECORD_SIZE = 38
WIDTH = 16
HEIGHT = 12


def decode_level(record: bytes, level_index: int) -> dict:
    if len(record) != RECORD_SIZE:
        raise ValueError(f"expected {RECORD_SIZE} bytes, got {len(record)}")

    walls = []
    for y in range(HEIGHT):
        left = record[y * 2]
        right = record[y * 2 + 1]
        row = []
        for bit in range(8):
            row.append(bool(left & (0x80 >> bit)))
        for bit in range(8):
            row.append(bool(right & (0x80 >> bit)))
        walls.append(row)

    ball = {"x": record[24], "y": record[25]}
    cube = {"x": record[26], "y": record[27]}

    bonuses = []
    for i in range(5):
        x = record[28 + i * 2]
        y = record[29 + i * 2]
        if x != 255 or y != 255:
            bonuses.append({"x": x, "y": y})

    return {
        "id": f"cpc-{level_index + 1:03d}",
        "width": WIDTH,
        "height": HEIGHT,
        "walls": walls,
        "ball": ball,
        "cube": cube,
        "bonuses": bonuses,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    data = args.input.read_bytes()
    if len(data) < RECORD_SIZE:
        raise SystemExit("TABLJEU.BIN is too small")

    count = len(data) // RECORD_SIZE
    levels = [
        decode_level(data[i * RECORD_SIZE : (i + 1) * RECORD_SIZE], i)
        for i in range(count)
    ]

    args.output.write_text(
        json.dumps({"format": "cpc-tabljeu-v1", "levels": levels}, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
