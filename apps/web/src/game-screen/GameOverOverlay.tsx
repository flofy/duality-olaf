import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";

export function GameOverOverlay({
  worldId,
  gameOver,
  onReset,
}: {
  worldId: number;
  gameOver: boolean;
  onReset: () => void;
}) {
  const navigate = useNavigate();

  if (!gameOver) return null;

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
      >
        <h2 id="gameover-title">✗ GAME OVER</h2>
        <p>Une forme est sortie du niveau…</p>
        <div className="modal-actions">
          <Button
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button
            icon={<ArrowLeft size={18} />}
            label="NIVEAUX"
            onClick={() => navigate(`/world/${worldId}`)}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
