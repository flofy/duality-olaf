<script lang="ts">
  import { onMount } from "svelte";
  import AudioSettings from "./AudioSettings.svelte";
  import Icon from "./Icon.svelte";
  import {
    boardDisplayModeLabels,
    cycleBoardDisplayMode,
    getBoardDisplayMode,
    syncBoardDisplayMode,
    type BoardDisplayMode,
  } from "../lib/boardDisplay";
  import {
    controlsModeLabels,
    cycleControlsMode,
    getControlsMode,
    getSwipeEnabled,
    installControlsStyles,
    syncControlsMode,
    toggleSwipeEnabled,
    type ControlsMode,
  } from "../lib/controls";
  import { isLevelLabEnabled } from "../lib/devFlags";
  import {
    cycleGameLayoutMode,
    gameLayoutModeLabels,
    getGameLayoutMode,
    syncGameLayoutMode,
    type GameLayoutMode,
  } from "../lib/gameLayout";
  import {
    getDeferredInstallPrompt,
    isStandaloneDisplay,
    setDeferredInstallPrompt,
    type BeforeInstallPromptEvent,
  } from "../lib/pwaInstall";
  import { location, navigate } from "../lib/router.svelte";
  import {
    getAvailableSkinPreferences,
    getSkinPreference,
    normalizeSkinPreference,
    setSkinPreference,
    skinLabels,
    type SkinPreference,
  } from "../lib/skins";
  import { cycleTheme, getTheme } from "../lib/theme";

  let {
    open,
    updateSW,
    onThemeChange,
    onClose,
  }: {
    open: boolean;
    updateSW: (reloadPage?: boolean) => Promise<void>;
    onThemeChange: () => void;
    /** Referme le panneau (actions sans navigation, p. ex. RECOMMENCER). */
    onClose: () => void;
  } = $props();

  let fullscreen = $state(Boolean(document.fullscreenElement));
  let installPrompt = $state.raw<BeforeInstallPromptEvent | null>(getDeferredInstallPrompt());
  let isStandalone = $state(isStandaloneDisplay());
  let updateAvailable = $state(false);
  let controlsMode = $state<ControlsMode>(getControlsMode());
  let swipeEnabled = $state(getSwipeEnabled());
  let boardDisplay = $state<BoardDisplayMode>(getBoardDisplayMode());
  let gameLayout = $state<GameLayoutMode>(getGameLayoutMode());
  let skin = $state<SkinPreference>(normalizeSkinPreference(getSkinPreference()));
  let themeLabel = $state(getTheme().name.toUpperCase());
  let panel: HTMLDivElement | undefined = $state();

  const availableSkins = getAvailableSkinPreferences();
  // RECOMMENCER n'a de sens que pendant une partie (route d'un niveau).
  const isLevelRoute = $derived(/^\/world\/\d+\/level\//.test(location.path));

  $effect(() => {
    installControlsStyles();
    syncControlsMode(controlsMode);
  });

  // Préférences de rendu : reflétées sur <html> pour les règles CSS.
  $effect(() => {
    syncBoardDisplayMode(boardDisplay);
  });

  $effect(() => {
    syncGameLayoutMode(gameLayout);
  });

  // À l'ouverture, le focus entre dans le panneau ; App le rend au burger à la fermeture.
  $effect(() => {
    if (open) panel?.focus({ preventScroll: true });
  });

  onMount(() => {
    const syncFullscreen = () => (fullscreen = Boolean(document.fullscreenElement));
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      setDeferredInstallPrompt(prompt);
      installPrompt = prompt;
    };
    const onAppInstalled = () => {
      setDeferredInstallPrompt(null);
      installPrompt = null;
      isStandalone = true;
    };
    const onDisplayModeChange = () => (isStandalone = isStandaloneDisplay());
    const onUpdate = () => (updateAvailable = true);
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    displayModeQuery.addEventListener("change", onDisplayModeChange);
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      displayModeQuery.removeEventListener("change", onDisplayModeChange);
      window.removeEventListener("duality:pwa-update", onUpdate);
    };
  });

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  function cycleSkin() {
    const index = availableSkins.indexOf(normalizeSkinPreference(skin));
    const next = availableSkins[(index + 1) % availableSkins.length] ?? "auto";
    setSkinPreference(next);
    skin = next;
    onThemeChange();
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredInstallPrompt(null);
      installPrompt = null;
    }
  }

  const canInstall = $derived(Boolean(installPrompt) && !isStandalone);
</script>

<div
  id="app-menu"
  bind:this={panel}
  class="menu-panel {open ? 'open' : ''}"
  role="dialog"
  aria-labelledby="app-menu-title"
  aria-hidden={!open}
  tabindex="-1"
>
  <!-- Libellé du dialogue : invisible, le panneau occupe tout l'écran. Le bouton
       de fermeture est le burger lui-même, qui reste au-dessus (cf. App). -->
  <h2 id="app-menu-title" class="sr-only">Menu</h2>

  <div class="menu-panel-body">
    <nav class="menu-sections" aria-label="Menu principal">
      <section class="menu-group" aria-labelledby="menu-group-game">
        <h3 id="menu-group-game" class="menu-group-title">JEU</h3>
        <button type="button" class="menu-item" onclick={() => navigate("/")}>
          <span class="menu-item-icon" aria-hidden="true">▶</span>
          <span class="menu-item-label">INTRO</span>
        </button>
        <button
          type="button"
          class="menu-item {location.path.startsWith('/help') ? 'active' : ''}"
          onclick={() => navigate("/help")}
        >
          <span class="menu-item-icon" aria-hidden="true"><Icon name="help" size={18} color="currentColor" /></span>
          <span class="menu-item-label">AIDE</span>
        </button>
        <button type="button" class="menu-item" onclick={() => (controlsMode = cycleControlsMode())}>
          <span class="menu-item-icon" aria-hidden="true">🎮</span>
          <span class="menu-item-label">COMMANDES · {controlsModeLabels[controlsMode].toUpperCase()}</span>
        </button>
        <button
          type="button"
          class="menu-item"
          onclick={() => {
            swipeEnabled = toggleSwipeEnabled();
            window.dispatchEvent(new Event("duality:swipe-preference"));
          }}
        >
          <span class="menu-item-icon" aria-hidden="true">↔</span>
          <span class="menu-item-label">GESTES · {swipeEnabled ? "ACTIVÉS" : "DÉSACTIVÉS"}</span>
        </button>
        <button type="button" class="menu-item" onclick={() => (gameLayout = cycleGameLayoutMode())}>
          <span class="menu-item-icon" aria-hidden="true">↔</span>
          <span class="menu-item-label">DISPOSITION · {gameLayoutModeLabels[gameLayout].toUpperCase()}</span>
        </button>
        <!-- Mode d'affichage de la grille : cases carrées (ratio conservé) ou
             plateau étiré pour occuper tout l'espace disponible. -->
        <button type="button" class="menu-item" onclick={() => (boardDisplay = cycleBoardDisplayMode())}>
          <span class="menu-item-icon" aria-hidden="true"><Icon name="grid" size={18} color="currentColor" /></span>
          <span class="menu-item-label">GRILLE · {boardDisplayModeLabels[boardDisplay].toUpperCase()}</span>
        </button>
        <!-- Visible uniquement pendant une partie : demande à l'écran de jeu de
             relancer le niveau (évènement « duality:game-reset »). -->
        {#if isLevelRoute}
          <button
            type="button"
            class="menu-item"
            onclick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent("duality:game-reset"));
            }}
          >
            <span class="menu-item-icon" aria-hidden="true"><Icon name="reset" size={18} color="currentColor" /></span>
            <span class="menu-item-label">RECOMMENCER</span>
          </button>
        {/if}
      </section>

      <section class="menu-group" aria-labelledby="menu-group-display">
        <h3 id="menu-group-display" class="menu-group-title">AFFICHAGE</h3>
        <button type="button" class="menu-item" onclick={() => void toggleFullscreen()}>
          <span class="menu-item-icon" aria-hidden="true">
            <Icon name={fullscreen ? "minimize" : "maximize"} size={18} color="currentColor" />
          </span>
          <span class="menu-item-label">{fullscreen ? "FENÊTRÉ" : "PLEIN ÉCRAN"}</span>
        </button>
        <!-- Thème et skin partagent une ligne tant que la largeur le permet. -->
        <div class="menu-row">
          <button
            type="button"
            class="menu-item"
            onclick={() => {
              cycleTheme();
              themeLabel = getTheme().name.toUpperCase();
              onThemeChange();
            }}
          >
            <span class="menu-item-icon" aria-hidden="true"><Icon name="theme" size={18} color="currentColor" /></span>
            <span class="menu-item-label">THÈME · {themeLabel}</span>
          </button>
          <button type="button" class="menu-item" onclick={cycleSkin}>
            <span class="menu-item-icon" aria-hidden="true"><Icon name="skin" size={18} color="currentColor" /></span>
            <span class="menu-item-label">SKIN · {skinLabels[skin].toUpperCase()}</span>
          </button>
        </div>
      </section>

      <section class="menu-group" aria-labelledby="menu-group-audio">
        <h3 id="menu-group-audio" class="menu-group-title">AUDIO & VIBRATIONS</h3>
        <AudioSettings />
      </section>

      {#if canInstall || updateAvailable}
        <section class="menu-group" aria-labelledby="menu-group-app">
          <h3 id="menu-group-app" class="menu-group-title">APPLICATION</h3>
          {#if canInstall}
            <button type="button" class="menu-item" onclick={() => void install()}>
              <span class="menu-item-icon" aria-hidden="true">📱</span>
              <span class="menu-item-label">INSTALLER</span>
            </button>
          {/if}
          {#if updateAvailable}
            <button type="button" class="menu-item" onclick={() => void updateSW(true)}>
              <span class="menu-item-icon" aria-hidden="true">🔄</span>
              <span class="menu-item-label">METTRE À JOUR</span>
            </button>
          {/if}
        </section>
      {/if}

      {#if isLevelLabEnabled}
        <section class="menu-group dev-group" aria-labelledby="menu-group-dev">
          <h3 id="menu-group-dev" class="menu-group-title">DÉVELOPPEMENT</h3>
          <button type="button" class="menu-item dev-item" onclick={() => navigate("/dev/levels")}>
            <span class="menu-item-icon" aria-hidden="true">🧪</span>
            <span class="menu-item-label">LEVEL LAB</span>
          </button>
          <button type="button" class="menu-item dev-item" onclick={() => navigate("/dev/generator")}>
            <span class="menu-item-icon" aria-hidden="true">🧬</span>
            <span class="menu-item-label">GÉNÉRATEUR</span>
          </button>
          <button type="button" class="menu-item dev-item" onclick={() => navigate("/dev/editor")}>
            <span class="menu-item-icon" aria-hidden="true">✏️</span>
            <span class="menu-item-label">ÉDITEUR</span>
          </button>
        </section>
      {/if}
    </nav>
  </div>
</div>
