<script lang="ts">
  import { levelEditorTools, type LevelEditorTool } from "../lib/editorTools";

  let {
    selected,
    onSelect,
  }: { selected: LevelEditorTool; onSelect: (tool: LevelEditorTool) => void } = $props();
</script>

<div class="editor-tools" role="toolbar" aria-label="Outils de niveau">
  {#each levelEditorTools as item (item.id)}
    <button
      class="editor-tool {selected === item.id ? 'selected' : ''}"
      onclick={() => onSelect(item.id)}
      title={item.label}
    >
      <span>{item.glyph}</span>
      {item.label}
    </button>
  {/each}
</div>
