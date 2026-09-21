import { useNavigate } from "react-router";
import { ArrowLeft } from "./Icons";
import { Button } from "./Button";

const rules: [string, string][] = [
  ["BALLE", "Déplace la balle avec les flèches ou en glissant sur mobile."],
  [
    "FORME",
    "Appuie sur ENTRÉE (ou le bouton carré) pour changer de forme entre balle et carré.",
  ],
  [
    "PORTES",
    "Une porte bloque le passage tant qu'un interrupteur lié ne l'a pas ouverte.",
  ],
  [
    "TÉLÉPORTER",
    "Atterris sur un portail pour ressortir par son portail associé.",
  ],
  ["OBJECTIF", "Ramasse toutes les étoiles ★ pour terminer."],
  ["RACCOURCIS", "R recommence · ÉCHAP menu · ENTRÉE suivant."],
];

export function Help() {
  const navigate = useNavigate();

  return (
    <section className="help">
      <Button
        icon={<ArrowLeft size={18} />}
        label="RETOUR"
        onClick={() => navigate("/menu")}
        variant="secondary"
      />
      <h1 className="title">COMMENT JOUER ?</h1>
      {rules.map(([title, text]) => (
        <section key={title}>
          <b className="subtitle">{title}</b>
          <p>{text}</p>
        </section>
      ))}
    </section>
  );
}
