<script lang="ts">
  import type { Level } from "@duality/level-format";
  import { onMount } from "svelte";
  import type { LevelEditorTool } from "../lib/editorTools";
  import { switchGlyph } from "../lib/editorTools";
  import { isDragPaintTool } from "../lib/levelOps";

  let {
    level,
    tool,
    onPaint,
  }: {
    level: Level;
    tool: LevelEditorTool;
    onPaint: (x: number, y: number) => void;
  } = $props();

  let painting = false;
  let lastPainted: string | null = null;

  function same(a: { x: number; y: number } | undefined, b: { x: number; y: number }) {
    return a !== undefined && a.x === b.x && a.y === b.y;
  }

  onMount(() => {
    const stopPainting = () => {
      painting = false;
      lastPainted = null;
    };
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    return () => {
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
    };
  });

  function onPointerDown(event: PointerEvent, x: number, y: number) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (isDragPaintTool(tool)) {
      painting = true;
      lastPainted = `${x}-${y}`;
    }
    onPaint(x, y);
  }

  function onPointerEnter(x: number, y: number) {
    if (!painting) return;
    const key = `${x}-${y}`;
    if (lastPainted === key) return;
    lastPainted = key;
    onPaint(x, y);
  }
</script>

<div class="editor-board board" style="--cols: {level.width}; --rows: {level.height}" aria-label="Grille d'édition">
  {#each level.tiles as row, y (y)}
    {#each row as tile, x (x)}
      {@const pos = { x, y }}
      {@const star = level.stars.some((p) => p.x === x && p.y === y)}
      {@const ball = same(level.ball, pos)}
      {@const square = same(level.square, pos)}
      {@const door = level.doors?.find((d) => same(d.position, pos))}
      {@const sw = level.switches?.find((s) => same(s.position, pos))}
      {@const tp = level.teleporters?.find((t) => same(t.position, pos))}
      <button
        type="button"
        class="editor-cell {tile === 'wall' ? 'wall' : ''}"
        style="grid-column: {x + 1}; grid-row: {y + 1}"
        onpointerdown={(event) => onPointerDown(event, x, y)}
        onpointerenter={() => onPointerEnter(x, y)}
        aria-label="Case {x + 1}, {y + 1}"
      >
        {#if ball}<span class="editor-entity ball">●</span>{/if}
        {#if square}<span class="editor-entity square">■</span>{/if}
        {#if star}<span class="editor-entity star">★</span>{/if}
        {#if door}<span class="editor-entity door">▣</span>{/if}
        {#if sw}<span class="editor-entity switch form-{sw.form}">{switchGlyph(sw.form)}</span>{/if}
        {#if tp}<span class="editor-entity teleporter">◎</span>{/if}
        {#if tile === "spike"}<span class="editor-entity spike">🔥</span>{/if}
      </button>
    {/each}
  {/each}
</div>
