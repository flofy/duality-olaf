import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AudioSettings } from "./AudioSettings";
import {
  cycleControlsMode,
  controlsModeLabels,
  getControlsMode,
  installControlsStyles,
  syncControlsMode,
  type ControlsMode,
} from "./controls";
import {
  getAvailableSkinPreferences,
  getSkinPreference,
  normalizeSkinPreference,
  setSkinPreference,
  skinLabels,
  type SkinPreference,
} from "./skins";
import { cycleTheme, getTheme } from "./theme";
import {
  ArrowRight,
  Help as HelpIcon,
  Maximize,
  Minimize,
  Skin,
  ThemeIcon as Theme,
} from "./components/Icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Module-level capture of the install prompt: it survives dismissing any
 * banner, so INSTALLER stays available from this menu at any time.
 */
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
  });
}

const isDevEnabled = import.meta.env.VITE_ENABLE_LEVEL_LAB === "true";

type BurgerMenuProps = {
  open: boolean;
  updateSW: (reloadPage?: boolean) => Promise<void>;
  onThemeChange: () => void;
};

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function BurgerMenu({ open, updateSW, onThemeChange }: BurgerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullscreen, setFullscreen] = useState(() =>
    Boolean(document.fullscreenElement),
  );
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(deferredInstallPrompt);
  const [isStandalone, setIsStandalone] = useState(isStandaloneDisplay);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [controlsMode, setControlsMode] =
    useState<ControlsMode>(getControlsMode);
  const [skin, setSkinState] = useState<SkinPreference>(() =>
    normalizeSkinPreference(getSkinPreference()),
  );
  const availableSkins = getAvailableSkinPreferences();

  useEffect(() => {
    installControlsStyles();
    syncControlsMode(controlsMode);
  }, [controlsMode]);

  useEffect(() => {
    const syncFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      deferredInstallPrompt = prompt;
      setInstallPrompt(prompt);
    };
    const onAppInstalled = () => {
      deferredInstallPrompt = null;
      setInstallPrompt(null);
      setIsStandalone(true);
    };
    const onDisplayModeChange = () => setIsStandalone(isStandaloneDisplay());
    const onUpdate = () => setUpdateAvailable(true);
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    displayModeQuery.addEventListener("change", onDisplayModeChange);
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      displayModeQuery.removeEventListener("change", onDisplayModeChange);
      window.removeEventListener("duality:pwa-update", onUpdate);
    };
  }, []);

  const go = (to: string) => navigate(to);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  const cycleSkin = () => {
    const index = availableSkins.indexOf(normalizeSkinPreference(skin));
    const next = availableSkins[(index + 1) % availableSkins.length] ?? "auto";
    setSkinPreference(next);
    setSkinState(next);
    onThemeChange();
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      deferredInstallPrompt = null;
      setInstallPrompt(null);
    }
  };

  const canInstall = Boolean(installPrompt) && !isStandalone;

  return (
    <div
      id="app-menu"
      className={`menu-panel ${open ? "open" : ""}`}
      aria-hidden={!open}
    >
      <nav className="menu-group" aria-label="Navigation">
        <button
          type="button"
          className={`menu-item ${
            location.pathname.startsWith("/menu") ? "active" : ""
          }`}
          onClick={() => go("/menu")}
        >
          <ArrowRight size={18} />
          <span>MENU</span>
        </button>
        <button
          type="button"
          className={`menu-item ${
            location.pathname.startsWith("/help") ? "active" : ""
          }`}
          onClick={() => go("/help")}
        >
          <HelpIcon size={18} />
          <span>AIDE</span>
        </button>
      </nav>

      <div className="menu-group">
        <div className="menu-group-title">AFFICHAGE</div>
        <button
          type="button"
          className="menu-item"
          onClick={() => void toggleFullscreen()}
        >
          {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          <span>{fullscreen ? "FENÊTRÉ" : "PLEIN ÉCRAN"}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          onClick={() => {
            cycleTheme();
            onThemeChange();
          }}
        >
          <Theme size={18} />
          <span>THÈME · {getTheme().name.toUpperCase()}</span>
        </button>
        <button type="button" className="menu-item" onClick={cycleSkin}>
          <Skin size={18} />
          <span>SKIN · {skinLabels[skin].toUpperCase()}</span>
        </button>
        <button
          type="button"
          className="menu-item"
          onClick={() => setControlsMode(cycleControlsMode())}
        >
          <span aria-hidden="true">🎮</span>
          <span>
            COMMANDES · {controlsModeLabels[controlsMode].toUpperCase()}
          </span>
        </button>
      </div>

      <div className="menu-group">
        <AudioSettings />
      </div>

      {(canInstall || updateAvailable) && (
        <div className="menu-group">
          <div className="menu-group-title">APPLICATION</div>
          {canInstall && (
            <button
              type="button"
              className="menu-item"
              onClick={() => void install()}
            >
              <span aria-hidden="true">📱</span>
              <span>INSTALLER</span>
            </button>
          )}
          {updateAvailable && (
            <button
              type="button"
              className="menu-item"
              onClick={() => void updateSW(true)}
            >
              <span aria-hidden="true">🔄</span>
              <span>METTRE À JOUR</span>
            </button>
          )}
        </div>
      )}

      {isDevEnabled && (
        <div className="menu-group dev-group">
          <div className="menu-group-title">DÉVELOPPEMENT</div>
          <button
            type="button"
            className="menu-item dev-item"
            onClick={() => go("/dev/levels")}
          >
            <span aria-hidden="true">🧪</span>
            <span>LEVEL LAB</span>
          </button>
          <button
            type="button"
            className="menu-item dev-item"
            onClick={() => go("/dev/generator")}
          >
            <span aria-hidden="true">🧬</span>
            <span>GÉNÉRATEUR</span>
          </button>
          <button
            type="button"
            className="menu-item dev-item"
            onClick={() => go("/dev/editor")}
          >
            <span aria-hidden="true">✏️</span>
            <span>ÉDITEUR</span>
          </button>
        </div>
      )}
    </div>
  );
}
