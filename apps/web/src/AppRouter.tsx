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
import { ArrowLeft, ArrowRight, SwitchForm, ResetIcon as Reset, Maximize, Minimize, Help, ThemeIcon as Theme, Skin } from "./components/Icons";
import "./style.css";

const isLevelLabEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";
const isDevtoolsEnabled = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const gestureDirections: Record<Direction, GameplayDirection> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };

function vars(): CSSProperties {
  const theme = getTheme();
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => typeof value === "number").map(([key, value]) => ["--" + key, hexToCss(value as number)])) as CSSProperties;
}