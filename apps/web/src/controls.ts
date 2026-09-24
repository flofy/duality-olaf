/** Game control visibility preference. */
export type ControlsMode = "auto" | "visible" | "hidden";

const STORAGE_KEY = "duality.controls.v1";
const DEFAULT_CONTROLS_MODE: ControlsMode = "auto";
const controlsModeOrder: ControlsMode[] = ["auto", "visible", "hidden"];

export const controlsModeLabels: Record<ControlsMode, string> = {
  auto: "Automatique",
  visible: "Afficher",
  hidden: "Masquer",
};

function isValidControlsMode(value: unknown): value is ControlsMode {
  return (
    typeof value === "string" &&
    controlsModeOrder.includes(value as ControlsMode)
  );
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

function setControlsMode(mode: ControlsMode): void {
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

const CONTROLS_STYLE_ID = "duality-controls-preference-style";

/** Inject the CSS rules driven by the data-controls-mode attribute. */
export function installControlsStyles(): void {
  if (document.getElementById(CONTROLS_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CONTROLS_STYLE_ID;
  style.textContent = `
    .game { touch-action: none; }
    .game button { touch-action: manipulation; }
    html[data-controls-mode="hidden"] .game .controls { display: none; }
    html[data-controls-mode="visible"] .game .controls { display: flex; }
    @media (min-width: 601px) {
      html:not([data-controls-mode="visible"]) .game .controls { display: none; }
    }
    @media (max-width: 600px) {
      .game .controls { display: flex; justify-content: flex-start; }
      .game .controls .switch { display: block; }
      .game .controls .dpad { display: none; }
      html[data-controls-mode="visible"] .game .dpad { display: grid; }
    }
  `;
  document.head.appendChild(style);
}

/** Reflect the current mode on the root element for the injected CSS. */
export function syncControlsMode(mode: ControlsMode): void {
  document.documentElement.dataset.controlsMode = mode;
}

const SWIPE_STORAGE_KEY = "duality.swipe.v1";
const DEFAULT_SWIPE_ENABLED = true;

/** Whether board swipe gestures are enabled, persisted across reloads. */
export function getSwipeEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SWIPE_STORAGE_KEY);
    return raw === null ? DEFAULT_SWIPE_ENABLED : raw === "true";
  } catch {
    return DEFAULT_SWIPE_ENABLED;
  }
}

export function toggleSwipeEnabled(): boolean {
  const next = !getSwipeEnabled();
  setSwipeEnabled(next);
  return next;
}
