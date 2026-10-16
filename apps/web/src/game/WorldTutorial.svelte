<script lang="ts">
  import { onMount } from "svelte";
  import { solveLevel, type SolverCommand } from "@duality/game";
  import type { Level } from "@duality/level-format";
  import { appearance } from "../lib/appearance.svelte";
  import { resolveLevelSkin } from "../lib/skins";
  import { getActiveThemeName } from "../lib/theme";
  import Button from "../components/Button.svelte";
  import GameBoard from "./GameBoard.svelte";
  import GameControls from "./GameControls.svelte";
  import GameHud from "./GameHud.svelte";
  import GameTopbar from "./GameTopbar.svelte";
  import { createLevelGameplay, type GameplayDirection } from "./gameplay.svelte";

  type TutorialStep = {
    title: string;
    description: string;
    command: SolverCommand | null;
  };

  let {
    level,
    worldId,
    levelIndex,
    tutorial = "world",
    onFinish,
    onBack,
  }: {
    level: Level;
    worldId: number;
    levelIndex: number;
    tutorial?: "world" | "fire";
    onFinish: () => void;
    onBack: () => void;
  } = $props();

  const STEP_READING_MS = 2200;
  const STEP_ACTION_MS = 2000;
  const STEP_DURATION_MS = STEP_READING_MS + STEP_ACTION_MS;

  function describeCommand(command: SolverCommand): string {
    if (command.type === "switch") return "ESPACE";
    return command.direction.x < 0 ? "←" : command.direction.x > 0 ? "→" : command.direction.y < 0 ? "↑" : "↓";
  }

  function buildTutorialSteps(
    worldId: number,
    commands: readonly SolverCommand[],
    tutorial: "world" | "fire",
  ): TutorialStep[] {
    if (tutorial === "fire") {
      return [
        {
          title: "Repérer les flammes",
          description:
            "Les cases enflammées tuent la forme qui entre dedans. Sur ce vrai niveau, observe leur position avant de construire ton chemin.",
          command: null,
        },
        ...commands.map((command, index) => ({
          title: index === commands.length - 1 ? "Finir sans toucher le feu" : `Contourner le feu · ${index + 1}`,
          description:
            "Suis la solution sur le plateau : la boule s’arrête contre les obstacles et change de direction pour rester loin des flammes.",
          command,
        })),
      ];
    }
    if (worldId === 1) {
      return [
        {
          title: "Déplacer la boule",
          description:
            "Clique sur la flèche droite. La boule glisse jusqu’à l’obstacle et collecte l’étoile sur son chemin. L’icône ↻ dans le panneau d’explication recommence le niveau si besoin.",
          command: commands[0]!,
        },
      ];
    }
    if (worldId === 2) {
      return [
        {
          title: "Découvrir le carré",
          description:
            "Appuie sur ESPACE : la forme active devient le carré. Le second appui permet de revenir à la boule.",
          command: { type: "switch" },
        },
        {
          title: "Revenir à la boule",
          description:
            "Utilise de nouveau ESPACE avant de poursuivre. Les deux formes partagent désormais la même grille.",
          command: { type: "switch" },
        },
        ...commands.map((command, index) => ({
          title: `Déplacement ${index + 1}`,
          description:
            "Suis la solution sur le vrai plateau. Un déplacement fait glisser la forme jusqu’au prochain obstacle.",
          command,
        })),
      ];
    }
    if (worldId === 3) {
      return [
        {
          title: "Choisir la bonne forme",
          description:
            "Le carré peut bloquer la boule. Appuie sur ESPACE pour prendre le contrôle du carré.",
          command: commands[0]!,
        },
        ...commands.slice(1).map((command, index) => ({
          title: index === 0 ? "Bloquer le passage" : `Étape ${index + 1}`,
          description:
            index === 0
              ? "Déplace le carré pour empêcher la boule de traverser son chemin."
              : "Change de forme ou déplace la forme active pour poursuivre la solution.",
          command,
        })),
      ];
    }
    if (worldId === 4) {
      return commands.map((command, index) => ({
        title: index < 2 ? "Approcher le portail" : `Étape ${index + 1}`,
        description:
          index < 2
            ? "La boule se déplace dans la grille jusqu’au téléporteur."
            : "Entre dans le portail violet : la boule réapparaît à l’autre extrémité avant de continuer.",
        command,
      }));
    }
    return commands.map((command, index) => ({
      title:
        index === commands.length - 1
          ? "Atteindre la dernière étoile"
          : index === 5
            ? "Actionner l’interrupteur"
            : index === 6
              ? "Se placer derrière la porte"
              : `Préparer le trajet · ${index + 1}`,
      description:
        index === 5
          ? "La boule traverse l’interrupteur bleu. Le mécanisme ouvre la porte, qui reste ouverte."
          : index === 6
            ? "La porte est ouverte : la boule peut remonter dans le couloir supérieur."
            : index === commands.length - 1
              ? "La boule traverse la porte ouverte et collecte la dernière étoile."
              : "La boule avance sur le vrai plateau et s’arrête contre les obstacles.",
      command,
    }));
  }

  /* svelte-ignore state_referenced_locally */
  const solution = solveLevel(level);
  /* svelte-ignore state_referenced_locally */
  const steps = buildTutorialSteps(worldId, solution.solvable ? solution.commands : [], tutorial);

  let stepIndex = $state(0);
  let finished = $state(false);
  let stepElapsed = $state(0);
  const current = $derived(steps[stepIndex]);

  const skin = $derived.by(() => {
    appearance.tick;
    return resolveLevelSkin(level.id) ?? "default";
  });
  const themeName = $derived.by(() => {
    appearance.tick;
    return getActiveThemeName();
  });

  function advanceStep() {
    stepElapsed = 0;
    if (stepIndex >= steps.length - 1) finished = true;
    else stepIndex += 1;
  }

  function handleTutorialMove(direction: GameplayDirection, moved: boolean) {
    const command = current?.command;
    if (
      moved &&
      !finished &&
      command?.type === "move" &&
      command.direction.x === direction.x &&
      command.direction.y === direction.y
    ) {
      advanceStep();
    }
  }

  /* svelte-ignore state_referenced_locally */
  const game = createLevelGameplay(level, {
    onEscape: onBack,
    onMove: handleTutorialMove,
    onSwitch: () => {
      if (!finished && current?.command?.type === "switch") advanceStep();
    },
    ambientSkin: () => skin,
  });

  function executeScheduledCommand() {
    const command = current?.command;
    if (!command) {
      // Une étape d’observation n’a pas d’action à jouer sur le plateau.
      advanceStep();
      return;
    }
    if (command.type === "switch") {
      game.switchForm();
      return;
    }
    game.move(command.direction);
  }

  // Minuteur de l'étape courante : à son terme, la commande est jouée toute seule.
  $effect(() => {
    if (finished) return;
    void stepIndex;
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= STEP_DURATION_MS) {
        window.clearInterval(timer);
        stepElapsed = STEP_DURATION_MS;
        executeScheduledCommand();
        return;
      }
      stepElapsed = elapsed;
    }, 50);
    return () => window.clearInterval(timer);
  });

  const remainingRatio = $derived(
    (STEP_DURATION_MS - Math.max(STEP_READING_MS, stepElapsed)) /
      (STEP_DURATION_MS - STEP_READING_MS),
  );
</script>

<section class="game world-tutorial">
  <GameTopbar {worldId} worldIndex={levelIndex} {onBack} />
  <GameHud
    {level}
    activeForm={game.state.activeForm}
    starsRemaining={game.state.stars.length}
    moves={game.state.moves}
    optimalMoves={null}
  />
  <div class="world-tutorial-layout">
    <div class="world-tutorial-board-column">
      <div class="board-wrap">
        <GameBoard {level} gameState={game.state} {skin} {themeName} movement={game.movement} />
      </div>
      <GameControls
        hasSquare={Boolean(level.square)}
        activeForm={game.state.activeForm}
        onMove={game.move}
        onSwitch={game.switchForm}
      />
    </div>
    <aside class="world-tutorial-panel" aria-live="polite">
      <div class="world-tutorial-panel-header">
        <p class="world-tutorial-eyebrow">
          {tutorial === "fire" ? "TUTORIEL FEU" : `TUTORIEL MONDE ${worldId}`}
          · ÉTAPE {Math.min(stepIndex + 1, steps.length)}/{steps.length}
        </p>
        <Button
          icon="reset"
          ariaLabel="Recommencer le niveau"
          onclick={game.reset}
          variant="secondary"
          class="world-tutorial-reset"
        />
      </div>
      <h1>{finished ? "C’est compris !" : current?.title}</h1>
      <p class="world-tutorial-description">
        {finished
          ? "Tu peux maintenant jouer ce niveau avec les commandes habituelles."
          : current?.description}
      </p>
      {#if !finished}
        <div class="world-tutorial-command">
          <div class="world-tutorial-command-row">
            <span>{current?.command ? "ACTION ATTENDUE" : "LIS LA CONSIGNE"}</span>
            {#if current?.command}<kbd>{describeCommand(current.command)}</kbd>{/if}
          </div>
          <div
            class="world-tutorial-timer"
            role="timer"
            aria-label="Temps restant avant la fin de l’étape"
          >
            <div
              class="world-tutorial-timer-bar"
              style="width: {Math.max(0, Math.min(100, remainingRatio * 100))}%"
            ></div>
          </div>
        </div>
      {/if}
      <ol class="world-tutorial-stepper">
        {#each steps as step, index (`${step.title}-${index}`)}
          <li
            class={index === stepIndex && !finished ? "is-active" : index < stepIndex || finished ? "is-done" : ""}
            aria-current={index === stepIndex && !finished ? "step" : undefined}
          >
            <span>{index < stepIndex || finished ? "✓" : index + 1}</span>
            {step.title}
          </li>
        {/each}
      </ol>
      {#if finished}
        <Button icon="arrowRight" iconSize={20} label="JOUER LE NIVEAU" onclick={onFinish} variant="primary" autofocus />
      {/if}
    </aside>
  </div>
</section>
