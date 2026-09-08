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
const dirs: Record<string, Dir> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } };

export type CatalogueEntry = { id: string; label: string; level: Level };
export type CatalogueGroup = { label: string; entries: CatalogueEntry[] };
export const allDevLevels: readonly Level[] = [...campaign, ...doorSwitchTutorials, ...teleporterTutorials, ...seasonalEvents.flatMap((event) => event.levels)];
export const devLevelById: ReadonlyMap<string, Level> = new Map(allDevLevels.map((level) => [level.id, level]));

export function levelDisplayLabel(level: Level): string {
  for (const world of worlds) { const index = world.levels.findIndex((l) => l.id === level.id); if (index >= 0) return `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, '0')}`; }
  return level.id;
}

function buildCatalogueGroups(): CatalogueGroup[] {
  const groups: CatalogueGroup[] = [];
  for (const world of worlds) groups.push({ label: `World ${world.id}`, entries: world.levels.map((level, index) => ({ id: level.id, label: `WORLD ${world.id} · LEVEL ${String(index + 1).padStart(2, '0')}`, level })) });
  groups.push({ label: 'Doors & switches', entries: doorSwitchTutorials.map((level) => ({ id: level.id, label: level.id, level })) });
  groups.push({ label: 'Teleporters', entries: teleporterTutorials.map((level) => ({ id: level.id, label: level.id, level })) });
  for (const event of seasonalEvents) groups.push({ label: event.label, entries: event.levels.map((level) => ({ id: level.id, label: level.id, level })) });
  return groups;
}

export function LevelCatalogue() {
  const groups = useMemo(() => buildCatalogueGroups(), []);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const goMenu = () => { window.location.hash = ''; };
  const toggle = (label: string) => setOpen((prev) => { const next = new Set(prev); if (next.has(label)) next.delete(label); else next.add(label); return next; });
  if (window.location.hash === '#/dev/generator') return <LevelGenerator />;
  return <section className="dev-catalogue"><div className="topbar"><button className="action" onClick={goMenu}>← MENU</button><b>CATALOGUE DES NIVEAUX</b></div><p className="dev-banner">DEV ONLY · accès direct au contenu · aucune progression requise</p><div className="dev-generator-entry"><button className="action" onClick={() => { window.location.hash = '#/dev/generator'; }}>⚡ GÉNÉRATEUR DE NIVEAUX</button></div><div className="dev-catalogue-groups">{groups.map((group) => { const isOpen = open.has(group.label); return <section key={group.label}><button className="dev-catalogue-group dev-catalogue-toggle" onClick={() => toggle(group.label)} aria-expanded={isOpen}><span>{group.label}</span><span className="dev-catalogue-toggle-icon">{isOpen ? '▼' : '▶'}</span></button>{isOpen && group.entries.map((entry) => <button className="dev-catalogue-entry" key={entry.id} onClick={() => { window.location.hash = `#/dev/levels/${entry.id}`; }}>{entry.label}</button>)}</section>; })}</div></section>;
}

export function LevelPlayground({ levelId }: { levelId: string }) {
  const level = devLevelById.get(levelId);
  const goCatalogue = () => { window.location.hash = '#/dev/levels'; };
  if (!level) return <section className="dev-playground"><div className="topbar"><button className="action" onClick={goCatalogue}>← TOUS LES NIVEAUX</button><b>NIVEAU INTRUVABLE</b></div><p className="dev-banner">DEV ONLY</p><div className="dev-playground-body"><p>Le niveau « {levelId} » est introuvable.</p></div></section>;
  const [validation, setValidation] = useState<ReturnType<typeof validateLevel> | null>(null);
  const [completion, setCompletion] = useState<{ moves: number } | null>(null);
  const [themeName, setThemeName] = useState<ThemeName>(() => getActiveThemeName());
  const [skinPreference, setSkinPreferenceState] = useState<SkinPreference>('auto');
  const activeSkin = resolveLevelSkin(level.id, skinPreference);
  const difficulty = validation?.difficulty;
  useEffect(() => { setValidation(null); setCompletion(null); }, [levelId]);
  const runValidation = () => setValidation(validateLevel(level));
  return <section className="dev-playground"><div className="topbar"><button className="action" onClick={goCatalogue}>← TOUS LES NIVEAUX</button><b>{levelDisplayLabel(level)}</b></div><p className="dev-banner">DEV ONLY · accès direct au contenu · aucune progression requise</p><div className="dev-playground-body"><header className="dev-playground-header"><div className="dev-playground-title"><b>{level.id}</b><span>{level.width} × {level.height}</span></div><div className={`dev-playground-metrics ${validation ? (difficulty ? 'dev-solvable' : 'dev-unsolvable') : ''}`}>{completion && <span className="dev-complete-inline">✓ NIVEAU TERMINÉ · {completion.moves} COUPS</span>}{!validation && <button className="action dev-solver-action" onClick={runValidation}>▶ ANALYSER</button>}{validation && (difficulty ? <>✓ SOLVABLE · {difficulty.moves} coups · {difficulty.exploredStates.toLocaleString('fr-FR')} états · score {difficulty.score}</> : '✗ UNSOLVABLE')}</div></header><div className="dev-skin-controls"><label>THÈME <select value={themeName} onChange={(e) => { const next = e.target.value as ThemeName; setThemeName(next); setTheme(next); }}>{themeOrder.map((name) => <option value={name} key={name}>{themes[name].name}</option>)}</select></label><label>SKIN <select value={skinPreference} onChange={(e) => setSkinPreferenceState(e.target.value as SkinPreference)}>{skinOrder.map((name) => <option value={name} key={name}>{skinLabels[name]}</option>)}</select></label><span className="dev-skin-active">ACTIF · {skinLabels[activeSkin]}</span></div><LabGame level={level} skin={activeSkin} themeName={themeName} onCompletionChange={setCompletion} /></div></section>;
}

function LabGame({ level, skin, themeName, onCompletionChange }: { level: Level; skin: string; themeName: ThemeName; onCompletionChange: (completion: { moves: number } | null) => void }) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());
  useEffect(() => { onCompletionChange(state.completed ? { moves: state.moves } : null); }, [onCompletionChange, state.completed, state.moves]);
  const move = useCallback((x: -1 | 0 | 1, y: -1 | 0 | 1) => setState((current) => current.completed ? current : runner.move({ x, y })), [runner]);
  const reset = useCallback(() => setState(runner.reset()), [runner]);
  const switchForm = useCallback(() => setState((current) => current.completed ? current : runner.switchForm()), [runner]);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === ' ') { e.preventDefault(); switchForm(); } else if (e.key === 'r' || e.key === 'R') reset(); else if (e.key === 'Escape') window.location.hash = '#/dev/levels'; else if (dirs[e.key]) { e.preventDefault(); move(dirs[e.key]!.x, dirs[e.key]!.y); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [move, reset, switchForm]);
  return <><div className={`dev-board board ${skin !== 'default' ? `seasonal theme-${skin}` : ''}`} style={{ ...Object.fromEntries(Object.entries(themes[themeName]).filter(([, v]) => typeof v === 'number').map(([k, v]) => ['--' + k, hexToCss(v as number)])), '--cols': level.width, '--rows': level.height } as CSSProperties}>{level.tiles.flatMap((row, y) => row.map((tile, x) => tile === 'wall' ? <div className="wall" style={{ gridColumn: x + 1, gridRow: y + 1 }} key={`w-${x}-${y}`} /> : null))}{level.doors?.map((door) => <div className={`door ${state.doors[door.id] ? 'open' : ''}`} style={{ gridColumn: door.position.x + 1, gridRow: door.position.y + 1 }} key={door.id}>{state.doors[door.id] ? '·' : '▢'}</div>)}{level.switches?.map((item) => <div className={`switch-tile form-${item.form}`} style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>⌁</div>)}{level.teleporters?.map((item) => <div className="teleporter" style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>◉</div>)}{state.stars.map((star) => <div className="star" style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }} key={`${star.x}-${star.y}`}>★</div>)}<div className={`piece ball ${state.activeForm === 'ball' ? '' : 'inactive'}`} style={{ gridColumn: state.ball.x + 1, gridRow: state.ball.y + 1 }} /><div className={`piece square ${state.activeForm === 'square' ? '' : 'inactive'}`} style={{ gridColumn: state.square.x + 1, gridRow: state.square.y + 1 }} /></div><div className="dev-controls"><div className="hud"><b>{state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'}</b><br /><span className="muted">★ {level.stars.length - state.stars.length}/{level.stars.length} · {state.moves} COUPS</span></div><div className="controls"><div className="dpad"><button className="up" onClick={() => move(0, -1)}>▲</button><button onClick={() => move(-1, 0)}>◀</button><button onClick={() => move(0, 1)}>▼</button><button onClick={() => move(1, 0)}>▶</button></div><button className="action switch" onClick={switchForm}>● ⇄ ■<br />CHANGER</button><button className="action" onClick={reset}>↻ RESET</button></div></div></>;
}
