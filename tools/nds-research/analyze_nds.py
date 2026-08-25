#!/usr/bin/env python3
"""Small, dependency-free NDS binary inspection helper.

The reference ROM itself must stay outside the repository. This tool prints
header information, known strings, references to the save path, and candidate
fixed-size regions for further investigation.
"""
from __future__ import annotations

import hashlib
import math
import struct
import sys
from collections import Counter
from pathlib import Path

ARM9_ROM = 0x20
ARM9_ENTRY = 0x24
ARM9_RAM = 0x28
ARM9_SIZE = 0x2C
ARM7_ROM = 0x30
ARM7_ENTRY = 0x34
ARM7_RAM = 0x38
ARM7_SIZE = 0x3C
FNT_ROM = 0x40
FNT_SIZE = 0x44
FAT_ROM = 0x48
FAT_SIZE = 0x4C


def u32(data: bytes, off: int) -> int:
    return struct.unpack_from("<I", data, off)[0]


def entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    n = len(data)
    return -sum((c / n) * math.log2(c / n) for c in counts.values())


def find_all(data: bytes, needle: bytes):
    start = 0
    while True:
        pos = data.find(needle, start)
        if pos < 0:
            return
        yield pos
        start = pos + 1


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} MAOUSS.nds", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    print(f"file={path}")
    print(f"size={len(data)}")
    print(f"sha256={digest}")

    print("\n[NDS header]")
    for off, name in [
        (ARM9_ROM, "arm9_rom"), (ARM9_ENTRY, "arm9_entry"),
        (ARM9_RAM, "arm9_ram"), (ARM9_SIZE, "arm9_size"),
        (ARM7_ROM, "arm7_rom"), (ARM7_ENTRY, "arm7_entry"),
        (ARM7_RAM, "arm7_ram"), (ARM7_SIZE, "arm7_size"),
        (FNT_ROM, "fnt_rom"), (FNT_SIZE, "fnt_size"),
        (FAT_ROM, "fat_rom"), (FAT_SIZE, "fat_size"),
    ]:
        print(f"{name}=0x{u32(data, off):x}")

    print("\n[known strings]")
    for needle in (b"/kukulcan/12.sav", b"PALib", b"PA_", b"MAOUSS", b"OLAF", b"TABLJEU"):
        hits = list(find_all(data, needle))
        print(f"{needle!r}: {[hex(x) for x in hits[:20]]}")

    save = b"/kukulcan/12.sav"
    hits = list(find_all(data, save))
    if hits:
        target = 0x02000000 + (hits[0] - u32(data, ARM9_ROM))
        refs = []
        for off in range(0, len(data) - 4, 4):
            if u32(data, off) == target:
                refs.append(off)
        print("\n[save-path references]")
        print(f"runtime_address=0x{target:x}")
        print(f"references={[hex(x) for x in refs[:50]]}")

    print("\n[55 x 38-byte scan]")
    # This does not assert that a match is a level table. It only reports
    # low-entropy candidate regions that are useful for manual inspection.
    length = 55 * 38
    candidates = []
    for off in range(0, len(data) - length, 4):
        block = data[off:off + length]
        if not block:
            continue
        small = sum(b <= 10 for b in block) / len(block)
        ent = entropy(block)
        if small > 0.95 and 1.0 < ent < 4.5:
            candidates.append((small, ent, off))
    for small, ent, off in sorted(candidates, reverse=True)[:20]:
        print(f"offset=0x{off:x} small={small:.3f} entropy={ent:.3f}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
