<script lang="ts">
  import { generateChallenge, type ChallengeMechanic } from "@duality/game";
  import Button from "../components/Button.svelte";
  import { location, navigate } from "../lib/router.svelte";
  import ChallengePlay from "./ChallengePlay.svelte";

  type Profile = { id: string; label: string; mechanics: readonly ChallengeMechanic[] };

  const PROFILES: readonly Profile[] = [
    { id: "classic", label: "CLASSIQUE", mechanics: ["walls"] },
    { id: "doors", label: "PORTES & INTERRUPTEURS", mechanics: ["walls", "doors"] },
    { id: "teleporters", label: "TÉLÉPORTEURS", mechanics: ["walls", "teleporters"] },
    { id: "advanced", label: "COMBINAISON", mechanics: ["walls", "doors", "teleporters"] },
  ];

  function readSeed(search: string): number {
    const parsed = Number(new URLSearchParams(search).get("seed"));
    return Number.isInteger(parsed) && parsed > 0 ? parsed : Date.now() % 2_000_000_000;
  }

  function readProfile(search: string): Profile {
    const id = new URLSearchParams(search).get("profile");
    return PROFILES.find((profile) => profile.id === id) ?? PROFILES[0]!;
  }

  function nextSeed() {
    return Math.floor(Math.random() * 1_900_000_000) + 1;
  }

  // L'URL ne sert qu'à l'état initial (lien partageable) ; ensuite l'état local fait foi.
  /* svelte-ignore state_referenced_locally */
  let profile = $state(readProfile(location.search));
  /* svelte-ignore state_referenced_locally */
  let seed = $state(readSeed(location.search));

  const challenge = $derived(generateChallenge(seed, { mechanics: profile.mechanics }));

  function start(nextProfile: Profile, nextChallengeSeed: number) {
    profile = nextProfile;
    seed = nextChallengeSeed;
    navigate(`/challenge?profile=${nextProfile.id}&seed=${nextChallengeSeed}`, { replace: true });
  }
</script>

<section class="game challenge-mode">
  <div class="topbar">
    <Button icon="arrowLeft" ariaLabel="Retour au menu" onclick={() => navigate("/menu")} variant="secondary" />
    <b>DÉFI · {profile.label}</b>
  </div>

  <div class="challenge-meta">
    <span>SEED · {challenge.seed}</span>
    <span>{challenge.moves} coups optimaux</span>
  </div>

  <!-- Un nouveau défi remonte le jeu : chrono, état et ambiance repartent à zéro. -->
  {#key `${profile.id}-${seed}`}
    <ChallengePlay
      {challenge}
      profileLabel={profile.label}
      onNewChallenge={() => start(profile, nextSeed())}
    />
  {/key}

  <div class="challenge-actions" aria-label="Profils de défi">
    {#each PROFILES as item (item.id)}
      <button
        type="button"
        class="action {item.id === profile.id ? 'active' : ''}"
        onclick={() => start(item, nextSeed())}
      >
        {item.label}
      </button>
    {/each}
  </div>
</section>
