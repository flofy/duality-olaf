<script lang="ts">
  import { onMount } from "svelte";
  import type { Level, SeasonalEvent } from "@duality/level-format";
  import { appearance } from "../lib/appearance.svelte";
  import { worlds } from "../lib/levels/campaign";
  import { calculateLevelResult, completeLevel, getNextWorld } from "../lib/progression";
  import { navigate } from "../lib/router.svelte";
  import { resolveLevelSkin } from "../lib/skins";
  import { getActiveThemeName } from "../lib/theme";
  import { formatDebugCommands } from "../lib/CommandRecorder";
  import { isDevtoolsEnabled } from "../lib/devFlags";
  import CompletionOverlay from "./CompletionOverlay.svelte";
  import DebugPanel from "./DebugPanel.svelte";
  import { createDebugCommands } from "./debugCommands.svelte";
  import GameOverOverlay from "./GameOverOverlay.svelte";
  import GameTopbar from "./GameTopbar.svelte";
  import LevelGameplayView from "./LevelGameplayView.svelte";
  import { createLevelGameplay } from "./gameplay.svelte";

  let {
    level,
    worldId,
    seasonalEvent,
    advent = false,
  }: {
    level: Level;
    worldId: number;
    seasonalEvent?: SeasonalEvent;
    advent?: boolean;
  } = $props();

  /* svelte-ignore state_referenced_locally */
  const world = worlds.find((item) => item.id === (seasonalEvent ? 2 : worldId))!;
  /* svelte-ignore state_referenced_locally */
  const levels = seasonalEvent ? seasonalEvent.levels : world.levels;
  const levelIndex = levels.findIndex((item) => item.id === level.id);
  /* svelte-ignore state_referenced_locally */
  const seasonalRoute = seasonalEvent?.theme === "christmas" ? (advent ? "/advent" : "/winter") : "/halloween";
  /* svelte-ignore state_referenced_locally */
  const backTo = seasonalEvent ? seasonalRoute : `/world/${world.id}`;
  /* svelte-ignore state_referenced_locally */
  const seasonalLevelRoute = advent ? "/advent/level/" : seasonalEvent?.theme === "christmas" ? "/winter/level/" : "/halloween/level/";

  const skin = $derived.by(() => {
    appearance.tick;
    return resolveLevelSkin(level.id) ?? "default";
  });
  const themeName = $derived.by(() => {
    appearance.tick;
    return getActiveThemeName();
  });

  function nextLevel() {
    if (seasonalEvent) {
      if (advent) {
        navigate("/advent");
        return;
      }
      if (levelIndex < levels.length - 1) {
        navigate(`${seasonalLevelRoute}${levels[levelIndex + 1]!.id}`);
      } else {
        navigate(seasonalRoute);
      }
    } else if (levelIndex < levels.length - 1) {
      navigate(`/world/${world.id}/level/${levels[levelIndex + 1]!.id}`);
    } else if (nextWorld) {
      navigate(`/world/${nextWorld.id}/level/${nextWorld.levels[0]!.id}`);
    } else {
      navigate(`/world/${world.id}`);
    }
  }

  const nextWorld = $derived(seasonalEvent ? null : getNextWorld(world.id));
  const debug = createDebugCommands();

  /* svelte-ignore state_referenced_locally */
  const game = createLevelGameplay(level, {
    onEscape: () => navigate(backTo),
    onMove: debug.recordMove,
    onSwitch: debug.recordSwitch,
    onReset: debug.clear,
    ambientSkin: () => skin,
  });

  const completionResult = $derived.by(() => {
    if (!game.state.completed) return null;
    return calculateLevelResult(game.state.moves, null, game.elapsedMs);
  });

  $effect(() => {
    if (completionResult) completeLevel(level.id, completionResult);
  });

  onMount(() => {
    const onGameReset = () => game.reset();
    window.addEventListener("duality:game-reset", onGameReset);
    return () => window.removeEventListener("duality:game-reset", onGameReset);
  });

  onMount(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && game.state.completed) {
        event.preventDefault();
        nextLevel();
        return;
      }
      if (event.key === "d" || event.key === "D") {
        if (!isDevtoolsEnabled || debug.commands.length === 0) return;
        event.preventDefault();
        void navigator.clipboard?.writeText(formatDebugCommands(debug.commands));
        return;
      }
      if (event.key === "c" || event.key === "C") {
        if (!isDevtoolsEnabled) return;
        debug.clear();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
</script>

<section class="game">
  <GameTopbar
    worldId={world.id}
    worldIndex={levelIndex}
    label={seasonalEvent
      ? `${seasonalEvent.theme === "christmas" ? "❄️ HIVER" : "🎃 HALLOWEEN"} · NIVEAU ${String(levelIndex + 1).padStart(2, "0")}`
      : undefined}
    onBack={() => navigate(backTo)}
  />
  <LevelGameplayView
    {level}
    gameState={game.state}
    movement={game.movement}
    {skin}
    {themeName}
    move={game.move}
    switchForm={game.switchForm}
    onReset={game.reset}
  />
  {#if isDevtoolsEnabled}
    <DebugPanel {level} gameState={game.state} commands={debug.commands} onClear={debug.clear} />
  {/if}
  <CompletionOverlay
    worldId={world.id}
    worldIndex={levelIndex}
    worldLength={levels.length}
    hasNextWorld={Boolean(nextWorld) && !seasonalEvent}
    completed={game.state.completed}
    moves={game.state.moves}
    elapsedMs={game.elapsedMs}
    optimalMoves={completionResult?.optimalMoves ?? null}
    stars={completionResult?.stars ?? null}
    score={completionResult?.score ?? null}
    onReset={game.reset}
    onNext={nextLevel}
  />
  <GameOverOverlay
    worldId={world.id}
    gameOver={game.state.gameOver}
    activeForm={game.state.activeForm}
    onReset={game.reset}
    {backTo}
  />
</section>
