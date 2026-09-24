import type { Level } from "@duality/level-format";

export function GameHud({
  level,
  activeForm,
  starsRemaining,
  moves,
  optimalMoves,
}: {
  level: Level;
  activeForm: "ball" | "square";
  starsRemaining: number;
  moves: number;
  optimalMoves: number | null;
}) {
  const progress =
    optimalMoves === null || moves === 0
      ? 0
      : Math.min(100, Math.round((optimalMoves / moves) * 100));
  return (
    <div className="hud">
      <b>{activeForm === "ball" ? "● BOULE" : "■ CARRÉ"}</b>
      <br />
      <div
        className="hud-progress"
        role="progressbar"
        aria-label="Coups par rapport au parcours optimal"
        aria-valuemin={0}
        aria-valuemax={optimalMoves ?? undefined}
        aria-valuenow={moves}
      >
        <div className="hud-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <span className="muted">
        ★ {level.stars.length - starsRemaining}/{level.stars.length} · {moves}{" "}
        COUPS
        {optimalMoves !== null ? ` / OPTIMAL ${optimalMoves}` : ""} · swipe ou
        flèches
      </span>
    </div>
  );
}
