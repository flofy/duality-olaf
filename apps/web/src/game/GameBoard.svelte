<script lang="ts">
  import type { Snippet } from "svelte";
  import type { GameState } from "@duality/game";
  import { isInside, type Level } from "@duality/level-format";
  import { hexToCss, themes, type ThemeName } from "../lib/theme";
  import { moveBaseDurationMs, teleportTiming } from "../lib/movementTiming";
  import { styleString, themeVars } from "../lib/style";
  import Icon from "../components/Icon.svelte";
  import SwitchIcon from "../components/SwitchIcon.svelte";
  import Character from "../components/Character.svelte";
  import type { MovementFeedback } from "./gameplay.svelte";

  let {
    level,
    gameState,
    skin,
    themeName,
    movement = null,
    children,
  }: {
    level: Level;
    gameState: GameState;
    skin: string;
    themeName: ThemeName;
    movement?: MovementFeedback;
    children?: Snippet;
  } = $props();

  let boardEl: HTMLDivElement | undefined = $state();
  let ballEl: HTMLDivElement | undefined = $state();
  let squareEl: HTMLDivElement | undefined = $state();
  let trailLayerEl: HTMLDivElement | undefined = $state();

  const theme = $derived(themes[themeName]);
  const isTeleporting = $derived(Boolean(movement?.teleport));

  const movementDirectionClass = $derived(
    movement && !isTeleporting
      ? `piece-moving--${movement.direction.x > 0 ? "right" : movement.direction.x < 0 ? "left" : movement.direction.y > 0 ? "down" : "up"}`
      : "",
  );
  const activePieceClass = $derived(
    movement
      ? isTeleporting
        ? "teleporting-piece"
        : `piece-moving--active is-moving ${movementDirectionClass}`
      : "",
  );
  const movementDistance = $derived(movement?.distance ?? 0);
  const moveX = $derived(
    movement && !isTeleporting
      ? `calc(var(--cell-width) * ${movement.target.x - movement.from.x})`
      : "0px",
  );
  const moveY = $derived(
    movement && !isTeleporting
      ? `calc(var(--cell-height) * ${movement.target.y - movement.from.y})`
      : "0px",
  );
  // Vitesse de déplacement constante : les longs coups durent proportionnellement
  // plus longtemps. La durée est partagée avec le chronomètre pour que la pièce
  // soit révélée exactement à la fin de l'animation.
  const moveDuration = $derived(moveBaseDurationMs(movementDistance));
  const activeColor = $derived(
    hexToCss(gameState.activeForm === "ball" ? theme.ball : theme.square),
  );
  // Halloween uses a distinct spectral palette for each character without
  // changing the normal trail colors for other skins or worlds.
  const trailColor = $derived(
    skin === "halloween"
      ? gameState.activeForm === "ball"
        ? "#B66CFF"
        : "#62E879"
      : activeColor,
  );

  const boardStyle = $derived(
    styleString({
      ...themeVars(theme),
      "--cols": level.width,
      "--rows": level.height,
      "--move-duration": `${moveDuration}ms`,
      "--teleport-departure-duration": `${teleportTiming.departureMs}ms`,
      "--teleport-arrival-delay": `${teleportTiming.arrivalDelayMs}ms`,
      "--teleport-arrival-duration": `${teleportTiming.arrivalMs}ms`,
    }),
  );

  // Traînée de particules + translation de la pièce active pendant un glissement.
  $effect(() => {
    const current = movement;
    const piece = gameState.activeForm === "ball" ? ballEl : squareEl;
    const board = boardEl;
    const layer = trailLayerEl;
    const color = trailColor;
    if (!current || current.teleport || !board || !piece || !layer) return;

    const boardRect = board.getBoundingClientRect();
    const cellWidth = boardRect.width / level.width;
    const cellHeight = boardRect.height / level.height;
    const startX = (current.from.x + 0.5) * cellWidth;
    const startY = (current.from.y + 0.5) * cellHeight;
    const endX = (current.target.x + 0.5) * cellWidth;
    const endY = (current.target.y + 0.5) * cellHeight;
    const startedAt = performance.now();
    const duration = moveBaseDurationMs(current.distance);
    let frame = 0;
    let lastTrailAt = -Infinity;

    const leaveTrailAt = (x: number, y: number) => {
      const particle = document.createElement("span");
      particle.className = "movement-trail-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.opacity = "1";
      particle.style.setProperty("--trail-color", color);
      layer.append(particle);
      const fadeOutAt = window.setTimeout(() => {
        particle.style.opacity = "0";
        particle.style.transform = "translate(-50%, -50%) scale(0.25)";
      }, 240);
      window.setTimeout(() => particle.remove(), 700);
      particle.addEventListener(
        "transitionend",
        () => window.clearTimeout(fadeOutAt),
        { once: true },
      );
    };

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      piece.style.transform = `translate3d(${x - startX}px, ${y - startY}px, 0)`;
      if (now - lastTrailAt >= 16) {
        leaveTrailAt(x, y);
        lastTrailAt = now;
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      piece.style.transform = "";
    };
  });
</script>

{#snippet teleportPiece(form: "ball" | "square", expression: "neutral" | "surprised")}
  <Character
    kind={form}
    size={36}
    color={hexToCss(form === "ball" ? theme.ball : theme.square)}
    {expression}
    {skin}
    class="character character-{form}"
  />
{/snippet}

<div
  bind:this={boardEl}
  class="board {skin !== 'default' ? `seasonal theme-${skin}` : ''}"
  style={boardStyle}
>
  {#each level.tiles as row, y (y)}
    {#each row as tile, x (x)}
      {#if tile === "wall"}
        <div class="wall" style="grid-column: {x + 1}; grid-row: {y + 1}"></div>
      {:else if tile === "spike"}
        <div class="fire-container" style="grid-column: {x + 1}; grid-row: {y + 1}">
          <Icon name="fire" size={24} color="#ff7a18" class="svg-icon svg-icon--fire fire-pulse" />
        </div>
      {:else}
        <div style="grid-column: {x + 1}; grid-row: {y + 1}"></div>
      {/if}
    {/each}
  {/each}

  {#each level.doors ?? [] as door (door.id)}
    <div
      class="door {gameState.doors[door.id] ? 'open' : ''}"
      style="grid-column: {door.position.x + 1}; grid-row: {door.position.y + 1}"
    >
      <Icon
        name="door"
        size={20}
        color={hexToCss(theme.wall)}
        isOpen={gameState.doors[door.id]}
        class="svg-icon svg-icon--door {gameState.doors[door.id] ? 'door-open' : ''}"
      />
    </div>
  {/each}

  {#each level.switches ?? [] as item (item.id)}
    <div
      class="switch-tile form-{item.form}"
      style="grid-column: {item.position.x + 1}; grid-row: {item.position.y + 1}"
    >
      <SwitchIcon
        size={24}
        ballColor={hexToCss(theme.ball)}
        squareColor={hexToCss(theme.square)}
        form={item.form}
        class="svg-icon svg-icon--switch"
      />
    </div>
  {/each}

  {#each level.teleporters ?? [] as item (item.id)}
    <div
      class="teleporter"
      style="grid-column: {item.position.x + 1}; grid-row: {item.position.y + 1}"
    >
      <Icon name="teleporter" size={20} color={hexToCss(theme.accent)} class="svg-icon svg-icon--teleporter teleporter-pulse" />
    </div>
  {/each}

  {#if movement?.teleport}
    {@const tp = movement.teleport}
    {#key movement.sequence}
      <div
        class="teleport-effect teleport-departure"
        style="grid-column: {tp.from.x + 1}; grid-row: {tp.from.y + 1}"
        data-teleport-from="{tp.from.x},{tp.from.y}"
      >
        {@render teleportPiece(tp.form, "neutral")}
      </div>
      <div
        class="teleport-effect teleport-arrival"
        style="grid-column: {tp.to.x + 1}; grid-row: {tp.to.y + 1}; --teleport-shift-x: calc(var(--cell-width) * {movement.target.x - tp.to.x}); --teleport-shift-y: calc(var(--cell-height) * {movement.target.y - tp.to.y})"
        data-teleport-to="{tp.to.x},{tp.to.y}"
      >
        {@render teleportPiece(tp.form, "surprised")}
      </div>
    {/key}
  {/if}

  {#each gameState.stars as star (`${star.x}-${star.y}`)}
    <div class="star-container" style="grid-column: {star.x + 1}; grid-row: {star.y + 1}">
      <Icon name="star" size={20} color={hexToCss(theme.star)} class="svg-icon svg-icon--star sparkle" />
    </div>
  {/each}

  {#if isInside(level, gameState.ball)}
    {@const active = gameState.activeForm === "ball"}
    <div
      bind:this={ballEl}
      class="piece ball {active ? '' : 'inactive'} {active ? activePieceClass : ''}"
      style:grid-column={active && movement ? movement.from.x + 1 : gameState.ball.x + 1}
      style:grid-row={active && movement ? movement.from.y + 1 : gameState.ball.y + 1}
      style:--move-x={active ? moveX : "0px"}
      style:--move-y={active ? moveY : "0px"}
      style:--move-duration="{moveDuration}ms"
      style:--trail-cells={movementDistance}
      style:--trail-color={trailColor}
      style:--piece-color={hexToCss(theme.ball)}
      data-movement-from={active && movement ? `${movement.from.x},${movement.from.y}` : undefined}
      data-movement-target={active && movement ? `${movement.target.x},${movement.target.y}` : undefined}
    >
      <Character
        kind="ball"
        size={36}
        color={hexToCss(theme.ball)}
        expression={gameState.gameOver ? "defeated" : gameState.completed ? "happy" : "neutral"}
        {skin}
        class="character character-ball"
      />
    </div>
  {/if}

  {#if level.square && isInside(level, gameState.square)}
    {@const active = gameState.activeForm === "square"}
    <div
      bind:this={squareEl}
      class="piece square {active ? '' : 'inactive'} {active ? activePieceClass : ''}"
      style:grid-column={active && movement ? movement.from.x + 1 : gameState.square.x + 1}
      style:grid-row={active && movement ? movement.from.y + 1 : gameState.square.y + 1}
      style:--move-x={active ? moveX : "0px"}
      style:--move-y={active ? moveY : "0px"}
      style:--move-duration="{moveDuration}ms"
      style:--trail-cells={movementDistance}
      style:--trail-color={trailColor}
      style:--piece-color={hexToCss(theme.square)}
      data-movement-from={active && movement ? `${movement.from.x},${movement.from.y}` : undefined}
      data-movement-target={active && movement ? `${movement.target.x},${movement.target.y}` : undefined}
    >
      <Character
        kind="square"
        size={36}
        color={hexToCss(theme.square)}
        expression={gameState.gameOver ? "defeated" : gameState.completed ? "happy" : "neutral"}
        {skin}
        class="character character-square"
      />
    </div>
  {/if}

  <div bind:this={trailLayerEl} class="movement-trail-layer" aria-hidden="true"></div>
  {@render children?.()}
</div>
