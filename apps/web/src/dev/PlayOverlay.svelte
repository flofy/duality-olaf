<script lang="ts">
  import type { Level } from "@duality/level-format";
  import Icon from "../components/Icon.svelte";
  import { resolveLevelSkin } from "../lib/skins";
  import { getActiveThemeName } from "../lib/theme";
  import LabGame from "./LabGame.svelte";

  let {
    level,
    onClose,
    onComplete,
  }: {
    level: Level;
    onClose: () => void;
    onComplete: (message: string) => void;
  } = $props();

  const skin = $derived(resolveLevelSkin(level.id));
  const themeName = getActiveThemeName();
</script>

<div class="editor-play-overlay">
  <div class="editor-play-panel">
    <div class="topbar">
      <b>TEST · {level.id}</b>
      <button
        class="action"
        onclick={onClose}
        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px"
      >
        <Icon name="x" size={14} color="currentColor" />
        FERMER
      </button>
    </div>
    <LabGame
      {level}
      {skin}
      {themeName}
      onCompletionChange={(completion) => completion && onComplete(`✓ Test terminé en ${completion.moves} coups`)}
      onBackToGenerator={onClose}
    />
  </div>
</div>
