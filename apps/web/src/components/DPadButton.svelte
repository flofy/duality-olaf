<script lang="ts">
  import type { IconName } from "../lib/icons";
  import Icon from "./Icon.svelte";

  let {
    icon,
    onclick,
    disabled = false,
    class: className = "",
    ariaLabel,
  }: {
    icon: IconName;
    onclick: (event: MouseEvent) => void;
    disabled?: boolean;
    class?: string;
    ariaLabel?: string;
  } = $props();

  let hovered = $state(false);
  const inlineStyle = $derived(
    [
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "width: 48px",
      "height: 48px",
      "border-radius: 8px",
      `background: ${hovered && !disabled ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
      "border: 1px solid rgba(255, 255, 255, 0.2)",
      `cursor: ${disabled ? "not-allowed" : "pointer"}`,
      "transition: all 0.2s ease",
      "color: var(--text, #fff)",
      `transform: ${hovered && !disabled ? "scale(1.1)" : "scale(1)"}`,
    ].join("; "),
  );
</script>

<button
  class="dpad-button {className}"
  aria-label={ariaLabel}
  {onclick}
  {disabled}
  style={inlineStyle}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>
  <span style="display: flex; align-items: center; justify-content: center; width: 100%">
    <Icon name={icon} size={24} color="var(--text)" />
  </span>
</button>
