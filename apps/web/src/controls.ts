/** Game control visibility preference. */
export type ControlsMode = 'auto' | 'visible' | 'hidden';

const STORAGE_KEY = 'duality.controls.v1';
export const DEFAULT_CONTROLS_MODE: ControlsMode = 'auto';
export const controlsModeOrder: ControlsMode[] = ['auto', 'visible', 'hidden'];

export const controlsModeLabels: Record<ControlsMode, string> = {
  auto: 'Automatique',
  visible: 'Afficher',
  hidden: 'Masquer',
};

function isValidControlsMode(value: unknown): value is ControlsMode {
  return typeof value === 'string' && controlsModeOrder.includes(value as ControlsMode);
}

function readStoredControlsMode(): ControlsMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidControlsMode(raw) ? raw : DEFAULT_CONTROLS_MODE;
  } catch {
    return DEFAULT_CONTROLS_MODE;
  }
}

/** Active control visibility preference, persisted across reloads. */
export function getControlsMode(): ControlsMode {
  return readStoredControlsMode();
}

export function setControlsMode(mode: ControlsMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* persist is best-effort */
  }
}

/** Switch to the next control visibility mode and return it. */
export function cycleControlsMode(): ControlsMode {
  const current = getControlsMode();
  const index = controlsModeOrder.indexOf(current);
  const next = controlsModeOrder[(index + 1) % controlsModeOrder.length];
  setControlsMode(next);
  return next;
}
