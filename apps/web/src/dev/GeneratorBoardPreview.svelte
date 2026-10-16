<script lang="ts">
  import type { Level } from "@duality/level-format";

  let { level }: { level: Level } = $props();
</script>

<div class="generator-board board" style="--cols: {level.width}; --rows: {level.height}">
  {#each level.tiles as row, y (y)}
    {#each row as tile, x (x)}
      {#if tile === "wall"}
        <div class="wall" style="grid-column: {x + 1}; grid-row: {y + 1}"></div>
      {/if}
    {/each}
  {/each}
  {#each level.stars as star (`${star.x}-${star.y}`)}
    <div class="star" style="grid-column: {star.x + 1}; grid-row: {star.y + 1}">★</div>
  {/each}
  <div class="piece ball" style="grid-column: {level.ball.x + 1}; grid-row: {level.ball.y + 1}"></div>
  {#if level.square}
    <div class="piece square" style="grid-column: {level.square.x + 1}; grid-row: {level.square.y + 1}"></div>
  {/if}
</div>
