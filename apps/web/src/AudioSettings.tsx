import { useState } from "react";
import {
  getAmbientEnabled,
  getHapticEnabled,
  getMasterVolume,
  isSoundEnabled,
  setAmbientEnabled,
  setHapticEnabled,
  setMasterVolume,
  setSoundEnabled,
} from "./audioFeedback";

export function AudioSettings() {
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled);
  const [volume, setVolume] = useState(getMasterVolume);
  const [ambientEnabled, setAmbientEnabledState] =
    useState(getAmbientEnabled);
  const [hapticEnabled, setHapticEnabledState] = useState(getHapticEnabled);

  const updateSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  const updateVolume = (value: number) => {
    setMasterVolume(value);
    setVolume(value);
  };

  const updateAmbient = (enabled: boolean) => {
    setAmbientEnabled(enabled);
    setAmbientEnabledState(enabled);
  };

  const updateHaptic = (enabled: boolean) => {
    setHapticEnabled(enabled);
    setHapticEnabledState(enabled);
  };

  return (
    <section className="audio-settings" aria-label="Réglages audio et vibrations">
      <div className="audio-settings-title">🔊 AUDIO & VIBRATIONS</div>
      <div className="audio-setting-row">
        <button
          className="action audio-toggle"
          type="button"
          aria-pressed={soundEnabled}
          onClick={() => updateSound(!soundEnabled)}
        >
          {soundEnabled ? "🔊 SON ON" : "🔇 SON OFF"}
        </button>
        <label className="audio-volume">
          <span>VOLUME</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => updateVolume(Number(event.target.value))}
            aria-label="Volume général"
          />
          <output>{Math.round(volume * 100)}%</output>
        </label>
      </div>
      <div className="audio-setting-row audio-setting-secondary">
        <button
          className="action audio-toggle"
          type="button"
          aria-pressed={ambientEnabled}
          onClick={() => updateAmbient(!ambientEnabled)}
        >
          {ambientEnabled ? "♪ AMBIANCE ON" : "♪ AMBIANCE OFF"}
        </button>
        <button
          className="action audio-toggle"
          type="button"
          aria-pressed={hapticEnabled}
          onClick={() => updateHaptic(!hapticEnabled)}
        >
          {hapticEnabled ? "▣ VIBRATION ON" : "▣ VIBRATION OFF"}
        </button>
      </div>
    </section>
  );
}
