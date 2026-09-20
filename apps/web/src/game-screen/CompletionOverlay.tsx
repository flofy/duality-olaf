import { Button } from "../components/Button";
import { ArrowRight, ResetIcon as Reset } from "../components/Icons";

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

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
      >
        <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
        <p>{moves} coups</p>
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
