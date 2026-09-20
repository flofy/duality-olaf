/** Board zoom preference for the Level Lab boards: multiplier applied to the
 *  adaptive tile size (1 = fits the available space, like the game screen). */
export type BoardZoom = number;

const STORAGE_KEY = "duality.board-zoom.v1";
export const DEFAULT_BOARD_ZOOM: BoardZoom = 1;
export const BOARD_ZOOM_MIN: BoardZoom = 0.5;
export const BOARD_ZOOM_MAX: BoardZoom = 2;
export const BOARD_ZOOM_STEP: BoardZoom = 0.25;

function clampZoom(value: BoardZoom): BoardZoom {
  return Math.min(
    BOARD_ZOOM_MAX,
    Math.max(BOARD_ZOOM_MIN, Math.round(value * 100) / 100),
  );
}

function readStoredZoom(): BoardZoom {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_BOARD_ZOOM;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0
      ? clampZoom(value)
      : DEFAULT_BOARD_ZOOM;
  } catch {
    return DEFAULT_BOARD_ZOOM;
  }
}

/** Active board zoom preference, persisted across reloads. */
export function getBoardZoom(): BoardZoom {
  return readStoredZoom();
}

export function setBoardZoom(zoom: BoardZoom): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(clampZoom(zoom)));
  } catch {
    /* persist is best-effort */
  }
}

/** Multiply the current zoom by a factor, keeping it in bounds. */
export function scaleBoardZoom(factor: number): BoardZoom {
  const next = clampZoom(readStoredZoom() * factor);
  setBoardZoom(next);
  return next;
}

export function zoomInBoard(): BoardZoom {
  return scaleBoardZoom(1 + BOARD_ZOOM_STEP);
}

export function zoomOutBoard(): BoardZoom {
  return scaleBoardZoom(1 - BOARD_ZOOM_STEP);
}

/** Reset to the default zoom (fits the available space) and return it. */
export function resetBoardZoom(): BoardZoom {
  setBoardZoom(DEFAULT_BOARD_ZOOM);
  return DEFAULT_BOARD_ZOOM;
}
