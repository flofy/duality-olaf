const SOUND_KEY = "duality.sound.enabled";

let context: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicTimer: number | null = null;

function isEnabled() {
  return localStorage.getItem(SOUND_KEY) !== "false";
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
  masterGain.gain.value = 0.16;
  masterGain.connect(context.destination);
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
  gain.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(duration: number, volume = 0.06) {
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
  const start = context.currentTime;

  filter.type = "highpass";
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(start);
}

export type SoundEffect =
  | "move"
  | "wall"
  | "switch"
  | "collect"
  | "door"
  | "teleport"
  | "complete"
  | "reset";

export async function startAudio() {
  if (!isEnabled()) return;
  const audio = await resumeAudio();
  if (!audio || musicTimer !== null) return;

  const notes = [220, 277.18, 329.63, 277.18, 246.94, 329.63, 369.99, 329.63];
  let index = 0;
  const playNote = () => {
    if (!isEnabled()) return;
    tone(notes[index % notes.length]!, 0.42, "triangle", 0.018);
    index += 1;
  };

  playNote();
  musicTimer = window.setInterval(playNote, 520);
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
  }
}

export function vibrate(pattern: number | number[]) {
  if (!isEnabled() || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_KEY, String(enabled));
  if (!enabled && musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function isSoundEnabled() {
  return isEnabled();
}

export function toggleSound() {
  const enabled = !isEnabled();
  setSoundEnabled(enabled);
  if (enabled) void startAudio();
  return enabled;
}

export function stopAudio() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}
