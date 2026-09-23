import { useEffect, useRef, useState, type CSSProperties } from "react";
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
import { worlds } from "./levels/campaign";
import { isLevelCompleted, isWorldUnlocked } from "./progression";
import { getTheme, hexToCss } from "./theme";
import { LevelCatalogue, LevelPlayground } from "./LevelLab";
import { LevelEditor } from "./LevelEditor";
import { LevelGenerator } from "./LevelGenerator";
import { Game } from "./GameScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BurgerMenu } from "./BurgerMenu";
import { Intro } from "./components/Intro";
import { Menu } from "./components/Menu";
import { WorldLevels } from "./components/WorldLevels";
import { Help } from "./components/Help";
import { UpdateBanner } from "./components/UpdateBanner";

import "./style.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";

function vars(): CSSProperties {
  const theme = getTheme();
  return Object.fromEntries(
    Object.entries(theme)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => ["--" + key, hexToCss(value as number)]),
  ) as CSSProperties;
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
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

  useEffect(() => {
    if (!menuOpen && wasMenuOpen.current) burgerRef.current?.focus();
    wasMenuOpen.current = menuOpen;
  }, [menuOpen]);

  return (
    <main className="app" style={vars()}>
      <UpdateBanner updateSW={updateSW} />
      <div className="shell app-enter" inert={menuOpen}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <div className="utility-bar">
        <button
          ref={burgerRef}
          type="button"
          className={`burger-toggle ${menuOpen ? "open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="app-menu"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
        </button>
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

function ProtectedLevel() {
  const { worldId, levelId } = useParams();
  const world = worlds.find((item) => item.id === Number(worldId));
  const levelIndex =
    world?.levels.findIndex((level) => level.id === levelId) ?? -1;

  if (!world || levelIndex < 0) return <Navigate to="/menu" replace />;
  if (world.status !== "available" || !isWorldUnlocked(world.id)) {
    return <Navigate to="/menu" replace />;
  }
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
