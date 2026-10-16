<script lang="ts">
  import type { Challenge } from "@duality/game";
  import Button from "../components/Button.svelte";
  import LevelGameplayView from "../game/LevelGameplayView.svelte";
  import { createLevelGameplay } from "../game/gameplay.svelte";
  import { appearance } from "../lib/appearance.svelte";
  import { calculateLevelResult } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";
  import { getActiveThemeName } from "../lib/theme";

  let {
    challenge,
    profileLabel,
    onNewChallenge,
  }: {
    challenge: Challenge;
    profileLabel: string;
    onNewChallenge: () => void;
  } = $props();

  /* svelte-ignore state_referenced_locally */
  const game = createLevelGameplay(challenge.level, {
    onEscape: () => navigate("/menu"),
  });

  const themeName = $derived.by(() => {
    appearance.tick;
    return getActiveThemeName();
  });

  let completed = $state(false);
  $effect(() => {
    if (game.state.completed) completed = true;
  });

  const result = $derived(
    completed
      ? calculateLevelResult(game.state.moves, challenge.moves, game.elapsedMs)
      : null,
  );

  function onReset() {
    completed = false;
    game.reset();
  }
</script>

{#if !completed}
  <LevelGameplayView
    level={challenge.level}
    gameState={game.state}
    movement={game.movement}
    skin="default"
    {themeName}
    move={game.move}
    switchForm={game.switchForm}
    {onReset}
  />
{:else}
  <div class="modal-actions challenge-complete">
    <h2>DÉFI TERMINÉ</h2>
    <p class="muted">
      {result?.stars ?? 0} ★ · {result?.score ?? 0} points · {game.state.moves} coups
    </p>
    <p class="muted">SEED · {challenge.seed}</p>
    <Button icon="arrowRight" label="NOUVEAU DÉFI" onclick={onNewChallenge} variant="primary" />
    <Button label="REJOUER" onclick={onReset} variant="secondary" />
  </div>
{/if}
