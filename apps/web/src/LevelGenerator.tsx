import { useMemo, useState } from 'react';
import { LevelRunner, validateLevel, type LevelValidation } from '@duality/game';
import type { Level } from '@duality/level-format';
import { generateCandidates, type GeneratedLevel, type GeneratorOptions } from './levelGenerator';

type Candidate = { level: GeneratedLevel; validation: LevelValidation };

const DEFAULTS: GeneratorOptions = { seed: 847291, width: 13, height: 10, wallDensity: 0.12, stars: 2 };

function nextSeed(seed: number): number {
  return (seed + 0x6d2b79f5) | 0;
}

function BoardPreview({ level, state }: { level: Level; state?: ReturnType<LevelRunner['getState']> }) {
  return <div className="generator-board board" style={{ '--cols': level.width, '--rows': level.height } as React.CSSProperties}>
    {level.tiles.flatMap((row, y) => row.map((tile, x) => tile === 'wall' ? <div className="wall" style={{ gridColumn: x + 1, gridRow: y + 1 }} key={`w-${x}-${y}`} /> : null))}
    {level.stars.map((star) => <div className="star" style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }} key={`${star.x}-${star.y}`}>★</div>)}
    <div className={`piece ball ${state?.activeForm === 'square' ? 'inactive' : ''}`} style={{ gridColumn: (state?.ball ?? level.ball).x + 1, gridRow: (state?.ball ?? level.ball).y + 1 }} />
    <div className={`piece square ${state?.activeForm === 'ball' ? 'inactive' : ''}`} style={{ gridColumn: (state?.square ?? level.square).x + 1, gridRow: (state?.square ?? level.square).y + 1 }} />
  </div>;
}

function GeneratorPlayer({ level, onBack }: { level: GeneratedLevel; onBack: () => void }) {
  const runner = useMemo(() => new LevelRunner(level), [level]);
  const [state, setState] = useState(() => runner.getState());
  const move = (x: -1 | 0 | 1, y: -1 | 0 | 1) => setState((current) => current.completed ? current : runner.move({ x, y }));
  const reset = () => setState(runner.reset());
  const switchForm = () => setState((current) => current.completed ? current : runner.switchForm());
  return <section className="generator-player"><div className="topbar"><button className="action" onClick={onBack}>← GÉNÉRER</button><b>APERÇU · SEED {level.seed}</b></div><BoardPreview level={level} state={state} /><div className="hud"><b>{state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'}</b><br /><span className="muted">★ {level.stars.length - state.stars.length}/{level.stars.length} · {state.moves} COUPS</span></div><div className="controls generator-controls"><div className="dpad"><button className="up" onClick={() => move(0, -1)}>▲</button><button onClick={() => move(-1, 0)}>◀</button><button onClick={() => move(0, 1)}>▼</button><button onClick={() => move(1, 0)}>▶</button></div><button className="action switch" onClick={switchForm}>● ⇄ ■<br />CHANGER</button><button className="action" onClick={reset}>↻ RESET</button></div>{state.completed && <div className="generator-complete">✓ NIVEAU RÉSOLU EN {state.moves} COUPS</div>}</section>;
}

export function LevelGenerator() {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULTS);
  const [generation, setGeneration] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const candidates = useMemo<Candidate[]>(() => {
    const raw = generateCandidates({ ...options, seed: options.seed + generation }, 24);
    return raw.map((level) => ({ level, validation: validateLevel(level) })).filter((item) => item.validation.difficulty).slice(0, 8);
  }, [generation, options]);
  const selected = candidates.find((item) => item.level.seed === selectedSeed)?.level ?? null;

  if (selected) return <GeneratorPlayer level={selected} onBack={() => setSelectedSeed(null)} />;

  const generate = () => { setSelectedSeed(null); setGeneration((value) => value + 1); };
  return <section className="dev-generator"><div className="topbar"><button className="action" onClick={() => { window.location.hash = '#/dev/levels'; }}>← LAB</button><b>GÉNÉRATEUR DE NIVEAUX</b></div><p className="dev-banner">DEV ONLY · génération déterministe · seuls les niveaux solvables sont proposés</p><div className="generator-options"><label>SEED<input type="number" value={options.seed} onChange={(e) => setOptions({ ...options, seed: Number(e.target.value) || 1 })} /></label><label>MURS <input type="range" min="0.04" max="0.24" step="0.01" value={options.wallDensity} onChange={(e) => setOptions({ ...options, wallDensity: Number(e.target.value) })} /><span>{Math.round(options.wallDensity * 100)}%</span></label><label>ÉTOILES<select value={options.stars} onChange={(e) => setOptions({ ...options, stars: Number(e.target.value) })}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><button className="action generator-generate" onClick={generate}>⚡ GÉNÉRER</button></div><div className="generator-meta">{candidates.length} candidat(s) solvable(s) · 13 × 10 · clique sur un niveau pour jouer</div><div className="generator-grid">{candidates.map(({ level, validation }) => <button className="generator-card" key={level.seed} onClick={() => setSelectedSeed(level.seed)}><BoardPreview level={level} /><div className="generator-card-meta"><b>SEED {level.seed}</b><span>✓ {validation.difficulty!.moves} coups · score {validation.difficulty!.score}</span></div></button>)}</div>{candidates.length === 0 && <div className="generator-empty">Aucun niveau solvable trouvé. Réduis les murs ou génère une nouvelle série.</div>}</section>;
}
