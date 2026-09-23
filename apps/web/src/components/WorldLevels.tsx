import { useNavigate, useParams, Navigate } from "react-router";
import { worlds } from "../levels/campaign";
import {
  isWorldCompleted,
  isLevelCompleted,
  isWorldUnlocked,
  getNextWorld,
  getLevelResult,
} from "../progression";
import { ArrowLeft, ArrowRight } from "./Icons";
import { Button } from "./Button";

export function WorldLevels() {
  const navigate = useNavigate();
  const { worldId } = useParams();
  const id = Number(worldId);
  const world = worlds.find((item) => item.id === id);

  if (!world) return <Navigate to="/menu" replace />;
  if (world.status !== "available") return <Navigate to="/menu" replace />;
  if (!isWorldUnlocked(world.id)) return <Navigate to="/menu" replace />;

  const completed = isWorldCompleted(world.id);
  const nextWorld = completed ? getNextWorld(world.id) : null;

  return (
    <section className="menu">
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          label="MONDES"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <b>MONDE {world.id}</b>
      </div>
      <h2 className="subtitle">{world.name.toUpperCase()}</h2>
      <div className="world-progress-summary">
        <span>
          {world.levels.filter((level) => isLevelCompleted(level.id)).length}/
          {world.levels.length} NIVEAUX
        </span>
        <span>
          {world.levels.reduce(
            (total, level) => total + (getLevelResult(level.id)?.stars ?? 0),
            0,
          )}
          /{world.levels.length * 3} ★
        </span>
      </div>
      <div className="levels">
        {world.levels.map((level, index) => {
          const unlocked =
            index === 0 || isLevelCompleted(world.levels[index - 1].id);
          const done = isLevelCompleted(level.id);
          return (
            <button
              className="level-button"
              disabled={!unlocked}
              onClick={() => navigate(`/world/${world.id}/level/${level.id}`)}
              key={level.id}
            >
              {done ? (
                <>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span
                    className="level-stars"
                    aria-label={`${getLevelResult(level.id)?.stars ?? 1} étoiles`}
                  >
                    {"★".repeat(getLevelResult(level.id)?.stars ?? 1)}
                  </span>
                </>
              ) : unlocked ? (
                String(index + 1).padStart(2, "0")
              ) : (
                "🔒"
              )}
            </button>
          );
        })}
      </div>
      {/* Le passage au monde suivant apparaît dès que celui-ci est terminé. */}
      {nextWorld && (
        <Button
          icon={<ArrowRight size={18} />}
          label={`MONDE ${nextWorld.id} · ${nextWorld.name.toUpperCase()}`}
          onClick={() => navigate(`/world/${nextWorld.id}`)}
          variant="primary"
          className="world-next"
        />
      )}
    </section>
  );
}
