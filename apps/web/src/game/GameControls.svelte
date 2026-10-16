<script lang="ts">
  import { gestureDirections } from "../lib/directions";
  import type { GameplayDirection } from "../lib/directions";
  import DPadButton from "../components/DPadButton.svelte";
  import CenterDPadButton from "../components/CenterDPadButton.svelte";
  import SwitchForm from "../components/SwitchForm.svelte";

  let {
    hasSquare,
    activeForm,
    onMove,
    onSwitch,
  }: {
    hasSquare: boolean;
    activeForm: "ball" | "square";
    onMove: (direction: GameplayDirection) => void;
    onSwitch: () => void;
  } = $props();
</script>

<div class="controls">
  <div class="dpad" role="group" aria-label="Contrôles directionnels">
    <DPadButton icon="arrowUp" ariaLabel="Déplacer en haut" onclick={() => onMove(gestureDirections.up)} />
    <DPadButton icon="arrowLeft" ariaLabel="Déplacer à gauche" onclick={() => onMove(gestureDirections.left)} />
    <DPadButton icon="arrowDown" ariaLabel="Déplacer en bas" onclick={() => onMove(gestureDirections.down)} />
    <DPadButton icon="arrowRight" ariaLabel="Déplacer à droite" onclick={() => onMove(gestureDirections.right)} />
  </div>
  {#if hasSquare}
    <CenterDPadButton
      label="SWITCH"
      onclick={onSwitch}
      onpointerdown={(event) => {
        event.stopPropagation();
      }}
      onpointerup={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSwitch();
      }}
      class="switch-toggle switch-toggle-{activeForm}"
      ariaLabel="Changer de forme"
    >
      {#snippet icon()}
        <SwitchForm size={24} {activeForm} />
      {/snippet}
    </CenterDPadButton>
  {/if}
</div>
