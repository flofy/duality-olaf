<script lang="ts">
  import type { Snippet } from "svelte";
  import type { IconName } from "../lib/icons";
  import Icon from "./Icon.svelte";

  type Variant = "primary" | "secondary" | "danger";

  const variants = {
    primary: { bg: "#1b2942", text: "#ffffff", hoverBg: "#2a3a5a", disabledBg: "#333", disabledText: "#666" },
    secondary: { bg: "#2a3a5a", text: "#ffffff", hoverBg: "#3a4a6a", disabledBg: "#444", disabledText: "#888" },
    danger: { bg: "#8b0000", text: "#ffffff", hoverBg: "#a00000", disabledBg: "#660000", disabledText: "#cc3333" },
  } satisfies Record<Variant, Record<string, string>>;

  let {
    icon,
    iconText,
    iconSize = 18,
    label = "",
    onclick,
    disabled = false,
    class: className = "",
    variant = "primary",
    ariaLabel,
    autofocus = false,
    selected = false,
    children,
  }: {
    /** Nom d'une icône du jeu. */
    icon?: IconName;
    /** Alternative : un emoji ou un court texte comme icône. */
    iconText?: string;
    iconSize?: number;
    label?: string;
    onclick: (event: MouseEvent) => void;
    disabled?: boolean;
    class?: string;
    variant?: Variant;
    ariaLabel?: string;
    autofocus?: boolean;
    selected?: boolean;
    children?: Snippet;
  } = $props();

  let button: HTMLButtonElement | undefined = $state();
  let hovered = $state(false);

  $effect(() => {
    if (autofocus) button?.focus();
  });

  const v = $derived(variants[variant]);
  const inlineStyle = $derived(
    [
      "display: inline-flex",
      "align-items: center",
      "justify-content: center",
      "gap: 8px",
      "padding: 12px 20px",
      "border-radius: 8px",
      `background: ${disabled ? v.disabledBg : hovered ? v.hoverBg : v.bg}`,
      `color: ${disabled ? v.disabledText : v.text}`,
      "border: none",
      `cursor: ${disabled ? "not-allowed" : "pointer"}`,
      "transition: all 0.2s ease",
      "font-size: 16px",
      "font-weight: bold",
      "text-transform: uppercase",
      "letter-spacing: 1px",
      `box-shadow: ${disabled ? "none" : "0 2px 5px rgba(0, 0, 0, 0.3)"}`,
      `opacity: ${disabled ? 0.7 : 1}`,
      `transform: ${hovered && !disabled ? "translateY(-2px)" : "translateY(0)"}`,
    ].join("; "),
  );
</script>

<button
  bind:this={button}
  class="modern-button {className}"
  {onclick}
  {disabled}
  data-selected={selected ? "true" : undefined}
  aria-label={ariaLabel}
  style={inlineStyle}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>
  {#if icon}
    <span style="display: flex; align-items: center; justify-content: center">
      <Icon name={icon} size={iconSize} />
    </span>
  {:else if iconText}
    <span style="display: flex; align-items: center; justify-content: center" aria-hidden="true">{iconText}</span>
  {/if}
  {#if label}<span>{label}</span>{/if}
  {@render children?.()}
</button>
