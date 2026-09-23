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
    melody: [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23],
    bass: [130.81, 130.81, 146.83, 130.81],
  },
  {
    melody: [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63],
    bass: [98, 98, 110, 98],
  },
  {
    melody: [293.66, 349.23, 440, 349.23, 329.63, 392, 493.88, 392],
    bass: [146.83, 146.83, 164.81, 146.83],
  },
  {
    melody: [246.94, 311.13, 369.99, 311.13, 277.18, 369.99, 415.3, 369.99],
    bass: [123.47, 123.47, 138.59, 123.47],
  },
];

/** Resolve a deterministic 8-bit motif from the level id. */
export function getAmbientTrack(levelId?: string): AmbientTrack {
  if (!levelId) return AMBIENT_TRACKS[0]!;

  const match = /world-(\\d+)-level-(\\d+)/.exec(levelId);
  const world = Number(match?.[1] ?? 1);
  const level = Number(match?.[2] ?? 1);
  return AMBIENT_TRACKS[(world * 3 + level - 4) % AMBIENT_TRACKS.length] ?? AMBIENT_TRACKS[0]!;
}
