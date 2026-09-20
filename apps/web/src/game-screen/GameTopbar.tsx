import { levelLabel } from "../levels/campaign";
import { Button } from "../components/Button";
import { ArrowLeft, ResetIcon as Reset } from "../components/Icons";

export function GameTopbar({
  worldId,
  worldIndex,
  onBack,
  onReset,
}: {
  worldId: number;
  worldIndex: number;
  onBack: () => void;
  onReset: () => void;
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
      <Button
        icon={<Reset size={18} />}
        label="RECOMMENCER"
        onClick={onReset}
        variant="secondary"
        className="topbar-restart"
      />
    </div>
  );
}
