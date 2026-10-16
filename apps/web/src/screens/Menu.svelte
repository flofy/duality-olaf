<script lang="ts">
  import { halloween, isSeasonalEventAvailable } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import { campaign, worlds } from "../lib/levels/campaign";
  import {
    getCampaignProgress,
    getCompletedCount,
    isLevelCompleted,
    isWorldUnlocked,
  } from "../lib/progression";
  import { isLevelLabEnabled } from "../lib/devFlags";
  import { navigate } from "../lib/router.svelte";

  const progress = getCampaignProgress();
  const visibleWorlds = worlds.filter(
    (world) => world.status === "available" && isWorldUnlocked(world.id),
  );

  function worldMeta(world: (typeof worlds)[number]): string {
    const done = world.levels.filter((level) => isLevelCompleted(level.id)).length;
    return done === world.levels.length
      ? `${world.subtitle} • ✓ TERMINÉ`
      : `${world.subtitle} • ${done}/${world.levels.length}`;
  }
</script>

<section class="menu">
  <h1 class="title">DUALITY</h1>
  <div class="subtitle">CHOISIS TON MONDE</div>
  <div class="world-list">
    {#each visibleWorlds as world (world.id)}
      <div style="position: relative">
        <Button
          icon="arrowRight"
          iconSize={20}
          label="MONDE {world.id} — {world.name.toUpperCase()}"
          onclick={() => navigate(`/world/${world.id}`)}
          variant="primary"
          class="world-button"
        />
        <div class="world-meta">{worldMeta(world)}</div>
      </div>
    {/each}
  </div>
  {#if isSeasonalEventAvailable(halloween)}
    <Button
      iconText="🎃"
      label="ÉVÉNEMENT HALLOWEEN · NIVEAUX SPÉCIAUX"
      onclick={() => navigate("/halloween")}
      variant="primary"
      class="halloween-promo"
    />
  {/if}
  <div class="campaign-progress">
    <div class="campaign-progress-header">
      <span>PROGRESSION</span>
      <strong>{progress.percentage}%</strong>
    </div>
    <div class="campaign-progress-track" aria-label="{progress.percentage}% de complétion">
      <div class="campaign-progress-fill" style="width: {progress.percentage}%"></div>
    </div>
    <div class="campaign-progress-meta">
      <span>{progress.completed}/{progress.total} niveaux</span>
      <span>{progress.stars}/{progress.totalStars} ★</span>
    </div>
  </div>
  <p class="muted">{getCompletedCount()} terminé(s) · {campaign.length} jouables</p>
  <div class="modal-actions">
    <Button icon="arrowRight" label="DÉFI" onclick={() => navigate("/challenge")} variant="secondary" />
    <Button icon="help" label="AIDE" onclick={() => navigate("/help")} variant="secondary" />
    {#if isLevelLabEnabled}
      <button class="action dev-entry" onclick={() => navigate("/dev/levels")}>🧪 LEVEL LAB</button>
    {/if}
  </div>
</section>
