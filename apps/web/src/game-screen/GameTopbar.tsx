import { levelLabel } from "../levels/campaign";
import { Button } from "../components/Button";
import { ArrowLeft } from "../components/Icons";

export function GameTopbar({
  worldId,
  worldIndex,
  onBack,
}: {
  worldId: number;
  worldIndex: number;
  onBack: () => void;
}) {
  return (
    <div className="topbar">
      {/* Retour au monde : icône seule (le contexte « MONDE x » est déjà dans
          le titre), d'où le libellé porté par aria-label. */}
      <Button
        icon={<ArrowLeft size={18} />}
        aria-label={`Retour aux niveaux · monde ${worldId}`}
        onClick={onBack}
        variant="secondary"
      />
      <b>
        {levelLabel(worldIndex)} · MONDE {worldId}
      </b>
    </div>
  );
}
