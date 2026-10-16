<script lang="ts">
  import Button from "../components/Button.svelte";
  import Redirect from "../components/Redirect.svelte";
  import { worlds } from "../lib/levels/campaign";
  import {
    getLevelResult,
    getNextWorld,
    isLevelCompleted,
    isWorldCompleted,
    isWorldUnlocked,
  } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";

  let { worldId }: { worldId: string } = $props();

  const world = $derived(worlds.find((item) => item.id === Number(worldId)));
  const nextWorld = $derived(
    world && isWorldCompleted(world.id) ? getNextWorld(world.id) : null,
  );
</script>

{#if !world || world.status !== "available" || !isWorldUnlocked(world.id)}
  <Redirect to="/menu" />
{:else}
  <section class="menu">
    <div class="topbar">
      <Button icon="arrowLeft" label="MONDES" onclick={() => navigate("/menu")} variant="secondary" />
      <b>MONDE {world.id}</b>
    </div>
    <h2 class="subtitle">{world.name.toUpperCase()}</h2>
    <Button
      icon="help"
      label="REVOIR LE TUTORIEL"
      onclick={() => navigate(`/world/${world.id}/level/${world.levels[0]!.id}?tutorial=1`)}
      variant="secondary"
      class="world-tutorial-replay"
    />
    {#if world.id === 1 && isLevelCompleted(world.levels[3]!.id)}
      <Button
        icon="help"
        label="REVOIR LE TUTORIEL FEU"
        onclick={() => navigate(`/world/1/level/${world.levels[4]!.id}?tutorial=fire`)}
        variant="secondary"
        class="world-tutorial-replay world-fire-tutorial-replay"
      />
    {/if}
    <div class="world-progress-summary">
      <span>
        {world.levels.filter((level) => isLevelCompleted(level.id)).length}/{world.levels.length} NIVEAUX
      </span>
      <span>
        {world.levels.reduce((total, level) => total + (getLevelResult(level.id)?.stars ?? 0), 0)}/{world.levels.length * 3} ★
      </span>
    </div>
    <div class="levels">
      {#each world.levels as level, index (level.id)}
        {@const unlocked = index === 0 || isLevelCompleted(world.levels[index - 1]!.id)}
        {@const done = isLevelCompleted(level.id)}
        {@const stars = getLevelResult(level.id)?.stars ?? 1}
        <button
          class="level-button"
          disabled={!unlocked}
          onclick={() => navigate(`/world/${world.id}/level/${level.id}`)}
        >
          {#if done}
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span class="level-stars" aria-label="{stars} étoiles">{"★".repeat(stars)}</span>
          {:else if unlocked}
            {String(index + 1).padStart(2, "0")}
          {:else}
            🔒
          {/if}
        </button>
      {/each}
    </div>
    <!-- Le passage au monde suivant apparaît dès que celui-ci est terminé. -->
    {#if nextWorld}
      <Button
        icon="arrowRight"
        label="MONDE {nextWorld.id} · {nextWorld.name.toUpperCase()}"
        onclick={() => navigate(`/world/${nextWorld.id}`)}
        variant="primary"
        class="world-next"
      />
    {/if}
  </section>
{/if}
