export type AmbientTrack = {
  bpm: number;
  melody: readonly number[];
  bass: readonly number[];
  arp: readonly number[];
  drums: readonly ("kick" | "snare" | "hat" | null)[];
};

/**
 * One musical identity per world, rather than one tiny motif per level.
 * The loops are intentionally layered like a light 8-bit shoot-'em-up:
 * lead + bass + arpeggio + simple percussion.
 */
const WORLD_TRACKS: readonly AmbientTrack[] = [
  {
    bpm: 150,
    melody: [220, 261.63, 293.66, 329.63, 293.66, 261.63, 220, 246.94],
    bass: [110, 110, 146.83, 110, 123.47, 123.47, 164.81, 123.47],
    arp: [440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 493.88],
    drums: ["kick", "hat", "hat", "hat", "snare", "hat", "hat", "hat"],
  },
  {
    bpm: 158,
    melody: [196, 246.94, 293.66, 392, 329.63, 293.66, 246.94, 220],
    bass: [98, 98, 123.47, 146.83, 110, 110, 146.83, 123.47],
    arp: [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 493.88],
    drums: ["kick", "hat", "hat", "snare", "kick", "hat", "hat", "hat"],
  },
  {
    bpm: 164,
    melody: [293.66, 349.23, 392, 466.16, 523.25, 466.16, 392, 349.23],
    bass: [146.83, 146.83, 174.61, 146.83, 130.81, 130.81, 196, 174.61],
    arp: [587.33, 698.46, 783.99, 932.33, 783.99, 698.46, 587.33, 659.25],
    drums: ["kick", "hat", "kick", "hat", "snare", "hat", "kick", "hat"],
  },
  {
    bpm: 172,
    melody: [246.94, 329.63, 369.99, 493.88, 440, 369.99, 329.63, 277.18],
    bass: [123.47, 123.47, 164.81, 184.99, 146.83, 146.83, 110, 123.47],
    arp: [493.88, 659.25, 739.99, 987.77, 880, 739.99, 659.25, 554.37],
    drums: ["kick", "hat", "hat", "kick", "snare", "hat", "kick", "hat"],
  },
  {
    bpm: 178,
    melody: [329.63, 392, 493.88, 587.33, 523.25, 493.88, 392, 349.23],
    bass: [164.81, 164.81, 196, 246.94, 174.61, 174.61, 220, 196],
    arp: [659.25, 783.99, 987.77, 1174.66, 1046.5, 987.77, 783.99, 698.46],
    drums: ["kick", "hat", "kick", "hat", "snare", "hat", "kick", "snare"],
  },
];

const SEASONAL_TRACKS: Readonly<Record<string, AmbientTrack>> = {
  halloween: {
    bpm: 138,
    melody: [220, 233.08, 220, 174.61, 196, 233.08, 261.63, 196],
    bass: [110, 110, 87.31, 98, 98, 87.31, 116.54, 98],
    arp: [440, 466.16, 523.25, 466.16, 392, 349.23, 392, 466.16],
    drums: ["kick", "hat", null, "hat", "snare", "hat", "kick", "hat"],
  },
  christmas: {
    bpm: 132,
    melody: [261.63, 329.63, 392, 523.25, 493.88, 392, 329.63, 261.63],
    bass: [130.81, 130.81, 164.81, 196, 146.83, 146.83, 196, 130.81],
    arp: [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 523.25],
    drums: ["kick", "hat", "hat", "hat", "snare", "hat", "hat", "hat"],
  },
};

function getWorldNumber(levelId?: string) {
  const match = levelId?.match(/^world-(\d+)-level-\d+$/);
  return Number(match?.[1] ?? 1);
}

/** Resolve one stable musical identity for a world/theme. */
export function getAmbientTrack(
  levelId?: string,
  skin: "default" | "halloween" | "christmas" = "default",
): AmbientTrack {
  if (skin !== "default") {
    return SEASONAL_TRACKS[skin] ?? WORLD_TRACKS[0]!;
  }

  const world = getWorldNumber(levelId);
  return WORLD_TRACKS[(world - 1) % WORLD_TRACKS.length] ?? WORLD_TRACKS[0]!;
}
