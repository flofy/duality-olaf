import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Level } from "@duality/level-format";
import {
  doorSwitchTutorials,
  seasonalEvents,
  teleporterTutorials,
} from "@duality/level-format";
import { campaign, worlds } from "./levels/campaign";
import {
  getActiveThemeName,
  setTheme,
  themeOrder,
  themes,
  type ThemeName,
} from "./theme";
import {
  resolveLevelSkin,
  skinLabels,
  skinOrder,
  type SkinPreference,
} from "./skins";
import { hexToCss } from "./theme";
import { useLevelGameplay } from "./useLevelGameplay";

export type GameOverOverlayProps = {
  type: "completed" | "gameOver" | null;
  moves?: number;
  optimalMoves?: number;
  onReset: () => void;
  onBackToGenerator?: () => void;
};

export function GameOverOverlay({
  type,
  moves,
  optimalMoves,
  onReset,
  onBackToGenerator,
}: GameOverOverlayProps) {
  if (type === null) return null;
  const isCompleted = type === "completed";
  const ratio =
    optimalMoves && moves ? Math.round((optimalMoves / moves) * 100) : null;
  return (
    <div
      className={`game-overlay ${isCompleted ? "overlay-completed" : "overlay-gameover"}`}
    >
      <div className="overlay-content">
        {isCompleted ? <>✓ NIVEAU RÉSOLU EN {moves} COUPS</> : <>✗ GAME OVER</>}
        {isCompleted && ratio !== null && (
          <div className="overlay-score">
            OPTIMAL: {optimalMoves} COUPS · SCORE: {ratio}%
          </div>
        )}
        <div className="overlay-buttons">
          <button className="action" onClick={onReset}>
            ↻ RESET
          </button>
          {onBackToGenerator && (
            <button className="action" onClick={onBackToGenerator}>
              ← GÉNÉRER
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type CatalogueEntry = {
  id: string;
  label: string;
  level: Level;
};

export type CatalogueGroup = {
  label: string;
  entries: CatalogueEntry[];
};

export const allDevLevels: readonly Level[] = [
  ...campaign,
  ...doorSwitchTutorials,
  ...teleporterTutorials,
  ...seasonalEvents.flatMap((event) => event.levels),
];

export const devLevelById: ReadonlyMap<string, Level> = new Map(
  allDevLevels.map((level) => [level.id, level]),
);

export function levelDisplayLabel(level: Level): string {
  for (const world of worlds) {
    const index = world.levels.findIndex((l) => l.id === level.id);
    if (index >= 0)
      return `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, "0")}`;
  }
  return level.id;
}

function buildCatalogueGroups(): CatalogueGroup[] {
  const groups: CatalogueGroup[] = [];

  for (const world of worlds) {
    groups.push({
      label: `World ${world.id}`,
      entries: world.levels.map((level, index) => ({
        id: level.id,
        label: `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, "0")} · ${level.id}`,
        level,
      })),
    });
  }

  groups.push({
    label: "Doors & switches",
    entries: doorSwitchTutorials.map((level) => ({
      id: level.id,
      label: level.id,
      level,
    })),
  });

  groups.push({
    label: "Teleporters",
    entries: teleporterTutorials.map((level) => ({
      id: level.id,
      label: level.id,
      level,
    })),
  });

  for (const event of seasonalEvents) {
    groups.push({
      label: event.label,
      entries: event.levels.map((level) => ({
        id: level.id,
        label: level.id,
        level,
      })),
    });
  }

  return groups;
}

export function LevelThumb({ level }: { level: Level }) {
  const w = level.width;
  const h = level.height;
  const key = (x: number, y: number) => `${x}:${y}`;

  const markers = new Map<string, string>();
  markers.set(key(level.ball.x, level.ball.y), "ball");
  markers.set(key(level.square.x, level.square.y), "square");
  for (const star of level.stars) markers.set(key(star.x, star.y), "star");

  return (
    <div
      className="dev-thumb"
      style={{
        gridTemplateColumns: `repeat(${w}, 1fr)`,
        gridTemplateRows: `repeat(${h}, 1fr)`,
        aspectRatio: `${w} / ${h}`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: h }, (_, y) =>
        Array.from({ length: w }, (_, x) => {
          const tile = level.tiles[y]?.[x] ?? "empty";
          const marker = markers.get(key(x, y));
          return (
            <div
              key={key(x, y)}
              className={`dev-thumb-cell dev-thumb-${tile}${marker ? ` dev-thumb-marker-${marker}` : ""}`}
            />
          );
        }),
      )}
    </div>
  );
}

export function LevelCatalogue() {
  const groups = useMemo(() => buildCatalogueGroups(), []);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const goMenu = () => {
    window.location.hash = "";
  };
  const toggle = (label: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <section className="dev-catalogue">
      <div className="topbar">
        <button className="action" onClick={goMenu}>
          ← MENU
        </button>
        <b>LEVEL LAB</b>
        <div className="dev-catalogue-actions">
          <button
            className="action"
            onClick={() => {
              window.location.hash = "#/dev/generator";
            }}
          >
            ⚡ GÉNÉRATEUR
          </button>
          <button
            className="action"
            onClick={() => {
              window.location.hash = "#/dev/editor";
            }}
          >
            ✎ ÉDITEUR
          </button>
        </div>
      </div>
      <p className="dev-banner">
        DEV ONLY · clique sur un niveau pour l'ouvrir dans le playground
      </p>
      <div className="dev-catalogue-groups">
        {groups.map((group) => {
          const isOpen = open.has(group.label);
          return (
            <div key={group.label}>
              <button
                className="dev-catalogue-group"
                onClick={() => toggle(group.label)}
              >
                {group.label}
                <span className="dev-catalogue-toggle-icon">
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>
              {isOpen && (
                <div className="dev-catalogue-grid">
                  {group.entries.map((entry) => {
                    const level = devLevelById.get(entry.id);
                    return (
                      <div className="dev-catalogue-card" key={entry.id}>
                        <div className="dev-catalogue-thumb-wrap">
                          {level && <LevelThumb level={level} />}
                          <div className="dev-catalogue-overlay">
                            <button
                              className="dev-catalogue-overlay-btn"
                              title={`Lancer ${entry.id}`}
                              aria-label={`Lancer ${entry.id}`}
                              onClick={() => {
                                window.location.hash = `#/dev/levels/${entry.id}`;
                              }}
                            >
                              ▶
                            </button>
                            <button
                              className="dev-catalogue-overlay-btn"
                              title={`Éditer ${entry.id}`}
                              aria-label={`Éditer ${entry.id}`}
                              onClick={() => {
                                window.location.hash = `#/dev/editor/${entry.id}`;
                              }}
                            >
                              ✎
                            </button>
                          </div>
                        </div>
                        <span
                          className="dev-catalogue-entry-label"
                          title={entry.label}
                        >
                          {entry.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** `/dev/levels/:levelId` — single-level gameplay playground. */
export function LevelPlayground({ levelId }: { levelId: string }) {
  const level = devLevelById.get(levelId);
  const [completion, setCompletion] = useState<{ moves: number } | null>(null);
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    getActiveThemeName(),
  );
  const [skin, setSkin] = useState<SkinPreference>(() =>
    resolveLevelSkin(level?.id ?? ""),
  );

  if (!level) {
    return (
      <section className="dev-playground">
        <div className="topbar">
          <button
            className="action"
            onClick={() => {
              window.location.hash = "#/dev/levels";
            }}
          >
            ← CATALOGUE
          </button>
          <b>PLAYGROUND</b>
        </div>
        <p className="dev-banner">DEV ONLY · niveau introuvable · {levelId}</p>
      </section>
    );
  }

  return (
    <section className="dev-playground">
      <div className="topbar">
        <button
          className="action"
          onClick={() => {
            window.location.hash = "#/dev/levels";
          }}
        >
          ← CATALOGUE
        </button>
        <b>PLAYGROUND</b>
        <button
          className="action"
          onClick={() => {
            window.location.hash = `#/dev/editor/${level.id}`;
          }}
        >
          ✎ ÉDITER
        </button>
      </div>
      <p className="dev-banner">
        DEV ONLY · gameplay · {levelDisplayLabel(level)}
      </p>
      <div className="dev-playground-header">
        <div className="dev-playground-title">
          <b>{levelDisplayLabel(level)}</b>
          <span>
            {level.width}×{level.height} · {level.stars.length} ★
          </span>
        </div>
        <div className="dev-playground-metrics">
          {completion && <span>✓ {completion.moves} coups</span>}
        </div>
      </div>
      <div className="dev-skin-controls">
        <label>
          THÈME
          <select
            value={themeName}
            onChange={(e) => {
              setThemeName(e.target.value as ThemeName);
              setTheme(e.target.value as ThemeName);
            }}
          >
            {themeOrder.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </label>
        <label>
          SKIN
          <select
            value={skin}
            onChange={(e) => setSkin(e.target.value as SkinPreference)}
          >
            {skinOrder.map((value) => (
              <option key={value} value={value}>
                {skinLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <span className="dev-skin-active">actif : {skinLabels[skin]}</span>
      </div>
      <LabGame
        level={level}
        skin={skin}
        themeName={themeName}
        onCompletionChange={setCompletion}
      />
    </section>
  );
}

export function LabGame({
  level,
  skin,
  themeName,
  onCompletionChange,
  optimalMoves,
  onBackToGenerator,
}: {
  level: Level;
  skin: string;
  themeName: ThemeName;
  onCompletionChange: (completion: { moves: number } | null) => void;
  optimalMoves?: number;
  onBackToGenerator?: () => void;
}) {
  const { state, reset } = useLevelGameplay(level, () => {
    window.location.hash = "#/dev/levels";
  });

  useEffect(() => {
    onCompletionChange(state.completed ? { moves: state.moves } : null);
  }, [onCompletionChange, state.completed, state.moves]);

  return (
    <div
      className={`dev-board board ${skin !== "default" ? `seasonal theme-${skin}` : ""}`}
      style={
        {
          ...Object.fromEntries(
            Object.entries(themes[themeName])
              .filter(([, value]) => typeof value === "number")
              .map(([key, value]) => ["--" + key, hexToCss(value as number)]),
          ),
          "--cols": level.width,
          "--rows": level.height,
        } as CSSProperties
      }
    >
      {level.tiles.flatMap((row, y) =>
        row.map((tile, x) =>
          tile === "wall" ? (
            <div
              className="wall"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`w-${x}-${y}`}
            />
          ) : null,
        ),
      )}
      {level.doors?.map((door) => (
        <div
          className={`door ${state.doors[door.id] ? "open" : ""}`}
          style={{
            gridColumn: door.position.x + 1,
            gridRow: door.position.y + 1,
          }}
          key={door.id}
        >
          {state.doors[door.id] ? "·" : "▢"}
        </div>
      ))}
      {level.switches?.map((item) => (
        <div
          className={`switch switch-${item.form}`}
          style={{
            gridColumn: item.position.x + 1,
            gridRow: item.position.y + 1,
          }}
          key={item.id}
        >
          ⌁
        </div>
      ))}
      {level.teleporters?.map((teleporter) => (
        <div
          className="teleporter"
          style={{
            gridColumn: teleporter.position.x + 1,
            gridRow: teleporter.position.y + 1,
          }}
          key={teleporter.id}
        >
          ◎
        </div>
      ))}
      {level.stars.map((star, index) => (
        <div
          className="star"
          style={{
            gridColumn: star.x + 1,
            gridRow: star.y + 1,
          }}
          key={`s-${index}`}
        >
          ★
        </div>
      ))}
      <div
        className="ball"
        style={{
          gridColumn: state.ball.x + 1,
          gridRow: state.ball.y + 1,
        }}
      />
      <div
        className="square"
        style={{
          gridColumn: state.square.x + 1,
          gridRow: state.square.y + 1,
        }}
      />
      <GameOverOverlay
        type={
          state.completed ? "completed" : state.gameOver ? "gameOver" : null
        }
        moves={state.moves}
        optimalMoves={optimalMoves}
        onReset={reset}
        onBackToGenerator={onBackToGenerator}
      />
    </div>
  );
}
