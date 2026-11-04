<script lang="ts">
  type Expression = "happy" | "neutral" | "surprised" | "angry" | "tired" | "defeated";

  let {
    kind,
    size = 48,
    color,
    expression = "neutral",
    skin = "default",
    class: className,
  }: {
    kind: "ball" | "square";
    size?: number;
    color?: string;
    expression?: Expression;
    skin?: string;
    class?: string;
  } = $props();

  const fill = $derived(color ?? (kind === "ball" ? "#35a9ff" : "#ffd447"));
  const halloween = $derived(skin === "halloween");
  const winter = $derived(skin === "christmas");
  const characterStyle =
    "display: block; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)";
</script>

{#snippet face(square: boolean)}
  {#if expression === "defeated"}
    <path d="M7.3 8.7 10.1 11.5M10.1 8.7 7.3 11.5M13.9 8.7 16.7 11.5M16.7 8.7 13.9 11.5" stroke="#172554" stroke-width="1.25" stroke-linecap="round" />
    <path d="M9 16c1.8-1.2 4.2-1.2 6 0" stroke="#172554" stroke-width="1" stroke-linecap="round" />
  {:else}
    <ellipse cx="8.6" cy="10.8" rx="2.05" ry="2.2" fill="#fff" />
    <ellipse cx="15.4" cy="10.8" rx="2.05" ry="2.2" fill="#fff" />
    <circle cx="9" cy="11" r="1.05" fill="#172554" />
    <circle cx="15" cy="11" r="1.05" fill="#172554" />
    <circle cx="9.35" cy="10.75" r=".35" fill="#fff" />
    <circle cx="15.35" cy="10.75" r=".35" fill="#fff" />
    {#if expression === "happy"}
      <path d="M8.5 14.4c1.8 2 5.2 2 7 0" stroke="#172554" stroke-width="1.2" stroke-linecap="round" />
    {:else if expression === "surprised"}
      <circle cx="12" cy="15" r="1.5" fill="#172554" />
    {:else if expression === "neutral" || expression === "tired"}
      <path d="M9.5 15h5" stroke="#172554" stroke-width="1" stroke-linecap="round" />
    {:else if expression === "angry"}
      <path d="M6.8 8.2 10 9.2M14 9.2l3.2-1" stroke="#172554" stroke-width="1.2" stroke-linecap="round" />
      <path d="M9 15.5c1.7-.8 4.3-.8 6 0" stroke="#172554" stroke-width="1.1" stroke-linecap="round" />
    {/if}
    {#if square}
      <path d="M5.5 5.5h2" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".45" />
    {/if}
  {/if}
{/snippet}

{#if kind === "ball"}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style={characterStyle} aria-hidden="true">
    <defs>
      <radialGradient id="ballCharacterGradient" cx="30%" cy="25%">
        <stop offset="0" stop-color={halloween ? "#f0e8ff" : winter ? "#ffffff" : "#bff1ff"} />
        <stop offset=".22" stop-color={halloween ? "#6d4a9e" : winter ? "#f4fbff" : fill} />
        <stop offset="1" stop-color={halloween ? "#24152f" : winter ? "#a8d9ed" : "#1769c2"} />
      </radialGradient>
    </defs>
    <ellipse cx="12" cy="21" rx="6" ry="1.3" fill="#0b3b73" opacity=".28" />
    {#if halloween}
      <g class="halloween-bat-wings" fill="#24152f" stroke="#bca0df" stroke-width=".55" stroke-linejoin="round">
        <path d="M7.2 10.2 1.1 6.2 2.1 12.2 0.9 15.1 5.2 14.4 8.2 17.2 9.1 12.5Z" />
        <path d="M16.8 10.2 22.9 6.2 21.9 12.2 23.1 15.1 18.8 14.4 15.8 17.2 14.9 12.5Z" />
      </g>
    {/if}
    {#if winter}
      <path d="M5.1 14.5c2.1 1.2 4.5 1.7 6.9 1.7 2.5 0 4.9-.5 6.9-1.7l-.8 3.2c-1.7 1.1-3.8 1.7-6.1 1.7s-4.4-.6-6.1-1.7Z" fill="#c83d4b" stroke="#8f2534" stroke-width=".45"/>
      <path d="M16.1 15.7 18.2 19.4 16.1 20.2 14.5 16.2Z" fill="#e74b58" stroke="#8f2534" stroke-width=".35"/>
      <circle cx="12" cy="3.5" r="2.1" fill="#e8f7ff" stroke="#8bb9d1" stroke-width=".45"/>
      <path d="M9.7 3.1c.7-1.2 2-1.5 3.3-.8" stroke="#fff" stroke-width=".8" stroke-linecap="round"/>
      <circle cx="12" cy="14.8" r=".55" fill="#26384b"/>
      <circle cx="12" cy="17.2" r=".55" fill="#26384b"/>
    {/if}
    <g class="ball-character-legs">
      <path class="ball-character-leg-left" d="M6.3 17.2c-1.1 1.8-.5 3.1.8 3.5 1.3.4 2.1-.7 2.3-2.1" fill={winter ? "#eaf8ff" : fill} stroke={winter ? "#8bb9d1" : "#12529a"} stroke-width=".55" />
      <path class="ball-character-leg-right" d="M17.7 17.2c1.1 1.8.5 3.1-.8 3.5-1.3.4-2.1-.7-2.3-2.1" fill={winter ? "#eaf8ff" : fill} stroke={winter ? "#8bb9d1" : "#12529a"} stroke-width=".55" />
    </g>
    <path d="M10 3.4c.4-1.2 1.5-1.8 2.5-.9-.2 1.1-.7 1.9-1.7 2.4" fill="#4fc3ff" stroke="#12529a" stroke-width=".45" />
    <circle cx="12" cy="12" r="9" fill="url(#ballCharacterGradient)" stroke={winter ? "#8bb9d1" : "#12529a"} stroke-width=".6" />
    <ellipse cx="8.2" cy="6.6" rx="2.5" ry="1.35" fill="#fff" opacity=".55" transform="rotate(-25 8.2 6.6)" />
    {#if winter}
      <path d="M8.1 13.5 10.3 14.3 11.7 13.7 13.5 14.4 15.8 13.5" stroke="#e98b8b" stroke-width=".65" stroke-linecap="round"/>
      <path d="M10.7 12.2 12 13.3 13.3 12.2" fill="#f08a35" stroke="#c86c28" stroke-width=".35"/>
    {:else}
      {@render face(false)}
    {/if}
    {#if expression === "happy" || expression === "surprised"}
      <circle cx="5.9" cy="13.9" r="1" fill="#ff8ba7" opacity=".65" />
      <circle cx="18.1" cy="13.9" r="1" fill="#ff8ba7" opacity=".65" />
    {/if}
  </svg>
{:else}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className} style={characterStyle} aria-hidden="true">
    <defs>
      <linearGradient id="squareCharacterGradient" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color={halloween ? "#c8f7a1" : winter ? "#fff4d6" : "#fff09a"} />
        <stop offset=".28" stop-color={halloween ? "#5a9b55" : winter ? "#b96a3f" : fill} />
        <stop offset="1" stop-color={halloween ? "#234c35" : winter ? "#743b2b" : "#e7a916"} />
      </linearGradient>
    </defs>
    <ellipse cx="12" cy="21" rx="6.5" ry="1.3" fill="#805c0b" opacity=".25" />
    <path d="M6.2 17.8c-.3 2 .3 3 1.6 3.1 1.1.1 1.8-.7 1.8-2.1M17.8 17.8c.3 2-.3 3-1.6 3.1-1.1.1-1.8-.7-1.8-2.1" fill={fill} stroke="#9b6808" stroke-width=".55" />
    <path d="M12 3.2 15 1.8v2.9" fill="#ffc928" stroke="#9b6808" stroke-width=".55" stroke-linejoin="round" />
    <rect x="2.2" y="3" width="19.6" height="17" rx="4" fill="url(#squareCharacterGradient)" stroke={winter ? "#743b2b" : "#9b6808"} stroke-width=".65" />
    <path d="M4 5h7" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".5" />
    {#if halloween}
      <g stroke="#253d2b" stroke-width="1.1" stroke-linecap="round">
        <path d="M2.2 8.2 4.4 8.2M19.6 8.2 21.8 8.2" />
        <path d="M5.5 17.5 7 16.6M17 16.6 18.5 17.5" />
        <path d="M2.5 11.5 4.1 12.8 2.7 14.2M21.5 11.5 19.9 12.8 21.3 14.2" />
      </g>
    {:else if winter}
      <path d="M5 4.2 3.1 1.3M5 4.2 1.7 4.1M19 4.2l1.9-2.9M19 4.2l3.3-.1" stroke="#b77b3c" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M4.8 4.3 4.3 2.2M19.2 4.3l.5-2.1" stroke="#f5d18b" stroke-width=".7" stroke-linecap="round"/>
      <path d="M11 17.2h2" stroke="#f5d18b" stroke-width="1" stroke-linecap="round"/>
    {/if}
    {@render face(true)}
    {#if winter}
      <circle cx="12" cy="14.2" r="1" fill="#c83d4b" stroke="#8f2534" stroke-width=".35"/>
    {/if}
    {#if expression === "happy" || expression === "surprised"}
      <circle cx="5" cy="14" r=".9" fill="#ff9b45" opacity=".55" />
      <circle cx="19" cy="14" r=".9" fill="#ff9b45" opacity=".55" />
    {/if}
  </svg>
{/if}
