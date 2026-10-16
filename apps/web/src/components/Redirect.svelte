<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";

  // Équivalent de <Navigate replace /> de react-router.
  let { to }: { to: string } = $props();

  onMount(() => navigate(to, { replace: true }));
</script>
