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

function noise(
  duration: number,
  volume = 0.06,
  delay = 0,
  destination: AudioNode | null = null,
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

  filter.type = "highpass";
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination ?? masterGain);
  source.start(start);
}

type SoundEffect =
  | "move"
  | "wall"
  | "switch"
  | "collect"
  | "door"
  | "teleport"
  | "complete"
  | "reset"
  | "burn";

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
  const stepMs = (60_000 / track.bpm) / 2;

  const playNote = () => {
    if (!isEnabled() || !isAmbientEnabled() || ambientMuted) return;

    const slot = index % 8;
    const melody = track.melody[slot]!;
    const bass = track.bass[slot]!;
    const arp = track.arp[slot]!;
    const drum = track.drums[slot];

    // Lead: bright arcade square wave.
    tone(melody, stepMs / 1000 * 0.82, "square", 0.045, 0, ambientGain);

    // Bass: slower triangle layer gives the loop some weight.
    if (slot % 2 === 0) {
      tone(bass, stepMs / 1000 * 1.7, "triangle", 0.045, 0, ambientGain);
    }

    // Fast arpeggio: the main shoot-'em-up flavour.
    tone(arp, stepMs / 1000 * 0.42, "square", 0.018, 0, ambientGain);

    // Minimal chip percussion keeps the loop moving without becoming a drum track.
    if (drum === "kick") {
      tone(bass / 2, 0.09, "sine", 0.028, 0, ambientGain);
    } else if (drum === "snare") {
      noise(0.065, 0.018, 0, ambientGain);
    } else if (drum === "hat") {
      noise(0.025, 0.008, 0, ambientGain);
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
      tone(150, 0.055, "sine", 0.035);
      break;
    case "wall":
      tone(85, 0.09, "triangle", 0.1);
      noise(0.055, 0.035);
      break;
    case "switch":
      tone(440, 0.08, "square", 0.055);
      tone(659.25, 0.12, "sine", 0.045, 0.055);
      break;
    case "collect":
      tone(784, 0.09, "sine", 0.06);
      tone(1174.66, 0.16, "sine", 0.045, 0.06);
      break;
    case "door":
      tone(196, 0.12, "triangle", 0.06);
      tone(293.66, 0.16, "triangle", 0.05, 0.08);
      break;
    case "teleport":
      tone(330, 0.12, "sine", 0.05);
      tone(660, 0.18, "sine", 0.045, 0.06);
      break;
    case "complete":
      tone(523.25, 0.13, "triangle", 0.07);
      tone(659.25, 0.13, "triangle", 0.07, 0.09);
      tone(783.99, 0.22, "triangle", 0.08, 0.18);
      break;
    case "reset":
      tone(392, 0.08, "sine", 0.035);
      tone(261.63, 0.1, "sine", 0.03, 0.05);
      break;
    case "burn":
      tone(180, 0.18, "sawtooth", 0.06);
      tone(110, 0.28, "triangle", 0.07, 0.08);
      noise(0.24, 0.045);
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
