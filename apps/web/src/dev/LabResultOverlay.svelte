<script lang="ts">
  import { createDialogNavigation } from "../lib/dialogNav.svelte";

  let {
    type,
    moves,
    optimalMoves,
    onReset,
    onBackToGenerator,
  }: {
    type: "completed" | "gameOver" | null;
    moves?: number;
    optimalMoves?: number;
    onReset: () => void;
    onBackToGenerator?: () => void;
  } = $props();

  const nav = createDialogNavigation(0);
  const isCompleted = $derived(type === "completed");
  const ratio = $derived(
    optimalMoves && moves ? Math.round((optimalMoves / moves) * 100) : null,
  );
</script>

{#if type !== null}
  <div class="game-overlay {isCompleted ? 'overlay-completed' : 'overlay-gameover'}">
    <div
      class="overlay-content"
      role="dialog"
      aria-modal="true"
      aria-label={isCompleted ? "Résultat du test" : "Échec du test"}
      use:nav.action
    >
      {#if isCompleted}✓ NIVEAU RÉSOLU EN {moves} COUPS{:else}✗ GAME OVER{/if}
      {#if isCompleted && ratio !== null}
        <div class="overlay-score">OPTIMAL: {optimalMoves} COUPS · SCORE: {ratio}%</div>
      {/if}
      <div class="overlay-buttons">
        <button class="action" data-selected={nav.activeIndex === 0 ? "true" : undefined} onclick={onReset}>
          ↻ RESET
        </button>
        {#if onBackToGenerator}
          <button class="action" data-selected={nav.activeIndex === 1 ? "true" : undefined} onclick={onBackToGenerator}>
            ← GÉNÉRER
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
