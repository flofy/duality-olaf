import { BallCharacter, SquareCharacter } from "./Characters";

type OverlayIllustrationProps = {
  variant: "game-over" | "victory" | "world-transition";
};

/** Decorative, reusable illustration stage for modal headers. */
export function OverlayIllustration({ variant }: OverlayIllustrationProps) {
  if (variant === "game-over") {
    return (
      <div className="modal-illustration modal-illustration--game-over" aria-hidden="true">
        <span className="illustration-spark illustration-spark--one">✦</span>
        <span className="illustration-spark illustration-spark--two">✦</span>
        <span className="illustration-crystal illustration-crystal--left" />
        <span className="illustration-crystal illustration-crystal--right" />
        <BallCharacter size={96} expression="defeated" className="modal-illustration__character" />
      </div>
    );
  }

  if (variant === "world-transition") {
    return (
      <div className="modal-illustration modal-illustration--transition" aria-hidden="true">
        <span className="illustration-spark illustration-spark--one">✦</span>
        <span className="illustration-spark illustration-spark--two">✦</span>
        <span className="illustration-portal">
          <span className="illustration-portal__core" />
        </span>
        <BallCharacter size={64} expression="happy" className="modal-illustration__character modal-illustration__character--ball" />
        <SquareCharacter size={64} expression="happy" className="modal-illustration__character modal-illustration__character--square" />
      </div>
    );
  }

  return (
    <div className="modal-illustration modal-illustration--victory" aria-hidden="true">
      <span className="illustration-spark illustration-spark--one">✦</span>
      <span className="illustration-spark illustration-spark--two">✦</span>
      <span className="illustration-star illustration-star--one">★</span>
      <span className="illustration-star illustration-star--two">★</span>
      <span className="illustration-burst" />
      <BallCharacter size={82} expression="happy" className="modal-illustration__character modal-illustration__character--ball" />
      <SquareCharacter size={82} expression="happy" className="modal-illustration__character modal-illustration__character--square" />
    </div>
  );
}
