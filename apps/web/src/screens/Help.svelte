<script lang="ts">
  import Button from "../components/Button.svelte";
  import { navigate } from "../lib/router.svelte";

  const rules: [string, string][] = [
    ["BALLE", "Déplace la balle avec les flèches ou en glissant sur mobile."],
    ["FORME", "Appuie sur ENTRÉE (ou le bouton carré) pour changer de forme entre balle et carré."],
    ["PORTES", "Une porte bloque le passage tant qu'un interrupteur lié ne l'a pas ouverte."],
    ["TÉLÉPORTER", "Atterris sur un portail pour ressortir par son portail associé."],
    ["OBJECTIF", "Ramasse toutes les étoiles ★ pour terminer."],
    ["RACCOURCIS", "R recommence · ÉCHAP menu · ENTRÉE suivant."],
  ];
</script>

<section class="help">
  <Button icon="arrowLeft" label="RETOUR" onclick={() => navigate("/menu")} variant="secondary" />
  <h1 class="title">COMMENT JOUER ?</h1>
  {#each rules as [title, text] (title)}
    <section>
      <b class="subtitle">{title}</b>
      <p>{text}</p>
    </section>
  {/each}
</section>
