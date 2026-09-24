import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";
import { OverlayIllustration } from "../components/OverlayIllustration";
import { useDialogButtonNavigation } from "../components/useDialogButtonNavigation";

export function GameOverOverlay({
  worldId,
  gameOver,
  activeForm,
  onReset,
}: {
  worldId: number;
  gameOver: boolean;
  activeForm: "ball" | "square";
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const { dialogRef, activeIndex } = useDialogButtonNavigation({
    active: gameOver,
    initialIndex: 0,
  });

  if (!gameOver) return null;

  return (
    <div className="overlay">
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
      >
        <OverlayIllustration variant="game-over" activeForm={activeForm} />
        <h2 id="gameover-title">🔥 OUPS… AUX ENFERS !</h2>
        <p>
          Cette forme a disparu dans les enfers. Elle a clairement pris le
          mauvais chemin…
        </p>
        <div className="modal-actions">
          <Button
            icon={<Reset size={18} />}
            label="REJOUER"
            selected={activeIndex === 0}
            onClick={onReset}
            variant="primary"
          />
          <Button
            icon={<ArrowLeft size={18} />}
            label="NIVEAUX"
            selected={activeIndex === 1}
            onClick={() => navigate(`/world/${worldId}`)}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
