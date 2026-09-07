import { useMemo, useState } from 'react';
import { LevelRunner, validateLevel } from '@duality/game';
import type { Level } from '@duality/level-format';
import { campaign } from './levels/campaign';
import { christmas, doorSwitchTutorials, halloween, seasonalEvents, teleporterTutorials } from '@duality/level-format';

type Props = { back: () => void };

type Entry = { group: string; level: Level };

const entries: Entry[] = [
  ...campaign.map((level) => ({ group: 'Campaign', level })),
  ...doorSwitchTutorials.map((level) => ({ group: 'Doors & switches', level })),
  ...teleporterTutorials.map((level) => ({ group: 'Teleporters', level })),
  ...seasonalEvents.flatMap((event) => event.levels.map((level) => ({ group: event.label, level }))),
];

function difficulty(level: Level) {
  const validation = validateLevel(level);
  return validation.difficulty;
}

export function LevelLab({ back }: Props) {
  const groups = [...new Set(entries.map((entry) => entry.group))];
  const [selectedId, setSelectedId] = useState(entries[0]?.level.id ?? '');
  const selected = entries.find((entry) => entry.level.id === selectedId)?.level ?? entries[0]?.level;

  if (!selected) return null;
  const metrics = difficulty(selected);

  return (
    <section className="level-lab">
      <div className="topbar">
        <button className="action" onClick={back}>← MENU</button>
        <b>LEVEL LAB</b>
      </div>
      <p className="dev-banner">DEV ONLY · accès direct au contenu · aucune progression requise</p>
      <div className="level-lab-layout">
        <aside className="level-lab-list">
          {groups.map((group) => (
            <section key={group}>
              <b className="level-lab-group">{group}</b>
              {entries.filter((entry) => entry.group === group).map(({ level }) => {
                const d = difficulty(level);
                return (
                  <button className={`level-lab-item ${level.id === selected.id ? 'selected' : ''}`} key={level.id} onClick={() => setSelectedId(level.id)}>
                    <span>{level.id}</span>
                    <small>{d ? `${d.moves} coups · ${d.score}` : 'UNSOLVABLE'}</small>
                  </button>
                );
              })}
            </section>
          ))}
        </aside>
        <div className="level-lab-preview">
          <header className="level-lab-header">
            <div><b>{selected.id}</b><span>{selected.width} × {selected.height}</span></div>
            <div className="level-lab-metrics">{metrics ? `✓ solvable · ${metrics.moves} coups · ${metrics.exploredStates} états · score ${metrics.score}` : '✗ UNSOLVABLE'}</div>
          </header>
          <LabGame level={selected} />
        </div>
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

  return (
    <>
      <div className="level-lab-board board" style={{ '--cols': level.width, '--rows': level.height } as React.CSSProperties}>
        {level.tiles.flatMap((row, y) => row.map((tile, x) => tile === 'wall' ? <div className="wall" style={{ gridColumn: x + 1, gridRow: y + 1 }} key={`w-${x}-${y}`} /> : null))}
        {level.doors?.map((door) => <div className={`door ${state.doors[door.id] ? 'open' : ''}`} style={{ gridColumn: door.position.x + 1, gridRow: door.position.y + 1 }} key={door.id}>{state.doors[door.id] ? '·' : '▣'}</div>)}
        {level.switches?.map((item) => <div className={`switch-tile form-${item.form}`} style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>⌁</div>)}
        {level.teleporters?.map((item) => <div className="teleporter" style={{ gridColumn: item.position.x + 1, gridRow: item.position.y + 1 }} key={item.id}>◉</div>)}
        {state.stars.map((star) => <div className="star" style={{ gridColumn: star.x + 1, gridRow: star.y + 1 }} key={`${star.x}-${star.y}`}>★</div>)}
        <div className={`piece ball ${state.activeForm === 'ball' ? '' : 'inactive'}`} style={{ gridColumn: state.ball.x + 1, gridRow: state.ball.y + 1 }} />
        <div className={`piece square ${state.activeForm === 'square' ? '' : 'inactive'}`} style={{ gridColumn: state.square.x + 1, gridRow: state.square.y + 1 }} />
      </div>
      <div className="level-lab-controls">
        <div className="hud"><b>{state.activeForm === 'ball' ? '● BOULE' : '■ CARRÉ'}</b><br /><span className="muted">★ {level.stars.length - state.stars.length}/{level.stars.length} · {state.moves} COUPS</span></div>
        <div className="controls"><div className="dpad"><button className="up" onClick={() => move(0, -1)}>▲</button><button onClick={() => move(-1, 0)}>◀</button><button onClick={() => move(0, 1)}>▼</button><button onClick={() => move(1, 0)}>▶</button></div><button className="action switch" onClick={switchForm}>● ⇄ ■<br />CHANGER</button><button className="action" onClick={reset}>↻ RESET</button></div>
      </div>
      {state.completed && <div className="dev-complete">✓ NIVEAU TERMINÉ · {state.moves} COUPS</div>}
    </>
  );
}
