<script lang="ts">
  import Redirect from "../components/Redirect.svelte";
  import Game from "../game/Game.svelte";
  import WorldTutorial from "../game/WorldTutorial.svelte";
  import { worlds } from "../lib/levels/campaign";
  import {
    hasSeenFireTutorial,
    hasSeenWorldTutorial,
    isLevelCompleted,
    isWorldUnlocked,
    markFireTutorialSeen,
    markWorldTutorialSeen,
  } from "../lib/progression";
  import { location, navigate } from "../lib/router.svelte";

  let { worldId, levelId }: { worldId: string; levelId: string } = $props();

  const world = $derived(worlds.find((item) => item.id === Number(worldId)));
  const levelIndex = $derived(world?.levels.findIndex((level) => level.id === levelId) ?? -1);
  const level = $derived(world?.levels[levelIndex]);

  /* svelte-ignore state_referenced_locally */
  let showFireTutorial = $state(levelId === "world-1-level-05" && !hasSeenFireTutorial());

  // `hasSeenWorldTutorial` lit le localStorage : non réactif. Comme le
  // tutoriel se joue sur la même URL que le niveau (replace sans changement
  // de chemin), on force ici la bascule vers le mode libre après « JOUER LE
  // NIVEAU », sinon le {#if} ne se réévalue jamais.
  let worldTutorialDone = $state(false);

  const tutorialParam = $derived(new URLSearchParams(location.search).get("tutorial"));
  const replayTutorial = $derived(tutorialParam === "1");
  const replayFireTutorial = $derived(tutorialParam === "fire");
</script>

{#if !world || levelIndex < 0 || !level}
  <Redirect to="/menu" />
{:else if world.status !== "available" || !isWorldUnlocked(world.id)}
  <!-- Les mondes sont séquentiels : pas d'accès direct à un monde verrouillé. -->
  <Redirect to="/menu" />
{:else if levelIndex > 0 && !isLevelCompleted(world.levels[levelIndex - 1]!.id)}
  <Redirect to="/world/{world.id}" />
{:else if levelIndex === 0 && !worldTutorialDone && (replayTutorial || !hasSeenWorldTutorial(world.id))}
  <WorldTutorial
    {level}
    worldId={world.id}
    {levelIndex}
    tutorial="world"
    onBack={() => navigate(`/world/${world.id}`)}
    onFinish={() => {
      markWorldTutorialSeen(world.id);
      worldTutorialDone = true;
      navigate(`/world/${world.id}/level/${level.id}`, { replace: true });
    }}
  />
{:else if showFireTutorial || replayFireTutorial}
  <WorldTutorial
    {level}
    worldId={world.id}
    {levelIndex}
    tutorial="fire"
    onBack={() => navigate(`/world/${world.id}`)}
    onFinish={() => {
      markFireTutorialSeen();
      showFireTutorial = false;
      navigate(`/world/${world.id}/level/${level.id}`, { replace: true });
    }}
  />
{:else}
  <Game {level} worldId={world.id} />
{/if}
