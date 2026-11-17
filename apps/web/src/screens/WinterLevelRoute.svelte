<script lang="ts">
  import { christmas } from "@duality/level-format";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isAdventDayAvailable } from "../lib/advent";
  import { getAppDate } from "../lib/devDate.svelte";

  let { levelId }: { levelId: string } = $props();

  const index = $derived(christmas.levels.findIndex((level) => level.id === levelId));
  const unlocked = $derived(index >= 0 && isAdventDayAvailable(index + 1, getAppDate()));
</script>

{#if index < 0 || !unlocked}
  <Redirect to="/advent" />
{:else}
  <Game level={christmas.levels[index]!} worldId={2} seasonalEvent={christmas} advent />
{/if}
