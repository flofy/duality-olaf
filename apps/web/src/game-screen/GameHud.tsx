import type { Level } from "@duality/level-format";

export function GameHud({
  level,
  activeForm,
  starsRemaining,
  moves,
}: {
  level: Level;
  activeForm: "ball" | "square";
  starsRemaining: number;
  moves: number;
}) {
  return (
    <div className="hud">
      <b>{activeForm === "ball" ? "● BOULE" : "■ CARRÉ"}</b>
      <br />
      <span className="muted">
        ★ {level.stars.length - starsRemaining}/{level.stars.length} · {moves}{" "}
        COUPS · swipe ou flèches
      </span>
    </div>
  );
}
