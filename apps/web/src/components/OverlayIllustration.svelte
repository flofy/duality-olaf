<script lang="ts">
  import Character from "./Character.svelte";

  let {
    variant,
    activeForm = "ball",
    showSquare = true,
  }: {
    variant: "game-over" | "victory" | "world-transition";
    activeForm?: "ball" | "square";
    showSquare?: boolean;
  } = $props();
</script>

<!-- Illustration décorative réutilisable pour les en-têtes de popin. -->
{#if variant === "game-over"}
  <div class="modal-illustration modal-illustration--game-over" aria-hidden="true">
    <span class="illustration-spark illustration-spark--one">✦</span>
    <span class="illustration-spark illustration-spark--two">✦</span>
    <span class="illustration-crystal illustration-crystal--left"></span>
    <span class="illustration-crystal illustration-crystal--right"></span>
    <Character kind={activeForm} size={96} expression="defeated" class="modal-illustration__character" />
  </div>
{:else if variant === "world-transition"}
  <div class="modal-illustration modal-illustration--transition" aria-hidden="true">
    <span class="illustration-spark illustration-spark--one">✦</span>
    <span class="illustration-spark illustration-spark--two">✦</span>
    <span class="illustration-portal"><span class="illustration-portal__core"></span></span>
    <Character kind="ball" size={64} expression="happy" class="modal-illustration__character modal-illustration__character--ball" />
    {#if showSquare}
      <Character kind="square" size={64} expression="happy" class="modal-illustration__character modal-illustration__character--square" />
    {/if}
  </div>
{:else}
  <div class="modal-illustration modal-illustration--victory" aria-hidden="true">
    <span class="illustration-spark illustration-spark--one">✦</span>
    <span class="illustration-spark illustration-spark--two">✦</span>
    <span class="illustration-star illustration-star--one">★</span>
    <span class="illustration-star illustration-star--two">★</span>
    <Character kind="ball" size={82} expression="happy" class="modal-illustration__character modal-illustration__character--ball" />
    {#if showSquare}
      <Character kind="square" size={82} expression="happy" class="modal-illustration__character modal-illustration__character--square" />
    {/if}
  </div>
{/if}
