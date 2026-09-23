export type AmbientTrack = {
  melody: readonly number[];
  bass: readonly number[];
};

const AMBIENT_TRACKS: readonly AmbientTrack[] = [
  {
    melody: [220, 277.18, 329.63, 277.18, 246.94, 329.63, 369.99, 329.63],
    bass: [110, 110, 123.47, 110],
  },
  {
    melody: [261.63, 311.13, 349.23, 392, 349.23, 311.13, 293.66, 261.63],
    bass: [130.81, 146.83, 130.81, 116.54],
  },
  {
    melody: [196, 293.66, 392, 293.66, 220, 329.63, 440, 329.63],
    bass: [98, 146.83, 98, 110],
  },
  {
    melody: [293.66, 311.13, 349.23, 415.3, 392, 349.23, 329.63, 293.66],
    bass: [146.83, 164.81, 146.83, 123.47],
  },
  {
    melody: [246.94, 369.99, 329.63, 415.3, 369.99, 277.18, 311.13, 246.94],
    bass: [123.47, 184.99, 138.59, 155.56],
  },
];

/** Resolve a deterministic 8-bit motif from the level id. */
export function getAmbientTrack(levelId?: string): AmbientTrack {
  if (!levelId) return AMBIENT_TRACKS[0]!;

  const match = /world-(\d+)-level-(\d+)/.exec(levelId);
  const world = Number(match?.[1] ?? 1);
  const level = Number(match?.[2] ?? 1);
  return (
    AMBIENT_TRACKS[(world * 3 + level - 4) % AMBIENT_TRACKS.length] ??
    AMBIENT_TRACKS[0]!
  );
}
