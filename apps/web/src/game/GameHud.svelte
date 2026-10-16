<script lang="ts">
  import type { Level } from "@duality/level-format";
  import Button from "../components/Button.svelte";

  let {
    level,
    activeForm,
    starsRemaining,
    moves,
    optimalMoves,
    onReset,
  }: {
    level: Level;
    activeForm: "ball" | "square";
    starsRemaining: number;
    moves: number;
    optimalMoves: number | null;
    onReset?: () => void;
  } = $props();

  const progress = $derived(
    optimalMoves === null || moves === 0
      ? 0
      : Math.min(100, Math.round((optimalMoves / moves) * 100)),
  );
</script>

<div class="hud-row">
  <div class="hud">
    <b>{activeForm === "ball" ? "● BOULE" : "■ CARRÉ"}</b>
    <br />
    <div
      class="hud-progress"
      role="progressbar"
      aria-label="Coups par rapport au parcours optimal"
      aria-valuemin={0}
      aria-valuemax={optimalMoves ?? undefined}
      aria-valuenow={moves}
    >
      <div class="hud-progress-bar" style="width: {progress}%"></div>
    </div>
    <span class="muted">
      ★ {level.stars.length - starsRemaining}/{level.stars.length} · {moves} COUPS{optimalMoves !== null
        ? ` / OPTIMAL ${optimalMoves}`
        : ""} · swipe ou flèches
    </span>
  </div>
  {#if onReset}
    <Button
      icon="reset"
      ariaLabel="Recommencer le niveau"
      onclick={onReset}
      variant="secondary"
      class="hud-restart"
    />
  {/if}
</div>
