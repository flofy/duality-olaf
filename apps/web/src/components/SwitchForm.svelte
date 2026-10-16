<script lang="ts">
  let {
    size = 24,
    color = "#fff",
    class: className,
    activeForm = "either",
  }: {
    size?: number;
    color?: string;
    class?: string;
    activeForm?: "ball" | "square" | "either";
  } = $props();

  const ballColor = $derived(
    activeForm === "ball"
      ? "var(--ball, #fff)"
      : "color-mix(in srgb, var(--ball, #fff) 38%, var(--muted, #888))",
  );
  const squareColor = $derived(
    activeForm === "square"
      ? "var(--square, #fff)"
      : "color-mix(in srgb, var(--square, #fff) 38%, var(--muted, #888))",
  );
  const switchColor = $derived(
    activeForm === "either" ? color : "var(--accent, #ffd447)",
  );
</script>

<svg width={size} height={size} viewBox="0 0 24 24" class={className}>
  <circle cx="6.5" cy="12" r="3.5" fill={ballColor} />
  <rect x="14" y="8.5" width="7" height="7" rx="1.2" fill={squareColor} />
  <path d="M10 9.5 13.5 12 10 14.5M13.5 12H9.5" stroke={switchColor} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
