import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Level } from "@duality/level-format";
import { solveLevel, type SolverCommand } from "@duality/game";
import { Button } from "./Button";
import { ArrowRight, ResetIcon as Reset } from "./Icons";
import { GameBoard } from "../GameBoard";
import { GameControls } from "../game-screen/GameControls";
import { GameHud } from "../game-screen/GameHud";
import { GameTopbar } from "../game-screen/GameTopbar";
import { resolveLevelSkin } from "../skins";
import { getActiveThemeName } from "../theme";
import { useLevelGameplay, type GameplayDirection } from "../useLevelGameplay";

type TutorialStep = {
  title: string;
  description: string;
  command: SolverCommand | null;
};

type WorldTutorialProps = {
  level: Level;
  worldId: number;
  levelIndex: number;
  tutorial?: "world" | "fire";
  onFinish: () => void;
  onBack: () => void;
};

const STEP_READING_MS = 2200;
const STEP_ACTION_MS = 5000;
const STEP_DURATION_MS = STEP_READING_MS + STEP_ACTION_MS;

function describeCommand(command: SolverCommand): string {
  if (command.type === "switch") return "ESPACE";
  return command.direction.x < 0
    ? "←"
    : command.direction.x > 0
      ? "→"
      : command.direction.y < 0
        ? "↑"
        : "↓";
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
        title:
          index === commands.length - 1
            ? "Finir sans toucher le feu"
            : `Contourner le feu · ${index + 1}`,
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

export function WorldTutorial({
  level,
  worldId,
  levelIndex,
  tutorial = "world",
  onFinish,
  onBack,
}: WorldTutorialProps) {
  const solution = useMemo(() => solveLevel(level), [level]);
  const steps = useMemo(
    () =>
      buildTutorialSteps(
        worldId,
        solution.solvable ? solution.commands : [],
        tutorial,
      ),
    [solution.commands, tutorial, worldId],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stepElapsed, setStepElapsed] = useState(0);
  const current = steps[stepIndex];
  const skin = resolveLevelSkin(level.id) ?? "default";
  const advanceStep = useCallback(() => {
    setStepElapsed(0);
    if (stepIndex >= steps.length - 1) {
      setFinished(true);
    } else {
      setStepIndex((index) => index + 1);
    }
  }, [stepIndex, steps.length]);

  const handleTutorialMove = useCallback(
    (direction: GameplayDirection, moved: boolean) => {
      if (
        moved &&
        !finished &&
        current?.command?.type === "move" &&
        current.command.direction.x === direction.x &&
        current.command.direction.y === direction.y
      ) {
        advanceStep();
      }
    },
    [advanceStep, current, finished],
  );

  const { state, movement, move, reset, switchForm } = useLevelGameplay(
    level,
    onBack,
    handleTutorialMove,
    () => {
      if (!finished && current?.command?.type === "switch") advanceStep();
    },
    undefined,
    resolveLevelSkin(level.id),
  );

  const executeScheduledCommand = useCallback(() => {
    if (!current?.command) {
      // Une étape d’observation n’a pas d’action à jouer sur le plateau.
      advanceStep();
      return;
    }
    if (current.command.type === "switch") {
      switchForm();
      return;
    }
    move(current.command.direction);
  }, [advanceStep, current, move, switchForm]);
  const executeScheduledCommandRef = useRef(executeScheduledCommand);
  executeScheduledCommandRef.current = executeScheduledCommand;

  useEffect(() => {
    if (finished) return;
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= STEP_DURATION_MS) {
        window.clearInterval(timer);
        setStepElapsed(STEP_DURATION_MS);
        executeScheduledCommandRef.current();
        return;
      }
      setStepElapsed(elapsed);
    }, 50);
    return () => window.clearInterval(timer);
  }, [finished, stepIndex]);

  const restartLevel = () => {
    reset();
  };

  return (
    <section className="game world-tutorial">
      <GameTopbar worldId={worldId} worldIndex={levelIndex} onBack={onBack} />
      <GameHud
        level={level}
        activeForm={state.activeForm}
        starsRemaining={state.stars.length}
        moves={state.moves}
        optimalMoves={solution.solvable ? solution.moves : null}
      />
      <div className="world-tutorial-layout">
        <div className="world-tutorial-board-column">
          <div className="board-wrap">
            <GameBoard
              level={level}
              state={state}
              skin={skin}
              themeName={getActiveThemeName()}
              movement={movement}
            />
          </div>
          <GameControls
            hasSquare={Boolean(level.square)}
            activeForm={state.activeForm}
            onMove={move}
            onSwitch={switchForm}
          />
        </div>
        <aside className="world-tutorial-panel" aria-live="polite">
          <div className="world-tutorial-panel-header">
            <p className="world-tutorial-eyebrow">
              {tutorial === "fire"
                ? "TUTORIEL FEU"
                : `TUTORIEL MONDE ${worldId}`}{" "}
              · ÉTAPE {Math.min(stepIndex + 1, steps.length)}/{steps.length}
            </p>
            <Button
              icon={<Reset size={18} />}
              aria-label="Recommencer le niveau"
              onClick={restartLevel}
              variant="secondary"
              className="world-tutorial-reset"
            />
          </div>
          <h1>{finished ? "C’est compris !" : current?.title}</h1>
          <p className="world-tutorial-description">
            {finished
              ? "Tu peux maintenant jouer ce niveau avec les commandes habituelles."
              : current?.description}
          </p>
          {!finished && (
            <div className="world-tutorial-command">
              <div className="world-tutorial-command-row">
                <span>
                  {current?.command ? "ACTION ATTENDUE" : "LIS LA CONSIGNE"}
                </span>
                {current?.command && (
                  <kbd>{describeCommand(current.command)}</kbd>
                )}
              </div>
              <div
                className="world-tutorial-timer"
                role="timer"
                aria-label="Temps restant avant la fin de l’étape"
                aria-valuemin={0}
                aria-valuemax={Math.ceil(
                  (STEP_DURATION_MS - STEP_READING_MS) / 1000,
                )}
                aria-valuenow={Math.max(
                  0,
                  Math.ceil(
                    (STEP_DURATION_MS -
                      Math.max(STEP_READING_MS, stepElapsed)) /
                      1000,
                  ),
                )}
              >
                <div
                  className="world-tutorial-timer-bar"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        ((STEP_DURATION_MS -
                          Math.max(STEP_READING_MS, stepElapsed)) /
                          (STEP_DURATION_MS - STEP_READING_MS)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          <ol className="world-tutorial-stepper">
            {steps.map((step, index) => (
              <li
                key={`${step.title}-${index}`}
                className={
                  index === stepIndex && !finished
                    ? "is-active"
                    : index < stepIndex || finished
                      ? "is-done"
                      : ""
                }
                aria-current={
                  index === stepIndex && !finished ? "step" : undefined
                }
              >
                <span>{index < stepIndex || finished ? "✓" : index + 1}</span>
                {step.title}
              </li>
            ))}
          </ol>
          {finished && (
            <Button
              icon={<ArrowRight size={20} />}
              label="JOUER LE NIVEAU"
              onClick={onFinish}
              variant="primary"
              autoFocus
            />
          )}
        </aside>
      </div>
    </section>
  );
}
