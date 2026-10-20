<script lang="ts">
  import { halloween } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import Icon from "../components/Icon.svelte";
  import { getLevelResult, isLevelCompleted } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";

  const titles = [
    "La nuit des citrouilles",
    "Le cimetière oublié",
    "La maison hantée",
    "L'envol des chauves-souris",
    "Le réveil des squelettes",
    "La sorcière et son chaudron",
  ];

  const completed = halloween.levels.filter((level) => isLevelCompleted(level.id)).length;
  const stars = halloween.levels.reduce(
    (total, level) => total + (getLevelResult(level.id)?.stars ?? 0),
    0,
  );
</script>

<section class="menu halloween-levels-page">
  <div class="topbar">
    <Button icon="arrowLeft" label="MENU" onclick={() => navigate("/menu")} variant="secondary" />
    <b>ÉVÉNEMENT SAISONNIER</b>
  </div>
  <div class="halloween-hero" role="img" aria-label="Halloween : chauves-souris, citrouilles et lune violette">
    <span class="halloween-hero-moon" aria-hidden="true">☾</span>
    <span class="halloween-hero-bat" aria-hidden="true">🦇</span>
    <span class="halloween-hero-pumpkin" aria-hidden="true">🎃</span>
    <span class="halloween-hero-title">HALLOWEEN</span>
    <span class="halloween-hero-subtitle">UNE AVENTURE QUI DONNE DES FRISSONS</span>
  </div>
  <div class="halloween-progress">
    <span>{completed}/{halloween.levels.length} NIVEAUX</span>
    <span>{stars}/{halloween.levels.length * 3} ★</span>
  </div>
  <p class="muted halloween-intro">
    Récupère toutes les étoiles dans des niveaux hantés. La boule chauve-souris
    et le carré Frankenstein t'accompagnent !
  </p>
  <div class="halloween-level-list">
    {#each halloween.levels as level, index (level.id)}
      {@const done = isLevelCompleted(level.id)}
      {@const unlocked = index === 0 || isLevelCompleted(halloween.levels[index - 1]!.id)}
      <button
        type="button"
        class="halloween-level-card"
        disabled={!unlocked}
        onclick={() => navigate(`/halloween/level/${level.id}`)}
      >
        <span class="halloween-level-number">{String(index + 1).padStart(2, "0")}</span>
        <span class="halloween-level-copy">
          <strong>{titles[index] ?? `Défi hanté ${index + 1}`}</strong>
          <small>
            {done
              ? "NIVEAU TERMINÉ"
              : unlocked
                ? `${level.stars.length} étoiles à récupérer`
                : "Termine le niveau précédent pour débloquer"}
          </small>
        </span>
        <span
          class="halloween-level-status"
          aria-label={done ? "Terminé" : unlocked ? "Disponible" : "Verrouillé"}
        >
          {#if done}★{:else if unlocked}<Icon name="arrowRight" size={20} />{:else}🔒{/if}
        </span>
      </button>
    {/each}
  </div>
  <p class="halloween-footnote">Disponible du 13 octobre au 3 novembre.</p>
</section>
