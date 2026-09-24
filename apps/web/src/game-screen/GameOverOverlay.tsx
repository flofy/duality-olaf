import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";
import { OverlayIllustration } from "../components/OverlayIllustration";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!gameOver) return;
    buttonsRef.current[0]?.focus();
    const focusButton = (index: number) => {
      const nextIndex = (index + 2) % 2;
      setActiveIndex(nextIndex);
      buttonsRef.current[nextIndex]?.focus();
    };
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
        focusButton(activeIndex + (event.key === "ArrowLeft" ? 1 : -1));
      }
    };
    dialogRef.current?.addEventListener("keydown", onKeyDown);
    return () => dialogRef.current?.removeEventListener("keydown", onKeyDown);
  }, [gameOver, activeIndex]);

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
            onClick={onReset}
            variant="primary"
            ref={(node) => {
              buttonsRef.current[0] = node;
            }}
          />
          <Button
            icon={<ArrowLeft size={18} />}
            label="NIVEAUX"
            onClick={() => navigate(`/world/${worldId}`)}
            variant="secondary"
            ref={(node) => {
              buttonsRef.current[1] = node;
            }}
          />
        </div>
      </div>
    </div>
  );
}
