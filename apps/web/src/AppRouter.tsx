import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { createBrowserRouter, Navigate, Outlet, useNavigate, useParams } from "react-router";
import { RouterProvider } from "react-router/dom";
import { type Level } from "@duality/level-format";
import { campaign, worlds, levelLabel } from "./levels/campaign";
import { completeLevel, getCompletedCount, isLevelCompleted } from "./progression";
import { cycleTheme, getActiveThemeName, getTheme, hexToCss } from "./theme";
import { getAvailableSkinPreferences, getSkinPreference, normalizeSkinPreference, resolveLevelSkin, setSkinPreference, skinLabels, type SkinPreference } from "./skins";
import { LevelCatalogue, LevelPlayground } from "./LevelLab";
import { GameBoard } from "./GameBoard";
import { LevelEditor } from "./LevelEditor";
import { LevelGenerator } from "./LevelGenerator";
import { interpretGesture, type Direction } from "./input/GestureInterpreter";
import { useLevelGameplay, type GameplayDirection } from "./useLevelGameplay";
import { formatDebugCommands, type DebugCommand, type DebugDirection } from "./debug/CommandRecorder";
import { InstallButton } from "./InstallButton";
import { Button, DPadButton, CenterDPadButton } from "./components/Button";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, SwitchForm, ResetIcon as Reset, Maximize, Minimize, Help, ThemeIcon as Theme, Skin, Check as CheckIcon, XIcon } from "./components/Icons";
import { BurgerMenu } from "./BurgerMenu";
import { ConfigScreen } from "./ConfigScreen";
import "./style.css";
import "./animations.css";
import "./svg-styles.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";
const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

const gestureDirections: Record<Direction, GameplayDirection> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

function vars(): CSSProperties {
  const theme = getTheme();
  return Object.fromEntries(
    Object.entries(theme).filter(([, value]) => typeof value === "number").map(([key, value]) => ["--" + key, hexToCss(value as number)]),
  ) as CSSProperties;
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() { window.dispatchEvent(new Event("duality:pwa-update")); },
});

export function RouterApp() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { index: true, element: <Intro /> },
        { path: "menu", element: <Menu /> },
        { path: "help", element: <Help /> },
        { path: "config", element: <ConfigScreen /> },
        { path: "world/:worldId", element: <WorldLevels /> },
        { path: "world/:worldId/level/:levelId", element: <ProtectedLevel /> },
        { element: <DevGuard />, children: [
          { path: "dev/levels", element: <LevelCatalogue /> },
          { path: "dev/levels/:levelId", element: <DevPlaygroundRoute /> },
          { path: "dev/generator", element: <LevelGenerator /> },
          { path: "dev/editor", element: <DevEditorRoute /> },
          { path: "dev/editor/:levelId", element: <DevEditorRoute /> },
        ] },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ], { basename: import.meta.env.BASE_URL === "./" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("app")!).render(<RouterApp />);