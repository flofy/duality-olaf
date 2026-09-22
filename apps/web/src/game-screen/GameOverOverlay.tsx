import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";
import { BallCharacter, SquareCharacter } from "../components/Characters";
import { useEffect, useRef, useState } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!gameOver) return;
    actionRefs.current[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") { event.preventDefault(); actionRefs.current[activeIndex]?.click(); }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Tab") {
        event.preventDefault();
        setActiveIndex((index) => (index + (event.key === "ArrowLeft" ? 1 : -1) + 2) % 2);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameOver, activeIndex]);

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
          <Button ref={(el) => { actionRefs.current[0] = el; }}
            icon={<Reset size={18} />}
            label="REJOUER"
            onClick={onReset}
            variant="primary"
          />
          <Button ref={(el) => { actionRefs.current[1] = el; }}
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
