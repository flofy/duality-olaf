<script lang="ts">
  import { halloween, isSeasonalEventAvailable } from "@duality/level-format";
  import { getAppDate } from "../lib/devDate.svelte";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isCollectionStarted, isLevelCompleted } from "../lib/progression";

  let { levelId }: { levelId: string } = $props();

  const index = $derived(halloween.levels.findIndex((level) => level.id === levelId));
</script>

{#if index < 0}
  <Redirect to="/halloween" />
{:else if ((!isSeasonalEventAvailable(halloween, getAppDate()) && !isCollectionStarted(halloween.levels)) || (index > 0 && !isLevelCompleted(halloween.levels[index - 1]!.id))}
  <Redirect to="/halloween" />
{:else}
  <Game level={halloween.levels[index]!} worldId={2} seasonalEvent={halloween} />
{/if}
