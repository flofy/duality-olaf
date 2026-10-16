<script lang="ts">
  import { bumpAppearance } from "../lib/appearance.svelte";
  import { devLevelById, levelDisplayLabel } from "../lib/devLevels";
  import { navigate } from "../lib/router.svelte";
  import { resolveLevelSkin, skinLabels, skinOrder, type SkinPreference } from "../lib/skins";
  import { getActiveThemeName, setTheme, themeOrder, type ThemeName } from "../lib/theme";
  import LabGame from "./LabGame.svelte";

  /** `/dev/levels/:levelId` — terrain de jeu pour un seul niveau. */
  let { levelId }: { levelId: string } = $props();

  const level = $derived(devLevelById.get(levelId));
  let completion = $state<{ moves: number } | null>(null);
  let themeName = $state<ThemeName>(getActiveThemeName());
  /* svelte-ignore state_referenced_locally */
  let skin = $state<SkinPreference>(resolveLevelSkin(levelId));
</script>

{#if !level}
  <section class="dev-playground">
    <div class="topbar">
      <button class="action" onclick={() => navigate("/dev/levels")}>← CATALOGUE</button>
      <b>PLAYGROUND</b>
    </div>
    <p class="dev-banner">DEV ONLY · niveau introuvable · {levelId}</p>
  </section>
{:else}
  <section class="dev-playground">
    <div class="topbar">
      <button class="action" onclick={() => navigate("/dev/levels")}>← CATALOGUE</button>
      <b>PLAYGROUND</b>
      <button class="action" onclick={() => navigate(`/dev/editor/${level.id}`)}>✎ ÉDITER</button>
    </div>
    <p class="dev-banner">DEV ONLY · gameplay · {levelDisplayLabel(level)}</p>
    <div class="dev-playground-header">
      <div class="dev-playground-title">
        <b>{levelDisplayLabel(level)}</b>
        <span>{level.width}×{level.height} · {level.stars.length} ★</span>
      </div>
      <div class="dev-playground-metrics">
        {#if completion}<span>✓ {completion.moves} coups</span>{/if}
      </div>
    </div>
    <div class="dev-skin-controls">
      <label>
        THÈME
        <select
          value={themeName}
          onchange={(e) => {
            themeName = e.currentTarget.value as ThemeName;
            setTheme(themeName);
            bumpAppearance();
          }}
        >
          {#each themeOrder as theme (theme)}
            <option value={theme}>{theme}</option>
          {/each}
        </select>
      </label>
      <label>
        SKIN
        <select value={skin} onchange={(e) => (skin = e.currentTarget.value as SkinPreference)}>
          {#each skinOrder as value (value)}
            <option {value}>{skinLabels[value]}</option>
          {/each}
        </select>
      </label>
      <span class="dev-skin-active">actif : {skinLabels[skin]}</span>
    </div>
    <LabGame {level} {skin} {themeName} onCompletionChange={(value) => (completion = value)} />
  </section>
{/if}
