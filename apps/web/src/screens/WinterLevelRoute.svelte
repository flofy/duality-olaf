<script lang="ts">
  import { christmas, isSeasonalEventAvailable } from "@duality/level-format";
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import { isAdventDayAvailable } from "../lib/advent";
  import { getAppDate } from "../lib/devDate.svelte";
  import { isLevelCompleted } from "../lib/progression";

  let { levelId, advent = false }: { levelId: string; advent?: boolean } = $props();

  const index = $derived(christmas.levels.findIndex((level) => level.id === levelId));
  const unlocked = $derived(
    advent
      ? index >= 0 && isAdventDayAvailable(index + 1, getAppDate())
      : index === 0 || (index > 0 && isLevelCompleted(christmas.levels[index - 1]!.id)),
  );
</script>

{#if index < 0}
  <Redirect to={advent ? "/advent" : "/winter"} />
{:else if (!advent && !isSeasonalEventAvailable(christmas, getAppDate())) || !unlocked}
  <Redirect to={advent ? "/advent" : "/winter"} />
{:else}
  <Game level={christmas.levels[index]!} worldId={2} seasonalEvent={christmas} {advent} />
{/if}
