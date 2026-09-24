import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";
import { OverlayIllustration } from "../components/OverlayIllustration";
import { useEffect, useRef, useState } from "react";

function formatTime(elapsedMs: number): string {
  const totalSeconds = elapsedMs / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function CompletionOverlay({
  worldId,
  worldIndex,
  worldLength,
  hasNextWorld,
  completed,
  moves,
  elapsedMs,
  optimalMoves,
  stars,
  score,
  onReset,
  onNext,
}: {
  worldId: number;
  worldIndex: number;
  worldLength: number;
  hasNextWorld: boolean;
  completed: boolean;
  moves: number;
  elapsedMs: number;
  optimalMoves: number | null;
  stars: 1 | 2 | 3 | null;
  score: number | null;
  onReset: () => void;
  onNext: () => void;
}) {
  const changingWorld = worldIndex === worldLength - 1 && hasNextWorld;
  const [activeIndex, setActiveIndex] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!completed) return;
    const focusButton = (index: number) => {
      const nextIndex = (index + 2) % 2;
      setActiveIndex(nextIndex);
      buttonsRef.current[nextIndex]?.focus();
    };
    focusButton(1);
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        document.activeElement instanceof HTMLButtonElement
      ) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        buttonsRef.current[activeIndex]?.click();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        focusButton(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
      }
    };
    dialogRef.current?.addEventListener("keydown", onKeyDown);
    return () => dialogRef.current?.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, completed]);

  if (!completed) return null;

  return (
    <div className="overlay">
      <div
        className="modal completion-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
      >
        {/* Le carré n'existe pas en monde 1 : aucun popin de fin de niveau du
            monde 1 ne doit le montrer (il est introduit en monde 2) — sauf le
            popin de passage de monde, qui est justement l'annonce de son
            arrivée. Attention, `worldIndex` est l'index du *niveau* dans le
            monde, pas le numéro du monde. */}
        <OverlayIllustration
          variant={changingWorld ? "world-transition" : "victory"}
          showSquare={changingWorld || worldId > 1}
        />
        <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>

        {stars !== null && (
          <div
            className="completion-stars"
            aria-label={`${stars} étoiles sur 3`}
          >
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className={index < stars ? "earned" : ""}>
                ★
              </span>
            ))}
          </div>
        )}

        <div className="completion-stats">
          <div>
            <span>COUPS</span>
            <strong>{moves}</strong>
            {optimalMoves !== null && <small>optimal {optimalMoves}</small>}
          </div>
          <div>
            <span>TEMPS</span>
            <strong>{formatTime(elapsedMs)}</strong>
          </div>
          {score !== null && (
            <div>
              <span>SCORE</span>
              <strong>{score}</strong>
            </div>
          )}
        </div>

        {optimalMoves !== null && (
          <div
            className="completion-progress"
            aria-label="Efficacité des coups"
          >
            <div
              className="completion-progress-bar"
              style={{
                width: `${Math.min(100, Math.round((optimalMoves / Math.max(1, moves)) * 100))}%`,
              }}
            />
          </div>
        )}

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
            ref={(node) => {
              buttonsRef.current[0] = node;
            }}
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
            ref={(node) => {
              buttonsRef.current[1] = node;
            }}
          />
        </div>
      </div>
    </div>
  );
}
