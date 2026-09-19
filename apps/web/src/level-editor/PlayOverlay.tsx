import { LabGame } from "../LevelLab";
import { getActiveThemeName } from "../theme";
import { resolveLevelSkin } from "../skins";
import type { Level } from "@duality/level-format";
import { XIcon } from "../components/Icons";

type PlayOverlayProps = {
  level: Level;
  onClose: () => void;
  onComplete: (message: string) => void;
};

export function PlayOverlay({ level, onClose, onComplete }: PlayOverlayProps) {
  const skin = resolveLevelSkin(level.id);
  const themeName = getActiveThemeName();
  return (
    <div className="editor-play-overlay">
      <div className="editor-play-panel">
        <div className="topbar">
          <b>TEST · {level.id}</b>
          <button
            className="action"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <XIcon size={14} color="currentColor" />
            FERMER
          </button>
        </div>
        <LabGame
          level={level}
          skin={skin}
          themeName={themeName}
          onCompletionChange={(completion) =>
            completion &&
            onComplete(`✓ Test terminé en ${completion.moves} coups`)
          }
          onBackToGenerator={onClose}
        />
      </div>
    </div>
  );
}
