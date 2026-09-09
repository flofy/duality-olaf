import { useMemo, useState, type CSSProperties } from "react";
import { createEmptyLevel, type Level, type Tile } from "@duality/level-format";
import { validateLevel } from "@duality/game";
import { LabGame } from "./LevelLab";
import { getActiveThemeName } from "./theme";
import { resolveLevelSkin } from "./skins";

type Tool =
  | "empty"
  | "wall"
  | "star"
  | "ball"
  | "square"
  | "door"
  | "switch"
  | "teleporter";

const tools: Array<{ id: Tool; label: string; glyph: string }> = [
  { id: "empty", label: "Case vide", glyph: "·" },
  { id: "wall", label: "Mur", glyph: "■" },
  { id: "star", label: "Étoile", glyph: "★" },
  { id: "ball", label: "Balle", glyph: "●" },
  { id: "square", label: "Carré", glyph: "■" },
  { id: "door", label: "Porte", glyph: "▣" },
  { id: "switch", label: "Interrupteur", glyph: "⌁" },
  { id: "teleporter", label: "Téléporteur", glyph: "◎" },
];

function blankLevel(id: string, width: number, height: number): Level {
  const level = createEmptyLevel(id);
  level.width = width;
  level.height = height;
  level.tiles = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "empty" as Tile),
  );
  level.ball = { x: Math.min(1, width - 1), y: Math.min(1, height - 1) };
  level.square = { x: Math.min(2, width - 1), y: Math.min(1, height - 1) };
  return level;
}

function clone(level: Level): Level {
  return {
    ...level,
    tiles: level.tiles.map((row) => [...row]),
    ball: { ...level.ball },
    square: { ...level.square },
    stars: level.stars.map((p) => ({ ...p })),
    doors: level.doors?.map((d) => ({ ...d, position: { ...d.position } })),
    switches: level.switches?.map((s) => ({
      ...s,
      position: { ...s.position },
      toggles: [...s.toggles],
    })),
    teleporters: level.teleporters?.map((t) => ({
      ...t,
      position: { ...t.position },
    })),
  };
}

function same(a: { x: number; y: number }, b: { x: number; y: number }) {
  return a.x === b.x && a.y === b.y;
}

export function LevelEditor() {
  const [level, setLevel] = useState<Level>(() =>
    blankLevel("custom-01", 13, 10),
  );
  const [tool, setTool] = useState<Tool>("wall");
  const [message, setMessage] = useState("Prêt à créer un niveau");
  const [playing, setPlaying] = useState(false);
  const [validation, setValidation] = useState<
    ReturnType<typeof validateLevel> | null
  >(null);
  const themeName = getActiveThemeName();
  const skin = resolveLevelSkin(level.id);
  const json = useMemo(() => JSON.stringify(level, null, 2), [level]);

  const update = (mutate: (next: Level) => void) => {
    setLevel((current) => {
      const next = clone(current);
      mutate(next);
      return next;
    });
    setValidation(null);
  };

  const paint = (x: number, y: number) => {
    update((next) => {
      if (tool === "empty" || tool === "wall") next.tiles[y]![x] = tool;
      if (tool === "star") {
        const index = next.stars.findIndex((p) => same(p, { x, y }));
        if (index >= 0) next.stars.splice(index, 1);
        else next.stars.push({ x, y });
      }
      if (tool === "ball") next.ball = { x, y };
      if (tool === "square") next.square = { x, y };
      if (tool === "door") {
        next.doors ??= [];
        const index = next.doors.findIndex((d) => same(d.position, { x, y }));
        if (index >= 0) next.doors.splice(index, 1);
        else {
          next.doors.push({
            id: `door-${next.doors.length + 1}`,
            position: { x, y },
          });
        }
      }
      if (tool === "switch") {
        next.switches ??= [];
        const index = next.switches.findIndex((s) =>
          same(s.position, { x, y }),
        );
        if (index >= 0) next.switches.splice(index, 1);
        else {
          const door = next.doors?.[0];
          next.switches.push({
            id: `switch-${next.switches.length + 1}`,
            position: { x, y },
            form: "either",
            toggles: door ? [door.id] : [],
          });
        }
      }
      if (tool === "teleporter") {
        next.teleporters ??= [];
        const index = next.teleporters.findIndex((t) =>
          same(t.position, { x, y }),
        );
        if (index >= 0) next.teleporters.splice(index, 1);
        else {
          const existing = next.teleporters[0];
          next.teleporters.push({
            id: `teleporter-${next.teleporters.length + 1}`,
            position: { x, y },
            targetId:
              existing?.id ?? `teleporter-${next.teleporters.length + 2}`,
          });
        }
      }
    });
  };

  const newLevel = () => {
    setLevel(blankLevel("custom-01", level.width, level.height));
    setValidation(null);
    setPlaying(false);
    setMessage("Nouveau niveau");
  };

  const resize = (width: number, height: number) => {
    if (width < 3 || height < 3 || width > 20 || height > 20) return;
    setLevel((current) => {
      const next = blankLevel(current.id, width, height);
      for (let y = 0; y < Math.min(height, current.height); y++) {
        for (let x = 0; x < Math.min(width, current.width); x++) {
          next.tiles[y]![x] = current.tiles[y]![x]!;
        }
      }
      next.stars = current.stars.filter((p) => p.x < width && p.y < height);
      next.ball =
        current.ball.x < width && current.ball.y < height
          ? current.ball
          : next.ball;
      next.square =
        current.square.x < width && current.square.y < height
          ? current.square
          : next.square;
      next.doors = current.doors?.filter(
        (d) => d.position.x < width && d.position.y < height,
      );
      next.switches = current.switches?.filter(
        (s) => s.position.x < width && s.position.y < height,
      );
      next.teleporters = current.teleporters?.filter(
        (t) => t.position.x < width && t.position.y < height,
      );
      return next;
    });
    setValidation(null);
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

  return (
    <section className="dev-editor">
      <div className="topbar">
        <button
          className="action"
          onClick={() => {
            window.location.hash = "#/dev/levels";
          }}
        >
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
              onChange={(e) =>
                setLevel((l) => ({ ...l, id: e.target.value }))
              }
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
                onChange={(e) =>
                  resize(Number(e.target.value), level.height)
                }
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
          <div
            className="editor-tools"
            role="toolbar"
            aria-label="Outils de niveau"
          >
            {tools.map((item) => (
              <button
                key={item.id}
                className={`editor-tool ${tool === item.id ? "selected" : ""}`}
                onClick={() => setTool(item.id)}
                title={item.label}
              >
                <span>{item.glyph}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="editor-section-title">ACTIONS</div>
          <button className="action editor-action" onClick={validate}>
            ⚡ VALIDER / RÉSOUDRE
          </button>
          <button
            className="action editor-action"
            onClick={() => setPlaying(true)}
          >
            ▶ TESTER LE NIVEAU
          </button>
          <button className="action editor-action" onClick={copyJson}>
            ⧉ COPIER LE JSON
          </button>
          <button
            className="action editor-action"
            onClick={() => {
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${level.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
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
        </aside>
        <div className="editor-workspace">
          <div
            className="editor-board board"
            style={
              { "--cols": level.width, "--rows": level.height } as CSSProperties
            }
            aria-label="Grille d'édition"
          >
            {level.tiles.flatMap((row, y) =>
              row.map((tile, x) => {
                const star = level.stars.some((p) => p.x === x && p.y === y);
                const ball = same(level.ball, { x, y });
                const square = same(level.square, { x, y });
                const door = level.doors?.find((d) =>
                  same(d.position, { x, y }),
                );
                const sw = level.switches?.find((s) =>
                  same(s.position, { x, y }),
                );
                const tp = level.teleporters?.find((t) =>
                  same(t.position, { x, y }),
                );
                return (
                  <button
                    type="button"
                    key={`${x}-${y}`}
                    className={`editor-cell ${tile === "wall" ? "wall" : ""}`}
                    style={{ gridColumn: x + 1, gridRow: y + 1 }}
                    onClick={() => paint(x, y)}
                    aria-label={`Case ${x + 1}, ${y + 1}`}
                  >
                    {ball && <span className="editor-entity ball">●</span>}
                    {square && <span className="editor-entity square">■</span>}
                    {star && <span className="editor-entity star">★</span>}
                    {door && <span className="editor-entity door">▣</span>}
                    {sw && <span className="editor-entity switch">⌁</span>}
                    {tp && <span className="editor-entity teleporter">◎</span>}
                  </button>
                );
              }),
            )}
          </div>
          <p className="editor-hint">
            Clique une case pour appliquer l'outil sélectionné. Les éléments
            mécaniques sont créés avec des identifiants automatiques.
          </p>
          <details className="editor-json">
            <summary>JSON du niveau</summary>
            <pre>{json}</pre>
          </details>
        </div>
      </div>
      {playing && (
        <div className="editor-play-overlay">
          <div className="editor-play-panel">
            <div className="topbar">
              <b>TEST · {level.id}</b>
              <button className="action" onClick={() => setPlaying(false)}>
                ✕ FERMER
              </button>
            </div>
            <LabGame
              level={level}
              skin={skin}
              themeName={themeName}
              onCompletionChange={(completion) =>
                completion &&
                setMessage(`✓ Test terminé en ${completion.moves} coups`)
              }
              onBackToGenerator={() => setPlaying(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
