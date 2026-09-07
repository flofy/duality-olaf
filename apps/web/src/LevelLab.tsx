import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LevelRunner, validateLevel } from '@duality/game';
import type { Level } from '@duality/level-format';
import { campaign, worlds } from './levels/campaign';
import { doorSwitchTutorials, seasonalEvents, teleporterTutorials } from '@duality/level-format';

type Dir = { x: -1 | 0 | 1; y: -1 | 0 | 1 };
const dirs: Record<string, Dir> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

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
  const toggle = (label: string) => { setOpen((prev) => { const next = new Set(prev); if (next.has(label)) next.delete(label); else next.add(label); return next; }); };

  return (
    <section className="dev-catalogue">
      <div className="topbar">
        <button className="action" onClick={goMenu}>← MENU</button>
        <b>CATALOGUE DES NIVEAUX</b>
      </div>
      <p className="dev-banner">DEV ONLY · accès direct au contenu · aucune progression requise</p>
      <div className="dev-catalogue-groups">
        {groups.map((group) => {
          const isOpen = open.has(group.label);
          return (
            <section key={group.label}>
              <button className="dev-catalogue-group dev-catalogue-toggle" onClick={() => toggle(group.label)} aria-expanded={isOpen}>
                <span>{group.label}</span>
                <span className="dev-catalogue-toggle-icon">{isOpen ? '▼' : '▶'}</span>
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
            </section>
          );
        })}
      </div>
    </section>
  );
}

// ── Playground ──────────────────────────────────────────────────

/**
 * `/dev/levels/:levelId` — single-level playground.
 * Loads one level, runs the solver once, and provides a playable preview.
 * Back button returns to `#/dev/levels`, not to the main menu.
 */
export function LevelPlayground({ levelId }: { levelId: string }) {
  const level = devLevelById.get(levelId);
  const goCatalogue = () => { window.location.hash = '#/dev/levels'; };

  if (!level) {
    return (
      <section className="dev-playground">
        <div className="topbar">
          <button className="action" onClick={goCatalogue}>← TOUS LES NIVEAUX</button>
          <b>NIVEAU INTRUVABLE</b>
        </div>
        <p className="dev-banner">DEV ONLY</p>
        <div className="dev-playground-body">
          <p>Le niveau « {levelId} » est introuvable.</p>
        </div>
      </section>
    );
  }

  // Solver runs exactly once per level change.
  const validation = useMemo(() => validateLevel(level), [level]);
  const difficulty = validation.difficulty;

  return (
    <section className="dev-playground">
      <div className="topbar">
        <button className="action" onClick={goCatalogue}>← TOUS LES NIVEAUX</button>
        <b>{levelDisplayLabel(level)}</b>
      </div>
      <p className="dev-banner">DEV ONLY · accès direct au contenu · aucune progression requise</p>
      <div className="dev-playground-body">
        <header className="dev-playground-header">
          <div className="dev-playground-title">
            <b>{level.id}</b>
            <span>{level.width} × {level.height}</span>
          </div>
          <div className={`dev-playground-metrics ${difficulty ? 'dev-solvable' : 'dev-unsolvable'}`}>
            {difficulty
              ? <>✓ SOLVABLE · {difficulty.moves} coups · {difficulty.exploredStates.toLocaleString('fr-FR')} états · score {difficulty.score}</>
              : '✗ UNSOLVABLE'}
          </div>
        </header>
        <LabGame level={level} />
      </div>
    </section>
  );
}

function LabGame({ level }: { level: Level }) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());
  const move = (x: -1 | 0 | 1, y: -1 | 0 | 1) => !state.completed && setState(runner.move({ x, y }));
  const reset = () => setState(runner.reset());
  const switchForm = () => !state.completed && setState(runner.switchForm());
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); switchForm(); }
      else if (e.key === 'r' || e.key === 'R') reset();
      else if (e.key === 'Escape') { window.location.hash = '#/dev/levels'; }
      else if (dirs[e.key]) { e.preventDefault(); move(dirs[e.key]!.x, dirs[e.key]!.y); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.completed]);
  return <>
    <div className="dev-board board" style={{ '--cols': level.width, '--rows': level.height } as CSSProperties}>
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
    {state.completed && <div className="dev-complete">✓ NIVEAU TERMINÉ · {state.moves} COUPS</div>}
  </>;
}
