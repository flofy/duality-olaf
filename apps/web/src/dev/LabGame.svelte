<script lang="ts">
  import type { Level } from "@duality/level-format";
  import LevelGameplayView from "../game/LevelGameplayView.svelte";
  import { createLevelGameplay } from "../game/gameplay.svelte";
  import {
    DEFAULT_BOARD_ZOOM,
    getBoardZoom,
    resetBoardZoom,
    zoomInBoard,
    zoomOutBoard,
    type BoardZoom,
  } from "../lib/boardZoom";
  import { navigate } from "../lib/router.svelte";
  import { resolveLevelSkin, type SkinPreference } from "../lib/skins";
  import type { ThemeName } from "../lib/theme";
  import LabResultOverlay from "./LabResultOverlay.svelte";

  let {
    level,
    skin,
    themeName,
    onCompletionChange,
    optimalMoves,
    onBackToGenerator,
  }: {
    level: Level;
    skin: SkinPreference;
    themeName: ThemeName;
    onCompletionChange: (completion: { moves: number } | null) => void;
    optimalMoves?: number;
    onBackToGenerator?: () => void;
  } = $props();

  let zoom = $state<BoardZoom>(getBoardZoom());
  const gameplaySkin = $derived(resolveLevelSkin(level.id, skin));

  /* svelte-ignore state_referenced_locally */
  const game = createLevelGameplay(level, {
    onEscape: () => navigate("/dev/levels"),
    ambientSkin: () => gameplaySkin,
  });

  $effect(() => {
    onCompletionChange(game.state.completed ? { moves: game.state.moves } : null);
  });
</script>

<section class="dev-playground-board" style:--board-zoom={zoom}>
  <LevelGameplayView
    {level}
    gameState={game.state}
    movement={game.movement}
    skin={gameplaySkin}
    {themeName}
    move={game.move}
    switchForm={game.switchForm}
    onReset={game.reset}
  />
  <!-- Popin hors de la grille (comme l'écran de jeu) : la fin de partie
       n'appartient pas au plateau. -->
  <LabResultOverlay
    type={game.state.completed ? "completed" : game.state.gameOver ? "gameOver" : null}
    moves={game.state.moves}
    {optimalMoves}
    onReset={game.reset}
    {onBackToGenerator}
  />
  <div class="dev-zoom">
    <button type="button" class="action dev-zoom-btn" aria-label="Zoom arrière" onclick={() => (zoom = zoomOutBoard())}>−</button>
    <span class="dev-zoom-value">{Math.round(zoom * 100)}%</span>
    <button type="button" class="action dev-zoom-btn" aria-label="Zoom avant" onclick={() => (zoom = zoomInBoard())}>＋</button>
    {#if zoom !== DEFAULT_BOARD_ZOOM}
      <button type="button" class="action dev-zoom-btn" aria-label="Réinitialiser le zoom" onclick={() => (zoom = resetBoardZoom())}>↺</button>
    {/if}
  </div>
</section>
