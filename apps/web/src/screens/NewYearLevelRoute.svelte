<script lang="ts">
  import { christmas, newYearSurprise } from "@duality/level-format";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isNewYearSurpriseAvailable } from "../lib/advent";
  import { getAppDate } from "../lib/devDate.svelte";

  const available = $derived(isNewYearSurpriseAvailable(getAppDate()));
</script>

{#if !available}
  <Redirect to="/advent" />
{:else}
  <Game
    level={newYearSurprise}
    worldId={2}
    seasonalEvent={christmas}
    advent
    levelsOverride={[newYearSurprise]}
  />
{/if}
