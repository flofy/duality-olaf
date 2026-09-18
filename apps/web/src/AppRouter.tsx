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
import { LevelEditor } from "./LevelEditor";
import { GameScreen } from "./GameScreen";
import { LevelGenerator } from "./LevelGenerator";
import { InstallButton } from "./InstallButton";

import "./style.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";
const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
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
          ? "✨ Nouvelle version disponible"
          : "📱 Installe Duality pour jouer en plein écran"}
      </span>
      <div className="pwa-actions">
        <button
          className="pwa-action"
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
        >
          {updateAvailable ? "METTRE À JOUR" : "INSTALLER"}
        </button>
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
    <button
      className="action fullscreen-toggle"
      type="button"
      onClick={toggle}
      aria-label={
        fullscreen ? "Quitter le plein écran" : "Passer en plein écran"
      }
    >
      {fullscreen ? "↙ FENÊTRÉ" : "⛶ PLEIN ÉCRAN"}
    </button>
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
        <Outlet />
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
      <button
        className="action intro-start"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          continueIntro();
        }}
      >
        JOUER ▶
      </button>
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
            <button
              className="world-button"
              disabled={world.status !== "available"}
              onClick={() => navigate(`/world/${world.id}`)}
              key={world.id}
            >
              🌍 MONDE {world.id} — {world.name.toUpperCase()}
              <span className="world-meta">
                {world.status === "available"
                  ? `${world.subtitle} · ${done}/${world.levels.length}`
                  : `${world.subtitle} · BIENTÔT`}
              </span>
            </button>
          );
        })}
      </div>
      <p className="muted">
        {getCompletedCount()} terminé(s) · {campaign.length} jouables
      </p>
      <div className="modal-actions">
        <InstallButton />
        <button className="action" onClick={() => navigate("/help")}>
          ? AIDE
        </button>
        <button
          className="action"
          onClick={() => {
            cycleTheme();
            setTick(tick + 1);
          }}
        >
          🎨 THÈME
        </button>
        <button
          className="action"
          onClick={() => {
            const index = availableSkins.indexOf(skin);
            const next =
              availableSkins[(index + 1) % availableSkins.length] ?? "auto";
            setSkinPreference(next);
            setSkinPreferenceState(next);
          }}
        >
          ✨ {skinLabels[skin]}
        </button>
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
        <button className="action" onClick={() => navigate("/menu")}>
          ← MONDES
        </button>
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
      "Une porte bloque le passage tant qu’un interrupteur lié ne l’a pas ouverte.",
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
      <button className="action" onClick={() => navigate("/menu")}>
        ← RETOUR
      </button>
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

  return <GameScreen level={world.levels[levelIndex]} worldId={world.id} />;
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
