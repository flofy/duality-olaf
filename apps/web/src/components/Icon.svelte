<script lang="ts">
  import type { IconName } from "../lib/icons";

  let {
    name,
    size = 24,
    color,
    class: className,
    isOpen = false,
  }: {
    name: IconName;
    size?: number;
    color?: string;
    class?: string;
    /** Uniquement pour l'icône « door ». */
    isOpen?: boolean;
  } = $props();

  const defaultColors: Record<IconName, string> = {
    x: "#fff",
    help: "#fff",
    fire: "#ff7a18",
    star: "#ffd700",
    door: "#7a5c3d",
    teleporter: "#9b59b6",
    arrowUp: "#fff",
    arrowDown: "#fff",
    arrowLeft: "#fff",
    arrowRight: "#fff",
    reset: "#fff",
    grid: "#fff",
    maximize: "#fff",
    minimize: "#fff",
    theme: "#fff",
    skin: "#fff",
  };

  const c = $derived(color ?? defaultColors[name]);
</script>

{#if name === "x"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto">
    <path d="M18 6L6 18" stroke={c} stroke-width="2" stroke-linecap="round" />
    <path d="M6 6L18 18" stroke={c} stroke-width="2" stroke-linecap="round" />
  </svg>
{:else if name === "help"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className}>
    <circle cx="12" cy="12" r="9" stroke={c} stroke-width="2" />
    <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .8-1.7 1.2-1.7 2.7" stroke={c} stroke-width="2" stroke-linecap="round" />
    <circle cx="12" cy="16.8" r="1" fill={c} />
  </svg>
{:else if name === "fire"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto">
    <path d="M12.4 2.5c.9 3.2-.8 4.9-2.4 6.5-1.5 1.5-2.8 3-2.8 5.5A5.8 5.8 0 0 0 13 20.2c3.7-.4 5.9-3.1 5.9-6.5 0-2.7-1.5-5.2-3.8-7.7.1 2.1-.6 3.3-1.8 4.1.3-2.8-.1-5.1-.9-7.6Z" fill={c} />
    <path d="M12.4 11.2c.7 1.3.5 2.2-.1 3.1-.5.7-.8 1.4-.8 2.2 0 1.5 1 2.5 2.5 2.5 1.6 0 2.6-1.1 2.6-2.7 0-1.3-.7-2.5-1.8-3.6.1 1-.2 1.6-.8 2-.1-1.3-.5-2.3-1.6-3.5Z" fill="#ffe08a" />
  </svg>
{:else if name === "star"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={c} xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto">
    <path d="M12 2L14.5 9.5L22 10.5L16 14L17.5 21L12 18L6.5 21L8 14L2 10.5L9.5 9.5L12 2Z" />
    <path d="M12 4L13 8L16 8L14 11L15 15L12 13L9 15L10 11L8 8L11 8L12 4Z" fill="white" opacity="0.3" />
  </svg>
{:else if name === "door"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto">
    <rect x="6" y="2" width="12" height="20" rx="1" fill={c} />
    <rect x="8" y="4" width="8" height="16" rx="1" fill="#5d432c" />
    <circle cx="16" cy="12" r="1" fill="#ffd447" />
    {#if !isOpen}
      <rect x="8" y="10" width="8" height="4" rx="1" fill="#3a2718" />
      <circle cx="12" cy="12" r=".5" fill="#ffd447" />
    {:else}
      <path d="M8 10L10 8L12 10" stroke="#5d432c" stroke-width="1" />
    {/if}
  </svg>
{:else if name === "teleporter"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto">
    <circle cx="12" cy="12" r="8" stroke={c} stroke-width="2" />
    <circle cx="12" cy="12" r="4" stroke={c} stroke-width="2" />
    <circle cx="12" cy="12" r="1" fill={c} />
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.36 6.36M17.64 17.64L19.07 19.07M4.93 19.07L6.36 17.64M17.64 6.36L19.07 4.93" stroke={c} stroke-width="1.5" />
  </svg>
{:else if name === "arrowUp"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M12 19V5M5 12l7-7 7 7" stroke={c} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
{:else if name === "arrowDown"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M12 5v14m-5-7 5 7 5-7" stroke={c} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
{:else if name === "arrowLeft"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M19 12H5m7-5-7 5 7 5" stroke={c} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
{:else if name === "arrowRight"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M5 12h14m-7-5 7 5-7 5" stroke={c} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
{:else if name === "reset"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66M20 3v4h-4" stroke={c} stroke-width="2" fill="none" stroke-linecap="round" />
  </svg>
{:else if name === "grid"}
  <svg width={size} height={size} viewBox="0 0 24 24" class={className}>
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" stroke={c} fill="none" />
  </svg>
{:else if name === "maximize"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto" stroke-linecap="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" stroke={c} stroke-width="2" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" stroke={c} stroke-width="2" />
    <path d="M21 16v3a2 2 0 0 1-2 2h-3" stroke={c} stroke-width="2" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" stroke={c} stroke-width="2" />
  </svg>
{:else if name === "minimize"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto" stroke-linecap="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3" stroke={c} stroke-width="2" />
    <path d="M16 3v3a2 2 0 0 0 2 2h3" stroke={c} stroke-width="2" />
    <path d="M8 21v-3a2 2 0 0 0-2-2H3" stroke={c} stroke-width="2" />
    <path d="M16 21v-3a2 2 0 0 1 2-2h3" stroke={c} stroke-width="2" />
  </svg>
{:else if name === "theme"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto" stroke-linecap="round">
    <circle cx="12" cy="12" r="4" stroke={c} stroke-width="2" />
    <path d="M12 2v2" stroke={c} stroke-width="2" />
    <path d="M12 20v2" stroke={c} stroke-width="2" />
    <path d="M4.93 4.93l1.41 1.41" stroke={c} stroke-width="2" />
    <path d="M17.66 17.66l1.41 1.41" stroke={c} stroke-width="2" />
    <path d="M2 12h2" stroke={c} stroke-width="2" />
    <path d="M20 12h2" stroke={c} stroke-width="2" />
    <path d="M6.34 17.66l-1.41 1.41" stroke={c} stroke-width="2" />
    <path d="M19.07 4.93l-1.41 1.41" stroke={c} stroke-width="2" />
  </svg>
{:else if name === "skin"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style="display: block; margin: 0 auto" stroke-linecap="round">
    <circle cx="12" cy="8" r="4" stroke={c} stroke-width="2" />
    <path d="M4 21a8 8 0 0 1 16 0" stroke={c} stroke-width="2" />
  </svg>
{/if}
