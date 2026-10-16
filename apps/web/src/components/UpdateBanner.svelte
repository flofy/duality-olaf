<script lang="ts">
  import { onMount } from "svelte";

  let { updateSW }: { updateSW: (reloadPage?: boolean) => Promise<void> } = $props();

  let visible = $state(false);
  let updating = $state(false);

  onMount(() => {
    const onUpdate = () => (visible = true);
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => window.removeEventListener("duality:pwa-update", onUpdate);
  });

  async function applyUpdate() {
    if (updating) return;
    updating = true;
    try {
      await updateSW(true);
    } catch {
      updating = false;
    }
  }
</script>

{#if visible}
  <aside class="pwa-update-banner" role="status" aria-live="polite">
    <div class="pwa-update-content">
      <span class="pwa-update-icon" aria-hidden="true">✨</span>
      <div class="pwa-update-copy">
        <strong>Une nouvelle version est disponible</strong>
        <span>Profitez des dernières améliorations de Duality Olaf.</span>
      </div>
      <div class="pwa-update-actions">
        <button type="button" class="pwa-update-button" onclick={() => void applyUpdate()} disabled={updating}>
          {updating ? "MISE À JOUR…" : "METTRE À JOUR"}
        </button>
        <button type="button" class="pwa-update-dismiss" onclick={() => (visible = false)} disabled={updating}>
          Plus tard
        </button>
      </div>
    </div>
  </aside>
{/if}
