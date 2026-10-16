<script lang="ts">
  import { createDialogNavigation } from "../lib/dialogNav.svelte";
  import { navigate } from "../lib/router.svelte";
  import Button from "../components/Button.svelte";
  import OverlayIllustration from "../components/OverlayIllustration.svelte";

  let {
    worldId,
    gameOver,
    activeForm,
    onReset,
    backTo,
  }: {
    worldId: number;
    gameOver: boolean;
    activeForm: "ball" | "square";
    onReset: () => void;
    /** Destination du bouton NIVEAUX (monde par défaut). */
    backTo?: string;
  } = $props();

  const nav = createDialogNavigation(0);
</script>

{#if gameOver}
  <div class="overlay">
    <div
      class="modal"
      use:nav.action
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <OverlayIllustration variant="game-over" {activeForm} />
      <h2 id="gameover-title">🔥 OUPS… AUX ENFERS !</h2>
      <p>
        Cette forme a disparu dans les enfers. Elle a clairement pris le mauvais
        chemin…
      </p>
      <div class="modal-actions">
        <Button icon="reset" label="REJOUER" selected={nav.activeIndex === 0} onclick={onReset} variant="primary" />
        <Button
          icon="arrowLeft"
          label="NIVEAUX"
          selected={nav.activeIndex === 1}
          onclick={() => navigate(backTo ?? `/world/${worldId}`)}
          variant="secondary"
        />
      </div>
    </div>
  </div>
{/if}
