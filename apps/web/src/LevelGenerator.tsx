import { useMemo, useState, type CSSProperties } from "react";
import { validateLevel, type LevelValidation } from "@duality/game";
import type { Level } from "@duality/level-format";
import { generateCandidates, type GeneratedLevel, type GeneratorOptions } from "./levelGen";
import { LabGame, GameOverOverlay } from "./LevelLab";
import { LevelEditor } from "./LevelEditor";
import "./level-editor.css";

type Candidate = { level: GeneratedLevel; validation: LevelValidation };
const DEFAULTS: GeneratorOptions = { seed: 847291, width: 13, height: 10, wallDensity: 0.12, stars: 2, openBorders: false };

function BoardPreview({ level }: { level: Level }) {
  return <div className="generator-board board" style={{ "--cols": level.width, "--rows": level.height } as CSSProperties}>
    {level.tiles.flatMap((row, y) => row.map((tile, x) => tile === "wall" ? <div className="wall" style={{ gridColumn: x + 1, gridRow: y + 1 }} key={`w-${x}-${y}`} /> : null))}
    {level.stars.map((star) => <div className="star" style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }} key={`${star.x}-${star.y}`}>★</div>)}
    <div className="piece ball" style={{ gridColumn: level.ball.x + 1, gridRow: level.ball.y + 1 }} />
    <div className="piece square" style={{ gridColumn: level.square.x + 1, gridRow: level.square.y + 1 }} />
  </div>;
}

export function LevelGenerator() {
  if (window.location.hash === "#/dev/editor") return <LevelEditor />;
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULTS);
  const [generation, setGeneration] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const candidates = useMemo<Candidate[]>(() => {
    void generation;
    return generateCandidates(options).map((level) => ({ level, validation: validateLevel(level) })).filter((item) => item.validation.result.solvable).sort((a, b) => a.validation.difficulty!.score - b.validation.difficulty!.score).slice(0, 8);
  }, [options, generation]);
  const selected = candidates.find((item) => item.level.seed === selectedSeed);
  if (selected) return <section className="generator-player"><div className="topbar"><button className="action" onClick={() => setSelectedSeed(null)}>← GÉNÉRER</button><b>APERÇU · SEED {selected.level.seed}</b></div><p className="dev-banner">DEV ONLY · collecte les ★ pour terminer le niveau · SEED {selected.level.seed}</p><LabGame level={selected.level} skin="default" themeName="retro" onCompletionChange={() => {}} optimalMoves={selected.validation.difficulty?.moves} onBackToGenerator={() => setSelectedSeed(null)} /></section>;
  const generate = () => { setSelectedSeed(null); setGeneration((value) => value + 1); };
  return <section className="dev-generator">
    <div className="topbar"><button className="action" onClick={() => { window.location.hash = "#/dev/levels"; }}>← LAB</button><b>GÉNÉRATEUR DE NIVEAUX</b><button className="action" onClick={() => { window.location.hash = "#/dev/editor"; }}>✎ ÉDITEUR</button></div>
    <p className="dev-banner">DEV ONLY · génération déterministe · seuls les niveaux solvables sont proposés</p>
    <div className="generator-options">
      <label>SEED<input type="number" value={options.seed} onChange={(e) => setOptions({ ...options, seed: Number(e.target.value) || 1 })} /></label>
      <label>LARGEUR<input type="number" min="5" max="20" value={options.width} onChange={(e) => setOptions({ ...options, width: Math.max(5, Math.min(20, Number(e.target.value) || 5)) })} /></label>
      <label>HAUTEUR<input type="number" min="5" max="15" value={options.height} onChange={(e) => setOptions({ ...options, height: Math.max(5, Math.min(15, Number(e.target.value) || 5)) })} /></label>
      <label>MURS<input type="range" min="0.04" max="0.24" step="0.01" value={options.wallDensity} onChange={(e) => setOptions({ ...options, wallDensity: Number(e.target.value) })} /><span>{Math.round(options.wallDensity * 100)}%</span></label>
      <label>ÉTOILES<select value={options.stars} onChange={(e) => setOptions({ ...options, stars: Number(e.target.value) })}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>
      <button className={`action generator-toggle ${options.openBorders ? "active" : ""}`} onClick={() => setOptions({ ...options, openBorders: !options.openBorders })} type="button">{options.openBorders ? "🔓 BORDURES OUVERTES" : "🔒 BORDURES FERMÉES"}</button>
      <button className="action generator-generate" onClick={generate}>⚡ GÉNÉRER</button>
    </div>
    <div className="generator-meta">{candidates.length} candidat(s) solvable(s) · {options.width} × {options.height} · {options.openBorders ? "🔓 bords ouverts" : "🔒 bords fermés"} · clique sur un niveau pour jouer</div>
    <div className="generator-grid">{candidates.map(({ level, validation }) => { const difficulty = validation.difficulty!; const scoreClass = difficulty.score <= 120 ? "easy" : difficulty.score <= 200 ? "medium" : "hard"; return <button className={`generator-card card-${scoreClass}`} key={level.seed} onClick={() => setSelectedSeed(level.seed)}><BoardPreview level={level} /><div className="generator-card-meta"><b>SEED {level.seed}</b><span>✓ {difficulty.moves} coups · score {difficulty.score}</span></div></button>; })}</div>
    {candidates.length === 0 && <div className="generator-empty">Aucun niveau solvable trouvé. Réduis les murs ou génère une nouvelle série.</div>}
  </section>;
}
