import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LevelRunner, validateLevel } from '@duality/game';
import type { Level } from '@duality/level-format';
import { campaign, worlds } from './levels/campaign';
import { doorSwitchTutorials, seasonalEvents, teleporterTutorials } from '@duality/level-format';
import { getActiveThemeName, setTheme, themeOrder, themes, type ThemeName } from './theme';
import { resolveLevelSkin, skinLabels, skinOrder, type SkinPreference } from './skins';
import { hexToCss } from './theme';
import { LevelGenerator } from './LevelGenerator';

type Dir = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
const dirs: Record<string, Dir> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

// ── Game Over Overlay ────────────────────────────────────────────

export type GameOverOverlayProps = {
  type: 'completed' | 'gameOver';
  moves?: number;
  optimalMoves?: number;
  onReset: () => void;
  onBackToGenerator?: () => void;
};

export function GameOverOverlay({ type, moves, optimalMoves, onReset, onBackToGenerator }: GameOverOverlayProps) {
  const isCompleted = type === 'completed';
  const ratio = optimalMoves && moves ? Math.round((optimalMoves / moves) * 100) : null;
  return (
    <div className={`game-overlay ${isCompleted ? 'overlay-completed' : 'overlay-gameover'}`}>
      <div className="overlay-content">
        {isCompleted ? (
          <>✓ NIVEAU RÉSOLU EN {moves} COUPS</>
        ) : (
          <>✗ GAME OVER</>
        )}
        {isCompleted && ratio !== null && (
          <div className="overlay-score">
            OPTIMAL: {optimalMoves} COUPS · SCORE: {ratio}%
          </div>
        )}
        <div className="overlay-buttons">
          <button className="action" onClick={onReset}>↻ RESET</button>
          {onBackToGenerator && (
            <button className="action" onClick={onBackToGenerator}>← GÉNÉRER</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Catalogue data ──────────────────────────────────────────────

export type CatalogueEntry = {
  id: string;
  label: string;
  level: Level;
};

export type CatalogueGroup = {
  label: string;
  entries: CatalogueEntry[];
};

/** All dev-accessible levels, in catalogue order, for by-id lookup. */
export const allDevLevels: readonly Level[] = [
  ...campaign,
  ...doorSwitchTutorials,
  ...teleporterTutorials,
  ...seasonalEvents.flatMap((event) => event.levels),
];

export const devLevelById: ReadonlyMap<string, Level> = new Map(
  allDevLevels.map((level) => [level.id, level]),
);

/** Human-readable label, e.g. "WORLD 1 · LEVEL 03" or the raw id. */
export function levelDisplayLabel(level: Level): string {
  for (const world of worlds) {
    const index = world.levels.findIndex((l) => l.id === level.id);
    if (index >= 0) return `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, '0')}`;
  }
  return level.id;
}

function buildCatalogueGroups(): CatalogueGroup[] {
  const groups: CatalogueGroup[] = [];

  // Campaign: one group per world so testers can jump to a specific world.
  for (const world of worlds) {
    groups.push({
      label: `World ${world.id}`,
      entries: world.levels.map((level, index) => ({
        id: level.id,
        label: `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, '0')}`,
        level,
      })),
    });
  }

  // Door / switch tutorials
  groups.push({
    label: 'Doors & switches',
    entries: doorSwitchTutorials.map((level) => ({ id: level.id, label: level.id, level })),
  });

  // Teleporter tutorials
  groups.push({
    label: 'Teleporters',
    entries: teleporterTutorials.map((level) => ({ id: level.id, label: level.id, level })),
  });

  // Seasonal events
  for (const event of seasonalEvents) {
    groups.push({
      label: event.label,
      entries: event.levels.map((level) => ({ id: level.id, label: level.id, level })),
    });
  }

  return groups;
}

// ── Catalogue ───────────────────────────────────────────────────

/**
 * `/dev/levels` — pure catalogue, no LevelRunner, no solver.
 * Lists every dev-accessible level grouped by world/category.
 * Clicking a level navigates to `#/dev/levels/:levelId`.
 */
export function LevelCatalogue() {
  const groups = useMemo(() => buildCatalogueGroups(), []);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const goMenu = () => { window.location.hash = ''; };
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
        <button className="action" onClick={goMenu}>← MENU</button>
        <b>LEVEL LAB</b>
      </div>
      <p className="dev-banner">
        DEV ONLY · clique sur un niveau pour l'ouvrir dans le playground
      </p>
      <div className="dev-generator-entry">
        <button
          className="action"
          onClick={() => { window.location.hash = '#/dev/generator'; }}
        >
          ⚡ GÉNÉRATEUR
        </button>
      </div>
      <div className="dev-catalogue-groups">
        {groups.map((group) => {
          const isOpen = open.has(group.label);
          return (
            <div key={group.label}>
              <button className="dev-catalogue-group" onClick={() => toggle(group.label)}>
                {group.label}
                <span className="dev-catalogue-toggle-icon">{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && group.entries.map((entry) => (
                <button
                  className="dev-catalogue-entry"
                  key={entry.id}
                  onClick={() => { window.location.hash = `#/dev/levels/${entry.id}`; }}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Playground ──────────────────────────────────────────────────

/**
 * `/dev/levels/:levelId` — single-level playground with solver + preview.
 * Read-only validation + solving; no progression, no persistence.
 */
export function LevelPlayground({ levelId }: { levelId: string }) {
  const level = devLevelById.get(levelId);
  if (!level) {
    return (
      <section className="dev-playground">
        <div className="topbar">
          <button className="action" onClick={() => { window.location.hash = '#/dev/levels'; }}>
            ← CATALOGUE
          </button>
          <b>PLAYGROUND</b>
        </div>
        <p className="dev-banner">DEV ONLY · niveau introuvable · {levelId}</p>
      </section>
    );
  }

  const [validation, setValidation] = useState<ReturnType<typeof validateLevel> | null>(null);
  const [completion, setCompletion] = useState<{ moves: number } | null>(null);
  const [themeName, setThemeName] = useState<ThemeName>(() => getActiveThemeName());
  const [skin, setSkin] = useState<SkinPreference>(() => resolveLevelSkin(level));

  const runValidation = () => {
    setValidation(validateLevel(level));
  };

  const cycleLocalTheme = () => {
    const idx = themeOrder.indexOf(themeName);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    setThemeName(next);
    setTheme(next);
  };

  const cycleLocalSkin = () => {
    const idx = skinOrder.indexOf(skin);
    const next = skinOrder[(idx + 1) % skinOrder.length];
    setSkin(next);
  };

  return (
    <section className="dev-playground">
      <div className="topbar">
        <button className="action" onClick={() => { window.location.hash = '#/dev/levels'; }}>
          ← CATALOGUE
        </button>
        <b>PLAYGROUND</b>
      </div>
      <p className="dev-banner">
        DEV ONLY · validation + solving · {levelDisplayLabel(level)}
      </p>
      <div className="dev-playground-header">
        <div className="dev-playground-title">
          <b>{levelDisplayLabel(level)}</b>
          <span>{level.width}×{level.height} · {level.stars.length} ★</span>
        </div>
        <div className="dev-playground-metrics">
          {completion && <span>✓ {completion.moves} coups · </span>}
          {validation && (
            validation.result.solvable
              ? <span>solvable en {validation.difficulty!.moves} coups</span>
              : <span className="dev-unsolvable">UNSOLVABLE</span>
          )}
        </div>
      </div>
      <div className="dev-skin-controls">
        <label>
          THÈME
          <select value={themeName} onChange={(e) => { setThemeName(e.target.value as ThemeName); setTheme(e.target.value as ThemeName); }}>
            {themeOrder.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>
          SKIN
          <select value={skin} onChange={(e) => setSkin(e.target.value as SkinPreference)}>
            {skinOrder.map((s) => <option key={s} value={s}>{skinLabels[s]}</option>)}
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
      <div className="dev-controls">
        <button className="action dev-solver-action" onClick={runValidation}>
          ⚡ VALIDER / RÉSOUDRE
        </button>
      </div>
      {validation && (
        <pre className="dev-solver-output">
          {validation.result.solvable
            ? `✓ solvable en ${validation.difficulty!.moves} coups\n  explored ${validation.result.exploredStates} states\n  score ${validation.difficulty!.score}`
            : `✗ unsolvable\n  explored ${validation.result.exploredStates} states`}
        </pre>
      )}
    </section>
  );
}

// ── Lab Game (reusable player) ──────────────────────────────────

export function LabGame({ level, skin, themeName, onCompletionChange, optimalMoves, onBackToGenerator }: { level: Level; skin: string; themeName: ThemeName; onCompletionChange: (completion: { moves: number } | null) => void; optimalMoves?: number; onBackToGenerator?: () => void }) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());
  useEffect(() => {
    onCompletionChange(state.completed ? { moves: state.moves } : null);
  }, [onCompletionChange, state.completed, state.moves]);
  const move = useCallback((x: -1 | 0 | 1, y: -1 | 0 | 1) => {
    setState((current) => current.completed || current.gameOver ? current : runner.move({ x, y }));
  }, [runner]);
  const reset = useCallback(() => setState(runner.reset()), [runner]);
  const switchForm = useCallback(() => {
    setState((current) => current.completed || current.gameOver ? current : runner.switchForm());
  }, [runner]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); switchForm(); }
      else if (e.key === 'r' || e.key === 'R') reset();
      else if (e.key === 'Escape') { window.location.hash = '#/dev/levels'; }
      else if (dirs[e.key]) { e.preventDefault(); move(dirs[e.key]!.x, dirs[e.key]!.y); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move, reset, switchForm]);
  return <>
    <div className={`dev-board board ${skin !== 'default' ? `seasonal theme-${skin}` : ''}`} style={{ ...Object.fromEntries(Object.entries(themes[themeName]).filter(([, v]) => typeof v === 'number').map(([k, v]) => ['--' + k, hexToCss(v as number)])), '--cols': level.width, '--rows': level.height } as CSSProperties}>
      {level.tiles.flatMap((row, y) => row.map((tile, x) => tile === 'wall' ? <div className="wall" style={{ gridColumn: x + 1, gridRow: y + 1 }} key={`w-${x}-${y}`} /> : null))}
      {level.doors?.map((door) => <div className={`door ${state.doors[door.id] ? 'open' : ''}`} style={{ gridColumn: door.position.x + 1, gridRow: door.position.y + 1 }} key={door.id}>{state.doors[door.id] ? '·' : '▢'}</div>)}
      {level.switches?.map((item) => <div className={`switch-tile form-${item.form}`} style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>⌁</div>)}
      {level.teleporters?.map((item) => <div className="teleporter" style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>◉</div>)}
      {state.stars.map((star) => <div className="star" style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }} key={`${star.x}-${star.y}`}>★</div>)}
      <div className={`piece ball ${state.activeForm === 'ball' ? '' : 'inactive'}`} style={{ gridColumn: state.ball.x + 1, gridRow: state.ball.y + 1 }} />
      <div className={`piece square ${state.activeForm === 'square' ? '' : 'inactive'}`} style={{ gridColumn: state.square.x + 1, gridRow: state.square.y + 1 }} />
    </div>
    <div className="dev-controls">
      <div className="hud"><b>{state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'}</b><br /><span className="muted">★ {level.stars.length - state.stars.length}/{level.stars.length} · {state.moves} COUPS</span></div>
      <div className="controls">
        <div className="dpad">
          <button className="up" onClick={() => move(0, -1)}>▲</button>
          <button onClick={() => move(-1, 0)}>◀</button>
          <button onClick={() => move(0, 1)}>▼</button>
          <button onClick={() => move(1, 0)}>▶</button>
        </div>
        <button className="action switch" onClick={switchForm}>● ⇄ ■<br />CHANGER</button>
        <button className="action" onClick={reset}>↻ RESET</button>
      </div>
    </div>
    {state.completed && (
      <GameOverOverlay type="completed" moves={state.moves} optimalMoves={optimalMoves} onReset={reset} onBackToGenerator={onBackToGenerator} />
    )}
    {state.gameOver && (
      <GameOverOverlay type="gameOver" onReset={reset} onBackToGenerator={onBackToGenerator} />
    )}
  </>;
}
