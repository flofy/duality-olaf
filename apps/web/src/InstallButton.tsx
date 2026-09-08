import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Capture the browser install event as soon as this module is loaded. The menu
// component is rendered after the intro screen, so registering the listener
// inside the component could miss the one-shot beforeinstallprompt event.
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
  });
}

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(deferredInstallPrompt);
  const [isStandalone, setIsStandalone] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

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

  if (isStandalone || !installPrompt) {
    return null;
  }

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
    <button
      className="action"
      type="button"
      onClick={handleInstall}
      aria-label="Installer l'application"
    >
      📱 INSTALLER
    </button>
  );
}
