import { getAmbientTrack, getAmbientTrackKey } from "./ambientTracks";

const SOUND_KEY = "duality.sound.enabled";
const VOLUME_KEY = "duality.sound.volume";
const AMBIENT_KEY = "duality.sound.ambient";
const HAPTIC_KEY = "duality.haptic.enabled";

const DEFAULT_VOLUME = 0.8;

let context: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientGain: GainNode | null = null;
let musicTimer: number | null = null;
let ambientMuted = false;
let ambientLevelId: string | null = null;
let ambientSkin: "default" | "halloween" | "christmas" = "default";
let ambientTrackKey: string | null = null;

function readBoolean(key: string, fallback = true) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

function writeValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures; audio preferences remain usable for the session.
  }
}

function readVolume() {
  try {
    const value = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(value)
      ? Math.min(1, Math.max(0, value))
      : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function isEnabled() {
  return readBoolean(SOUND_KEY);
}

function isAmbientEnabled() {
  return readBoolean(AMBIENT_KEY);
}

function isHapticEnabled() {
  return readBoolean(HAPTIC_KEY);
}

function getAudioContext() {
  if (context) return context;

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  context = new AudioContextClass();
  masterGain = context.createGain();
  masterGain.gain.value = readVolume();
  masterGain.connect(context.destination);

  ambientGain = context.createGain();
  ambientGain.gain.value = ambientMuted ? 0 : 1;
  ambientGain.connect(masterGain);

  return context;
}

async function resumeAudio() {
  const audio = getAudioContext();
  if (!audio) return null;
  if (audio.state === "suspended") await audio.resume();
  return audio;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
  delay = 0,
  destination: AudioNode | null = null,
) {
  if (!isEnabled() || !context || !masterGain) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(destination ?? masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

type NoiseShape = {
  /** Type de filtre appliqué au bruit (défaut : `highpass`). */
  filter?: BiquadFilterType;
  /** Fréquence du filtre au démarrage (défaut : 900 Hz). */
  frequency?: number;
  /** Fréquence d'arrivée du filtre : donne un souffle ou un clic descendant. */
  sweepTo?: number;
};

function noise(
  duration: number,
  volume = 0.06,
  delay = 0,
  destination: AudioNode | null = null,
  shape: NoiseShape = {},
) {
  if (!isEnabled() || !context || !masterGain) return;

  const buffer = context.createBuffer(
    1,
    Math.max(1, Math.floor(context.sampleRate * duration)),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const start = context.currentTime + delay;

  filter.type = shape.filter ?? "highpass";
  filter.frequency.setValueAtTime(shape.frequency ?? 900, start);
  if (shape.sweepTo !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, shape.sweepTo),
      start + duration,
    );
  }
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination ?? masterGain);
  source.start(start);
}

/**
 * Note glissée : la hauteur part de `fromFrequency` et rejoint `toFrequency`.
 * C'est la brique des « zap », « warp » et chutes d'impact.
 */
function glide(
  fromFrequency: number,
  toFrequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.1,
  delay = 0,
  destination: AudioNode | null = null,
) {
  if (!isEnabled() || !context || !masterGain) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = Math.min(0.02, duration * 0.3);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(1, fromFrequency), start);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, toFrequency),
    start + duration,
  );
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(destination ?? masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export type SoundEffect =
  | "move"
  | "wall"
  | "switch"
  | "collect"
  | "door"
  | "teleport"
  | "complete"
  | "reset"
  | "burn";

/**
 * Effets exposés à l'oreille dans le menu (AUDIO › TESTS) : c'est le seul moyen
 * de valider un timbre sans jouer la situation qui le déclenche.
 */
export const soundEffectPreviews: readonly {
  effect: SoundEffect;
  label: string;
}[] = [
  { effect: "move", label: "PAS" },
  { effect: "wall", label: "MUR" },
  { effect: "switch", label: "FORME" },
  { effect: "collect", label: "ÉTOILE" },
  { effect: "door", label: "PORTE" },
  { effect: "teleport", label: "WARP" },
  { effect: "complete", label: "VICTOIRE" },
  { effect: "reset", label: "RESET" },
  { effect: "burn", label: "FEU" },
];

/** Un accord de la nappe tient une demi-mesure, soit 4 croches. */
const CHORD_STEPS = 4;

/** Lecture cyclique : chaque couche peut avoir sa propre longueur de boucle. */
function stepAt<T>(steps: readonly T[], index: number): T {
  return steps[index % steps.length]!;
}

export async function startAmbient(
  levelId?: string,
  skin: "default" | "halloween" | "christmas" = "default",
) {
  if (!isEnabled()) return;
  const nextTrackKey = getAmbientTrackKey(levelId, skin);
  if (nextTrackKey !== ambientTrackKey) {
    stopAudio();
    ambientLevelId = levelId ?? ambientLevelId;
    ambientSkin = skin;
    ambientTrackKey = nextTrackKey;
  }

  const audio = await resumeAudio();
  if (!audio || !isAmbientEnabled() || ambientMuted || musicTimer !== null)
    return;

  const track = getAmbientTrack(ambientLevelId ?? undefined, ambientSkin);
  let index = 0;
  const stepMs = 60_000 / track.bpm / 2;
  const stepSeconds = stepMs / 1000;

  const playNote = () => {
    if (!isEnabled() || !isAmbientEnabled() || ambientMuted) return;

    // Accent léger sur les temps : la boucle respire au lieu de ronronner.
    const accent = index % CHORD_STEPS === 0 ? 1.18 : 1;

    // Lead : onde carrée arcade, une croche par pas (les silences phrasent).
    const melody = stepAt(track.melody, index);
    if (melody !== null) {
      tone(
        melody,
        stepSeconds * 0.85,
        "square",
        0.046 * accent,
        0,
        ambientGain,
      );
    }

    // Basse : triangle tenu plus longtemps que le pas, pour lier les notes.
    const bass = stepAt(track.bass, index);
    if (bass !== null) {
      tone(bass, stepSeconds * 1.7, "triangle", 0.05 * accent, 0, ambientGain);
    }

    // Arpège aigu : la brillance « chip », volontairement discrète.
    const arp = stepAt(track.arp, index);
    if (arp !== null) {
      tone(arp, stepSeconds * 0.4, "square", 0.012, 0, ambientGain);
    }

    // Nappe : la triade de l'accord courant, tenue sur la demi-mesure. C'est
    // elle qui rend l'harmonie lisible sous la mélodie.
    if (index % CHORD_STEPS === 0) {
      const chord = stepAt(track.chords, index / CHORD_STEPS);
      for (const note of chord) {
        tone(
          note,
          stepSeconds * CHORD_STEPS * 1.08,
          "triangle",
          0.016,
          0,
          ambientGain,
        );
      }
    }

    // Percussion minimale : grosse caisse tombante, caisse claire et charley
    // en bruit filtré (plus de « clic » sec).
    const drum = stepAt(track.drums, index);
    if (drum === "kick") {
      glide(150, 48, 0.11, "sine", 0.05, 0, ambientGain);
    } else if (drum === "snare") {
      noise(0.07, 0.02, 0, ambientGain, {
        filter: "bandpass",
        frequency: 1900,
      });
      tone(190, 0.05, "triangle", 0.012, 0, ambientGain);
    } else if (drum === "hat") {
      noise(0.02, 0.006, 0, ambientGain, {
        filter: "highpass",
        frequency: 6500,
      });
    }

    index += 1;
  };

  playNote();
  musicTimer = window.setInterval(playNote, stepMs);
}

export async function playSound(effect: SoundEffect) {
  if (!isEnabled()) return;
  await resumeAudio();
  if (!context) return;

  switch (effect) {
    case "move":
      // Pas feutré : très court et discret, il est joué à chaque coup.
      glide(360, 210, 0.09, "triangle", 0.05);
      noise(0.03, 0.012, 0, null, { filter: "bandpass", frequency: 1800 });
      break;
    case "wall":
      // Impact sourd, sans musicalité : la forme bute sur un mur.
      glide(150, 82, 0.16, "triangle", 0.085);
      tone(96, 0.14, "sine", 0.07, 0.01);
      noise(0.09, 0.03, 0, null, {
        filter: "lowpass",
        frequency: 700,
        sweepTo: 280,
      });
      break;
    case "switch":
      // Zap montant : on change de forme, la hauteur monte avec la bascule.
      glide(392, 880, 0.12, "square", 0.05);
      tone(659.25, 0.16, "sine", 0.04, 0.05);
      tone(196, 0.09, "triangle", 0.05, 0.09);
      break;
    case "collect":
      // Arpège majeur + étincelle : la récompense principale du jeu.
      tone(783.99, 0.08, "triangle", 0.06);
      tone(987.77, 0.08, "triangle", 0.055, 0.045);
      tone(1174.66, 0.16, "triangle", 0.055, 0.09);
      tone(1567.98, 0.1, "sine", 0.03, 0.09);
      noise(0.05, 0.014, 0.08, null, { filter: "bandpass", frequency: 4200 });
      break;
    case "door":
      // Mécanique : cliquetis grave puis quinte tenue (l'ouverture).
      noise(0.07, 0.035, 0, null, {
        filter: "lowpass",
        frequency: 900,
        sweepTo: 380,
      });
      tone(196, 0.18, "triangle", 0.055, 0.03);
      tone(293.66, 0.22, "sine", 0.05, 0.05);
      break;
    case "teleport":
      // Zap : charge descendante, éclair montant, puis impulsion d'arrivée.
      glide(1600, 180, 0.32, "sawtooth", 0.055);
      glide(260, 1800, 0.36, "square", 0.038, 0.08);
      tone(1800, 0.09, "sine", 0.055, 0.39);
      noise(0.26, 0.018, 0.02, null, {
        filter: "bandpass",
        frequency: 900,
        sweepTo: 4200,
      });
      break;
    case "complete":
      // Petite fanfare : arpège montant puis accord final tenu.
      tone(523.25, 0.12, "triangle", 0.07);
      tone(659.25, 0.12, "triangle", 0.07, 0.08);
      tone(783.99, 0.12, "triangle", 0.07, 0.16);
      tone(1046.5, 0.3, "triangle", 0.075, 0.24);
      tone(659.25, 0.3, "sine", 0.03, 0.24);
      noise(0.16, 0.016, 0.24, null, {
        filter: "bandpass",
        frequency: 5200,
        sweepTo: 3000,
      });
      break;
    case "reset":
      // Deux notes descendantes : on repart, sans punir le joueur.
      glide(520, 392, 0.1, "sine", 0.045);
      tone(261.63, 0.14, "sine", 0.035, 0.07);
      break;
    case "burn":
      // Disparition : souffle grave qui s'effondre dans les enfers.
      glide(260, 58, 0.42, "sawtooth", 0.06);
      tone(110, 0.3, "triangle", 0.06, 0.06);
      noise(0.34, 0.045, 0, null, {
        filter: "lowpass",
        frequency: 1600,
        sweepTo: 220,
      });
      break;
  }
}

export function isHapticSupported() {
  return (
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
  );
}

export function vibrate(pattern: number | number[]) {
  if (!isHapticEnabled() || !isHapticSupported()) return false;
  return navigator.vibrate(pattern);
}

export async function testSound() {
  if (typeof window === "undefined") return false;
  const audio = await resumeAudio();
  if (!audio) return false;
  tone(523.25, 0.12, "triangle", 0.08);
  tone(783.99, 0.18, "triangle", 0.06, 0.1);
  return true;
}

export function testHaptic() {
  if (!isHapticSupported()) return false;
  return navigator.vibrate(35);
}

export function setSoundEnabled(enabled: boolean) {
  writeValue(SOUND_KEY, String(enabled));
  if (!enabled) stopAudio();
}

export function isSoundEnabled() {
  return isEnabled();
}

export function toggleSound() {
  const enabled = !isEnabled();
  setSoundEnabled(enabled);
  if (enabled) void startAmbient();
  return enabled;
}

export function getMasterVolume() {
  return readVolume();
}

export function setMasterVolume(volume: number) {
  const normalized = Math.min(1, Math.max(0, volume));
  writeValue(VOLUME_KEY, String(normalized));
  if (masterGain && context) {
    masterGain.gain.setTargetAtTime(normalized, context.currentTime, 0.015);
  }
}

export function getAmbientEnabled() {
  return isAmbientEnabled();
}

export function setAmbientEnabled(enabled: boolean) {
  writeValue(AMBIENT_KEY, String(enabled));
  if (!enabled) {
    stopAudio();
  } else if (isEnabled() && !ambientMuted) {
    void startAmbient();
  }
}

export function setAmbientMuted(muted: boolean) {
  ambientMuted = muted;
  if (ambientGain && context) {
    ambientGain.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.015);
  }
  if (muted) {
    stopAudio();
  } else if (isEnabled() && isAmbientEnabled()) {
    void startAmbient();
  }
}

function toggleAmbient() {
  const enabled = !isAmbientEnabled();
  setAmbientEnabled(enabled);
  return enabled;
}

export function getHapticEnabled() {
  return isHapticEnabled();
}

export function setHapticEnabled(enabled: boolean) {
  writeValue(HAPTIC_KEY, String(enabled));
}

function toggleHaptic() {
  const enabled = !isHapticEnabled();
  setHapticEnabled(enabled);
  return enabled;
}

function stopAudio() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}
