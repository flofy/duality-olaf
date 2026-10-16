/** Board display preference: square cells (ratio kept) or stretched to fill. */
export type BoardDisplayMode = "square" | "fill";

const STORAGE_KEY = "duality.board-display.v1";
const DEFAULT_BOARD_DISPLAY_MODE: BoardDisplayMode = "square";
const boardDisplayModeOrder: BoardDisplayMode[] = ["square", "fill"];

export const boardDisplayModeLabels: Record<BoardDisplayMode, string> = {
  square: "Carré",
  fill: "Plein",
};

function isValidBoardDisplayMode(value: unknown): value is BoardDisplayMode {
  return (
    typeof value === "string" &&
    boardDisplayModeOrder.includes(value as BoardDisplayMode)
  );
}

function readStoredBoardDisplayMode(): BoardDisplayMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidBoardDisplayMode(raw) ? raw : DEFAULT_BOARD_DISPLAY_MODE;
  } catch {
    return DEFAULT_BOARD_DISPLAY_MODE;
  }
}

/** Active board display preference, persisted across reloads. */
export function getBoardDisplayMode(): BoardDisplayMode {
  return readStoredBoardDisplayMode();
}

function setBoardDisplayMode(mode: BoardDisplayMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* persist is best-effort */
  }
}

/** Switch to the next board display mode and return it. */
export function cycleBoardDisplayMode(): BoardDisplayMode {
  const current = getBoardDisplayMode();
  const index = boardDisplayModeOrder.indexOf(current);
  const next =
    boardDisplayModeOrder[(index + 1) % boardDisplayModeOrder.length];
  setBoardDisplayMode(next);
  return next;
}

/** Reflect the current mode on the root element for the CSS rules. */
export function syncBoardDisplayMode(mode: BoardDisplayMode): void {
  document.documentElement.dataset.boardDisplay = mode;
}
