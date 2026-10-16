<script lang="ts">
  import { halloween } from "@duality/level-format";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isLevelCompleted } from "../lib/progression";

  let { levelId }: { levelId: string } = $props();

  const index = $derived(halloween.levels.findIndex((level) => level.id === levelId));
</script>

{#if index < 0}
  <Redirect to="/halloween" />
{:else if index > 0 && !isLevelCompleted(halloween.levels[index - 1]!.id)}
  <Redirect to="/halloween" />
{:else}
  <Game level={halloween.levels[index]!} worldId={2} seasonalEvent={halloween} />
{/if}
