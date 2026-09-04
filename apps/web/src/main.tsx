import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { LevelRunner } from '@duality/game';
import type { Level } from '@duality/level-format';
import { campaign, worlds, getCampaignLevelIndex, levelLabel } from './levels/campaign';
import { completeLevel, getCompletedCount, isLevelCompleted } from './progression';
import { cycleTheme, getTheme, hexToCss } from './theme';
import { interpretGesture, type Direction as GestureDirection } from './input/GestureInterpreter';
import './style.css';

type Dir = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

const dirs: Record<GestureDirection, Dir> = {
  left:  { x: -1, y: 0 },
  right: { x: 1,  y: 0 },
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1 },
};

function vars(): CSSProperties {
  const t = getTheme();
  return Object.fromEntries(
    Object.entries(t)
      .filter(([, v]) => typeof v === 'number')
      .map(([k, v]) => ['--' + k, hexToCss(v as number)]),
  ) as CSSProperties;
}

// ───────────── App ─────────────
function App() {
  const [view, setView] = useState<'menu' | 'levels' | 'help' | 'game'>('menu');
  const [world, setWorld] = useState(1);
  const [levelIndex, setLevelIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const open = (id: number, i: number) => {
    setWorld(id);
    setLevelIndex(getCampaignLevelIndex(id, i));
    setView('game');
  };

  return (
    <main className="app" style={vars()}>
      <div className="shell">
        {view === 'menu' && (
          <Menu
            world={(w) => { setWorld(w); setView('levels'); }}
            help={() => setView('help')}
            theme={() => { cycleTheme(); setTick(tick + 1); }}
          />
        )}
        {view === 'levels' && (
          <Levels id={world} back={() => setView('menu')} open={open} />
        )}
        {view === 'help' && <Help back={() => setView('menu')} />}
        {view === 'game' && (
          <Game li={levelIndex} w={world} back={() => setView('levels')} next={open} />
        )}
      </div>
    </main>
  );
}

// ───────────── Menu ─────────────
function Menu(p: { world: (x: number) => void; help: () => void; theme: () => void }) {
  return (
    <section className="menu">
      <h1 className="title">DUALITY</h1>
      <div className="subtitle">CHOISIS TON MONDE</div>

      <div className="world-list">
        {worlds.map((w) => {
          const done = w.levels.filter((l) => isLevelCompleted(l.id)).length;
          return (
            <button
              className="world-button"
              disabled={w.status !== 'available'}
              onClick={() => p.world(w.id)}
              key={w.id}
            >
              🌍 MONDE {w.id} — {w.name.toUpperCase()}
              <span className="world-meta">
                {w.status === 'available'
                  ? `${w.subtitle} · ${done}/${w.levels.length}`
                  : `${w.subtitle} · BIENTÔT`}
              </span>
            </button>
          );
        })}
      </div>

      <p className="muted">{getCompletedCount()} terminé(s) · {campaign.length} jouables</p>

      <div className="modal-actions">
        <button className="action" onClick={p.help}>? AIDE</button>
        <button className="action" onClick={p.theme}>🎨 THÈME</button>
      </div>
    </section>
  );
}
// ───────────── Levels ─────────────
function Levels(p: { id: number; back: () => void; open: (w: number, i: number) => void }) {
  const world = worlds.find((x) => x.id === p.id)!;
  return (
    <section className="menu">
      <div className="topbar">
        <button className="action" onClick={p.back}>← MONDES</button>
        <b>MONDE {world.id}</b>
      </div>
      <h2 className="subtitle">{world.name.toUpperCase()}</h2>

      <div className="levels">
        {world.levels.map((l, i) => {
          const unlocked = i === 0 || isLevelCompleted(world.levels[i - 1].id);
          const done = isLevelCompleted(l.id);
          return (
            <button
              className="level-button"
              disabled={!unlocked}
              onClick={() => p.open(world.id, i)}
              key={l.id}
            >
              {done ? '✓' : unlocked ? String(i + 1).padStart(2, '0') : '🔒'}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ───────────── Help ─────────────
function Help(p: { back: () => void }) {
  const rules: [string, string][] = [
    ['SE DÉPLACER', "La forme active glisse jusqu'à rencontrer un mur ou l'autre forme."],
    ['CHANGER', 'ESPACE ou ● ⇄ ■ choisit la forme active.'],
    ['BLOQUER', 'La boule et le carré peuvent se servir mutuellement de mur.'],
    ['OBJECTIF', 'Ramasse toutes les étoiles ★ pour terminer.'],
    ['RACCOURCIS', 'R recommence · ÉCHAP menu · ENTRÉE suivant.'],
  ];

  return (
    <section className="help">
      <button className="action" onClick={p.back}>← RETOUR</button>
      <h1 className="title">COMMENT JOUER ?</h1>
      {rules.map(([title, text]) => (
        <section key={title}>
          <b className="subtitle">{title}</b>
          <p>{text}</p>
        </section>
      ))}
    </section>
  );
}
// ───────────── Game ─────────────
function Game(p: {
  li: number;
  w: number;
  back: () => void;
  next: (w: number, i: number) => void;
}) {
  const level = campaign[p.li] as Level;
  const runner = useMemo(() => new LevelRunner(level), [p.li]);
  const [s, setS] = useState(() => runner.getState());
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const move = (d: Dir) => !s.completed && setS(runner.move(d));
  const switchForm = () => !s.completed && setS(runner.switchForm());
  const reset = () => setS(runner.reset());

  const world = worlds.find((x) => x.id === p.w)!;
  const worldIndex = world.levels.findIndex((x) => x.id === level.id);
  const next = () =>
    worldIndex < world.levels.length - 1
      ? p.next(p.w, worldIndex + 1)
      : p.back();

  // Clavier
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowLeft: dirs.left,
        ArrowRight: dirs.right,
        ArrowUp: dirs.up,
        ArrowDown: dirs.down,
      };
      if (e.key === ' ') {
        e.preventDefault();
        switchForm();
      } else if (e.key === 'r' || e.key === 'R') {
        reset();
      } else if (e.key === 'Escape') {
        p.back();
      } else if (e.key === 'Enter' && s.completed) {
        next();
      } else if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.completed, p.li]);

  // Complétion de niveau
  useEffect(() => {
    if (s.completed) completeLevel(level.id);
  }, [s.completed, level.id]);

  const pos = (x: number, y: number): CSSProperties => ({
    transform: `translate(${x * 100}%, ${y * 100}%)`,
    width: 'var(--tile)',
    height: 'var(--tile)',
  });

  return (
    <section className="game">
      <div className="topbar">
        <button className="action" onClick={p.back}>← NIVEAUX</button>
        <b>{levelLabel(worldIndex)} · MONDE {p.w}</b>
        <button className="action" onClick={reset}>↻</button>
      </div>

      <div className="board-wrap">
        <div
          className="board"
          style={{ '--cols': level.width, '--rows': level.height } as CSSProperties}
          onPointerDown={(e) => setStart({ x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            if (!start) return;
            const result = interpretGesture(start, { x: e.clientX, y: e.clientY }, 24);
            setStart(null);
            if (result.type === 'swipe' && result.direction) move(dirs[result.direction]);
          }}
        >
          {level.tiles.flatMap((row, y) =>
            row.map((tile, x) => (
              <div
                className={'cell ' + (tile === 'wall' ? 'wall' : '')}
                key={`${x}-${y}`}
              />
            )),
          )}
          {s.stars.map((star) => (
            <div
              className="star"
              style={pos(star.x, star.y)}
              key={`${star.x}-${star.y}`}
            >
              ★
            </div>
          ))}
          <div
            className={`piece ball ${s.activeForm === 'ball' ? '' : 'inactive'}`}
            style={pos(s.ball.x, s.ball.y)}
          />
          <div
            className={`piece square ${s.activeForm === 'square' ? '' : 'inactive'}`}
            style={pos(s.square.x, s.square.y)}
          />
        </div>
      </div>

      <div className="hud">
        <b>{s.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'}</b>
        <br />
        <span className="muted">
          ★ {level.stars.length - s.stars.length}/{level.stars.length} ·{' '}
          {s.moves} COUPS · swipe ou flèches
        </span>
      </div>

      <div className="controls">
        <div className="dpad">
          <button className="up" onClick={() => move(dirs.up)}>▲</button>
          <button onClick={() => move(dirs.left)}>◀</button>
          <button onClick={() => move(dirs.down)}>▼</button>
          <button onClick={() => move(dirs.right)}>▶</button>
        </div>
        <button className="action switch" onClick={switchForm}>
          ● ⇄ ■<br />CHANGER
        </button>
      </div>

      {s.completed && (
        <div className="overlay">
          <div className="modal">
            <h2>★ NIVEAU TERMINÉ ★</h2>
            <p>{s.moves} coups</p>
            <div className="modal-actions">
              <button className="action" onClick={reset}>REJOUER</button>
              <button className="action" onClick={next}>
                {worldIndex < world.levels.length - 1 ? 'SUIVANT ▶' : 'MENU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

registerSW({ immediate: true });
createRoot(document.getElementById('app')!).render(<App />);