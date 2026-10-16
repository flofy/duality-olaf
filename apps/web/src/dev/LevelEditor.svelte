<script lang="ts">
  import "../level-editor.css";
  import { cloneLevel, sanitizeLevel, type Level, type Switch } from "@duality/level-format";
  import { validateLevel, type LevelValidation } from "@duality/game";
  import { LEVEL_SERVER_URL } from "../lib/devFlags";
  import { devLevelById } from "../lib/devLevels";
  import type { LevelEditorTool } from "../lib/editorTools";
  import { applyTool, blankLevel, inferWorld, resizeLevel } from "../lib/levelOps";
  import { navigate } from "../lib/router.svelte";
  import EditorActions from "./EditorActions.svelte";
  import EditorGrid from "./EditorGrid.svelte";
  import EditorTools from "./EditorTools.svelte";
  import PlayOverlay from "./PlayOverlay.svelte";

  let { initialLevelId = null }: { initialLevelId?: string | null } = $props();

  function initialLevel(): Level {
    const initial = initialLevelId === null ? undefined : devLevelById.get(initialLevelId);
    // sanitizeLevel écarte toute clé parasite sérialisée par un ancien outil.
    return initial ? sanitizeLevel(initial) : blankLevel("custom-01", 13, 10);
  }

  let level = $state.raw<Level>(initialLevel());
  let tool = $state<LevelEditorTool>("wall");
  // Forme(s) à laquelle réagit un interrupteur nouvellement posé (outil « switch »).
  let switchForm = $state<Switch["form"]>("either");
  /* svelte-ignore state_referenced_locally */
  let message = $state(
    initialLevelId
      ? "Édition d'un niveau existant — modifie puis exporte le JSON"
      : "Prêt à créer un niveau",
  );
  let playing = $state(false);
  let showImportText = $state(false);
  let pastedJson = $state("");
  let targetWorld = $state<number | null>(null);
  let validation = $state.raw<LevelValidation | null>(null);

  // On affiche / copie / exporte toujours un niveau assaini : pas de clés parasites.
  const json = $derived(JSON.stringify(sanitizeLevel(level), null, 2));
  const inferredWorld = $derived(inferWorld(level.id));

  const switchChoices = [
    { form: "either", glyph: "●⇄■", label: "Les deux" },
    { form: "ball", glyph: "●", label: "Boule" },
    { form: "square", glyph: "■", label: "Carré" },
  ] as const;

  function update(next: Level) {
    level = next;
    validation = null;
  }

  function paint(x: number, y: number) {
    const next = cloneLevel(level);
    applyTool(next, tool, x, y, { switchForm });
    update(next);
  }

  function newLevel() {
    update(blankLevel("custom-01", level.width, level.height));
    playing = false;
    message = "Nouveau niveau";
  }

  function resize(width: number, height: number) {
    const next = resizeLevel(level, width, height);
    if (next) update(next);
  }

  function validate() {
    const result = validateLevel(level);
    validation = result;
    message = result.result.solvable
      ? `✓ Solvable en ${result.difficulty?.moves} coups`
      : "✗ Niveau non solvable";
  }

  async function copyJson() {
    await navigator.clipboard.writeText(json);
    message = "JSON copié dans le presse-papiers";
  }

  async function saveToServer() {
    const world = targetWorld ?? inferredWorld;
    if (world < 1 || world > 5) {
      message = "✗ Monde cible inconnu — l'id doit suivre world-N-level-XX ou choisis un monde";
      return;
    }
    try {
      const response = await fetch(`${LEVEL_SERVER_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: sanitizeLevel(level), world }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        errors?: string[];
      };
      message =
        response.ok && payload.ok
          ? `💾 ${payload.message}`
          : `✗ ${payload.errors?.join(" · ") ?? "écriture refusée"}`;
    } catch {
      message = `✗ Serveur local introuvable (${LEVEL_SERVER_URL}) — lance « pnpm level:serve »`;
    }
  }

  function applyImport(raw: string): boolean {
    try {
      const parsed = JSON.parse(raw) as Level;
      if (
        typeof parsed.id !== "string" ||
        !Array.isArray(parsed.tiles) ||
        typeof parsed.width !== "number" ||
        typeof parsed.height !== "number" ||
        !Array.isArray(parsed.stars)
      ) {
        throw new Error("structure");
      }
      update(sanitizeLevel(parsed));
      message = `✓ Niveau importé · ${parsed.id}`;
      return true;
    } catch {
      message = "✗ JSON invalide — import annulé";
      return false;
    }
  }

  function importFile(file: File) {
    void file.text().then(applyImport);
  }

  function importPasted() {
    if (applyImport(pastedJson.trim())) {
      pastedJson = "";
      showImportText = false;
    }
  }

  function exportJson() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${level.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="dev-editor">
  <div class="topbar">
    <button class="action" onclick={() => navigate("/dev/levels")}>← LAB</button>
    <b>LEVEL EDITOR</b>
    <button class="action" onclick={newLevel}>＋ NOUVEAU</button>
  </div>
  <p class="dev-banner">DEV ONLY · construis, valide et teste tes propres niveaux</p>
  <div class="editor-layout">
    <aside class="editor-sidebar">
      <label>
        ID DU NIVEAU
        <input value={level.id} oninput={(e) => (level = { ...level, id: e.currentTarget.value })} />
      </label>
      <div class="editor-size">
        <label>
          LARGEUR
          <input
            type="number"
            min="3"
            max="20"
            value={level.width}
            onchange={(e) => resize(Number(e.currentTarget.value), level.height)}
          />
        </label>
        <label>
          HAUTEUR
          <input
            type="number"
            min="3"
            max="20"
            value={level.height}
            onchange={(e) => resize(level.width, Number(e.currentTarget.value))}
          />
        </label>
      </div>
      <div class="editor-section-title">OUTILS</div>
      <EditorTools selected={tool} onSelect={(next) => (tool = next)} />
      {#if tool === "switch"}
        <div class="editor-section-title">RÉACTION DE L'INTERRUPTEUR</div>
        <div class="editor-tools" role="radiogroup" aria-label="Forme activatrice de l'interrupteur">
          {#each switchChoices as item (item.form)}
            <button
              type="button"
              class="editor-tool {switchForm === item.form ? 'selected' : ''}"
              onclick={() => (switchForm = item.form)}
              title={item.label}
              aria-pressed={switchForm === item.form}
            >
              <span>{item.glyph}</span>
              {item.label}
            </button>
          {/each}
        </div>
      {/if}
      <EditorActions
        {message}
        {validation}
        {targetWorld}
        {inferredWorld}
        {showImportText}
        bind:pastedJson
        onValidate={validate}
        onTest={() => (playing = true)}
        onCopyJson={() => void copyJson()}
        onSaveToServer={() => void saveToServer()}
        onTargetWorldChange={(world) => (targetWorld = world)}
        onToggleImportText={() => (showImportText = !showImportText)}
        onImportPasted={importPasted}
        onImportFile={importFile}
        onExport={exportJson}
      />
    </aside>
    <div class="editor-workspace">
      <div class="editor-board-shell">
        <EditorGrid {level} {tool} onPaint={paint} />
      </div>
      <p class="editor-hint">
        Clique (ou clique-glisse pour les murs, piques et cases vides) pour appliquer l'outil
        sélectionné. Le carré est optionnel : re-clique sur sa case pour le retirer. Les piques
        sont mortelles : une pièce qui glisse dessus déclenche un game over. Les éléments
        mécaniques sont créés avec des identifiants automatiques.
      </p>
      <details class="editor-json">
        <summary>JSON du niveau</summary>
        <pre>{json}</pre>
      </details>
    </div>
  </div>
  {#if playing}
    <PlayOverlay {level} onClose={() => (playing = false)} onComplete={(text) => (message = text)} />
  {/if}
</section>
