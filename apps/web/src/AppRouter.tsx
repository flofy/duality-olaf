import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { RouterProvider } from "react-router/dom";
import { campaign, worlds } from "./levels/campaign";
import { getCompletedCount, isLevelCompleted } from "./progression";
import { cycleTheme, getTheme, hexToCss } from "./theme";
import {
  getAvailableSkinPreferences,
  getSkinPreference,
  normalizeSkinPreference,
  setSkinPreference,
  skinLabels,
  type SkinPreference,
} from "./skins";
import { LevelCatalogue, LevelPlayground } from "./LevelLab";
import { LevelEditor } from "./LevelEditor";
import { LevelGenerator } from "./LevelGenerator";
import { Game } from "./GameScreen";
import { Button, DPadButton, CenterDPadButton } from "./components/Button";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BurgerMenu } from "./BurgerMenu";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  SwitchForm,
  ResetIcon as Reset,
  Maximize,
  Minimize,
  Help,
  ThemeIcon as Theme,
  Skin,
  XIcon,
} from "./components/Icons";
import { ConfigScreen } from "./ConfigScreen";

import "./style.css";
import "./animations.css";
import "./svg-styles.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";
const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

const gestureDirections = {
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

function PwaControls({ updateSW }: { updateSW: () => void }) {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => window.removeEventListener("duality:pwa-update", onUpdate);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!installPrompt && !updateAvailable) return null;

  return (
    <div className="pwa-controls" role="status" aria-live="polite">
      <span>
        {updateAvailable
          ? "Nouvelle version disponible"
          : "Installe Duality pour jouer en plein ecran"}
      </span>
      <div className="pwa-actions">
        <Button
          icon={<ArrowRight size={16} />}
          label={updateAvailable ? "METTRE A JOUR" : "INSTALLER"}
          onClick={() => {
            if (updateAvailable) {
              updateSW();
            } else if (installPrompt) {
              (installPrompt as any).prompt();
              setInstallPrompt(null);
            }
          }}
          variant="primary"
        />
        <button
          className="pwa-dismiss"
          type="button"
          onClick={() => setUpdateAvailable(false)}
          aria-label="Fermer"
        >
          <XIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function FullscreenButton() {
  const [fullscreen, setFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen((f) => !f);
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <Button
      icon={fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      label={fullscreen ? "FENETRE" : "PLEIN ECRAN"}
      onClick={toggle}
      aria-label={fullscreen ? "Quitter le plein ecran" : "Passer en plein ecran"}
      variant="secondary"
    />
  );
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <main className="app" style={vars()}>
      <div className="shell app-enter">
        <div className="utility-bar">
          <button
            type="button"
            className={`burger-toggle ${menuOpen ? "open" : ""}`}
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
          </button>
          <PwaControls updateSW={updateSW} />
          <FullscreenButton />
        </div>
        <div className="app-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
      <BurgerMenu
        open={menuOpen}
        updateSW={updateSW}
        onThemeChange={() => setTick((tick) => tick + 1)}
        onClose={() => setMenuOpen(false)}
      />
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
      <p className="intro-tagline">DEUX FORMES UN SEUL CHEMIN</p>
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
      <span className="intro-hint">ENTREE ESPACE CLIQUER</span>
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
                label={`MONDE ${world.id} ${world.name.toUpperCase()}`}
                onClick={() => navigate(`/world/${world.id}`)}
                disabled={world.status !== "available"}
                variant="primary"
                className="world-button"
              />
              <div className="world-meta">
                {world.status === "available"
                  ? `${world.subtitle} ${done}/${world.levels.length}`
                  : `${world.subtitle} BIENTOT`}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted">
        {getCompletedCount()} termines {campaign.length} jouables
      </p>
      <div className="modal-actions">
        <Button
          icon={<Help size={18} />}
          label="AIDE"
          onClick={() => navigate("/help")}
          variant="secondary"
        />
        <Button
          icon={<Theme size={18} />}
          label="THEME"
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
            LEVEL LAB
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
                ? ""
                : unlocked
                  ? String(index + 1).padStart(2, "0")
                  : ""}
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
      "SE DEPLACER",
      "La forme active glisse jusqu'a rencontrer un mur ou l'autre forme.",
    ],
    ["CHANGER", "ESPACE ou ● ⇄ ■ choisit la forme active."],
    ["BLOQUER", "La boule et le carre peuvent se servir mutuellement de mur."],
    [
      "PORTES",
      "Une porte bloque le passage tant qu'un interrupteur lie ne l'a pas ouverte.",
    ],
    [
      "TELEPORTER",
      "Atterris sur un portail pour ressortir par son portail associe.",
    ],
    ["OBJECTIF", "Ramasse toutes les etoiles pour terminer."],
    ["RACCOURCIS", "R recommence · ECHAP menu · ENTREE suivant."],
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

function Game({ level, worldId }: { level: Level; worldId: number }) {
  const navigate = useNavigate();
  const world = worlds.find((w) => w.id === worldId);
  const worldIndex = world ? worlds.indexOf(world) : 0;

  const {
    state,
    move,
    switchForm,
    reset,
    nextLevel,
    undo,
    redo,
  } = useLevelGameplay(level, worldId);

  const levelLabel = (index: number) => {
    const labels = ["", "A", "B", "C", "D", "E", "F", "G", "H"];
    return labels[index] || String(index);
  };

  const onSwipe = useCallback(
    (direction: Direction) => {
      const gameDirection = gestureDirections[direction];
      if (gameDirection) move(gameDirection);
    },
    [move],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        switchForm();
      } else if (event.key === "r" || event.key === "R") {
        reset();
      } else if (event.key === "Backspace") {
        undo();
      } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        redo();
      } else if (event.key === "y" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchForm, reset, undo, redo]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      let direction: GameplayDirection | null = null;
      switch (event.key) {
        case "ArrowUp":
          direction = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          direction = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          direction = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          direction = { x: 1, y: 0 };
          break;
        default:
          return;
      }
      event.preventDefault();
      if (direction) move(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const [gestureStart, setGestureStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      setGestureStart({ x: touch.clientX, y: touch.clientY });
    },
    [],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!gestureStart) return;
      const touch = event.touches[0];
      const dx = touch.clientX - gestureStart.x;
      const dy = touch.clientY - gestureStart.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx > 10 || ady > 10) {
        if (adx > ady) {
          onSwipe(dx > 0 ? "right" : "left");
        } else {
          onSwipe(dy > 0 ? "down" : "up");
        }
        setGestureStart(null);
      }
    },
    [gestureStart, onSwipe],
  );

  const onTouchEnd = useCallback(() => {
    setGestureStart(null);
  }, []);

  return (
    <section
      className="game"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          label="NIVEAUX"
          onClick={() => navigate(`/world/${worldId}`)}
          variant="secondary"
        />
        <b>
          {levelLabel(worldIndex)} MONDE {worldId}
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
          skin={resolveLevelSkin(worldId, level.id)}
          themeName={getActiveThemeName()}
        />
        <div className="game-stats">
          <b>{state.activeForm === "ball" ? "BOULE" : "CARRE"}</b>
          <br />
          <span className="muted">
            {level.stars.length - state.stars.length}/{level.stars.length} 
            {state.moves} COUPS swipe ou fleches
          </span>
        </div>
      </div>
      <div className="controls">
        <div className="dpad" style={{ alignSelf: "flex-start" }}>
          <DPadButton
            icon={<ArrowUp size={24} color="var(--text)" />}
            onClick={() => move({ x: 0, y: -1 })}
          />
          <DPadButton
            icon={<ArrowLeft size={24} color="var(--text)" />}
            onClick={() => move({ x: -1, y: 0 })}
          />
          <DPadButton
            icon={<ArrowDown size={24} color="var(--text)" />}
            onClick={() => move({ x: 0, y: 1 })}
          />
          <DPadButton
            icon={<ArrowRight size={24} color="var(--text)" />}
            onClick={() => move({ x: 1, y: 0 })}
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
      {state.completed && (
        <div className="modal-overlay" onClick={nextLevel}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="completion-title"
          >
            <h2 id="completion-title">NIVEAU TERMINE</h2>
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
                label={worldIndex < world.levels.length - 1 ? "SUIVANT" : "NIVEAUX"}
                onClick={nextLevel}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}
      {state.gameOver && (
        <div className="modal-overlay" onClick={() => navigate(`/world/${worldId}`)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gameover-title"
          >
            <h2 id="gameover-title">GAME OVER</h2>
            <p>Une forme est sortie du niveau</p>
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
                onClick={() => navigate(`/world/${worldId}`)}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      )}
      {isDevtoolsEnabled && (
        <div className="debug-panel">
          <button className="debug-button" onClick={undo}>
            UNDO
          </button>
          <button className="debug-button" onClick={redo}>
            REDO
          </button>
          <button className="debug-button" onClick={reset}>
            RESET
          </button>
          <div className="debug-commands">
            {formatDebugCommands(state.debugCommands)}
          </div>
        </div>
      )}
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
        { path: "config", element: <ConfigScreen /> },
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
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("app")!).render(<RouterApp />);
