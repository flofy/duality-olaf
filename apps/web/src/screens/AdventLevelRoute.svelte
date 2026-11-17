<script lang="ts">
  import { christmas, isSeasonalEventAvailable } from "@duality/level-format";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isAdventDayAvailable } from "../lib/advent";
  import { getAppDate } from "../lib/devDate.svelte";

  let { levelId }: { levelId: string } = $props();

  const index = $derived(christmas.levels.findIndex((level) => level.id === levelId));
  const date = $derived(getAppDate());
  const eventAvailable = $derived(isSeasonalEventAvailable(christmas, date));
  const unlocked = $derived(index >= 0 && isAdventDayAvailable(index + 1, date));
</script>

{#if !eventAvailable || !unlocked}
  <Redirect to="/advent" />
{:else}
  <Game level={christmas.levels[index]!} worldId={2} seasonalEvent={christmas} advent />
{/if}
