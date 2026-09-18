import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from "react-router";
import { RouterProvider } from "react-router/dom";
import { type Level } from "@duality/level-format";
import { campaign, worlds, levelLabel } from "./levels/campaign";
import {
  completeLevel,
  getCompletedCount,
  isLevelCompleted,
} from "./progression";
import { cycleTheme, getActiveThemeName, getTheme, hexToCss } from "./theme";
import {
  getAvailableSkinPreferences,
  getSkinPreference,
  normalizeSkinPreference,
  resolveLevelSkin,
  setSkinPreference,
  skinLabels,
  type SkinPreference,
} from "./skins";
import { LevelCatalogue, LevelPlayground } from "./LevelLab";
import { GameBoard } from "./GameBoard";
import { LevelEditor } from "./LevelEditor";
import { LevelGenerator } from "./LevelGenerator";
import { interpretGesture, type Direction } from "./input/GestureInterpreter";
import { useLevelGameplay, type GameplayDirection } from "./useLevelGameplay";
import {
  formatDebugCommands,
  type DebugCommand,
  type DebugDirection,
} from "./debug/CommandRecorder";
import { InstallButton } from "./InstallButton";

// Import des nouveaux composants
import { Button, DPadButton, CenterDPadButton } from "./components/Button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SwitchForm,
  ResetIcon as Reset,
  Maximize,
  Minimize,
  Help as HelpIcon,
  ThemeIcon as Theme,
  Skin,
} from "./components/Icons";

import "./style.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";
const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

function vars(): CSSProperties {
  const theme = getTheme();
  return Object.fromEntries(
    Object.entries(theme)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => ["--" + key, hexToCss(value as number)]),
  ) as CSSProperties;
}

function PwaControls({
  updateSW,
}: {
  updateSW: (reloadPage?: boolean) => Promise<void>;
}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setDismissed(false);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      setUpdateAvailable(true);
      setDismissed(false);
    };
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => window.removeEventListener("duality:pwa-update", onUpdate);
  }, []);

  if (dismissed || (!updateAvailable && !installPrompt)) return null;

  return (
    <div className="pwa-controls" role="status" aria-live="polite">
      <span>
        {updateAvailable
          ? "🎨 Nouvelle version disponible"
          : "📱 Installe Duality pour jouer en plein écran"}
      </span>
      <div className="pwa-actions">
        <Button
          icon={<ArrowRight size={16} />}
          label={updateAvailable ? "METTRE À JOUR" : "INSTALLER"}
          onClick={
            updateAvailable
              ? () => updateSW(true)
              : async () => {
                  if (!installPrompt) return;
                  await installPrompt.prompt();
                  await installPrompt.userChoice;
                  setInstallPrompt(null);
                }
          }
          variant="primary"
        />

        <button
          className="pwa-dismiss"
          type="button"
          aria-label="Fermer"
          onClick={() => setDismissed(true)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function FullscreenButton() {
  const [fullscreen, setFullscreen] = useState(() =>
    Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  if (!document.fullscreenEnabled) return null;

  const toggle = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  return (
    <Button
      icon={fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      label={fullscreen ? "FENÊTRÉ" : "PLEIN ÉCRAN"}
      onClick={toggle}
      aria-label={
        fullscreen ? "Quitter le plein écran" : "Passer en plein écran"
      }
      variant="secondary"
    />
  );
}

function AppLayout() {
  return (
    <main className="app" style={vars()}>
      <div className="shell app-enter">
        <div className="utility-bar">
          <PwaControls updateSW={updateSW} />
          <FullscreenButton />
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </main>
  );
}

function Intro() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const continueIntro = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => navigate("/menu"), 420);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        continueIntro();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section
      className={`intro ${leaving ? "intro-leaving" : ""}`}
      onClick={continueIntro}
      role="button"
      tabIndex={0}
      aria-label="Entrer dans Duality"
    >
      <div className="intro-grid" />
      <div className="intro-logo">
        <span className="intro-ball">●</span>
        <span>DUALITY</span>
        <span className="intro-square">■</span>
      </div>
      <p className="intro-tagline">DEUX FORMES · UN SEUL CHEMIN</p>
      <div className="intro-demo">
        <div className="intro-track">
          <span className="intro-demo-ball">●</span>
          <span className="intro-star">★</span>
          <span className="intro-demo-square">■</span>
        </div>
        <span className="intro-switch">● ⇄ ■</span>
      </div>
      <Button
        icon={<ArrowRight size={20} />}
        label="JOUER"
        onClick={(event) => {
          event.stopPropagation();
          continueIntro();
        }}
        className="intro-start"
        variant="primary"
      />
      <span className="intro-hint">ENTRÉE · ESPACE · CLIQUER</span>
    </section>
  );
}

function Menu() {
  const navigate = useNavigate();
  const [skinPreference, setSkinPreferenceState] = useState<SkinPreference>(
    () => normalizeSkinPreference(getSkinPreference()),
  );
  const [tick, setTick] = useState(0);
  const availableSkins = getAvailableSkinPreferences();
  const skin = normalizeSkinPreference(skinPreference);

  return (
    <section className="menu">
      <h1 className="title">DUALITY</h1>
      <div className="subtitle">CHOISIS TON MONDE</div>
      <div className="world-list">
        {worlds.map((world) => {
          const done = world.levels.filter((level) =>
            isLevelCompleted(level.id),
          ).length;
          return (
            <div key={world.id} style={{ position: "relative" }}>
              <Button
                icon={<ArrowRight size={20} />}
                label={`MONDE ${world.id} — ${world.name.toUpperCase()}`}
                onClick={() => navigate(`/world/${world.id}`)}
                disabled={world.status !== "available"}
                variant="primary"
                className="world-button"
              />
              <div className="world-meta">
                {world.status === "available"
                  ? `${world.subtitle} • ${done}/${world.levels.length}`
                  : `${world.subtitle} • BIENTÔT`}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted">
        {getCompletedCount()} terminé(s) · {campaign.length} jouables
      </p>
      <div className="modal-actions">
        <Button
          icon={<HelpIcon size={18} />}
          label="AIDE"
          onClick={() => navigate("/help")}
          variant="secondary"
        />
        <Button
          icon={<Theme size={18} />}
          label="THÈME"
          onClick={() => {
            cycleTheme();
            setTick(tick + 1);
          }}
          variant="secondary"
        />
        <Button
          icon={<Skin size={18} />}
          label={skinLabels[skin]}
          onClick={() => {
            const index = availableSkins.indexOf(skin);
            const next =
              availableSkins[(index + 1) % availableSkins.length] ?? "auto";
            setSkinPreference(next);
            setSkinPreferenceState(next);
          }}
          variant="secondary"
        />
        {isLevelLabEnabled && (
          <button
            className="action dev-entry"
            onClick={() => navigate("/dev/levels")}
          >
            🧪 LEVEL LAB
          </button>
        )}
      </div>
    </section>
  );
}

function WorldLevels() {
  const navigate = useNavigate();
  const { worldId } = useParams();
  const id = Number(worldId);
  const world = worlds.find((item) => item.id === id);

  if (!world) return <Navigate to="/menu" replace />;

  return (
    <section className="menu">
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          label="MONDES"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <b>MONDE {world.id}</b>
      </div>
      <h2 className="subtitle">{world.name.toUpperCase()}</h2>
      <div className="levels">
        {world.levels.map((level, index) => {
          const unlocked =
            index === 0 || isLevelCompleted(world.levels[index - 1].id);
          const done = isLevelCompleted(level.id);
          return (
            <button
              className="level-button"
              disabled={!unlocked}
              onClick={() => navigate(`/world/${world.id}/level/${level.id}`)}
              key={level.id}
            >
              {done
                ? "✓"
                : unlocked
                  ? String(index + 1).padStart(2, "0")
                  : "🔒"}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Help() {
  const navigate = useNavigate();
  const rules: [string, string][] = [
    [
      "SE DÉPLACER",
      "La forme active glisse jusqu'à rencontrer un mur ou l'autre forme.",
    ],
    ["CHANGER", "ESPACE ou ● ⇄ ■ choisit la forme active."],
    ["BLOQUER", "La boule et le carré peuvent se servir mutuellement de mur."],
    [
      "PORTES",
      "Une porte bloque le passage tant qu'un interrupteur lié ne l'a pas ouverte.",
    ],
    [
      "TÉLÉPORTER",
      "Atterris sur un portail pour ressortir par son portail associé.",
    ],
    ["OBJECTIF", "Ramasse toutes les étoiles ★ pour terminer."],
    ["RACCOURCIS", "R recommence · ÉCHAP menu · ENTRÉE suivant."],
  ];

  return (
    <section className="help">
      <Button
        icon={<ArrowLeft size={18} />}
        label="RETOUR"
        onClick={() => navigate("/menu")}
        variant="secondary"
      />
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

function ProtectedLevel() {
  const { worldId, levelId } = useParams();
  const world = worlds.find((item) => item.id === Number(worldId));
  const levelIndex =
    world?.levels.findIndex((level) => level.id === levelId) ?? -1;

  if (!world || levelIndex < 0) return <Navigate to="/menu" replace />;
  if (levelIndex > 0 && !isLevelCompleted(world.levels[levelIndex - 1].id)) {
    return <Navigate to={`/world/${world.id}`} replace />;
  }

  return <Game level={world.levels[levelIndex]} worldId={world.id} />;
}

function Game({ level, worldId }: { level: Level; worldId: number }) {
  const navigate = useNavigate();
  const world = worlds.find((item) => item.id === worldId)!;
  const worldIndex = world.levels.findIndex((item) => item.id === level.id);
  const seasonalTheme = resolveLevelSkin(level.id);
  const [commands, setCommands] = useState<DebugCommand[]>([]);
  const [start, setStart] = useState<{
    x: number;
    y: number;
    interactive: boolean;
  } | null>(null);

  const nextLevel = useCallback(() => {
    if (worldIndex < world.levels.length - 1) {
      navigate(`/world/${world.id}/level/${world.levels[worldIndex + 1].id}`);
    } else {
      navigate(`/world/${world.id}`);
    }
  }, [navigate, world, worldIndex]);

  const { state, move, reset, switchForm } = useLevelGameplay(
    level,
    () => navigate(`/world/${world.id}`),
    (direction, moved) => {
      if (!moved || !isDevtoolsEnabled) return;
      const debugDirection: DebugDirection =
        direction.x === 1
          ? "RIGHT"
          : direction.x === -1
            ? "LEFT"
            : direction.y === 1
              ? "DOWN"
              : "UP";
      setCommands((current) => [
        ...current,
        { type: "move", direction: debugDirection },
      ]);
    },
    () => {
      if (isDevtoolsEnabled)
        setCommands((current) => [...current, { type: "switch" }]);
    },
    () => {
      if (isDevtoolsEnabled) setCommands([]);
    },
  );

  useEffect(() => {
    if (state.completed) completeLevel(level.id);
  }, [level.id, state.completed]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && state.completed) {
        event.preventDefault();
        nextLevel();
        return;
      }
      if (event.key === "d" || event.key === "D") {
        if (!isDevtoolsEnabled || commands.length === 0) return;
        event.preventDefault();
        void navigator.clipboard?.writeText(formatDebugCommands(commands));
        return;
      }
      if (event.key === "c" || event.key === "C") {
        if (!isDevtoolsEnabled) return;
        setCommands([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commands, nextLevel, state.completed]);

  return (
    <section
      className="game"
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        const interactive = Boolean(
          target.closest('button, a, input, textarea, select, [role="dialog"]'),
        );
        setStart({ x: event.clientX, y: event.clientY, interactive });
      }}
      onPointerUp={(event) => {
        if (!start) return;
        const result = interpretGesture(
          start,
          { x: event.clientX, y: event.clientY },
          24,
        );
        const wasInteractive = start.interactive;
        setStart(null);
        if (!wasInteractive && result.type === "swipe" && result.direction) {
          move(gestureDirections[result.direction]);
        }
      }}
    >
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          label="NIVEAUX"
          onClick={() => navigate(`/world/${world.id}`)}
          variant="secondary"
        />
        <b>
          {levelLabel(worldIndex)} · MONDE {world.id}
        </b>
        <Button
          icon={<Reset size={18} />}
          label="RECOMMENCER"
          onClick={reset}
          variant="secondary"
        />
      </div>
      <div className="board-wrap">
        <GameBoard
          level={level}
          state={state}
          skin={seasonalTheme ?? "default"}
          themeName={getActiveThemeName()}
        />
      </div>
      <div className="hud">
        <b>{state.activeForm === "ball" ? "● BOULE" : "■ CARRÉ"}</b>
        <br />
        <span className="muted">
          ★ {level.stars.length - state.stars.length}/{level.stars.length} ·{" "}
          {state.moves} COUPS · swipe ou flèches
        </span>
      </div>
      <div className="controls">
        <div className="dpad">
          <DPadButton
            icon={<ArrowUp size={24} color="var(--text)" />}
            onClick={() => move(gestureDirections.up)}
          />
          <DPadButton
            icon={<ArrowLeft size={24} color="var(--text)" />}
            onClick={() => move(gestureDirections.left)}
          />
          <DPadButton
            icon={<ArrowDown size={24} color="var(--text)" />}
            onClick={() => move(gestureDirections.down)}
          />
          <DPadButton
            icon={<ArrowRight size={24} color="var(--text)" />}
            onClick={() => move(gestureDirections.right)}
          />
        </div>
        {level.square && (
          <CenterDPadButton
            icon={<SwitchForm size={24} color="var(--text)" />}
            label="CHANGER"
            onClick={switchForm}
          />
        )}
      </div>
      {isDevtoolsEnabled && (
        <aside className="dev-entry" aria-label="Outils de développement">
          <strong>🐛 DEBUG</strong>
          <span>{level.id}</span>
          <span>
            ● {state.ball.x},{state.ball.y}
            {level.square
              ? ` · ■ ${state.square.x},${state.square.y}`
              : " · ■ absent"}
          </span>
          <span>
            {state.activeForm} · ★ {state.stars.length} · {commands.length}{" "}
            commandes
          </span>
          <span className="muted">
            {commands
              .slice(-8)
              .map((command) =>
                command.type === "switch"
                  ? "↔"
                  : command.direction === "RIGHT"
                    ? "→"
                    : command.direction === "LEFT"
                      ? "←"
                      : command.direction === "DOWN"
                        ? "↓"
                        : "↑",
              )
              .join(" ") || "—"}
          </span>
          <div className="modal-actions">
            <button
              className="action"
              type="button"
              disabled={commands.length === 0}
              onClick={() =>
                void navigator.clipboard?.writeText(
                  formatDebugCommands(commands),
                )
              }
            >
              COPIER
            </button>
            <button
              className="action"
              type="button"
              onClick={() => setCommands([])}
            >
              EFFACER
            </button>
          </div>
        </aside>
      )}
      {state.completed && (
        <div className="overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
          >
            <h2 id="completion-title">★ NIVEAU TERMINÉ ★</h2>
            <p>{state.moves} coups</p>
            <div className="modal-actions">
              <Button
                icon={<Reset size={18} />}
                label="REJOUER"
                onClick={reset}
                variant="primary"
              />
              <Button
                icon={<ArrowRight size={18} />}
                label={
                  worldIndex < world.levels.length - 1 ? "SUIVANT" : "NIVEAUX"
                }
                onClick={nextLevel}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}
      {state.gameOver && (
        <div className="overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gameover-title"
          >
            <h2 id="gameover-title">✗ GAME OVER</h2>
            <p>Une forme est sortie du niveau…</p>
            <div className="modal-actions">
              <Button
                icon={<Reset size={18} />}
                label="REJOUER"
                onClick={reset}
                variant="primary"
              />
              <Button
                icon={<ArrowLeft size={18} />}
                label="NIVEAUX"
                onClick={() => navigate(`/world/${world.id}`)}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DevGuard() {
  if (!isLevelLabEnabled) return <Navigate to="/menu" replace />;
  return <Outlet />;
}

function DevPlaygroundRoute() {
  const { levelId } = useParams();
  return <LevelPlayground levelId={levelId ?? ""} />;
}

function DevEditorRoute() {
  const { levelId } = useParams();
  return <LevelEditor initialLevelId={levelId ?? null} />;
}

const basename =
  import.meta.env.BASE_URL === "./"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { index: true, element: <Intro /> },
        { path: "menu", element: <Menu /> },
        { path: "help", element: <Help /> },
        { path: "world/:worldId", element: <WorldLevels /> },
        {
          path: "world/:worldId/level/:levelId",
          element: <ProtectedLevel />,
        },
        {
          element: <DevGuard />,
          children: [
            { path: "dev/levels", element: <LevelCatalogue /> },
            { path: "dev/levels/:levelId", element: <DevPlaygroundRoute /> },
            { path: "dev/generator", element: <LevelGenerator /> },
            { path: "dev/editor", element: <DevEditorRoute /> },
            { path: "dev/editor/:levelId", element: <DevEditorRoute /> },
          ],
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event("duality:pwa-update"));
  },
});

export function RouterApp() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("app")!).render(<RouterApp />);
