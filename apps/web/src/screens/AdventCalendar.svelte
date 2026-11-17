<script lang="ts">
  import { christmas, isSeasonalEventAvailable } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import DevDateSimulator from "../components/DevDateSimulator.svelte";
  import Redirect from "../components/Redirect.svelte";
  import { getAppDate } from "../lib/devDate.svelte";
  import { getAdventDay, isAdventDayAvailable, isNewYearSurpriseAvailable } from "../lib/advent";
  import { isLevelCompleted } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";

  const today = $derived(getAdventDay(getAppDate()));
  const eventAvailable = $derived(isSeasonalEventAvailable(christmas, getAppDate()));
  const newYearAvailable = $derived(isNewYearSurpriseAvailable(getAppDate()));
  const levels = christmas.levels;
  const days = Array.from({ length: 24 }, (_, index) => index + 1);
  const levelForDay = (day: number) => levels[day - 1];
</script>

{#if !eventAvailable}
  <Redirect to="/menu" />
{:else}
<section class="menu advent-page winter-menu">
  <div class="topbar">
    <Button icon="arrowLeft" label="MENU" onclick={() => navigate("/menu")} variant="secondary" />
    <b>ÉVÉNEMENT SPÉCIAL</b>
  </div>
  <DevDateSimulator />
  <div class="advent-hero">
    <span class="advent-hero-flake advent-hero-flake-left" aria-hidden="true">❄</span>
    <span class="advent-hero-flake advent-hero-flake-right" aria-hidden="true">✦</span>
    <span class="advent-hero-kicker">DU 1ER DÉCEMBRE AU 7 JANVIER</span>
    <h1>LA MAGIE DE L'HIVER</h1>
    <p>24 cases, 24 défis à découvrir jusqu'à Noël.</p>
    <div class="advent-countdown">{today === 0 ? "BIENTÔT…" : today >= 24 ? "JOYEUX NOËL !" : today + " / 24 JOURS DÉCOUVERTS"}</div>
  </div>
  <div class="advent-grid" aria-label="Les 24 jours du calendrier de l'Avent">
    {#each days as day (day)}
      {@const level = levelForDay(day)}
      {@const available = isAdventDayAvailable(day, getAppDate())}
      {@const done = level ? isLevelCompleted(level.id) : false}
      <button
        type="button"
        class="advent-door {available ? 'is-available' : 'is-locked'} {done ? 'is-complete' : ''}"
        disabled={!available || !level}
        aria-label={"Jour " + day + (done ? ", terminé" : available ? ", disponible" : ", verrouillé")}
        onclick={() => level && navigate("/advent/level/" + level.id)}
      >
        <span class="advent-door-number">{String(day).padStart(2, "0")}</span>
        <span class="advent-door-symbol">{done ? "★" : available ? "✦" : "🔒"}</span>
      </button>
    {/each}
  </div>
  <p class="advent-note">
    Une nouvelle case s'ouvre chaque jour du 1er au 24 décembre. Les cases déjà
    révélées restent accessibles : tu peux jouer à ton rythme et rattraper les défis.
  </p>
  {#if newYearAvailable}
    <div class="new-year-surprise">
      <span class="new-year-surprise-icon" aria-hidden="true">🎆</span>
      <div>
        <strong>LA SURPRISE DU NOUVEL AN</strong>
        <p>Un défi bonus pour commencer l'année en beauté.</p>
      </div>
      <Button icon="arrowRight" label="DÉCOUVRIR" onclick={() => navigate("/advent/new-year")} />
    </div>
  {:else}
    <p class="advent-note new-year-teaser">Une surprise spéciale t'attendra le 1er janvier… ✨</p>
  {/if}
</section>
{/if}
