<script lang="ts">
  import BurgerMenu from "./components/BurgerMenu.svelte";
  import Redirect from "./components/Redirect.svelte";
  import UpdateBanner from "./components/UpdateBanner.svelte";
  import { appearance, bumpAppearance } from "./lib/appearance.svelte";
  import { location, matchRoute } from "./lib/router.svelte";
  import { themeVars, styleString } from "./lib/style";
  import { getTheme } from "./lib/theme";
  import LevelCatalogue from "./dev/LevelCatalogue.svelte";
  import LevelEditor from "./dev/LevelEditor.svelte";
  import LevelGenerator from "./dev/LevelGenerator.svelte";
  import LevelPlayground from "./dev/LevelPlayground.svelte";
  import ChallengeMode from "./screens/ChallengeMode.svelte";
  import Help from "./screens/Help.svelte";
  import Intro from "./screens/Intro.svelte";
  import Menu from "./screens/Menu.svelte";
  import ProtectedLevel from "./screens/ProtectedLevel.svelte";
  import SeasonalLevelRoute from "./screens/SeasonalLevelRoute.svelte";
  import SeasonalLevels from "./screens/SeasonalLevels.svelte";
  import WorldLevels from "./screens/WorldLevels.svelte";

  let { updateSW }: { updateSW: (reloadPage?: boolean) => Promise<void> } = $props();

  let menuOpen = $state(false);
  // Le burger est l'unique contrôle ouvert/fermé du menu : on le référence pour
  // lui rendre le focus à la fermeture (le panneau le prend à l'ouverture).
  let burger: HTMLButtonElement | undefined = $state();
  let wasMenuOpen = false;

  const view = $derived(matchRoute(location.path));
  const appStyle = $derived.by(() => {
    appearance.tick;
    return styleString(themeVars(getTheme()));
  });

  // Ferme le menu à chaque changement de route.
  $effect(() => {
    location.path;
    menuOpen = false;
  });

  // Ferme le menu avec Échap.
  $effect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") menuOpen = false;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Le focus revient au burger à la fermeture, pour ne jamais le laisser dans le vide.
  $effect(() => {
    if (!menuOpen && wasMenuOpen) burger?.focus();
    wasMenuOpen = menuOpen;
  });
</script>

<main class="app" style={appStyle}>
  <UpdateBanner {updateSW} />
  <!-- inert : menu ouvert, la page derrière n'est ni cliquable ni focusable.
       Le burger reste atteignable : il vit à côté, pas dans .shell. -->
  <div class="shell app-enter" inert={menuOpen}>
    <svelte:boundary onerror={(error) => console.error("[duality] render error:", error)}>
      <!-- Chaque navigation remonte l'écran : l'état d'un niveau (chrono, plateau,
           ambiance) repart toujours de zéro, comme avec une nouvelle route React. -->
      {#key location.path}
        {#if view.name === "intro"}
          <Intro />
        {:else if view.name === "menu"}
          <Menu />
        {:else if view.name === "help"}
          <Help />
        {:else if view.name === "challenge"}
          <ChallengeMode />
        {:else if view.name === "halloween"}
          <SeasonalLevels />
        {:else if view.name === "halloween-level"}
          <SeasonalLevelRoute levelId={view.levelId} />
        {:else if view.name === "world"}
          <WorldLevels worldId={view.worldId} />
        {:else if view.name === "level"}
          <ProtectedLevel worldId={view.worldId} levelId={view.levelId} />
        {:else if view.name === "dev-levels"}
          <LevelCatalogue />
        {:else if view.name === "dev-playground"}
          <LevelPlayground levelId={view.levelId} />
        {:else if view.name === "dev-generator"}
          <LevelGenerator />
        {:else if view.name === "dev-editor"}
          <LevelEditor initialLevelId={view.levelId} />
        {:else}
          <Redirect to={view.to} />
        {/if}
      {/key}
      {#snippet failed(error)}
        <div class="error-boundary" role="alert">
          <h1 class="title">💥 OUPS</h1>
          <p class="subtitle">UNE ERREUR INATTENDUE EST SURVENUE</p>
          <pre class="error-detail">{(error as Error).message}</pre>
          <div class="error-actions">
            <button type="button" class="menu-item" onclick={() => window.location.assign("/")}>← MENU</button>
            <button type="button" class="menu-item" onclick={() => window.location.reload()}>↻ RECHARGER</button>
          </div>
        </div>
      {/snippet}
    </svelte:boundary>
  </div>
  <!-- Barre utilitaire hors de .shell, à côté du panneau : elle passe au-dessus de
       lui (z-index, cf. layout.css) et le burger devient l'unique bouton
       ouvert/fermé. -->
  <div class="utility-bar">
    <button
      bind:this={burger}
      type="button"
      class="burger-toggle {menuOpen ? 'open' : ''}"
      aria-expanded={menuOpen}
      aria-controls="app-menu"
      aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <span aria-hidden="true"></span>
    </button>
  </div>
  <BurgerMenu
    open={menuOpen}
    {updateSW}
    onThemeChange={bumpAppearance}
    onClose={() => (menuOpen = false)}
  />
</main>
