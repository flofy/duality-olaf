<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    icon,
    label,
    onclick,
    onpointerdown,
    onpointerup,
    disabled = false,
    class: className = "",
    ariaLabel,
  }: {
    icon: Snippet;
    label: string;
    onclick: (event: MouseEvent) => void;
    onpointerdown?: (event: PointerEvent) => void;
    onpointerup?: (event: PointerEvent) => void;
    disabled?: boolean;
    class?: string;
    ariaLabel?: string;
  } = $props();

  let hovered = $state(false);
  const inlineStyle = $derived(
    [
      "display: flex",
      "flex-direction: column",
      "align-items: center",
      "justify-content: center",
      "gap: 4px",
      "width: 60px",
      "height: 60px",
      "border-radius: 50%",
      `background: ${hovered && !disabled ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
      "border: 2px solid rgba(255, 255, 255, 0.3)",
      `cursor: ${disabled ? "not-allowed" : "pointer"}`,
      "transition: all 0.2s ease",
      "color: var(--text, #fff)",
      `transform: ${hovered && !disabled ? "scale(1.1)" : "scale(1)"}`,
    ].join("; "),
  );

  function handleClick(event: MouseEvent) {
    // Quand un pointerup est fourni, il active déjà le bouton : on garde le
    // clic pour le clavier / les technologies d'assistance uniquement
    // (detail === 0), afin de ne pas déclencher deux fois l'action.
    if (onpointerup && event.detail !== 0) return;
    onclick(event);
  }
</script>

<button
  class="center-dpad-button {className}"
  aria-label={ariaLabel}
  onclick={handleClick}
  {onpointerdown}
  {onpointerup}
  {disabled}
  style={inlineStyle}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>
  <span style="display: flex; align-items: center; justify-content: center; font-size: 24px">
    {@render icon()}
  </span>
  <span style="font-size: 10px; font-weight: bold">{label}</span>
</button>
