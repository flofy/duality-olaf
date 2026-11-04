<script lang="ts">
  import { halloween, christmas, isSeasonalEventAvailable } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import DevDateSimulator from "../components/DevDateSimulator.svelte";
  import { campaign, worlds } from "../lib/levels/campaign";
  import {
    getCampaignProgress,
    getCompletedCount,
    isLevelCompleted,
    isWorldUnlocked,
  } from "../lib/progression";
  import { isLevelLabEnabled } from "../lib/devFlags";
  import { getAppDate } from "../lib/devDate.svelte";
  import { navigate } from "../lib/router.svelte";

  const progress = getCampaignProgress();
  const visibleWorlds = worlds.filter(
    (world) => world.status === "available" && isWorldUnlocked(world.id),
  );
  const seasonalAvailable = [
    { event: halloween, route: "/halloween", icon: "🎃", label: "HALLOWEEN", description: "UNE AVENTURE QUI DONNE DES FRISSONS" },
    { event: christmas, route: "/winter", icon: "❄️", label: "HIVER", description: "24 NIVEAUX SOUS LA NEIGE" },
  ];

  const adventAvailable = $derived(
    getAppDate().getMonth() === 11 && getAppDate().getDate() <= 24,
  );

  function worldMeta(world: (typeof worlds)[number]): string {
    const done = world.levels.filter((level) => isLevelCompleted(level.id)).length;
    return done === world.levels.length
      ? `${world.subtitle} • ✓ TERMINÉ`
      : `${world.subtitle} • ${done}/${world.levels.length}`;
  }
</script>

<section class="menu worlds-menu {isSeasonalEventAvailable(christmas, getAppDate()) ? 'winter-menu' : ''}">
  <h1 class="title">DUALITY</h1>
  <div class="subtitle">CHOISIS TON MONDE</div>
  <DevDateSimulator />

  <section class="world-group" aria-labelledby="classic-worlds-title">
    <div class="world-group-heading">
      <h2 id="classic-worlds-title">MONDES CLASSIQUES</h2>
      <span>PROGRESSION PRINCIPALE</span>
    </div>
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
  </section>

  <section class="world-group seasonal-world-group" aria-labelledby="seasonal-worlds-title">
    <div class="world-group-heading">
      <h2 id="seasonal-worlds-title">MONDES SAISONNIERS</h2>
      <span>COLLECTIONS ÉVÉNEMENTIELLES</span>
    </div>
    {#each seasonalAvailable as item (item.event.id)}
      {#if isSeasonalEventAvailable(item.event, getAppDate())}
        <Button
          iconText={item.icon}
          label={`${item.label} · ${item.description}`}
          onclick={() => navigate(item.route)}
          variant="primary"
          class={item.event.theme === "halloween" ? "halloween-promo" : "winter-promo"}
        />
      {/if}
    {/each}
{#if adventAvailable}
      <Button
        iconText="🎁"
        label="CALENDRIER DE L'AVENT · 24 SURPRISES"
        onclick={() => navigate("/advent")}
        variant="secondary"
        class="advent-promo"
      />
    {/if}
  </section>

  <div class="campaign-progress">
    <div class="campaign-progress-header">
      <span>PROGRESSION CLASSIQUE</span>
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
