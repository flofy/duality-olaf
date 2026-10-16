<script lang="ts">
  import { buildCatalogueGroups, devLevelById } from "../lib/devLevels";
  import { navigate } from "../lib/router.svelte";
  import LevelThumb from "./LevelThumb.svelte";

  const groups = buildCatalogueGroups();
  let open = $state<Set<string>>(new Set());

  function toggle(label: string) {
    const next = new Set(open);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    open = next;
  }
</script>

<section class="dev-catalogue">
  <div class="topbar">
    <b>LEVEL LAB</b>
    <div class="dev-catalogue-actions">
      <button class="action" onclick={() => navigate("/dev/generator")}>⚡ GÉNÉRATEUR</button>
      <button class="action" onclick={() => navigate("/dev/editor")}>✎ ÉDITEUR</button>
    </div>
  </div>
  <p class="dev-banner">DEV ONLY · clique sur un niveau pour l'ouvrir dans le playground</p>
  <div class="dev-catalogue-groups">
    {#each groups as group (group.label)}
      {@const isOpen = open.has(group.label)}
      <div>
        <button class="dev-catalogue-group" onclick={() => toggle(group.label)}>
          {group.label}
          <span class="dev-catalogue-toggle-icon">{isOpen ? "▾" : "▸"}</span>
        </button>
        {#if isOpen}
          <div class="dev-catalogue-grid">
            {#each group.entries as entry (entry.id)}
              {@const level = devLevelById.get(entry.id)}
              <div class="dev-catalogue-card">
                <div class="dev-catalogue-thumb-wrap">
                  {#if level}<LevelThumb {level} />{/if}
                  <div class="dev-catalogue-overlay">
                    <button
                      class="dev-catalogue-overlay-btn"
                      title="Lancer {entry.id}"
                      aria-label="Lancer {entry.id}"
                      onclick={() => navigate(`/dev/levels/${entry.id}`)}
                    >▶</button>
                    <button
                      class="dev-catalogue-overlay-btn"
                      title="Éditer {entry.id}"
                      aria-label="Éditer {entry.id}"
                      onclick={() => navigate(`/dev/editor/${entry.id}`)}
                    >✎</button>
                  </div>
                </div>
                <span class="dev-catalogue-entry-label" title={entry.label}>{entry.label}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
