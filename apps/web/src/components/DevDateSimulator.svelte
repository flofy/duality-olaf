<script lang="ts">
  import {
    getSimulatedDate,
    resetSimulatedDate,
    setSimulatedDate,
  } from "../lib/devDate.svelte";

  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEVTOOLS === "true";
  const simulatedDate = $derived(getSimulatedDate());
  const inputValue = $derived(
    simulatedDate
      ? `${simulatedDate.getFullYear()}-${String(simulatedDate.getMonth() + 1).padStart(2, "0")}-${String(simulatedDate.getDate()).padStart(2, "0")}`
      : "",
  );
</script>

{#if isDevelopment}
  <aside class="dev-date-tool" aria-label="Simulation de date développeur">
    <label class="dev-date-label" for="dev-simulated-date">🧪 SIMULER LA DATE DU JEU</label>
    <input
      id="dev-simulated-date"
      aria-label="Choisir la date simulée"
      type="date"
      value={inputValue}
      onchange={(event) => setSimulatedDate(event.currentTarget.value)}
    />
    {#if simulatedDate}
      <span class="dev-date-active">SIMULATION ACTIVE</span>
      <button type="button" onclick={resetSimulatedDate}>DATE RÉELLE</button>
    {:else}
      <span class="dev-date-hint">La date réelle est utilisée</span>
    {/if}
  <small class="dev-date-description">Teste les dates d’ouverture d’Halloween, du monde Hiver et des 24 jours de l’Avent.</small>
  </aside>

  <style>
    .dev-date-tool {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin: 12px auto;
      padding: 9px 12px;
      max-width: 560px;
      border: 1px dashed rgba(120, 190, 255, 0.45);
      border-radius: 8px;
      background: rgba(10, 25, 48, 0.72);
      color: #c9def7;
      font-size: 11px;
      letter-spacing: 0.06em;
    }
    .dev-date-label { font-weight: 800; }
    .dev-date-tool input {
      min-width: 140px;
      padding: 5px 7px;
      border: 1px solid rgba(160, 195, 230, 0.35);
      border-radius: 5px;
      background: #111d32;
      color: #fff;
      color-scheme: dark;
      font: inherit;
      letter-spacing: normal;
    }
    .dev-date-tool button {
      padding: 5px 7px;
      border: 0;
      background: transparent;
      color: #9ed3ff;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .dev-date-active { color: #8de0bd; font-weight: 800; }
    .dev-date-hint { color: #8295ae; }
    .dev-date-description { flex-basis: 100%; text-align: center; color: #8295ae; letter-spacing: normal; }
  </style>
{/if}
