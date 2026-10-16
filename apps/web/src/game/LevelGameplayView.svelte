<script lang="ts">
  import type { GameState } from "@duality/game";
  import type { Level } from "@duality/level-format";
  import { onMount } from "svelte";
  import { getSwipeEnabled } from "../lib/controls";
  import { gestureDirections, type GameplayDirection } from "../lib/directions";
  import { interpretGesture } from "../lib/GestureInterpreter";
  import type { ThemeName } from "../lib/theme";
  import GameBoard from "./GameBoard.svelte";
  import GameControls from "./GameControls.svelte";
  import GameHud from "./GameHud.svelte";
  import type { MovementFeedback } from "./gameplay.svelte";

  let {
    level,
    gameState,
    movement,
    skin,
    themeName,
    move,
    switchForm,
    onReset,
  }: {
    level: Level;
    gameState: GameState;
    movement: MovementFeedback;
    skin: string;
    themeName: ThemeName;
    move: (direction: GameplayDirection) => void;
    switchForm: () => void;
    onReset: () => void;
  } = $props();

  const INTERACTIVE_SELECTOR =
    'button, a, input, textarea, select, [role="button"], [role="dialog"]';

  let swipeEnabled = $state(getSwipeEnabled());
  let swipeStart: { x: number; y: number } | null = null;

  onMount(() => {
    const sync = () => (swipeEnabled = getSwipeEnabled());
    window.addEventListener("duality:swipe-preference", sync);
    return () => window.removeEventListener("duality:swipe-preference", sync);
  });

  // L'optimal est volontairement masqué pour l'instant : le solveur synchrone
  // fige la page sur les grands niveaux ouverts (ex. Halloween 01). Les
  // composants supportent déjà `null` (aucun "/ OPTIMAL" affiché).
  const optimalMoves: number | null = null;

  function onPointerDown(event: PointerEvent) {
    if (!swipeEnabled) return;
    const target = event.target as Element | null;
    // Les contrôles UI gardent leur interaction : le détecteur de swipe ne doit
    // pas observer leur séquence tactile, sinon les navigateurs mobiles peuvent
    // retarder / disputer le clic du bouton.
    if (target?.closest(INTERACTIVE_SELECTOR)) {
      swipeStart = null;
      return;
    }
    swipeStart = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent) {
    if (!swipeEnabled || !swipeStart) return;
    const result = interpretGesture(
      swipeStart,
      { x: event.clientX, y: event.clientY },
      24,
    );
    swipeStart = null;
    if (result.type === "swipe" && result.direction) {
      move(gestureDirections[result.direction]);
    }
  }
</script>

<GameHud
  {level}
  activeForm={gameState.activeForm}
  starsRemaining={gameState.stars.length}
  moves={gameState.moves}
  {optimalMoves}
  {onReset}
/>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="board-wrap" onpointerdown={onPointerDown} onpointerup={onPointerUp}>
  <GameBoard {level} {gameState} {skin} {themeName} {movement} />
</div>
<GameControls
  hasSquare={Boolean(level.square)}
  activeForm={gameState.activeForm}
  onMove={move}
  onSwitch={switchForm}
/>
