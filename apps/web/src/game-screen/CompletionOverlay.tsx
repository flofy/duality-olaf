import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";
import { OverlayIllustration } from "../components/OverlayIllustration";
import { useEffect, useState } from "react";

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
  useEffect(() => {
    if (!completed) return;
    document
      .querySelector<HTMLButtonElement>(".modal-actions button:nth-child(2)")
      ?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document
          .querySelectorAll<HTMLButtonElement>(".modal-actions button")
          [activeIndex]?.click();
      }
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Tab"
      ) {
        event.preventDefault();
        setActiveIndex(
          (index) => (index + (event.key === "ArrowLeft" ? -1 : 1) + 2) % 2,
        );
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
        <OverlayIllustration
          variant={changingWorld ? "world-transition" : "victory"}
        />
        <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
        <p>{moves} coups</p>
        {changingWorld && (
          <p className="world-transition-message">
            Bravo ! On change de monde… et notre deuxième héros arrive !
          </p>
        )}
        <div className="modal-actions">
          <Button
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button
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
