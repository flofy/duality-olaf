<script lang="ts">
  import type { LevelValidation } from "@duality/game";

  let {
    message,
    validation,
    targetWorld,
    inferredWorld,
    showImportText,
    pastedJson = $bindable(),
    onValidate,
    onTest,
    onCopyJson,
    onSaveToServer,
    onTargetWorldChange,
    onToggleImportText,
    onImportPasted,
    onImportFile,
    onExport,
  }: {
    message: string;
    validation: LevelValidation | null;
    targetWorld: number | null;
    inferredWorld: number;
    showImportText: boolean;
    pastedJson: string;
    onValidate: () => void;
    onTest: () => void;
    onCopyJson: () => void;
    onSaveToServer: () => void;
    onTargetWorldChange: (world: number | null) => void;
    onToggleImportText: () => void;
    onImportPasted: () => void;
    onImportFile: (file: File) => void;
    onExport: () => void;
  } = $props();

  let fileInput: HTMLInputElement | undefined = $state();

  function importJson(event: Event & { currentTarget: HTMLInputElement }) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    onImportFile(file);
  }
</script>

<div class="editor-section-title">ACTIONS</div>
<label>
  MONDE CIBLE (ÉCRITURE LOCALE)
  <select
    value={targetWorld ?? ""}
    onchange={(e) => onTargetWorldChange(e.currentTarget.value === "" ? null : Number(e.currentTarget.value))}
  >
    <option value="">
      {inferredWorld >= 1 ? `auto · monde ${inferredWorld} (d'après l'id)` : "auto — aucun monde dans l'id"}
    </option>
    {#each [1, 2, 3, 4, 5] as world (world)}
      <option value={world}>monde {world}</option>
    {/each}
  </select>
</label>
<button class="action editor-action" onclick={onValidate}>⚡ VALIDER / RÉSOUDRE</button>
<button class="action editor-action" onclick={onTest}>▶ TESTER LE NIVEAU</button>
<button class="action editor-action" onclick={onCopyJson}>⧉ COPIER LE JSON</button>
<button class="action editor-action" onclick={onSaveToServer}>⬇ ÉCRIRE SUR LE DISQUE</button>
<button class="action editor-action" onclick={() => fileInput?.click()}>⇪ IMPORTER (FICHIER)</button>
<button class="action editor-action" onclick={onToggleImportText}>
  ⇪ IMPORTER (COLLER){showImportText ? " ▴" : " ▾"}
</button>
{#if showImportText}
  <div class="editor-import-text">
    <textarea
      bind:value={pastedJson}
      placeholder={'{"id": "custom-01", "width": 13, ...}'}
      rows={8}
      spellcheck={false}
    ></textarea>
    <button class="action editor-action" disabled={!pastedJson.trim()} onclick={onImportPasted}>
      CHARGER LE JSON
    </button>
  </div>
{/if}
<input bind:this={fileInput} type="file" accept="application/json,.json" onchange={importJson} hidden />
<button class="action editor-action" onclick={onExport}>↓ EXPORTER</button>
<div class="editor-status" role="status">{message}</div>
{#if validation}
  <div class="editor-validation {validation.result.solvable ? 'ok' : 'error'}">
    {validation.result.solvable
      ? `Solvable · ${validation.difficulty?.moves} coups · score ${validation.difficulty?.score}`
      : `Unsolvable · ${validation.result.exploredStates} états explorés`}
  </div>
{/if}
