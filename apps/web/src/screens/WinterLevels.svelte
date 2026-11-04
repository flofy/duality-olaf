<script lang="ts">
  import { christmas } from "@duality/level-format";
  import Button from "../components/Button.svelte";
  import Character from "../components/Character.svelte";
  import { getLevelResult, isLevelCompleted } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";

  const titles = [
    "Premiers flocons", "Le sentier gelé", "La forêt de sapins", "Le lac miroir",
    "Les cadeaux perdus", "La montée enneigée", "La clairière étoilée", "Le village illuminé",
    "Le pont de glace", "La nuit polaire", "Le refuge du renne", "Les cristaux bleus",
    "La vallée blanche", "Le passage secret", "La ronde des étoiles", "Le grand blizzard",
    "Le sommet givré", "La forêt silencieuse", "Le traîneau égaré", "La dernière étoile",
    "La veille de Noël", "Le ciel scintillant", "La magie de l'hiver", "Le matin de Noël",
  ];

  const completed = christmas.levels.filter((level) => isLevelCompleted(level.id)).length;
  const stars = christmas.levels.reduce(
    (total, level) => total + (getLevelResult(level.id)?.stars ?? 0),
    0,
  );
</script>

<section class="menu winter-levels-page">
  <div class="topbar">
    <Button icon="arrowLeft" label="MENU" onclick={() => navigate("/menu")} variant="secondary" />
    <b>MONDE SAISONNIER</b>
  </div>
  <div class="winter-hero" role="img" aria-label="Monde hivernal avec neige et étoiles">
    <span class="winter-hero-snow" aria-hidden="true">❄</span>
    <span class="winter-hero-star winter-hero-star-one" aria-hidden="true">✦</span>
    <span class="winter-hero-star winter-hero-star-two" aria-hidden="true">✧</span>
    <div class="winter-characters" aria-hidden="true">
      <span class="winter-character-ball"><Character kind="ball" skin="christmas" size={66} /></span>
      <span class="winter-character-square"><Character kind="square" skin="christmas" size={66} /></span>
    </div>
    <span class="winter-hero-title">HIVER</span>
    <span class="winter-hero-subtitle">24 NIVEAUX SOUS LA NEIGE</span>
  </div>
  <div class="winter-progress">
    <span>{completed}/{christmas.levels.length} NIVEAUX</span>
    <span>{stars}/{christmas.levels.length * 3} ★</span>
  </div>
  <p class="muted winter-intro">
    La boule devient un bonhomme de neige et le carré se transforme en renne.
    Récupère toutes les étoiles dans cette aventure hivernale.
  </p>
  <div class="winter-level-list">
    {#each christmas.levels as level, index (level.id)}
      {@const done = isLevelCompleted(level.id)}
      {@const unlocked = index === 0 || isLevelCompleted(christmas.levels[index - 1]!.id)}
      <button
        type="button"
        class="winter-level-card"
        disabled={!unlocked}
        onclick={() => navigate(`/winter/level/${level.id}`)}
      >
        <span class="winter-level-number">{String(index + 1).padStart(2, "0")}</span>
        <span class="winter-level-copy">
          <strong>{titles[index] ?? `Défi hivernal ${index + 1}`}</strong>
          <small>
            {done ? "NIVEAU TERMINÉ" : unlocked ? `${level.stars.length} étoiles à récupérer` : "Termine le niveau précédent pour débloquer"}
          </small>
        </span>
        <span class="winter-level-status">{done ? "★" : unlocked ? "→" : "🔒"}</span>
      </button>
    {/each}
  </div>
  <Button iconText="🎁" label="OUVRIR LE CALENDRIER DE L'AVENT" onclick={() => navigate("/advent")} variant="secondary" class="advent-promo" />
</section>
