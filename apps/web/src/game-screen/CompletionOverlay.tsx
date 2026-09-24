import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";
import { OverlayIllustration } from "../components/OverlayIllustration";
import { useDialogButtonNavigation } from "../components/useDialogButtonNavigation";

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
  const { dialogRef, activeIndex } = useDialogButtonNavigation({
    active: completed,
    initialIndex: 1,
  });

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
            selected={activeIndex === 0}
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
            selected={activeIndex === 1}
            onClick={onNext}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
