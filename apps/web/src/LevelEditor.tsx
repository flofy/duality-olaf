import { useMemo, useState } from "react";
import {
  cloneLevel,
  sanitizeLevel,
  type Level,
  type Switch,
} from "@duality/level-format";
import { validateLevel, type LevelValidation } from "@duality/game";
import { useNavigate } from "react-router";
import { devLevelById } from "./LevelLab";
import { LevelEditorTools, type LevelEditorTool } from "./LevelEditorTools";
import { EditorActions } from "./level-editor/EditorActions";
import { EditorGrid } from "./level-editor/EditorGrid";
import { PlayOverlay } from "./level-editor/PlayOverlay";
import {
  applyTool,
  blankLevel,
  inferWorld,
  resizeLevel,
} from "./level-editor/levelOps";
import "./level-editor.css";

/** Local write server (tools/level-serve.mjs) — run `pnpm level:serve`. */
const LEVEL_SERVER_URL =
  import.meta.env.VITE_LEVEL_SERVER_URL ?? "http://localhost:34761";

export function LevelEditor({
  initialLevelId = null,
}: {
  initialLevelId?: string | null;
}) {
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level>(() => {
    const initial =
      initialLevelId === null ? undefined : devLevelById.get(initialLevelId);
    // sanitizeLevel drops any junk key a legacy tool may have serialized.
    return initial ? sanitizeLevel(initial) : blankLevel("custom-01", 13, 10);
  });
  const [tool, setTool] = useState<LevelEditorTool>("wall");
  // Which form(s) a newly placed switch reacts to (tool: "switch").
  const [switchForm, setSwitchForm] = useState<Switch["form"]>("either");
  const [message, setMessage] = useState(
    initialLevelId
      ? "Édition d'un niveau existant — modifie puis exporte le JSON"
      : "Prêt à créer un niveau",
  );
  const [playing, setPlaying] = useState(false);
  const [showImportText, setShowImportText] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [targetWorld, setTargetWorld] = useState<number | null>(null);
  const [validation, setValidation] = useState<LevelValidation | null>(null);
  // Always display / copy / export a sanitized level: no junk keys.
  const json = useMemo(
    () => JSON.stringify(sanitizeLevel(level), null, 2),
    [level],
  );
  const inferredWorld = inferWorld(level.id);

  const update = (next: Level) => {
    setLevel(next);
    setValidation(null);
  };

  const paint = (x: number, y: number) => {
    const next = cloneLevel(level);
    applyTool(next, tool, x, y, { switchForm });
    update(next);
  };

  const newLevel = () => {
    update(blankLevel("custom-01", level.width, level.height));
    setPlaying(false);
    setMessage("Nouveau niveau");
  };

  const resize = (width: number, height: number) => {
    const next = resizeLevel(level, width, height);
    if (next) update(next);
  };

  const validate = () => {
    const result = validateLevel(level);
    setValidation(result);
    setMessage(
      result.result.solvable
        ? `✓ Solvable en ${result.difficulty?.moves} coups`
        : "✗ Niveau non solvable",
    );
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(json);
    setMessage("JSON copié dans le presse-papiers");
  };

  const saveToServer = async () => {
    const world = targetWorld ?? inferredWorld;
    if (world < 1 || world > 5) {
      setMessage(
        "✗ Monde cible inconnu — l'id doit suivre world-N-level-XX ou choisis un monde",
      );
      return;
    }
    try {
      const response = await fetch(`${LEVEL_SERVER_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: sanitizeLevel(level), world }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        errors?: string[];
      };
      if (response.ok && payload.ok) {
        setMessage(`💾 ${payload.message}`);
      } else {
        setMessage(`✗ ${payload.errors?.join(" · ") ?? "écriture refusée"}`);
      }
    } catch {
      setMessage(
        `✗ Serveur local introuvable (${LEVEL_SERVER_URL}) — lance « pnpm level:serve »`,
      );
    }
  };

  const applyImport = (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Level;
      if (
        typeof parsed.id !== "string" ||
        !Array.isArray(parsed.tiles) ||
        typeof parsed.width !== "number" ||
        typeof parsed.height !== "number" ||
        !Array.isArray(parsed.stars)
      ) {
        throw new Error("structure");
      }
      update(sanitizeLevel(parsed));
      setMessage(`✓ Niveau importé · ${parsed.id}`);
      return true;
    } catch {
      setMessage("✗ JSON invalide — import annulé");
      return false;
    }
  };

  const importFile = (file: File) => {
    void file.text().then(applyImport);
  };

  const importPasted = () => {
    if (applyImport(pastedJson.trim())) {
      setPastedJson("");
      setShowImportText(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${level.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="dev-editor">
      <div className="topbar">
        <button className="action" onClick={() => navigate("/dev/levels")}>
          ← LAB
        </button>
        <b>LEVEL EDITOR</b>
        <button className="action" onClick={newLevel}>
          ＋ NOUVEAU
        </button>
      </div>
      <p className="dev-banner">
        DEV ONLY · construis, valide et teste tes propres niveaux
      </p>
      <div className="editor-layout">
        <aside className="editor-sidebar">
          <label>
            ID DU NIVEAU
            <input
              value={level.id}
              onChange={(e) => setLevel((l) => ({ ...l, id: e.target.value }))}
            />
          </label>
          <div className="editor-size">
            <label>
              LARGEUR
              <input
                type="number"
                min="3"
                max="20"
                value={level.width}
                onChange={(e) => resize(Number(e.target.value), level.height)}
              />
            </label>
            <label>
              HAUTEUR
              <input
                type="number"
                min="3"
                max="20"
                value={level.height}
                onChange={(e) => resize(level.width, Number(e.target.value))}
              />
            </label>
          </div>
          <div className="editor-section-title">OUTILS</div>
          <LevelEditorTools selected={tool} onSelect={setTool} />
          {tool === "switch" && (
            <>
              <div className="editor-section-title">
                RÉACTION DE L'INTERRUPTEUR
              </div>
              <div
                className="editor-tools"
                role="radiogroup"
                aria-label="Forme activatrice de l'interrupteur"
              >
                {(
                  [
                    { form: "either", glyph: "●⇄■", label: "Les deux" },
                    { form: "ball", glyph: "●", label: "Boule" },
                    { form: "square", glyph: "■", label: "Carré" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.form}
                    type="button"
                    className={`editor-tool ${switchForm === item.form ? "selected" : ""}`}
                    onClick={() => setSwitchForm(item.form)}
                    title={item.label}
                    aria-pressed={switchForm === item.form}
                  >
                    <span>{item.glyph}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
          <EditorActions
            message={message}
            validation={validation}
            targetWorld={targetWorld}
            inferredWorld={inferredWorld}
            showImportText={showImportText}
            pastedJson={pastedJson}
            onValidate={validate}
            onTest={() => setPlaying(true)}
            onCopyJson={() => void copyJson()}
            onSaveToServer={() => void saveToServer()}
            onTargetWorldChange={setTargetWorld}
            onToggleImportText={() => setShowImportText((v) => !v)}
            onPasteJsonChange={setPastedJson}
            onImportPasted={importPasted}
            onImportFile={importFile}
            onExport={exportJson}
          />
        </aside>
        <div className="editor-workspace">
          <div className="editor-board-shell">
            <EditorGrid level={level} tool={tool} onPaint={paint} />
          </div>
          <p className="editor-hint">
            Clique (ou clique-glisse pour les murs, piques et cases vides) pour
            appliquer l'outil sélectionné. Le carré est optionnel : re-clique
            sur sa case pour le retirer. Les piques sont mortelles : une pièce
            qui glisse dessus déclenche un game over. Les éléments mécaniques
            sont créés avec des identifiants automatiques.
          </p>
          <details className="editor-json">
            <summary>JSON du niveau</summary>
            <pre>{json}</pre>
          </details>
        </div>
      </div>
      {playing && (
        <PlayOverlay
          level={level}
          onClose={() => setPlaying(false)}
          onComplete={(text) => setMessage(text)}
        />
      )}
    </section>
  );
}
