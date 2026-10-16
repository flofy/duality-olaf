<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../components/Button.svelte";
  import { navigate } from "../lib/router.svelte";

  let leaving = $state(false);

  function continueIntro() {
    if (leaving) return;
    leaving = true;
    window.setTimeout(() => navigate("/menu"), 420);
  }

  onMount(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        continueIntro();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

<!-- Le clavier est géré globalement (Entrée / Espace) dans onMount. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="intro {leaving ? 'intro-leaving' : ''}"
  onclick={continueIntro}
  role="button"
  tabindex="0"
  aria-label="Entrer dans Duality"
>
  <div class="intro-grid"></div>
  <div class="intro-logo">
    <span class="intro-ball">●</span>
    <span>DUALITY</span>
    <span class="intro-square">■</span>
  </div>
  <p class="intro-tagline">DEUX FORMES · UN SEUL CHEMIN</p>
  <div class="intro-demo">
    <div class="intro-track">
      <span class="intro-demo-ball">●</span>
      <span class="intro-star">★</span>
      <span class="intro-demo-square">■</span>
    </div>
    <span class="intro-switch">● ⇄ ■</span>
  </div>
  <Button
    icon="arrowRight"
    iconSize={20}
    label="JOUER"
    onclick={(event) => {
      event.stopPropagation();
      continueIntro();
    }}
    class="intro-start"
    variant="primary"
  />
  <span class="intro-hint">ENTRÉE · ESPACE · CLIQUER</span>
</div>
