import { useNavigate } from "react-router";
import { halloween } from "@duality/level-format";
import { getLevelResult, isLevelCompleted } from "../progression";
import { Button } from "./Button";
import { ArrowLeft, ArrowRight } from "./Icons";

export function SeasonalLevels() {
  const navigate = useNavigate();
  const completed = halloween.levels.filter((level) =>
    isLevelCompleted(level.id),
  ).length;
  const stars = halloween.levels.reduce(
    (total, level) => total + (getLevelResult(level.id)?.stars ?? 0),
    0,
  );

  return (
    <section className="menu halloween-levels-page">
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          label="MENU"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <b>ÉVÉNEMENT SAISONNIER</b>
      </div>
      <div
        className="halloween-hero"
        role="img"
        aria-label="Halloween : chauves-souris, citrouilles et lune violette"
      >
        <span className="halloween-hero-moon" aria-hidden="true">
          ☾
        </span>
        <span className="halloween-hero-bat" aria-hidden="true">
          🦇
        </span>
        <span className="halloween-hero-pumpkin" aria-hidden="true">
          🎃
        </span>
        <span className="halloween-hero-title">HALLOWEEN</span>
        <span className="halloween-hero-subtitle">
          UNE AVENTURE QUI DONNE DES FRISSONS
        </span>
      </div>
      <div className="halloween-progress">
        <span>
          {completed}/{halloween.levels.length} NIVEAUX
        </span>
        <span>
          {stars}/{halloween.levels.length * 3} ★
        </span>
      </div>
      <p className="muted halloween-intro">
        Récupère toutes les étoiles dans des niveaux hantés. La boule
        chauve-souris et le carré Frankenstein t'accompagnent !
      </p>
      <div className="halloween-level-list">
        {halloween.levels.map((level, index) => {
          const done = isLevelCompleted(level.id);
          const unlocked =
            index === 0 || isLevelCompleted(halloween.levels[index - 1]!.id);
          return (
            <button
              type="button"
              className="halloween-level-card"
              key={level.id}
              disabled={!unlocked}
              onClick={() => navigate(`/halloween/level/${level.id}`)}
            >
              <span className="halloween-level-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="halloween-level-copy">
                <strong>
                  {[
                    "La nuit des citrouilles",
                    "Le cimetière oublié",
                    "La maison hantée",
                    "L'envol des chauves-souris",
                    "Le réveil des squelettes",
                  ][index] ?? `Défi hanté ${index + 1}`}
                </strong>
                <small>
                  {done
                    ? "NIVEAU TERMINÉ"
                    : unlocked
                      ? `${level.stars.length} étoiles à récupérer`
                      : "Termine le niveau précédent pour débloquer"}
                </small>
              </span>
              <span
                className="halloween-level-status"
                aria-label={
                  done ? "Terminé" : unlocked ? "Disponible" : "Verrouillé"
                }
              >
                {done ? "★" : unlocked ? <ArrowRight size={20} /> : "🔒"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="halloween-footnote">
        Disponible du 13 octobre au 3 novembre.
      </p>
    </section>
  );
}
