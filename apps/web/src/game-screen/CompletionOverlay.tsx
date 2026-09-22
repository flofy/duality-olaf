import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";
import { BallCharacter, SquareCharacter } from "../components/Characters";
import { useEffect, useRef, useState } from "react";

export function CompletionOverlay({
  worldIndex,
  worldLength,
  hasNextWorld,
  completed,
  moves,
  onReset,
  onNext,
}: {
  worldIndex: number;
  worldLength: number;
  hasNextWorld: boolean;
  completed: boolean;
  moves: number;
  onReset: () => void;
  onNext: () => void;
}) {
  if (!completed) return null;

  const changingWorld = worldIndex === worldLength - 1 && hasNextWorld;
  const [activeIndex, setActiveIndex] = useState(1);
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!completed) return;
    actionRefs.current[1]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") { event.preventDefault(); actionRefs.current[activeIndex]?.click(); }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Tab") {
        event.preventDefault();
        setActiveIndex((index) => (index + (event.key === "ArrowLeft" ? -1 : 1) + 2) % 2);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [completed, activeIndex]);

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
      >
        {changingWorld ? (
          <div className="overlay-character-pair" aria-hidden="true">
            <BallCharacter
              size={76}
              expression="happy"
              className="celebration-character"
            />
            <span className="celebration-arrow">→</span>
            <SquareCharacter
              size={76}
              expression="happy"
              className="celebration-character"
            />
          </div>
        ) : (
          <div className="overlay-character" aria-hidden="true">
            <BallCharacter size={76} expression="happy" />
          </div>
        )}
        <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
        <p>{moves} coups</p>
        {changingWorld && (
          <p className="world-transition-message">
            Bravo ! On change de monde… et notre deuxième héros arrive !
          </p>
        )}
        <div className="modal-actions">
          <Button ref={(el) => { actionRefs.current[0] = el; }}
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button ref={(el) => { actionRefs.current[1] = el; }}
            icon={<ArrowRight size={18} />}
            label={
              worldIndex < worldLength - 1
                ? "SUIVANT"
                : hasNextWorld
                  ? "MONDE SUIVANT"
                  : "NIVEAUX"
            }
            onClick={onNext}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
