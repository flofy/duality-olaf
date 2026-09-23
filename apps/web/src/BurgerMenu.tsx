import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AudioSettings } from "./AudioSettings";
import {
  animationSpeedLabels,
  cycleAnimationSpeed,
  getAnimationSpeed,
  syncAnimationSpeed,
  type AnimationSpeed,
} from "./animationPreferences";
import {
  cycleControlsMode,
  controlsModeLabels,
  getControlsMode,
  installControlsStyles,
  syncControlsMode,
  type ControlsMode,
} from "./controls";
import {
  cycleBoardDisplayMode,
  boardDisplayModeLabels,
  getBoardDisplayMode,
  syncBoardDisplayMode,
  type BoardDisplayMode,
} from "./boardDisplay";
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
  Help as HelpIcon,
  GridIcon,
  Maximize,
  Minimize,
  ResetIcon,
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
  /** Referme le panneau (utilisé par les actions sans navigation, p. ex. RECOMMENCER). */
  onClose: () => void;
};

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function BurgerMenu({
  open,
  updateSW,
  onThemeChange,
  onClose,
}: BurgerMenuProps) {
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
  const [boardDisplay, setBoardDisplay] =
    useState<BoardDisplayMode>(getBoardDisplayMode);
  const [animationSpeed, setAnimationSpeed] =
    useState<AnimationSpeed>(getAnimationSpeed);
  const [skin, setSkinState] = useState<SkinPreference>(() =>
    normalizeSkinPreference(getSkinPreference()),
  );
  const availableSkins = getAvailableSkinPreferences();
  const panelRef = useRef<HTMLDivElement>(null);
  // RECOMMENCER n'a de sens que pendant une partie (route d'un niveau).
  const isLevelRoute = /^\/world\/\d+\/level\//.test(location.pathname);

  useEffect(() => {
    installControlsStyles();
    syncControlsMode(controlsMode);
  }, [controlsMode]);

  useEffect(() => {
    syncAnimationSpeed(animationSpeed);
  }, [animationSpeed]);

  // Mode d'affichage du plateau : reflété sur <html> pour les règles CSS.
  useEffect(() => {
    syncBoardDisplayMode(boardDisplay);
  }, [boardDisplay]);

  // À l'ouverture, le focus entre dans le panneau (qui ouvre le menu au clavier) ;
  // AppLayout le rend au burger à la fermeture.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

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
      ref={panelRef}
      className={`menu-panel ${open ? "open" : ""}`}
      role="dialog"
      aria-labelledby="app-menu-title"
      aria-hidden={!open}
      tabIndex={-1}
    >
      {/* Libellé du dialogue : invisible, le panneau occupe tout l'écran. Le bouton
          de fermeture est le burger lui-même, qui reste au-dessus (cf. AppRouter). */}
      <h2 id="app-menu-title" className="sr-only">
        Menu
      </h2>

      <div className="menu-panel-body">
        <nav className="menu-sections" aria-label="Menu principal">
          <section className="menu-group" aria-labelledby="menu-group-game">
            <h3 id="menu-group-game" className="menu-group-title">
              JEU
            </h3>
            <button type="button" className="menu-item" onClick={() => go("/")}>
              <span className="menu-item-icon" aria-hidden="true">
                ▶
              </span>
              <span className="menu-item-label">INTRO</span>
            </button>
            <button
              type="button"
              className={`menu-item ${
                location.pathname.startsWith("/help") ? "active" : ""
              }`}
              onClick={() => go("/help")}
            >
              <span className="menu-item-icon" aria-hidden="true">
                <HelpIcon size={18} color="currentColor" />
              </span>
              <span className="menu-item-label">AIDE</span>
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => setControlsMode(cycleControlsMode())}
            >
              <span className="menu-item-icon" aria-hidden="true">
                🎮
              </span>
              <span className="menu-item-label">
                COMMANDES · {controlsModeLabels[controlsMode].toUpperCase()}
              </span>
            </button>
            {/* Mode d'affichage de la grille : cases carrées (ratio conservé)
                ou plateau étiré pour occuper tout l'espace disponible. */}
            <button
              type="button"
              className="menu-item"
              onClick={() => setBoardDisplay(cycleBoardDisplayMode())}
            >
              <span className="menu-item-icon" aria-hidden="true">
                <GridIcon size={18} color="currentColor" />
              </span>
              <span className="menu-item-label">
                GRILLE · {boardDisplayModeLabels[boardDisplay].toUpperCase()}
              </span>
            </button>
            {/* Visible uniquement pendant une partie : demande à l'écran de jeu
                de relancer le niveau (cf. GameScreen, event « duality:game-reset »). */}
            {isLevelRoute && (
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent("duality:game-reset"));
                }}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  <ResetIcon size={18} color="currentColor" />
                </span>
                <span className="menu-item-label">RECOMMENCER</span>
              </button>
            )}
          </section>

          <section className="menu-group" aria-labelledby="menu-group-display">
            <h3 id="menu-group-display" className="menu-group-title">
              AFFICHAGE
            </h3>
            <button
              type="button"
              className="menu-item"
              onClick={() => void toggleFullscreen()}
            >
              <span className="menu-item-icon" aria-hidden="true">
                {fullscreen ? (
                  <Minimize size={18} color="currentColor" />
                ) : (
                  <Maximize size={18} color="currentColor" />
                )}
              </span>
              <span className="menu-item-label">
                {fullscreen ? "FENÊTRÉ" : "PLEIN ÉCRAN"}
              </span>
            </button>
            {/* Thème et skin partagent une ligne tant que la largeur le permet. */}
            <div className="menu-row">
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  cycleTheme();
                  onThemeChange();
                }}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  <Theme size={18} color="currentColor" />
                </span>
                <span className="menu-item-label">
                  THÈME · {getTheme().name.toUpperCase()}
                </span>
              </button>
              <button type="button" className="menu-item" onClick={cycleSkin}>
                <span className="menu-item-icon" aria-hidden="true">
                  <Skin size={18} color="currentColor" />
                </span>
                <span className="menu-item-label">
                  SKIN · {skinLabels[skin].toUpperCase()}
                </span>
              </button>
            </div>
          </section>

          <section className="menu-group" aria-labelledby="menu-group-animation">
            <h3 id="menu-group-animation" className="menu-group-title">
              ANIMATIONS
            </h3>
            <button
              type="button"
              className="menu-item"
              onClick={() => {
                const next = cycleAnimationSpeed();
                setAnimationSpeed(next);
              }}
            >
              <span className="menu-item-icon" aria-hidden="true">
                ✨
              </span>
              <span className="menu-item-label">
                VITESSE · {animationSpeedLabels[animationSpeed].toUpperCase()}
              </span>
            </button>
          </section>

          <section className="menu-group" aria-labelledby="menu-group-audio">
            <h3 id="menu-group-audio" className="menu-group-title">
              AUDIO & VIBRATIONS
            </h3>
            <AudioSettings />
          </section>

          {(canInstall || updateAvailable) && (
            <section className="menu-group" aria-labelledby="menu-group-app">
              <h3 id="menu-group-app" className="menu-group-title">
                APPLICATION
              </h3>
              {canInstall && (
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => void install()}
                >
                  <span className="menu-item-icon" aria-hidden="true">
                    📱
                  </span>
                  <span className="menu-item-label">INSTALLER</span>
                </button>
              )}
              {updateAvailable && (
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => void updateSW(true)}
                >
                  <span className="menu-item-icon" aria-hidden="true">
                    🔄
                  </span>
                  <span className="menu-item-label">METTRE À JOUR</span>
                </button>
              )}
            </section>
          )}

          {isDevEnabled && (
            <section
              className="menu-group dev-group"
              aria-labelledby="menu-group-dev"
            >
              <h3 id="menu-group-dev" className="menu-group-title">
                DÉVELOPPEMENT
              </h3>
              <button
                type="button"
                className="menu-item dev-item"
                onClick={() => go("/dev/levels")}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  🧪
                </span>
                <span className="menu-item-label">LEVEL LAB</span>
              </button>
              <button
                type="button"
                className="menu-item dev-item"
                onClick={() => go("/dev/generator")}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  🧬
                </span>
                <span className="menu-item-label">GÉNÉRATEUR</span>
              </button>
              <button
                type="button"
                className="menu-item dev-item"
                onClick={() => go("/dev/editor")}
              >
                <span className="menu-item-icon" aria-hidden="true">
                  ✏️
                </span>
                <span className="menu-item-label">ÉDITEUR</span>
              </button>
            </section>
          )}
        </nav>
      </div>
    </div>
  );
}
