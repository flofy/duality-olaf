import { useState } from "react";
import {
  getAmbientEnabled,
  getHapticEnabled,
  getMasterVolume,
  isHapticSupported,
  isSoundEnabled,
  setAmbientEnabled,
  setHapticEnabled,
  setMasterVolume,
  setSoundEnabled,
  testHaptic,
  testSound,
} from "./audioFeedback";

export function AudioSettings() {
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled);
  const [volume, setVolume] = useState(getMasterVolume);
  const [ambientEnabled, setAmbientEnabledState] = useState(getAmbientEnabled);
  const [hapticEnabled, setHapticEnabledState] = useState(getHapticEnabled);
  const [testsOpen, setTestsOpen] = useState(false);
  const hapticSupported = isHapticSupported();

  const updateSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
    // Couper le son coupe aussi tout ce qui en dépend.
    if (!enabled) {
      setAmbientEnabled(false);
      setAmbientEnabledState(false);
      setHapticEnabled(false);
      setHapticEnabledState(false);
    }
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
    <div className="audio-settings">
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
          disabled={!hapticSupported}
          onClick={() => updateHaptic(!hapticEnabled)}
        >
          {hapticSupported
            ? hapticEnabled
              ? "📳 VIBRATION ON"
              : "📳 VIBRATION OFF"
            : "📳 VIBRATION INDISPONIBLE"}
        </button>
      </div>
      {/* Sous-menu repliable : les tests ne sont utiles qu'occasionnellement. */}
      <button
        className="action audio-toggle audio-tests-toggle"
        type="button"
        aria-expanded={testsOpen}
        onClick={() => setTestsOpen(!testsOpen)}
      >
        {testsOpen ? "▾ TESTS" : "▸ TESTS"}
      </button>
      {testsOpen && (
        <div className="audio-setting-tests">
          <button
            className="action audio-test-button"
            type="button"
            onClick={() => void testSound()}
          >
            🔊 TESTER LE SON
          </button>
          <button
            className="action audio-test-button"
            type="button"
            disabled={!hapticSupported}
            onClick={testHaptic}
          >
            {hapticSupported
              ? "📳 TESTER VIBRATION"
              : "📳 VIBRATION INDISPONIBLE"}
          </button>
        </div>
      )}
    </div>
  );
}
