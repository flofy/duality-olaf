<script lang="ts">
  import { christmas, isSeasonalEventAvailable } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import DevDateSimulator from "../components/DevDateSimulator.svelte";
  import { getAppDate } from "../lib/devDate.svelte";
  import { getAdventDay, isAdventDayAvailable } from "../lib/advent";
  import { isLevelCompleted } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";

  const today = $derived(getAdventDay(getAppDate()));
  const levels = christmas.levels;
  const days = Array.from({ length: 24 }, (_, index) => index + 1);
  const levelForDay = (day: number) => levels[day - 1];
</script>

<section class="menu advent-page">
  <div class="topbar">
    <Button icon="arrowLeft" label="MENU" onclick={() => navigate("/menu")} variant="secondary" />
    <b>ÉVÉNEMENT SPÉCIAL</b>
  </div>
  <DevDateSimulator />
  <div class="advent-hero">
    <span class="advent-hero-flake advent-hero-flake-left" aria-hidden="true">❄</span>
    <span class="advent-hero-flake advent-hero-flake-right" aria-hidden="true">✦</span>
    <span class="advent-hero-kicker">DU 1ER AU 24 DÉCEMBRE</span>
    <h1>CALENDRIER DE L'AVENT</h1>
    <p>24 jours, 24 petits défis à découvrir.</p>
    <div class="advent-countdown">{today === 0 ? "BIENTÔT…" : today >= 24 ? "JOYEUX NOËL !" : `${today} / 24 JOURS DÉCOUVERTS`}</div>
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
        aria-label={`Jour ${day}${done ? ', terminé' : available ? ', disponible' : ', verrouillé'}`}
        onclick={() => level && navigate(`/advent/level/${level.id}`)}
      >
        <span class="advent-door-number">{String(day).padStart(2, "0")}</span>
        <span class="advent-door-symbol">{done ? "★" : available ? "✦" : "🔒"}</span>
      </button>
    {/each}
  </div>
  <p class="advent-note">
    Chaque case se débloque à sa date. Une fois découverte, elle reste accessible
    pour pouvoir jouer à ton rythme.
  </p>
  {#if isSeasonalEventAvailable(christmas)}
    <Button iconText="❄️" label="DÉCOUVRIR LE MONDE HIVER" onclick={() => navigate("/winter")} variant="secondary" class="advent-winter-link" />
  {:else}
    <p class="advent-note">Le monde Hiver ouvrira le 1er décembre.</p>
  {/if}
</section>
