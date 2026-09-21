import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "./Icons";
import { Button } from "./Button";

export function Intro() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const continueIntro = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => navigate("/menu"), 420);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        continueIntro();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section
      className={`intro ${leaving ? "intro-leaving" : ""}`}
      onClick={continueIntro}
      role="button"
      tabIndex={0}
      aria-label="Entrer dans Duality"
    >
      <div className="intro-grid" />
      <div className="intro-logo">
        <span className="intro-ball">●</span>
        <span>DUALITY</span>
        <span className="intro-square">■</span>
      </div>
      <p className="intro-tagline">DEUX FORMES · UN SEUL CHEMIN</p>
      <div className="intro-demo">
        <div className="intro-track">
          <span className="intro-demo-ball">●</span>
          <span className="intro-star">★</span>
          <span className="intro-demo-square">■</span>
        </div>
        <span className="intro-switch">● ⇄ ■</span>
      </div>
      <Button
        icon={<ArrowRight size={20} />}
        label="JOUER"
        onClick={(event) => {
          event.stopPropagation();
          continueIntro();
        }}
        className="intro-start"
        variant="primary"
      />
      <span className="intro-hint">ENTRÉE · ESPACE · CLIQUER</span>
    </section>
  );
}
