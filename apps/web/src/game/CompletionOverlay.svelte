<script lang="ts">
  import { createDialogNavigation } from "../lib/dialogNav.svelte";
  import Button from "../components/Button.svelte";
  import OverlayIllustration from "../components/OverlayIllustration.svelte";

  let {
    worldId,
    worldIndex,
    worldLength,
    hasNextWorld,
    completed,
    moves,
    elapsedMs,
    optimalMoves,
    stars,
    score,
    onReset,
    onNext,
  }: {
    worldId: number;
    worldIndex: number;
    worldLength: number;
    hasNextWorld: boolean;
    completed: boolean;
    moves: number;
    elapsedMs: number;
    optimalMoves: number | null;
    stars: 1 | 2 | 3 | null;
    score: number | null;
    onReset: () => void;
    onNext: () => void;
  } = $props();

  function formatTime(ms: number): string {
    const totalSeconds = ms / 1000;
    if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  const nav = createDialogNavigation(1);
  const changingWorld = $derived(worldIndex === worldLength - 1 && hasNextWorld);
  const nextLabel = $derived(
    worldIndex < worldLength - 1
      ? "SUIVANT"
      : hasNextWorld
        ? "MONDE SUIVANT"
        : worldId === 2 && worldLength > 0
          ? "HALLOWEEN"
          : "NIVEAUX",
  );
</script>

{#if completed}
  <div class="overlay">
    <div
      class="modal completion-modal"
      use:nav.action
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <!-- Le carré n'existe pas en monde 1 : aucun popin de fin de niveau du
           monde 1 ne doit le montrer (il est introduit en monde 2) — sauf le
           popin de passage de monde, qui est justement l'annonce de son
           arrivée. `worldIndex` est l'index du niveau dans le monde, pas le
           numéro du monde. -->
      <OverlayIllustration
        variant={changingWorld ? "world-transition" : "victory"}
        showSquare={changingWorld || worldId > 1}
      />
      <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>

      {#if stars !== null}
        <div class="completion-stars" aria-label="{stars} étoiles sur 3">
          {#each [0, 1, 2] as index (index)}
            <span class={index < stars ? "earned" : ""}>★</span>
          {/each}
        </div>
      {/if}

      <div class="completion-stats">
        <div>
          <span>COUPS</span>
          <strong>{moves}</strong>
          {#if optimalMoves !== null}<small>optimal {optimalMoves}</small>{/if}
        </div>
        <div>
          <span>TEMPS</span>
          <strong>{formatTime(elapsedMs)}</strong>
        </div>
        {#if score !== null}
          <div>
            <span>SCORE</span>
            <strong>{score}</strong>
          </div>
        {/if}
      </div>

      {#if optimalMoves !== null}
        <div class="completion-progress" aria-label="Efficacité des coups">
          <div
            class="completion-progress-bar"
            style="width: {Math.min(100, Math.round((optimalMoves / Math.max(1, moves)) * 100))}%"
          ></div>
        </div>
      {/if}

      {#if changingWorld}
        <p class="world-transition-message">
          Bravo ! On change de monde… et notre deuxième héros arrive !
        </p>
      {/if}
      <div class="modal-actions">
        <Button icon="reset" label="REJOUER" selected={nav.activeIndex === 0} onclick={onReset} variant="primary" />
        <Button icon="arrowRight" label={nextLabel} selected={nav.activeIndex === 1} onclick={onNext} variant="primary" />
      </div>
    </div>
  </div>
{/if}
