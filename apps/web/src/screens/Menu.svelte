<script lang="ts">
  import { halloween, christmas, isSeasonalEventAvailable, isSeasonalEventPublished } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import DevDateSimulator from "../components/DevDateSimulator.svelte";
  import { worlds } from "../lib/levels/campaign";
  import {
    getCampaignProgress,
    getCollectionProgress,
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

  const adventAvailable = $derived(isSeasonalEventAvailable(christmas, getAppDate()));

  function worldMeta(world: (typeof worlds)[number]): string {
    const stats = getCollectionProgress(world.levels);
    return `${world.subtitle} · ${stats.completed}/${stats.total} niveaux · ${stats.stars}/${stats.totalStars} ★`;
  }

  function isEventVisible(item: (typeof seasonalAvailable)[number]): boolean {
    return isSeasonalEventPublished(item.event, getAppDate());
  }
</script>

<section class="menu worlds-menu {isSeasonalEventAvailable(christmas, getAppDate()) ? 'winter-menu' : ''}">
  <h1 class="title">DUALITY</h1>
  <div class="subtitle">CHOISIS TON MONDE</div>
  <DevDateSimulator />

  <section class="world-group" aria-labelledby="campaign-worlds-title">
    <div class="world-group-heading">
      <h2 id="campaign-worlds-title">CAMPAGNE</h2>
      <span>5 MONDES · PROGRESSION PERMANENTE</span>
    </div>
    <div class="campaign-progress">
      <div class="campaign-progress-header">
        <span>PROGRESSION DE LA CAMPAGNE</span>
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

  {#if seasonalAvailable.some(isEventVisible)}
    <section class="world-group seasonal-world-group" aria-labelledby="seasonal-worlds-title">
      <div class="world-group-heading">
        <h2 id="seasonal-worlds-title">ÉVÉNEMENTS</h2>
        <span>COLLECTIONS SAISONNIÈRES</span>
      </div>
      {#each seasonalAvailable as item (item.event.id)}
        {@const stats = getCollectionProgress(item.event.levels)}
        {#if isEventVisible(item)}
          <div class="seasonal-world-entry">
            <Button
              iconText={item.icon}
              label={`${item.label} · ${item.description}`}
              onclick={() => navigate(item.route)}
              variant="primary"
              class={item.event.theme === "halloween" ? "halloween-promo" : "winter-promo"}
            />
            <div class="world-meta">
              {stats.completed}/{stats.total} niveaux terminés · {stats.stars}/{stats.totalStars} ★
            </div>
          </div>
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
  {/if}

  <section class="world-group challenge-world-group" aria-labelledby="challenges-title">
    <div class="world-group-heading">
      <h2 id="challenges-title">DÉFIS</h2>
      <span>NIVEAUX INDÉPENDANTS ET REJOUABLES</span>
    </div>
    <Button
      icon="arrowRight"
      label="DÉCOUVRIR LES DÉFIS"
      onclick={() => navigate("/challenge")}
      variant="secondary"
    />
  </section>

  <div class="modal-actions">
    <Button icon="help" label="AIDE" onclick={() => navigate("/help")} variant="secondary" />
    {#if isLevelLabEnabled}
      <button class="action dev-entry" onclick={() => navigate("/dev/levels")}>🧪 LEVEL LAB</button>
    {/if}
  </div>
</section>
