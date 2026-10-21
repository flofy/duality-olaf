/** Responsive game layout preference, persisted across sessions. */
export type GameLayoutMode = "portrait" | "landscape" | "auto";

const STORAGE_KEY = "duality.game-layout.v1";
const DEFAULT_GAME_LAYOUT_MODE: GameLayoutMode = "portrait";
const modes: GameLayoutMode[] = ["portrait", "landscape", "auto"];

export const gameLayoutModeLabels: Record<GameLayoutMode, string> = {
  portrait: "Portrait",
  landscape: "Paysage",
  auto: "Auto",
};

function isGameLayoutMode(value: unknown): value is GameLayoutMode {
  return typeof value === "string" && modes.includes(value as GameLayoutMode);
}

export function getGameLayoutMode(): GameLayoutMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isGameLayoutMode(value) ? value : DEFAULT_GAME_LAYOUT_MODE;
  } catch {
    return DEFAULT_GAME_LAYOUT_MODE;
  }
}

function persistGameLayoutMode(mode: GameLayoutMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in private browsing; the setting still works
    // for the current session.
  }
}

export function cycleGameLayoutMode(): GameLayoutMode {
  const current = getGameLayoutMode();
  const next = modes[(modes.indexOf(current) + 1) % modes.length] ?? DEFAULT_GAME_LAYOUT_MODE;
  persistGameLayoutMode(next);
  return next;
}

/** Reflect the preference on <html>; CSS adapts layout without changing gameplay. */
export function syncGameLayoutMode(mode: GameLayoutMode): void {
  document.documentElement.dataset.gameLayout = mode;
}
