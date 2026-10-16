<script lang="ts">
  import { validateLevel, type LevelValidation } from "@duality/game";
  import { generateCandidates, type GeneratedLevel, type GeneratorOptions } from "../lib/levelGen";
  import { navigate } from "../lib/router.svelte";
  import GeneratorBoardPreview from "./GeneratorBoardPreview.svelte";
  import LabGame from "./LabGame.svelte";

  type Candidate = { level: GeneratedLevel; validation: LevelValidation };

  const DEFAULTS: GeneratorOptions = {
    seed: 847291,
    width: 13,
    height: 10,
    wallDensity: 0.12,
    stars: 2,
    openBorders: false,
  };

  let options = $state<GeneratorOptions>({ ...DEFAULTS });
  let generation = $state(0);
  let selectedSeed = $state<number | null>(null);

  const candidates = $derived.by<Candidate[]>(() => {
    void generation;
    return generateCandidates($state.snapshot(options) as GeneratorOptions)
      .map((level) => ({ level, validation: validateLevel(level) }))
      .filter((item) => item.validation.result.solvable)
      .sort((a, b) => a.validation.difficulty!.score - b.validation.difficulty!.score)
      .slice(0, 8);
  });

  const selected = $derived(candidates.find((item) => item.level.seed === selectedSeed));

  function generate() {
    selectedSeed = null;
    generation += 1;
  }
</script>

{#if selected}
  <section class="generator-player">
    <div class="topbar">
      <button class="action" onclick={() => (selectedSeed = null)}>← RETOUR</button>
      <b>APERÇU · SEED {selected.level.seed}</b>
    </div>
    <p class="dev-banner">
      DEV ONLY · collecte les ★ pour terminer le niveau · SEED {selected.level.seed}
    </p>
    {#key selected.level.seed}
      <LabGame
        level={selected.level}
        skin="default"
        themeName="retro"
        onCompletionChange={() => {}}
        optimalMoves={selected.validation.difficulty?.moves}
        onBackToGenerator={() => (selectedSeed = null)}
      />
    {/key}
  </section>
{:else}
  <section class="dev-generator">
    <div class="topbar">
      <button class="action" onclick={() => navigate("/dev/levels")}>← LAB</button>
      <b>GÉNÉRATEUR DE NIVEAUX</b>
      <button class="action" onclick={() => navigate("/dev/editor")}>✎ ÉDITEUR</button>
    </div>
    <p class="dev-banner">
      DEV ONLY · génération déterministe · seuls les niveaux solvables sont proposés
    </p>
    <div class="generator-options">
      <label>
        SEED
        <input type="number" value={options.seed} oninput={(e) => (options.seed = Number(e.currentTarget.value) || 1)} />
      </label>
      <label>
        LARGEUR
        <input
          type="number"
          min="5"
          max="20"
          value={options.width}
          oninput={(e) => (options.width = Math.max(5, Math.min(20, Number(e.currentTarget.value) || 5)))}
        />
      </label>
      <label>
        HAUTEUR
        <input
          type="number"
          min="5"
          max="15"
          value={options.height}
          oninput={(e) => (options.height = Math.max(5, Math.min(15, Number(e.currentTarget.value) || 5)))}
        />
      </label>
      <label>
        MURS
        <input
          type="range"
          min="0.04"
          max="0.24"
          step="0.01"
          value={options.wallDensity}
          oninput={(e) => (options.wallDensity = Number(e.currentTarget.value))}
        />
        <span>{Math.round(options.wallDensity * 100)}%</span>
      </label>
      <label>
        ÉTOILES
        <select value={options.stars} onchange={(e) => (options.stars = Number(e.currentTarget.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </label>
      <button
        class="action generator-toggle {options.openBorders ? 'active' : ''}"
        onclick={() => (options.openBorders = !options.openBorders)}
        type="button"
      >
        {options.openBorders ? "🔓 BORDURES OUVERTES" : "🔒 BORDURES FERMÉES"}
      </button>
      <button class="action generator-generate" onclick={generate}>⚡ GÉNÉRER</button>
    </div>
    <div class="generator-meta">
      {candidates.length} candidat(s) solvable(s) · {options.width} × {options.height} ·
      {options.openBorders ? "🔓 bords ouverts" : "🔒 bords fermés"} · clique sur un niveau pour jouer
    </div>
    <div class="generator-grid">
      {#each candidates as { level, validation } (level.seed)}
        {@const difficulty = validation.difficulty!}
        {@const scoreClass = difficulty.score <= 120 ? "easy" : difficulty.score <= 200 ? "medium" : "hard"}
        <button class="generator-card card-{scoreClass}" onclick={() => (selectedSeed = level.seed)}>
          <GeneratorBoardPreview {level} />
          <div class="generator-card-meta">
            <b>SEED {level.seed}</b>
            <span>✓ {difficulty.moves} coups · score {difficulty.score}</span>
          </div>
        </button>
      {/each}
    </div>
    {#if candidates.length === 0}
      <div class="generator-empty">
        Aucun niveau solvable trouvé. Réduis les murs ou génère une nouvelle série.
      </div>
    {/if}
  </section>
{/if}
