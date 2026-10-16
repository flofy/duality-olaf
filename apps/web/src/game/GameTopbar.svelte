<script lang="ts">
  import { levelLabel } from "../lib/levels/campaign";
  import Button from "../components/Button.svelte";

  let {
    worldId,
    worldIndex,
    onBack,
    label,
  }: {
    worldId: number;
    worldIndex: number;
    onBack: () => void;
    label?: string;
  } = $props();
</script>

<div class="topbar">
  <!-- Retour au monde : icône seule (le contexte « MONDE x » est déjà dans le
       titre), d'où le libellé porté par aria-label. -->
  <Button
    icon="arrowLeft"
    ariaLabel="Retour aux niveaux · monde {worldId}"
    onclick={onBack}
    variant="secondary"
  />
  <b>{label ?? `${levelLabel(worldIndex)} · MONDE ${worldId}`}</b>
</div>
