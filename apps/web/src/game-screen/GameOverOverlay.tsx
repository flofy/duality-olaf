import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";
import { BallCharacter, SquareCharacter } from "../components/Characters";

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

  if (!gameOver) return null;

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
      >
        <div className="overlay-character overlay-character--defeated">
          {activeForm === "ball" ? (
            <BallCharacter size={92} expression="defeated" />
          ) : (
            <SquareCharacter size={92} expression="defeated" />
          )}
        </div>
        <h2 id="gameover-title">🔥 OUPS… AUX ENFERS !</h2>
        <p>
          Cette forme a disparu dans les enfers. Elle a clairement pris le
          mauvais chemin…
        </p>
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
