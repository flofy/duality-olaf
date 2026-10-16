<script lang="ts">
  import {
    getAmbientEnabled,
    getHapticEnabled,
    getMasterVolume,
    isHapticSupported,
    isSoundEnabled,
    playSound,
    setAmbientEnabled,
    setHapticEnabled,
    setMasterVolume,
    setSoundEnabled,
    soundEffectPreviews,
    testHaptic,
    testSound,
  } from "../lib/audioFeedback";

  let soundEnabled = $state(isSoundEnabled());
  let volume = $state(getMasterVolume());
  let ambientEnabled = $state(getAmbientEnabled());
  let hapticEnabled = $state(getHapticEnabled());
  let testsOpen = $state(false);
  const hapticSupported = isHapticSupported();

  function updateSound(enabled: boolean) {
    setSoundEnabled(enabled);
    soundEnabled = enabled;
    // Couper le son coupe aussi tout ce qui en dépend.
    if (!enabled) {
      setAmbientEnabled(false);
      ambientEnabled = false;
      setHapticEnabled(false);
      hapticEnabled = false;
    }
  }

  function updateVolume(value: number) {
    setMasterVolume(value);
    volume = value;
  }

  function updateAmbient(enabled: boolean) {
    setAmbientEnabled(enabled);
    ambientEnabled = enabled;
  }

  function updateHaptic(enabled: boolean) {
    setHapticEnabled(enabled);
    hapticEnabled = enabled;
  }
</script>

<div class="audio-settings">
  <div class="audio-setting-row">
    <button class="audio-toggle" type="button" aria-pressed={soundEnabled} onclick={() => updateSound(!soundEnabled)}>
      {soundEnabled ? "🔊 SON ON" : "🔇 SON OFF"}
    </button>
    <label class="audio-volume">
      <span>VOLUME</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        oninput={(event) => updateVolume(Number(event.currentTarget.value))}
        aria-label="Volume général"
      />
      <output>{Math.round(volume * 100)}%</output>
    </label>
  </div>
  <div class="audio-setting-row audio-setting-secondary">
    <button class="audio-toggle" type="button" aria-pressed={ambientEnabled} onclick={() => updateAmbient(!ambientEnabled)}>
      {ambientEnabled ? "♪ AMBIANCE ON" : "♪ AMBIANCE OFF"}
    </button>
    <button
      class="audio-toggle"
      type="button"
      aria-pressed={hapticEnabled}
      disabled={!hapticSupported}
      onclick={() => updateHaptic(!hapticEnabled)}
    >
      {hapticSupported
        ? hapticEnabled
          ? "📳 VIBRATION ON"
          : "📳 VIBRATION OFF"
        : "📳 VIBRATION INDISPONIBLE"}
    </button>
  </div>
  <!-- Sous-menu repliable : les tests ne sont utiles qu'occasionnellement. -->
  <button
    class="audio-toggle audio-tests-toggle"
    type="button"
    aria-expanded={testsOpen}
    onclick={() => (testsOpen = !testsOpen)}
  >
    {testsOpen ? "▾ TESTS" : "▸ TESTS"}
  </button>
  {#if testsOpen}
    <div class="audio-setting-tests">
      <button class="audio-test-button" type="button" onclick={() => void testSound()}>🔊 TESTER LE SON</button>
      <button class="audio-test-button" type="button" disabled={!hapticSupported} onclick={testHaptic}>
        {hapticSupported ? "📳 TESTER VIBRATION" : "📳 VIBRATION INDISPONIBLE"}
      </button>
      <!-- Écoute de chaque effet : les timbres se valident à l'oreille, sans
           devoir provoquer la situation qui les déclenche en jeu. -->
      <div class="audio-effect-tests">
        <span class="audio-effect-tests-title">ÉCOUTER UN EFFET</span>
        {#each soundEffectPreviews as { effect, label } (effect)}
          <button class="audio-test-button" type="button" onclick={() => void playSound(effect)}>{label}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>
