import { useEffect, useState } from 'react';
import { cycleControlsMode, controlsModeLabels, getControlsMode, type ControlsMode } from './controls';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
  });
}

const CONTROLS_STYLE_ID = 'duality-controls-preference-style';

function installControlsStyles() {
  if (document.getElementById(CONTROLS_STYLE_ID)) return;
  const style = document.createElement('style');
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
      .game .controls { display: flex; justify-content: flex-end; }
      .game .controls .switch { display: block; }
      .game .controls .dpad { display: none; }
      html[data-controls-mode="visible"] .game .dpad { display: grid; }
    }
  `;
  document.head.appendChild(style);
}

function syncControlsMode(mode: ControlsMode) {
  document.documentElement.dataset.controlsMode = mode;
}

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(deferredInstallPrompt);
  const [isStandalone, setIsStandalone] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
  });
  const [controlsMode, setControlsMode] = useState<ControlsMode>(() => getControlsMode());

  useEffect(() => {
    installControlsStyles();
    syncControlsMode(controlsMode);
  }, [controlsMode]);

  useEffect(() => {
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
    const onDisplayModeChange = () => {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', onDisplayModeChange);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  const handleControlsMode = () => {
    const next = cycleControlsMode();
    setControlsMode(next);
    syncControlsMode(next);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredInstallPrompt = null;
      setInstallPrompt(null);
    }
  };

  return (
    <>
      <button className="action" type="button" onClick={handleControlsMode}
        aria-label={`Commandes : ${controlsModeLabels[controlsMode]}. Changer le mode d'affichage`}>
        🎮 COMMANDES · {controlsModeLabels[controlsMode].toUpperCase()}
      </button>
      {!isStandalone && installPrompt && (
        <button className="action" type="button" onClick={handleInstall} aria-label="Installer l'application">
          📱 INSTALLER
        </button>
      )}
    </>
  );
}
