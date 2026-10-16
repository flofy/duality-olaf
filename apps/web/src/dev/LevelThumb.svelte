<script lang="ts">
  import type { Level } from "@duality/level-format";

  let { level }: { level: Level } = $props();

  const key = (x: number, y: number) => `${x}:${y}`;

  const markers = $derived.by(() => {
    const map = new Map<string, string>();
    map.set(key(level.ball.x, level.ball.y), "ball");
    if (level.square) map.set(key(level.square.x, level.square.y), "square");
    for (const star of level.stars) map.set(key(star.x, star.y), "star");
    for (const door of level.doors ?? []) map.set(key(door.position.x, door.position.y), "door");
    for (const sw of level.switches ?? []) map.set(key(sw.position.x, sw.position.y), "switch");
    return map;
  });

  // Téléporteurs : position → id pour l'affichage A/B.
  const teleporterAt = $derived.by(() => {
    const map = new Map<string, string>();
    for (const tp of level.teleporters ?? []) map.set(key(tp.position.x, tp.position.y), tp.id);
    return map;
  });
</script>

<div
  class="dev-thumb"
  style="grid-template-columns: repeat({level.width}, 1fr); grid-template-rows: repeat({level.height}, 1fr); aspect-ratio: {level.width} / {level.height}"
  aria-hidden="true"
>
  {#each { length: level.height } as _, y (y)}
    {#each { length: level.width } as __, x (x)}
      {@const tile = level.tiles[y]?.[x] ?? "empty"}
      {@const marker = markers.get(key(x, y))}
      {@const tpId = teleporterAt.get(key(x, y))}
      <div class="dev-thumb-cell dev-thumb-{tile}{marker ? ` dev-thumb-marker-${marker}` : ''}">
        {#if tpId}
          <span class="dev-thumb-teleport-label">{tpId === "teleporter-a" || tpId.endsWith("-a") ? "A" : "B"}</span>
        {/if}
      </div>
    {/each}
  {/each}
</div>
