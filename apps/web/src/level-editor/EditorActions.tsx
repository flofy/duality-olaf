import type { LevelValidation } from "@duality/game";
import { useRef, type ChangeEvent } from "react";

type EditorActionsProps = {
  message: string;
  validation: LevelValidation | null;
  targetWorld: number | null;
  inferredWorld: number;
  showImportText: boolean;
  pastedJson: string;
  onValidate: () => void;
  onTest: () => void;
  onCopyJson: () => void;
  onSaveToServer: () => void;
  onTargetWorldChange: (world: number | null) => void;
  onToggleImportText: () => void;
  onPasteJsonChange: (value: string) => void;
  onImportPasted: () => void;
  onImportFile: (file: File) => void;
  onExport: () => void;
};

export function EditorActions({
  message,
  validation,
  targetWorld,
  inferredWorld,
  showImportText,
  pastedJson,
  onValidate,
  onTest,
  onCopyJson,
  onSaveToServer,
  onTargetWorldChange,
  onToggleImportText,
  onPasteJsonChange,
  onImportPasted,
  onImportFile,
  onExport,
}: EditorActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onImportFile(file);
  };

  return (
    <>
      <div className="editor-section-title">ACTIONS</div>
      <label>
        MONDE CIBLE (ÉCRITURE LOCALE)
        <select
          value={targetWorld ?? ""}
          onChange={(e) =>
            onTargetWorldChange(
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        >
          <option value="">
            {inferredWorld >= 1
              ? `auto · monde ${inferredWorld} (d'après l'id)`
              : "auto — aucun monde dans l'id"}
          </option>
          {[1, 2, 3, 4, 5].map((world) => (
            <option key={world} value={world}>
              monde {world}
            </option>
          ))}
        </select>
      </label>
      <button className="action editor-action" onClick={onValidate}>
        ⚡ VALIDER / RÉSOUDRE
      </button>
      <button className="action editor-action" onClick={onTest}>
        ▶ TESTER LE NIVEAU
      </button>
      <button className="action editor-action" onClick={onCopyJson}>
        ⧉ COPIER LE JSON
      </button>
      <button className="action editor-action" onClick={onSaveToServer}>
        ⬇ ÉCRIRE SUR LE DISQUE
      </button>
      <button
        className="action editor-action"
        onClick={() => fileInputRef.current?.click()}
      >
        ⇪ IMPORTER (FICHIER)
      </button>
      <button className="action editor-action" onClick={onToggleImportText}>
        ⇪ IMPORTER (COLLER){showImportText ? " ▴" : " ▾"}
      </button>
      {showImportText && (
        <div className="editor-import-text">
          <textarea
            value={pastedJson}
            placeholder='{"id": "custom-01", "width": 13, ...}'
            onChange={(e) => onPasteJsonChange(e.target.value)}
            rows={8}
            spellCheck={false}
          />
          <button
            className="action editor-action"
            disabled={!pastedJson.trim()}
            onClick={onImportPasted}
          >
            CHARGER LE JSON
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={importJson}
        hidden
      />
      <button className="action editor-action" onClick={onExport}>
        ↓ EXPORTER
      </button>
      <div className="editor-status" role="status">
        {message}
      </div>
      {validation && (
        <div
          className={`editor-validation ${validation.result.solvable ? "ok" : "error"}`}
        >
          {validation.result.solvable
            ? `Solvable · ${validation.difficulty?.moves} coups · score ${validation.difficulty?.score}`
            : `Unsolvable · ${validation.result.exploredStates} états explorés`}
        </div>
      )}
    </>
  );
}
