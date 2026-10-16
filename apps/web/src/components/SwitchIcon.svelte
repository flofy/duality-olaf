<script lang="ts">
  let {
    size = 24,
    form = "either",
    ballColor = "var(--ball, #4aa3ff)",
    squareColor = "var(--square, #ffd447)",
    class: className,
  }: {
    size?: number;
    form?: "ball" | "square" | "either";
    ballColor?: string;
    squareColor?: string;
    class?: string;
  } = $props();

  // Identifiant unique par instance (le dégradé est référencé par url(#id)).
  const uid = $props.id();
  const gradientId = `switch-both-gradient-${uid}`;

  const label = $derived(
    form === "ball"
      ? "Interrupteur actionnable par la boule"
      : form === "square"
        ? "Interrupteur actionnable par le carré"
        : "Interrupteur actionnable par les deux formes",
  );
  const frameColor = $derived(
    form === "ball"
      ? ballColor
      : form === "square"
        ? squareColor
        : `url(#${gradientId})`,
  );
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} role="img" aria-label={label}>
  <title>{label}</title>
  <defs>
    <linearGradient id={gradientId} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
      <stop stop-color={ballColor} />
      <stop offset="1" stop-color={squareColor} />
    </linearGradient>
  </defs>
  <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#071022" stroke={frameColor} stroke-width="2" />
  {#if form === "ball"}
    <circle cx="12" cy="12" r="6" fill={ballColor} />
    <circle cx="10" cy="10" r="1.8" fill="#fff" opacity=".5" />
  {:else if form === "square"}
    <rect x="6" y="6" width="12" height="12" rx="1.5" fill={squareColor} />
    <path d="M8 8h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".45" />
  {:else}
    <circle cx="7.5" cy="12" r="3.25" fill={ballColor} />
    <rect x="12.5" y="8.75" width="6.5" height="6.5" rx="1" fill={squareColor} />
    <path d="M9 12h5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".9" />
  {/if}
</svg>
