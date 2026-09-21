import { useNavigate } from "react-router";
import { worlds, campaign } from "../levels/campaign";
import {
  getCompletedCount,
  isLevelCompleted,
  isWorldUnlocked,
} from "../progression";
import { ArrowRight, Help as HelpIcon } from "./Icons";
import { Button } from "./Button";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";

export function Menu() {
  const navigate = useNavigate();

  return (
    <section className="menu">
      <h1 className="title">DUALITY</h1>
      <div className="subtitle">CHOISIS TON MONDE</div>
      <div className="world-list">
        {worlds.map((world) => {
          const done = world.levels.filter((level) =>
            isLevelCompleted(level.id),
          ).length;
          // Un monde ne s'ouvre qu'une fois le précédent entièrement terminé.
          const unlocked =
            world.status === "available" && isWorldUnlocked(world.id);
          const meta =
            world.status !== "available"
              ? `${world.subtitle} • BIENTÔT`
              : !unlocked
                ? `${world.subtitle} • 🔒 FINIS LE MONDE ${world.id - 1}`
                : done === world.levels.length
                  ? `${world.subtitle} • ✓ TERMINÉ`
                  : `${world.subtitle} • ${done}/${world.levels.length}`;
          return (
            <div key={world.id} style={{ position: "relative" }}>
              <Button
                icon={<ArrowRight size={20} />}
                label={`MONDE ${world.id} — ${world.name.toUpperCase()}`}
                onClick={() => navigate(`/world/${world.id}`)}
                disabled={!unlocked}
                variant="primary"
                className="world-button"
              />
              <div className="world-meta">{meta}</div>
            </div>
          );
        })}
      </div>
      <p className="muted">
        {getCompletedCount()} terminé(s) · {campaign.length} jouables
      </p>
      <div className="modal-actions">
        <Button
          icon={<HelpIcon size={18} />}
          label="AIDE"
          onClick={() => navigate("/help")}
          variant="secondary"
        />
        {isLevelLabEnabled && (
          <button
            className="action dev-entry"
            onClick={() => navigate("/dev/levels")}
          >
            🧪 LEVEL LAB
          </button>
        )}
      </div>
    </section>
  );
}
